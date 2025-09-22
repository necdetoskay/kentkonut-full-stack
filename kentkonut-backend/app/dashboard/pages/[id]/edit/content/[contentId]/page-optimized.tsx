'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { UnifiedTinyMCEEditor } from '@/components/tinymce';
import { toast } from 'sonner';

interface PageContent {
  id: string;
  type: string;
  title?: string;
  content?: string;
  imagePath?: string;
  linkUrl?: string;
  videoUrl?: string;
  html?: string;
  subtitle?: string;
  buttonText?: string;
  description?: string;
  author?: string;
  date?: string;
  metadata?: any;
  settings?: any;
  isActive?: boolean;
  pageId?: string;
  sortOrder?: number;
  caption?: string;
}

export default function ContentEditPage() {
  const router = useRouter();
  const params = useParams();
  const { id: pageId, contentId } = params;
  
  const [content, setContent] = useState<PageContent | null>(null);
  const [formData, setFormData] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/page-contents/${contentId}`);
      
      if (!response.ok) throw new Error('İçerik yüklenemedi');
      
      const data = await response.json();
      
      // API response format kontrolü
      if (data.success && data.data) {
        setContent(data.data);
        setFormData(data.data);
      } else if (data.id) {
        setContent(data);
        setFormData(data);
      } else {
        throw new Error('Geçersiz veri formatı');
      }
    } catch (error) {
      console.error('İçerik yükleme hatası:', error);
      toast.error('İçerik yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    if (contentId) {
      fetchContent();
    }
  }, [fetchContent, contentId]);

  const handleSave = useCallback(async () => {
    if (!formData) return;
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/page-contents/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kaydetme başarısız: ${response.status} - ${errorText}`);
      }

      toast.success('İçerik başarıyla kaydedildi');
      router.push(`/dashboard/pages/${pageId}/edit`);
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error(`Kaydetme sırasında hata oluştu: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }, [formData, contentId, pageId, router]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Bu içeriği silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/page-contents/${contentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Silme başarısız');

      toast.success('İçerik başarıyla silindi');
      router.push(`/dashboard/pages/${pageId}/edit`);
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Silme sırasında hata oluştu');
    }
  }, [contentId, pageId, router]);

  const handleInputChange = useCallback((field: keyof PageContent, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const renderContentFields = useMemo(() => {
    if (!content || !formData) return null;

    switch (content.type) {
      case 'TEXT':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>            <div>
              <Label htmlFor="content">İçerik</Label>
              <UnifiedTinyMCEEditor
                value={formData.content || ''}
                onChange={(content: string) => handleInputChange('content', content)}
                height={400}
                menubar={false}
                enableGallery={true}
                showPreviewPane={false}
                showHtmlPane={false}
                showDebugPane={false}
                showConsolePane={false}
              />
            </div>
          </div>
        );

      case 'IMAGE':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="imagePath">Resim Yolu</Label>
              <Input
                id="imagePath"
                value={formData.imagePath || ''}
                onChange={(e) => handleInputChange('imagePath', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="caption">Açıklama</Label>
              <Textarea
                id="caption"
                value={formData.caption || ''}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'VIDEO':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl || ''}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'BUTTON':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="buttonText">Buton Metni</Label>
              <Input
                id="buttonText"
                value={formData.buttonText || ''}
                onChange={(e) => handleInputChange('buttonText', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="linkUrl">Link URL</Label>
              <Input
                id="linkUrl"
                value={formData.linkUrl || ''}
                onChange={(e) => handleInputChange('linkUrl', e.target.value)}
              />
            </div>
          </div>
        );

      case 'HTML':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="html">HTML Kodu</Label>
              <Textarea
                id="html"
                value={formData.html || ''}
                onChange={(e) => handleInputChange('html', e.target.value)}
                rows={10}
                className="font-mono"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="content">İçerik</Label>
              <Textarea
                id="content"
                value={formData.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={5}
              />
            </div>
          </div>
        );
    }
  }, [content, formData, handleInputChange, saving]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">İçerik yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content || !formData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-red-600">İçerik bulunamadı veya yüklenemedi.</p>
          <Button 
            onClick={() => router.push(`/dashboard/pages/${pageId}/edit`)}
            className="mt-4"
          >
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">      {/* Breadcrumb */}
      <Breadcrumb
        segments={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Sayfalar', href: '/dashboard/pages' },
          { name: 'Düzenle', href: `/dashboard/pages/${pageId}/edit` },
          { name: 'İçerik Düzenle', href: '#' }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/pages/${pageId}/edit`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-2xl font-bold">İçerik Düzenle</h1>
            <p className="text-gray-600">
              {content.type} • {content.title || 'Başlıksız'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="isActive" className="text-sm">
              {formData.isActive ? 'Aktif' : 'Pasif'}
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive || false}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            {formData.isActive ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </div>

          <Button 
            onClick={handleDelete} 
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </Button>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* Content Form */}
      <Card>
        <CardHeader>
          <CardTitle>İçerik Detayları</CardTitle>
          <CardDescription>
            İçerik tipine göre alanları düzenleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContentFields}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Meta Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sortOrder">Sıralama</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder || 0}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="author">Yazar</Label>
              <Input
                id="author"
                value={formData.author || ''}
                onChange={(e) => handleInputChange('author', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
