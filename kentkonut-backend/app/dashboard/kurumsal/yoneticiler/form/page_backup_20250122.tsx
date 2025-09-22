'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, User, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalMediaSelector } from '@/components/media/GlobalMediaSelector';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ExecutiveQuickLinksManager } from '@/components/executives/ExecutiveQuickLinksManager';

interface Executive {
  id: string;
  name: string;
  title: string;
  position: string;
  slug?: string;
  type: 'PRESIDENT' | 'GENERAL_MANAGER' | 'DIRECTOR' | 'MANAGER' | 'DEPARTMENT' | 'STRATEGY' | 'GOAL';
  email?: string;
  phone?: string;
  imageUrl?: string;
  linkedIn?: string;
  pageId?: string;
  order: number;
  isActive: boolean;
}

interface GlobalMediaFile {
  id: string;
  url: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  alt?: string;
  caption?: string;
  category: number;
  createdAt: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
}

export default function ExecutiveFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const executiveId = searchParams.get('id');
  const isEditMode = !!executiveId;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    position: '',
    type: 'MANAGER' as Executive['type'],
    email: '',
    phone: '',
    imageUrl: '',
    linkedIn: '',
    pageId: '',
    order: 0,
    isActive: true,
    quickAccessUrl: '',
    hasQuickAccessLinks: false,
  });

  // Load executive data if editing
  useEffect(() => {
    if (isEditMode && executiveId) {
      const loadExecutive = async () => {
        try {
          const response = await fetch(`/api/yoneticiler/${executiveId}`);
          if (!response.ok) {
            throw new Error('Yönetici bulunamadı');
          }
          const executive = await response.json();
          
          setFormData({
            name: executive.name || '',
            title: executive.title || '',
            position: executive.position || '',
            type: executive.type || 'MANAGER',
            email: executive.email || '',
            phone: executive.phone || '',
            imageUrl: executive.imageUrl || '',
            linkedIn: executive.linkedIn || '',
            pageId: executive.pageId || '',
            order: executive.order || 0,
            isActive: executive.isActive ?? true,
            quickAccessUrl: executive.quickAccessUrl || '',
            hasQuickAccessLinks: executive.hasQuickAccessLinks || false,
          });

          // Set selected media if imageUrl exists
          if (executive.imageUrl) {
            // Try to find the media file from the URL
            // This is a simplified approach - in a real app you might want to fetch media details
            setSelectedMedia({
              id: 'existing',
              url: executive.imageUrl,
              originalName: 'Mevcut fotoğraf',
              filename: 'existing.jpg',
              mimeType: 'image/jpeg',
              size: 0,
              category: 6,
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Load error:', error);
          toast.error('Yönetici bilgileri yüklenemedi');
          router.push('/dashboard/kurumsal/yoneticiler');
        } finally {
          setIsLoading(false);
        }
      };

      loadExecutive();
    }
  }, [isEditMode, executiveId, router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMediaSelect = (media: GlobalMediaFile | null) => {
    setSelectedMedia(media);
    handleInputChange('imageUrl', media?.url || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.title.trim()) {
      toast.error('Ad Soyad ve Unvan alanları zorunludur');
      return;
    }

    setIsSaving(true);

    try {
      const url = isEditMode ? `/api/yoneticiler/${executiveId}` : '/api/yoneticiler';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'İşlem başarısız');
      }

      toast.success(
        isEditMode
          ? 'Yönetici başarıyla güncellendi'
          : 'Yönetici başarıyla eklendi'
      );

      router.push('/dashboard/corporate/executives');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(
        error instanceof Error ? error.message : 'İşlem başarısız oldu'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Kurumsal', href: '/dashboard/corporate' },
          { label: 'Yöneticiler', href: '/dashboard/corporate/executives' },
          { label: isEditMode ? 'Düzenle' : 'Yeni Ekle', href: '#' }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Yönetici Düzenle' : 'Yeni Yönetici Ekle'}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Mevcut yönetici bilgilerini düzenleyin' : 'Yeni bir yönetici ekleyin'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className={`grid w-full ${formData.hasQuickAccessLinks ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <TabsTrigger value="info">Yönetici Bilgileri</TabsTrigger>
                {formData.hasQuickAccessLinks && (
                  <TabsTrigger value="quicklinks">Hızlı Erişim Linkleri</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Yönetici Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Unvan *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Genel Müdür"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Pozisyon</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="Departman Müdürü"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tip *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESIDENT">Başkan</SelectItem>
                        <SelectItem value="GENERAL_MANAGER">Genel Müdür</SelectItem>
                        <SelectItem value="DIRECTOR">Direktör</SelectItem>
                        <SelectItem value="MANAGER">Müdür</SelectItem>
                        <SelectItem value="DEPARTMENT">Birimlerimiz</SelectItem>
                        <SelectItem value="STRATEGY">Stratejimiz</SelectItem>
                        <SelectItem value="GOAL">Hedefimiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="ornek@kentkonut.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+90 555 123 45 67"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn</Label>
                  <Input
                    id="linkedIn"
                    type="url"
                    value={formData.linkedIn}
                    onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quickAccessUrl">Hedef URL</Label>
                  <Input
                    id="quickAccessUrl"
                    type="text"
                    value={formData.quickAccessUrl}
                    onChange={(e) => handleInputChange('quickAccessUrl', e.target.value)}
                    placeholder="/baskan veya https://example.com/yonetici-detay"
                  />
                  <p className="text-xs text-muted-foreground">
                    Yöneticinin ana hedef sayfasına yönlendirilecek URL'yi girin (opsiyonel).
                  </p>
                </div>

                <Separator />

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">Sıralama</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isActive">Durum</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                      />
                      <Label htmlFor="isActive">
                        {formData.isActive ? 'Aktif' : 'Pasif'}
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hasQuickAccessLinks">Hızlı Erişim Linkleri</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasQuickAccessLinks"
                        checked={formData.hasQuickAccessLinks}
                        onCheckedChange={(checked) => handleInputChange('hasQuickAccessLinks', checked)}
                      />
                      <Label htmlFor="hasQuickAccessLinks">
                        {formData.hasQuickAccessLinks ? 'Etkin' : 'Devre Dışı'}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Etkinleştirildiğinde yönetici için hızlı erişim linkleri yönetebilirsiniz.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
              </TabsContent>

              {/* Quick Access Links Tab */}
              {formData.hasQuickAccessLinks && (
                <TabsContent value="quicklinks">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        Hızlı Erişim Linkleri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditMode && executiveId ? (
                        <ExecutiveQuickLinksManager executiveId={executiveId} />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Hızlı erişim linkleri henüz kullanılamıyor</p>
                          <p>Yöneticiyi önce kaydedin, ardından düzenleme sayfasında hızlı erişim linklerini ekleyebilirsiniz.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Media Selection - PROJELERDEKİ GİBİ ÇALIŞAN YAKLAŞIM */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Yönetici Fotoğrafı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Image Preview */}
                {selectedMedia && (
                  <div className="space-y-3">
                    <div className="aspect-square w-full max-w-[200px] mx-auto">
                      <img
                        src={selectedMedia.url}
                        alt="Seçilen fotoğraf"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Seçilen fotoğraf</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedMedia.originalName}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSelectedMedia(null);
                          handleInputChange('imageUrl', '');
                        }}
                      >
                        Fotoğrafı Kaldır
                      </Button>
                    </div>
                  </div>
                )}

                {/* ÇALIŞAN YAKLAŞIM: GlobalMediaSelector */}
                <GlobalMediaSelector
                  onSelect={handleMediaSelect}
                  selectedMedia={selectedMedia}
                  acceptedTypes={['image/*']}
                  defaultCategory="kurumsal-images"
                  restrictToCategory={true}
                  customFolder="media/kurumsal"
                  buttonText={selectedMedia ? "Fotoğrafı Değiştir" : "Fotoğraf Seç"}
                  title="Yönetici Fotoğrafı Seçin"
                  description="Kurumsal klasöründen yönetici fotoğrafı seçin veya yeni bir fotoğraf yükleyin"
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving
                ? 'Kaydediliyor...'
                : isEditMode
                  ? 'Değişiklikleri Kaydet'
                  : 'Yönetici Ekle'
              }
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
