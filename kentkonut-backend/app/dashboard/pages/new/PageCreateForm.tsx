'use client';

import { useState } from 'react';
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, AlertCircle } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';

interface PageFormData {
  title: string;
  slug: string;
  content: string; // Required field in database
  excerpt: string;
  order: number;
  isActive: boolean;
  isDeletable: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[]; // Array to match database
  categoryId: string;
  publishedAt: string;
  hasQuickAccess: boolean;
}

interface FormErrors {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  order?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categoryId?: string;
  publishedAt?: string;
  general?: string;
}

interface PageCreateFormProps {
  onModeSwitch?: () => void;
  showModeSwitch?: boolean;
}

export default function PageCreateForm({
  onModeSwitch,
  showModeSwitch = false
}: PageCreateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    content: JSON.stringify({
      blocks: [],
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
    }),
    excerpt: '',
    order: 0,
    isActive: true,
    isDeletable: true,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [], // Array type
    categoryId: '',
    publishedAt: '',
    hasQuickAccess: false
  });

  // Validation functions
  const validateField = (name: keyof PageFormData, value: any): string | undefined => {
    switch (name) {
      case 'title':
        if (!value || value.trim().length === 0) return 'Sayfa başlığı gereklidir';
        if (value.length < 3) return 'Sayfa başlığı en az 3 karakter olmalıdır';
        if (value.length > 100) return 'Sayfa başlığı en fazla 100 karakter olabilir';
        break;
      case 'slug':
        if (!value || value.trim().length === 0) return 'URL slug gereklidir';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Slug sadece küçük harf, sayı ve tire içerebilir';
        if (value.length < 2) return 'Slug en az 2 karakter olmalıdır';
        if (value.length > 50) return 'Slug en fazla 50 karakter olabilir';
        break;
      case 'content':
        if (!value || value.trim().length === 0) return 'İçerik gereklidir';
        break;
      case 'metaTitle':
        if (value && value.length > 60) return 'Meta başlık en fazla 60 karakter olabilir';
        break;
      case 'metaDescription':
        if (value && value.length > 160) return 'Meta açıklama en fazla 160 karakter olabilir';
        break;
      case 'order':
        if (value < 0) return 'Sıra negatif olamaz';
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof PageFormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-|-$/g, ''),
      metaTitle: title
    }));

    // Clear title error when user starts typing
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  // Handle input change with validation
  const handleInputChange = (name: keyof PageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle metaKeywords as string input (will be converted to array on submit)
  const handleMetaKeywordsChange = (value: string) => {
    setFormData(prev => ({ ...prev, metaKeywords: value.split(',').map(k => k.trim()).filter(k => k.length > 0) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error('Lütfen form hatalarını düzeltin');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API - convert metaKeywords string to array
      const apiData = {
        ...formData,
        metaKeywords: typeof formData.metaKeywords === 'string'
          ? formData.metaKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
          : formData.metaKeywords,
        categoryId: formData.categoryId || undefined, // Convert empty string to undefined
        publishedAt: formData.publishedAt || undefined, // Convert empty string to undefined
      };

      console.log('🔍 [FRONTEND] Sending data to API:', JSON.stringify(apiData, null, 2));

      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Sayfa başarıyla oluşturuldu! İçerik düzenleme arayüzüne yönlendiriliyorsunuz...');
        // Redirect directly to the edit page, which defaults to the content editing tab
        // This provides a streamlined workflow: Create → Edit Content immediately
        router.push(`/dashboard/pages/${data.data.id}/edit`);
      } else {
        // Handle API validation errors
        if (data.details && Array.isArray(data.details)) {
          const newErrors: FormErrors = {};
          data.details.forEach((error: any) => {
            if (error.path && error.path.length > 0) {
              const fieldName = error.path[0] as keyof FormErrors;
              newErrors[fieldName] = error.message;
            }
          });
          setErrors(newErrors);
          toast.error('Form verilerinde hatalar var');
        } else {
          setErrors({ general: data.error || 'Sayfa oluşturulurken hata oluştu' });
          toast.error(data.error || 'Sayfa oluşturulurken hata oluştu');
        }
      }
    } catch (error) {
      console.error('Error creating page:', error);
      setErrors({ general: 'Bağlantı hatası oluştu' });
      toast.error('Bağlantı hatası oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    await handleSubmit(new Event('submit') as any);
  };
  const breadcrumbSegments = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Sayfalar', href: '/dashboard/pages' },
    { name: 'Yeni Sayfa', href: '#' }
  ];

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
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="mb-6">
        {/* BREADCRUMB_TO_FIX: <Breadcrumb segments={breadcrumbSegments} homeHref="/dashboard" /> */}
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/pages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Sayfa Oluştur</h1>
            <p className="text-gray-600 mt-2">
              Sayfa bilgilerini girin ve doğrudan içerik düzenleme arayüzüne geçin
            </p>
          </div>
        </div>

        {showModeSwitch && (
          <Button
            variant="outline"
            onClick={onModeSwitch}
            className="text-sm"
          >
            Gelişmiş Moda Geç
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{errors.general}</span>
          </div>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
            <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sayfa Bilgileri</CardTitle>
                <CardDescription>Sayfanın temel bilgilerini girin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Sayfa Başlığı *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Örn: Hakkımızda"
                    className={errors.title ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <ErrorMessage error={errors.title} />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="hakkimizda"
                    className={errors.slug ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <ErrorMessage error={errors.slug} />
                  {!errors.slug && (
                    <p className="text-sm text-gray-500 mt-1">
                      Sayfa URL'i: /{formData.slug}
                    </p>
                  )}
                </div>

                

                <div>
                  <Label htmlFor="excerpt">Özet</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Sayfa özeti"
                    className={errors.excerpt ? 'border-red-500 focus:border-red-500' : ''}
                    rows={3}
                  />
                  <ErrorMessage error={errors.excerpt} />
                </div>



                <div>
                  <Label htmlFor="order">Sıra</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="max-w-xs"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Sayfaların sıralanması için kullanılır (0 = en üstte)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Sayfa Aktif</Label>
                  <p className="text-sm text-gray-500 ml-2">
                    Aktif olmayan sayfalar yayınlanmaz
                  </p>
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
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    placeholder="SEO için sayfa başlığı"
                    className={errors.metaTitle ? 'border-red-500 focus:border-red-500' : ''}
                    maxLength={60}
                  />
                  <ErrorMessage error={errors.metaTitle} />
                  {!errors.metaTitle && (
                    <p className="text-sm text-gray-500 mt-1">{formData.metaTitle.length}/60 karakter</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Açıklama</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="Arama sonuçlarında görünecek açıklama"
                    className={errors.metaDescription ? 'border-red-500 focus:border-red-500' : ''}
                    rows={3}
                    maxLength={160}
                  />
                  <ErrorMessage error={errors.metaDescription} />
                  {!errors.metaDescription && (
                    <p className="text-sm text-gray-500 mt-1">{formData.metaDescription.length}/160 karakter</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="metaKeywords">Meta Anahtar Kelimeler</Label>
                  <Input
                    id="metaKeywords"
                    value={Array.isArray(formData.metaKeywords) ? formData.metaKeywords.join(', ') : formData.metaKeywords}
                    onChange={(e) => handleMetaKeywordsChange(e.target.value)}
                    placeholder="anahtar, kelimeler, virgülle, ayrılmış"
                    className={errors.metaKeywords ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  <ErrorMessage error={errors.metaKeywords} />
                </div>

                <div>
                  <Label htmlFor="categoryId">Kategori</Label>
                  <Input
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    placeholder="Kategori ID (opsiyonel)"
                    className={errors.categoryId ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  <ErrorMessage error={errors.categoryId} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="publishedAt">Yayın Tarihi</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                      className={errors.publishedAt ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    <ErrorMessage error={errors.publishedAt} />
                  </div>

                  <div>
                    <Label htmlFor="hasQuickAccess">Hızlı Erişim</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="hasQuickAccess"
                        checked={formData.hasQuickAccess}
                        onCheckedChange={(checked) => handleInputChange('hasQuickAccess', checked)}
                      />
                      <span>Hızlı erişim menüsünde göster</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Taslak Kaydet
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" disabled={loading}>
              <Eye className="w-4 h-4 mr-2" />
              Önizle
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Sayfa Oluştur ve İçerik Ekle'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
