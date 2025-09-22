'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Image } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';
import { ensureAbsoluteUrl } from '@/lib/url-utils';
import { toast } from 'sonner';

interface PageContent {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  order: number;
  isActive: boolean;
  fullWidth: boolean;
  config?: any;
  alt?: string;
  caption?: string;
}

interface ContentBlockProps {
  content: PageContent;
  onSave: (data: Partial<PageContent>) => void;
  onCancel: () => void;
}

export default function ContentBlock({ content, onSave, onCancel }: ContentBlockProps) {
  const [formData, setFormData] = useState(content);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const editorRef = useRef<any>(null);

  const handleSave = () => {
    onSave(formData);
  };

  const handleGallerySelect = (files: GlobalMediaFile[]) => {
    if (files.length > 0 && editorRef.current) {
      const file = files[0];
      // URL'deki ../../ ön ekini temizle
      let cleanUrl = file.url;
      if (cleanUrl.startsWith('../../')) {
        cleanUrl = cleanUrl.replace(/^\.\.\//g, '/');
      }
      // Eğer / ile başlamıyorsa ekle
      if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
        cleanUrl = '/' + cleanUrl;
      }
      
      const imageHtml = `<img src="${cleanUrl}" alt="${file.alt || file.originalName || 'Seçilen görsel'}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); visibility: visible !important; opacity: 1 !important; display: block !important;" />`;
      
      editorRef.current.insertContent(imageHtml);
      console.log('Galeri görseli eklendi:', file.originalName, 'Clean URL:', cleanUrl);
      toast.success('Görsel başarıyla eklendi!');
    }
    setIsGalleryOpen(false);
  };

  const setupEditor = (editor: any) => {
    editor.ui.registry.addButton('customgallery', {
      text: 'Galeri',
      onAction: () => {
        setIsGalleryOpen(true);
      }
    });
  };

  const onEditorInit = (evt: any, editor: any) => {
    editorRef.current = editor;
    setupEditor(editor);
  };

  const renderContentFields = () => {
    switch (content.type) {
      case 'TEXT':
        return (
          <>
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="İçerik başlığı"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Alt Başlık</Label>
              <Input
                id="subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="İçerik alt başlığı"
              />
            </div>            <div>
              <Label htmlFor="content">İçerik</Label>
              <Editor
                apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc"
                value={formData.content || ''}
                onEditorChange={(value: string) => setFormData(prev => ({ ...prev, content: value }))}
                onInit={onEditorInit}
                init={{
                  height: 400,
                  menubar: true,
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
                      'link image media customgallery | table | code preview | removeformat | help',
                  font_formats: 'Arial=arial,helvetica,sans-serif; ' +
                    'Courier New=courier new,courier,monospace; ' +
                    'Times New Roman=times new roman,times,serif; ' +
                    'Verdana=verdana,geneva,sans-serif; ' +
                    'Georgia=georgia,serif; ' +
                    'Helvetica=helvetica,arial,sans-serif; ' +
                    'Impact=impact,sans-serif; ' +
                    'Tahoma=tahoma,arial,helvetica,sans-serif; ' +
                    'Comic Sans MS=comic sans ms,cursive',
                  fontsize_formats: '8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px 48px 72px',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  placeholder: 'İçeriğinizi yazın ve biçimlendirin...',
                  branding: false,
                  promotion: false,
                  setup: setupEditor
                }}
              />
              <p className="text-sm text-gray-500 mt-1">
                TinyMCE editor ile içeriğinizi biçimlendirebilirsiniz. Gelişmiş editör özellikleri ve Türkçe dil desteği mevcuttur.
              </p>
            </div>
          </>
        );

      case 'IMAGE':
        return (
          <>
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Görsel başlığı"
              />
            </div>            <div>
              <Label htmlFor="imageUrl">Görsel URL'i *</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div>
              <Label htmlFor="alt">Alt Text (SEO)</Label>
              <Input
                id="alt"
                value={formData.alt || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="Görsel açıklaması (erişilebilirlik için önemli)"
              />
            </div>

            <div>
              <Label htmlFor="caption">Açıklama</Label>
              <Textarea
                id="caption"
                value={formData.caption || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Görsel altında gösterilecek açıklama"
                rows={2}
              />
            </div>
          </>
        );

      case 'VIDEO':
        return (
          <>
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Video başlığı"
              />
            </div>

            <div>
              <Label htmlFor="videoUrl">Video URL'i *</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... veya direct video URL"
                required
              />
            </div>

            <div>
              <Label htmlFor="caption">Açıklama</Label>
              <Textarea
                id="caption"
                value={formData.caption || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Video açıklaması"
                rows={3}
              />
            </div>
          </>
        );

      case 'CTA':
        const ctaData = formData.content ? JSON.parse(formData.content) : {};
        const ctaConfig = formData.config || {};

        return (
          <>
            <div>
              <Label htmlFor="title">CTA Başlığı *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Çağrı başlığı"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={ctaData.description || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content: JSON.stringify({
                    ...ctaData,
                    description: e.target.value
                  })
                }))}
                placeholder="CTA açıklaması"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buttonText">Buton Metni *</Label>
                <Input
                  id="buttonText"
                  value={ctaData.buttonText || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: JSON.stringify({
                      ...ctaData,
                      buttonText: e.target.value
                    })
                  }))}
                  placeholder="Buton yazısı"
                  required
                />
              </div>

              <div>
                <Label htmlFor="buttonUrl">Buton URL'i *</Label>
                <Input
                  id="buttonUrl"
                  value={ctaData.buttonUrl || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: JSON.stringify({
                      ...ctaData,
                      buttonUrl: e.target.value
                    })
                  }))}
                  placeholder="/iletisim veya https://..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="buttonColor">Buton Rengi</Label>
                <select
                  id="buttonColor"
                  value={ctaConfig.buttonColor || 'primary'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    config: {
                      ...ctaConfig,
                      buttonColor: e.target.value
                    }
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="primary">Birincil</option>
                  <option value="secondary">İkincil</option>
                  <option value="success">Başarı</option>
                  <option value="warning">Uyarı</option>
                  <option value="danger">Tehlike</option>
                </select>
              </div>

              <div>
                <Label htmlFor="buttonSize">Buton Boyutu</Label>
                <select
                  id="buttonSize"
                  value={ctaConfig.buttonSize || 'medium'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    config: {
                      ...ctaConfig,
                      buttonSize: e.target.value
                    }
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="small">Küçük</option>
                  <option value="medium">Orta</option>
                  <option value="large">Büyük</option>
                </select>
              </div>

              <div>
                <Label htmlFor="alignment">Hizalama</Label>
                <select
                  id="alignment"
                  value={ctaConfig.alignment || 'left'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    config: {
                      ...ctaConfig,
                      alignment: e.target.value
                    }
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="left">Sol</option>
                  <option value="center">Orta</option>
                  <option value="right">Sağ</option>
                </select>
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="İçerik başlığı"
              />
            </div>

            <div>
              <Label htmlFor="content">İçerik (JSON)</Label>
              <Textarea
                id="content"
                value={formData.content || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder='{"key": "value"}'
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                Bu içerik tipi için JSON formatında veri girin.
              </p>
            </div>
          </>
        );
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels = {
      TEXT: 'Metin',
      IMAGE: 'Görsel',
      VIDEO: 'Video',
      GALLERY: 'Galeri',
      BANNER: 'Banner',
      CTA: 'Çağrı',
      STATISTICS: 'İstatistik',
      TESTIMONIAL: 'Referans'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{getContentTypeLabel(content.type)} Düzenle</CardTitle>
                <CardDescription>İçerik bloğunu düzenleyin ve kaydedin</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            {renderContentFields()}

            {/* Common Settings */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Genel Ayarlar</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fullWidth"
                    checked={formData.fullWidth}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fullWidth: checked }))}
                  />
                  <Label htmlFor="fullWidth">Tam Genişlik</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Aktif</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onCancel}>
                İptal
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Galeri Modal */}
      {isGalleryOpen && (
        <GlobalMediaSelector
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onSelect={handleGallerySelect}
          allowMultiple={false}
          mediaType="image"
        />
      )}
    </div>
  );
}
