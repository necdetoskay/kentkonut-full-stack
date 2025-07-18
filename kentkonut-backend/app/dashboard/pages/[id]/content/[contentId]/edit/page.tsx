'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import RichTextEditor from '@/components/ui/rich-text-editor-tiptap';
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
      <Breadcrumb segments={breadcrumbSegments} homeHref="/dashboard" />

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
              <RichTextEditor
                content={contentText}
                onChange={setContentText}
                placeholder="İçeriğinizi yazın..."
                minHeight="400px"
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
    </div>
  );
}
