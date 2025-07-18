'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor-tiptap';
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  order: number;
  excerpt: string;
  imageUrl: string;
}

export default function NewSimplePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PageFormData>({    defaultValues: {
      title: '',
      slug: '',
      content: '',
      isActive: true,
      metaTitle: '',
      metaDescription: '',
      imageUrl: '',
      order: 0,
      excerpt: ''
    }
  });

  // Başlık değiştiğinde slug'ı otomatik oluştur
  const title = watch('title');
  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('slug', slug);
  };

  const onSubmit = async (data: PageFormData) => {
    // İçeriği formData'ya ekle
    data.content = content;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/simple-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Sayfa oluşturulamadı');
      }

      router.push('/dashboard/simple-pages');
    } catch (error) {
      console.error('Sayfa oluşturma hatası:', error);
      alert('Sayfa oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold">Yeni Sayfa</h1>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={isLoading}
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Başlık <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Sayfa başlığı"
                  {...register('title', { 
                    required: 'Başlık gereklidir',
                    onBlur: generateSlug
                  })}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="sayfa-slug"
                  {...register('slug', { 
                    required: 'Slug gereklidir',
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message: 'Geçerli bir slug giriniz (sadece küçük harfler, rakamlar ve tire)'
                    }
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          </CardContent>
        </Card>        {/* Sayfa İçeriği */}
        <Card>
          <CardHeader>
            <CardTitle>Sayfa İçeriği</CardTitle>
          </CardHeader>          <CardContent>            <RichTextEditor
              content={content} 
              onChange={setContent} 
              minHeight="500px"
            />
          </CardContent>
        </Card>

        {/* Görsel İçerik */}
        <Card>
          <CardHeader>
            <CardTitle>Sayfa Görseli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Öne Çıkan Görsel</Label>
              
              {/* Seçili görsel önizlemesi */}
              {watch('imageUrl') && (
                <div className="relative inline-block">
                  <img 
                    src={watch('imageUrl')} 
                    alt="Seçili görsel" 
                    className="max-w-xs h-32 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setValue('imageUrl', '')}
                    className="absolute top-2 right-2"
                  >
                    ×
                  </Button>
                </div>
              )}              <GlobalMediaSelector
                onSelect={(media: GlobalMediaFile) => {
                  console.log("GlobalMediaSelector onSelect:", media)
                  setValue('imageUrl', media?.url || '')
                }}
                defaultCategory="content-images"
                trigger={
                  <Button type="button" variant="outline" className="w-full">
                    {watch('imageUrl') ? "Görseli Değiştir" : "Görsel Seç"}
                  </Button>
                }
              />
              
              <p className="text-sm text-gray-500">
                Bu görsel sayfa önizlemelerinde ve SEO için kullanılacaktır.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Başlık</Label>
              <Input
                id="metaTitle"
                placeholder="Meta başlık (boş bırakılırsa sayfa başlığı kullanılır)"
                {...register('metaTitle')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Açıklama</Label>
              <Input
                id="metaDescription"
                placeholder="Sayfanın kısa açıklaması (SEO için önemli)"
                {...register('metaDescription')}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
