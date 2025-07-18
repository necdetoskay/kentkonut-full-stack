'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Image } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor-tiptap';
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';
import { ensureAbsoluteUrl } from '@/lib/url-utils';

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

  const handleSave = () => {
    onSave(formData);
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
              <RichTextEditor
                content={formData.content || ''}
                onChange={(value: string) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="İçeriğinizi yazın ve biçimlendirin..."
                minHeight="300px"
              />
              <p className="text-sm text-gray-500 mt-1">
                TipTap editor ile içeriğinizi biçimlendirebilirsiniz. Resim ekleme, floating resimler, hizalama ve text biçimlendirme özelliklerini kullanabilirsiniz.
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
    </div>
  );
}
