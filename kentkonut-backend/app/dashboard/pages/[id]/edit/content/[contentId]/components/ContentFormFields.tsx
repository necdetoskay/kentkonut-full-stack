'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UnifiedTinyMCEEditor } from '@/components/tinymce';
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';
import { Button } from '@/components/ui/button';
import { Image } from 'lucide-react';
import { useState } from 'react';



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

interface ContentFormFieldsProps {
  formData: PageContent;
  onUpdate: (updates: Partial<PageContent>) => void;
}

export default function ContentFormFields({ formData, onUpdate }: ContentFormFieldsProps) {
  const renderTextFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="İçerik başlığı"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="subtitle">Alt Başlık</Label>
          <Input
            id="subtitle"
            value={formData.subtitle || ''}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="İçerik alt başlığı"
            className="mt-1"
          />
        </div>
      </div>        <div>
        <Label htmlFor="content">İçerik</Label>
        <div className="mt-2">          <UnifiedTinyMCEEditor
            value={formData.content || ''}
            onChange={(value: string) => onUpdate({ content: value })}
            height={400}
            menubar={true}
            enableGallery={true}
            showPreviewPane={false}
            showHtmlPane={false}
            showDebugPane={false}
            showConsolePane={false}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          TinyMCE editör ile içeriğinizi biçimlendirebilirsiniz. Gelişmiş editör özellikleri ve Türkçe dil desteği mevcuttur.
        </p>
      </div>
    </div>
  );

  const renderImageFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Görsel başlığı"
            className="mt-1"
          />
        </div>        <div>
          <Label htmlFor="imageUrl">Görsel URL'i *</Label>
          <div className="flex mt-1 gap-2">
            <Input
              id="imageUrl"
              value={formData.imageUrl || ''}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              required
              className="flex-1"
            />            <GlobalMediaSelector
              onSelect={(media: GlobalMediaFile) => {
                onUpdate({ 
                  imageUrl: media.url,
                  alt: formData.alt || media.alt || media.originalName,
                  caption: formData.caption || media.caption
                });
              }}
              defaultCategory="content-images"
              trigger={
                <Button type="button" variant="secondary" className="flex-shrink-0">
                  <Image className="w-4 h-4 mr-2" />
                  Görsel Seç
                </Button>
              }
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Görseli galeriden seçebilir veya yeni görsel yükleyebilirsiniz
          </p>
        </div>
          <div>
          <Label htmlFor="alt">Alt Text (SEO)</Label>
          <Input
            id="alt"
            value={formData.alt || ''}
            onChange={(e) => onUpdate({ alt: e.target.value })}
            placeholder="Görsel açıklaması erişilebilirlik için önemli"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="caption">Açıklama</Label>
          <Textarea
            id="caption"
            value={formData.caption || ''}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder="Görsel altında gösterilecek açıklama"
            rows={3}
            className="mt-1"
          />
        </div>
      </div>      {formData.imageUrl && (
        <div>
          <Label>Önizleme</Label>
          <div className="mt-2 border rounded-lg p-4 bg-gray-50">
            <div className="relative">
              <img 
                src={formData.imageUrl} 
                alt={formData.alt || "Görsel önizleme"} 
                className="max-w-full h-auto max-h-64 rounded-lg shadow-sm mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.classList.remove('hidden');
                }}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center p-4">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Görsel yüklenemedi</p>
                </div>
              </div>
              
              {formData.alt && (
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Alt Text:</strong> {formData.alt}
                </div>
              )}
              
              {formData.caption && (
                <div className="mt-1 text-sm text-gray-600">
                  <strong>Açıklama:</strong> {formData.caption}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVideoFields = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Video başlığı"
            className="mt-1"
          />
        </div>        <div>
          <Label htmlFor="videoUrl">Video URL'si veya Yüklenmiş Video *</Label>
          <div className="flex mt-1 gap-2">
            <Input
              id="videoUrl"
              value={formData.videoUrl || ''}
              onChange={(e) => onUpdate({ videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=... veya direct video URL"
              required
              className="flex-1"
            />            <GlobalMediaSelector
              onSelect={(media: GlobalMediaFile) => {
                onUpdate({ 
                  videoUrl: media.url,
                  caption: formData.caption || media.caption
                });
              }}
              defaultCategory="general"
              trigger={
                <Button type="button" variant="secondary" className="flex-shrink-0">
                  <Image className="w-4 h-4 mr-2" />
                  Video Seç/Yükle
                </Button>
              }
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            YouTube video adresi girebilir veya kendi videonuzu yükleyebilirsiniz
          </p>
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="content">Açıklama</Label>
          <Textarea
            id="content"
            value={formData.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Video açıklaması"
            rows={4}
            className="mt-1"
          />
        </div>
      </div>      {formData.videoUrl && (
        <div>
          <Label>Önizleme</Label>
          <div className="mt-2 border rounded-lg p-4 bg-gray-50">
            <div className="aspect-video">
              {(() => {
                // YouTube video
                if (formData.videoUrl.includes('youtube.com') || formData.videoUrl.includes('youtu.be')) {
                  const embedUrl = formData.videoUrl.includes('youtube.com/embed') 
                    ? formData.videoUrl 
                    : formData.videoUrl.replace('watch?v=', 'embed/');
                  
                  return (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  );
                }
                // Vimeo video
                else if (formData.videoUrl.includes('vimeo.com')) {
                  const vimeoUrl = formData.videoUrl.includes('player.vimeo.com') 
                    ? formData.videoUrl 
                    : formData.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/');
                  
                  return (
                    <iframe
                      src={vimeoUrl}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  );
                }
                // Yüklenen video dosyası
                else if (formData.videoUrl.match(/\.(mp4|webm|ogg)$/i) || 
                         formData.videoUrl.startsWith('/uploads/') || 
                         formData.videoUrl.startsWith('http') && 
                         !formData.videoUrl.includes('youtube') && 
                         !formData.videoUrl.includes('vimeo')) {
                  return (
                    <video 
                      src={formData.videoUrl} 
                      className="w-full h-full rounded-lg"
                      controls
                    />
                  );
                }
                
                // Diğer URL'ler için varsayılan iframe
                return (
                  <iframe
                    src={formData.videoUrl}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                );
              })()}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Video kaynağı: {formData.videoUrl.startsWith('/uploads/') 
                ? 'Yüklenen video dosyası' 
                : formData.videoUrl.includes('youtube') 
                ? 'YouTube' 
                : formData.videoUrl.includes('vimeo') 
                ? 'Vimeo' 
                : 'Harici kaynak'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderDefaultFields = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="content">İçerik</Label>
        <Textarea
          id="content"
          value={formData.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="İçerik metni"
          rows={6}
          className="mt-1"
        />
      </div>
    </div>
  );

  switch (formData.type) {
    case 'TEXT':
      return renderTextFields();
    case 'IMAGE':
      return renderImageFields();
    case 'VIDEO':
      return renderVideoFields();
    default:
      return renderDefaultFields();
  }
}
