'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import ContentBlocksHelpModal from '@/components/help/ContentBlocksHelpModal';

interface Page {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  showInNavigation: boolean;
  order: number;
  isActive: boolean;
  isDeletable?: boolean;
  hasQuickAccess?: boolean; // Hızlı erişim aktif mi?
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  template: string;
  headerType: string;
  headerImage?: string;
}

interface PageEditFormProps {
  page: Page;
  onUpdate: (updatedPage: Page) => void;
}

export default function PageEditForm({ page, onUpdate }: PageEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(page);

  if (!page) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Sayfa bilgisi yükleniyor...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔍 [FRONTEND] Submitting form data:', JSON.stringify(formData, null, 2));
      console.log('🔍 [FRONTEND] hasQuickAccess value:', formData.hasQuickAccess);
      console.log('🔍 [FRONTEND] Type of hasQuickAccess:', typeof formData.hasQuickAccess);

      // Normalize payload for API (Zod expects metaKeywords as string[])
      const normalizedMetaKeywords: string[] | undefined = Array.isArray(formData.metaKeywords)
        ? formData.metaKeywords
        : typeof formData.metaKeywords === 'string'
          ? formData.metaKeywords
              .split(',')
              .map((k) => k.trim())
              .filter((k) => k.length > 0)
          : undefined;

      // Helper to convert null/empty string to undefined (for optional string fields)
      const toUndef = (v: unknown) => (v === null || v === '' ? undefined : v);

      // Build payload with only fields accepted by backend schema
      const payload: any = {
        title: toUndef((formData as any).title),
        slug: toUndef((formData as any).slug),
        content: toUndef((formData as any).content),
        excerpt: toUndef((formData as any).excerpt),
        imageUrl: toUndef((formData as any).imageUrl), // schema does not accept null
        isActive: (formData as any).isActive,
        categoryId: (formData as any).categoryId ?? undefined, // schema handles '' -> null
        order: typeof (formData as any).order === 'number' ? (formData as any).order : parseInt(String((formData as any).order)) || 0,
        metaTitle: toUndef((formData as any).metaTitle),
        metaDescription: toUndef((formData as any).metaDescription),
        metaKeywords: normalizedMetaKeywords,
        publishedAt: (formData as any).publishedAt ?? undefined, // schema transform handles '' -> null
        hasQuickAccess: (formData as any).hasQuickAccess ?? undefined,
        isDeletable: (formData as any).isDeletable ?? undefined,
      };

      // Remove keys with undefined to keep payload minimal
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      console.log('🔍 [FRONTEND] Normalized payload before PUT:', JSON.stringify(payload, null, 2));

      const response = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('🔍 [FRONTEND] API Response:', JSON.stringify(data, null, 2));
      console.log('🔍 [FRONTEND] Response status:', response.status);

      if (data.success) {
        console.log('🔍 [FRONTEND] Update successful');
        onUpdate(data.data);
      } else {
        console.log('🔍 [FRONTEND] Update failed:', data.error);
        if (data.details) {
          console.log('🔍 [FRONTEND] Error details:', data.details);
        }
        alert('Sayfa güncellenirken hata oluştu: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating page:', error);
      alert('Sayfa güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      {/* Header with Help Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Sayfa Ayarları</h2>
          <p className="text-gray-600">Sayfanın temel bilgilerini ve SEO ayarlarını düzenleyin</p>
        </div>
        <ContentBlocksHelpModal />
      </div>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
          <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          <TabsTrigger value="layout">Layout & Design</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sayfa Bilgileri</CardTitle>
              <CardDescription>Sayfanın temel bilgilerini düzenleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Sayfa Başlığı *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Sayfa URL'i: /{formData.slug}
                </p>
              </div>

              <div>
                <Label htmlFor="subtitle">Alt Başlık</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="order">Sıra</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showInNavigation"
                      checked={formData.showInNavigation}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInNavigation: checked }))}
                    />
                    <Label htmlFor="showInNavigation">Menüde Göster</Label>
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasQuickAccess"
                    checked={formData.hasQuickAccess || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasQuickAccess: checked }))}
                  />
                  <Label htmlFor="hasQuickAccess">Hızlı Erişim Aktif</Label>
                  <span className="text-sm text-gray-500">
                    (Aktif edildiğinde sayfa için hızlı erişim linkleri yönetilebilir)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDeletable"
                    checked={formData.isDeletable !== false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDeletable: checked }))}
                  />
                  <Label htmlFor="isDeletable">Silinebilir</Label>
                  <span className="text-sm text-gray-500">
                    (Kapatıldığında sayfa silinemez hale gelir)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta Bilgileri</CardTitle>
              <CardDescription>Arama motorları için optimizasyon ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  maxLength={60}
                />
                <p className="text-sm text-gray-500 mt-1">{(formData.metaTitle || '').length}/60 karakter</p>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={3}
                  maxLength={160}
                />
                <p className="text-sm text-gray-500 mt-1">{(formData.metaDescription || '').length}/160 karakter</p>
              </div>

              <div>
                <Label htmlFor="metaKeywords">Meta Anahtar Kelimeler</Label>
                <Input
                  id="metaKeywords"
                  value={Array.isArray(formData.metaKeywords) ? formData.metaKeywords.join(', ') : (formData.metaKeywords || '')}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={formData.canonicalUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ogTitle">Open Graph Başlık</Label>
                  <Input
                    id="ogTitle"
                    value={formData.ogTitle || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="ogImage">Open Graph Görseli</Label>
                  <Input
                    id="ogImage"
                    value={formData.ogImage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ogDescription">Open Graph Açıklama</Label>
                <Textarea
                  id="ogDescription"
                  value={formData.ogDescription || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ogDescription: e.target.value }))}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout & Tasarım</CardTitle>
              <CardDescription>Sayfanın görünüm ve layout ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template">Sayfa Şablonu</Label>
                  <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şablon seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEFAULT">Varsayılan</SelectItem>
                      <SelectItem value="FULL_WIDTH">Tam Genişlik</SelectItem>
                      <SelectItem value="SIDEBAR_LEFT">Sol Sidebar</SelectItem>
                      <SelectItem value="SIDEBAR_RIGHT">Sağ Sidebar</SelectItem>
                      <SelectItem value="LANDING">Landing Page</SelectItem>
                      <SelectItem value="CONTACT">İletişim Sayfası</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="headerType">Header Tipi</Label>
                  <Select value={formData.headerType} onValueChange={(value) => setFormData(prev => ({ ...prev, headerType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Header tipini seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMAGE">Görsel</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="SLIDER">Slider</SelectItem>
                      <SelectItem value="GRADIENT">Gradient</SelectItem>
                      <SelectItem value="NONE">Header Yok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.headerType === 'IMAGE' && (
                <div>
                  <Label htmlFor="headerImage">Header Görseli</Label>
                  <Input
                    id="headerImage"
                    value={formData.headerImage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, headerImage: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-6 border-t">
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>

      <ContentBlocksHelpModal />
    </form>
  );
}
