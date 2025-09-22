'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { PageFormData, FormErrors } from '../hooks/usePageForm';

interface PageMetadataFormProps {
  formData: PageFormData;
  errors: FormErrors;
  onTitleChange: (title: string) => void;
  onInputChange: (name: keyof PageFormData, value: any) => void;
}

export default function PageMetadataForm({
  formData,
  errors,
  onTitleChange,
  onInputChange
}: PageMetadataFormProps) {

  // Error display component
  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
        <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
        <TabsTrigger value="settings">Ayarlar</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-6 mt-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Sayfa Başlığı <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Sayfa başlığını girin"
            className={errors.title ? 'border-red-500' : ''}
          />
          <ErrorMessage error={errors.title} />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">
            URL Slug <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => onInputChange('slug', e.target.value)}
            placeholder="url-slug"
            className={errors.slug ? 'border-red-500' : ''}
          />
          <p className="text-sm text-gray-500">
            URL'de görünecek kısım. Otomatik olarak başlıktan oluşturulur.
          </p>
          <ErrorMessage error={errors.slug} />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt">Özet</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => onInputChange('excerpt', e.target.value)}
            placeholder="Sayfa özeti (isteğe bağlı)"
            rows={3}
            className={errors.excerpt ? 'border-red-500' : ''}
          />
          <ErrorMessage error={errors.excerpt} />
        </div>


      </TabsContent>

      <TabsContent value="seo" className="space-y-6 mt-6">
        {/* Meta Title */}
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Başlık</Label>
          <Input
            id="metaTitle"
            value={formData.metaTitle}
            onChange={(e) => onInputChange('metaTitle', e.target.value)}
            placeholder="SEO için meta başlık"
            className={errors.metaTitle ? 'border-red-500' : ''}
          />
          <p className="text-sm text-gray-500">
            Arama motorlarında görünecek başlık (60 karakter önerilir)
          </p>
          <ErrorMessage error={errors.metaTitle} />
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Açıklama</Label>
          <Textarea
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => onInputChange('metaDescription', e.target.value)}
            placeholder="SEO için meta açıklama"
            rows={3}
            className={errors.metaDescription ? 'border-red-500' : ''}
          />
          <p className="text-sm text-gray-500">
            Arama motorlarında görünecek açıklama (160 karakter önerilir)
          </p>
          <ErrorMessage error={errors.metaDescription} />
        </div>

        {/* Meta Keywords */}
        <div className="space-y-2">
          <Label htmlFor="metaKeywords">Meta Anahtar Kelimeler</Label>
          <Input
            id="metaKeywords"
            value={Array.isArray(formData.metaKeywords) 
              ? formData.metaKeywords.join(', ') 
              : formData.metaKeywords}
            onChange={(e) => onInputChange('metaKeywords', e.target.value)}
            placeholder="anahtar, kelime, virgülle, ayrılmış"
            className={errors.metaKeywords ? 'border-red-500' : ''}
          />
          <p className="text-sm text-gray-500">
            Virgülle ayrılmış anahtar kelimeler
          </p>
          <ErrorMessage error={errors.metaKeywords} />
        </div>
      </TabsContent>

      <TabsContent value="settings" className="space-y-6 mt-6">
        {/* Order */}
        <div className="space-y-2">
          <Label htmlFor="order">Sıralama</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => onInputChange('order', parseInt(e.target.value) || 0)}
            placeholder="0"
            min="0"
            className={errors.order ? 'border-red-500' : ''}
          />
          <ErrorMessage error={errors.order} />
        </div>

        {/* Published At */}
        <div className="space-y-2">
          <Label htmlFor="publishedAt">Yayın Tarihi</Label>
          <Input
            id="publishedAt"
            type="datetime-local"
            value={formData.publishedAt}
            onChange={(e) => onInputChange('publishedAt', e.target.value)}
            className={errors.publishedAt ? 'border-red-500' : ''}
          />
          <p className="text-sm text-gray-500">
            Boş bırakılırsa şu anki tarih kullanılır
          </p>
          <ErrorMessage error={errors.publishedAt} />
        </div>

        {/* Switches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aktif</Label>
              <p className="text-sm text-gray-500">
                Sayfa yayında görünür olsun mu?
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => onInputChange('isActive', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hızlı Erişim</Label>
              <p className="text-sm text-gray-500">
                Hızlı erişim menüsünde görünsün mü?
              </p>
            </div>
            <Switch
              checked={formData.hasQuickAccess}
              onCheckedChange={(checked) => onInputChange('hasQuickAccess', checked)}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
