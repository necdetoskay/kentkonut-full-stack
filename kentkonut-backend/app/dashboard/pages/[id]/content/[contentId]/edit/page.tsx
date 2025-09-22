'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from "next/link"
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Editor } from '@tinymce/tinymce-react';
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';
import { toast } from 'sonner';

interface PageContent {
  id: number;
  pageId: number;
  type: string;
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
  metadata: Record<string, any>;
  page: {
    id: number;
    title: string;
    slug: string;
  };
}

export default function ContentEditPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  const contentId = params.contentId as string;

  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const editorRef = useRef<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [type, setType] = useState('paragraph');
  const [isVisible, setIsVisible] = useState(true);

  // Breadcrumb segments
  const breadcrumbSegments = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Sayfalar', href: '/dashboard/pages' },
    { 
      name: content?.page?.title || 'Sayfa', 
      href: `/dashboard/pages/${pageId}/edit` 
    },
    { 
      name: `İçerik: ${content?.title || 'Yükleniyor...'}`, 
      href: '#' 
    }
  ];

  useEffect(() => {
    fetchContent();
  }, [contentId]);

  // TinyMCE callback fonksiyonları
  const handleEditorChange = (newContent: string) => {
    setContentText(newContent);
  };

  // Galeri seçme fonksiyonu
  const handleImageSelect = useCallback((media: GlobalMediaFile) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      // URL'deki ../../ ön ekini temizle
      let cleanUrl = media.url;
      if (cleanUrl.startsWith('../../')) {
        cleanUrl = cleanUrl.replace(/^\.\.\//g, '/');
      }
      // Eğer / ile başlamıyorsa ekle
      if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
        cleanUrl = '/' + cleanUrl;
      }
      
      const imgHtml = `<img src="${cleanUrl}" alt="${media.alt || media.originalName}" width="${media.width || 'auto'}" height="${media.height || 'auto'}" style="visibility: visible !important; opacity: 1 !important; display: block !important;" />`;
      editor.insertContent(imgHtml);
      console.log('Resim eklendi:', media.originalName, 'Clean URL:', cleanUrl);
    }
    setIsGalleryOpen(false);
  }, []);

  // Setup fonksiyonu
  const setupEditor = useCallback((editor: any) => {
    editorRef.current = editor;
    
    // Özel galeri butonu ekleme
    editor.ui.registry.addButton('customgallery', {
      text: 'Galeri',
      icon: 'image',
      tooltip: 'Galeriden resim seç',
      onAction: () => {
        setIsGalleryOpen(true);
      }
    });
  }, [setIsGalleryOpen]);

  // onInit fonksiyonu
  const onEditorInit = useCallback((evt: any, editor: any) => {
    editorRef.current = editor;
    
    // Özel galeri butonu ekleme
    editor.ui.registry.addButton('customgallery', {
      text: 'Galeri',
      icon: 'image',
      tooltip: 'Galeriden resim seç',
      onAction: () => {
        setIsGalleryOpen(true);
      }
    });
  }, [setIsGalleryOpen]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/page-contents/${contentId}`);
      
      if (!response.ok) {
        throw new Error('İçerik bulunamadı');
      }

      const data = await response.json();
      setContent(data);
      setTitle(data.title);
      setContentText(data.content);
      setType(data.type);
      setIsVisible(data.isVisible);
    } catch (error) {
      console.error('İçerik yükleme hatası:', error);
      toast.error('İçerik yüklenirken bir hata oluştu');
      router.push(`/dashboard/pages/${pageId}/edit`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/page-contents/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: contentText,
          type,
          isVisible,
        }),
      });

      if (!response.ok) {
        throw new Error('Kaydetme başarısız');
      }

      toast.success('İçerik başarıyla güncellendi');
      router.push(`/dashboard/pages/${pageId}/edit`);
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      toast.error('Kaydetme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/pages/${pageId}/edit`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">İçerik Bulunamadı</h1>
          <p className="text-gray-600 mb-4">Aradığınız içerik mevcut değil.</p>
          <Button onClick={() => router.push(`/dashboard/pages/${pageId}/edit`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      {/* BREADCRUMB_TO_FIX: */}
      {/* <Breadcrumb segments={breadcrumbSegments} homeHref="/dashboard" /> */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">İçerik Düzenle</h1>
          <p className="text-gray-600 mt-1">
            {content.page.title} sayfası içeriğini düzenleyin
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            İptal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>İçerik Detayları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="İçerik başlığı girin..."
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">İçerik Tipi</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="İçerik tipini seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraph">Paragraf</SelectItem>
                <SelectItem value="heading">Başlık</SelectItem>
                <SelectItem value="list">Liste</SelectItem>
                <SelectItem value="quote">Alıntı</SelectItem>
                <SelectItem value="image">Resim</SelectItem>
                <SelectItem value="code">Kod</SelectItem>
                <SelectItem value="custom">Özel</SelectItem>
              </SelectContent>
            </Select>
          </div>          {/* Content */}          <div className="space-y-2">
            <Label htmlFor="content">İçerik</Label>            <div className="min-h-[400px]">
              <Editor
                apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc"
                onInit={onEditorInit}
                value={contentText}
                onEditorChange={handleEditorChange}
                init={{
                  height: 500,
                  menubar: false,
                  language: 'tr',
                  language_url: 'https://cdn.tiny.cloud/1/qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc/tinymce/6/langs/tr.js',
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                  ],
                  toolbar_mode: 'sliding',
                  toolbar: 'undo redo | fontfamily fontsize | ' +
                    'bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'link image media | table | code preview | removeformat | customgallery | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  font_formats: 'Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',
                  fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
                  block_formats: 'Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3; Header 4=h4; Header 5=h5; Header 6=h6; Preformatted=pre',
                  branding: false,
                  promotion: false,
                  setup: setupEditor
                }}
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isVisible"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isVisible">Bu içerik görünür</Label>
          </div>
        </CardContent>
      </Card>

      {/* Galeri Modal */}
      {isGalleryOpen && (
        <GlobalMediaSelector
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onSelect={handleImageSelect}
          allowMultiple={false}
        />
      )}
    </div>
  );
}
