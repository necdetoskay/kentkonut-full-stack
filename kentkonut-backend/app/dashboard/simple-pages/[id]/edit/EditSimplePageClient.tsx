"use client";

import { useState, useEffect } from 'react';
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

export default function EditSimplePageClient({ id }: { id: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<PageFormData>({
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      isActive: true,
      metaTitle: '',
      metaDescription: '',
      imageUrl: ''
    }
  });

  // Load page data on component mount
  useEffect(() => {
    const loadPage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/simple-pages/${id}`);
        
        if (!response.ok) {
          throw new Error('Sayfa yüklenemedi');
        }
        
        const pageData = await response.json();
          // Form verilerini ayarla
        reset({
          title: pageData.title || '',
          slug: pageData.slug || '',
          content: pageData.content || '',
          isActive: pageData.isActive !== undefined ? pageData.isActive : true,
          metaTitle: pageData.metaTitle || '',
          metaDescription: pageData.metaDescription || '',
          order: pageData.order || 0,
          excerpt: pageData.excerpt || '',
          imageUrl: pageData.imageUrl || ''
        });
        
        setContent(pageData.content || '');
        setIsPageLoaded(true);
      } catch (error) {
        console.error('Error loading page:', error);
        alert('Sayfa yüklenirken hata oluştu!');
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [id, reset, router]);

  const onSubmit = async (data: PageFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/simple-pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          content: content, // Editor'dan gelen content
        }),
      });

      if (!response.ok) {
        throw new Error('Sayfa güncellenirken hata oluştu');
      }

      alert('Sayfa başarıyla güncellendi!');
      router.push('/dashboard/simple-pages');
    } catch (error) {
      console.error('Update error:', error);
      alert('Güncelleme sırasında hata oluştu!');
    } finally {
      setIsLoading(false);
    }
  };
  const handleMediaSelect = (media: GlobalMediaFile) => {
    if (media) {
      setValue('imageUrl', media.url);
    }
  };

  if (!isPageLoaded) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Sayfa yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        
        <h2 className="text-3xl font-bold tracking-tight">Basit Sayfa Düzenle</h2>
        <p className="text-muted-foreground">
          Sayfanın içeriğini ve ayarlarını düzenleyin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sayfa Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>                <Input
                  id="title"
                  {...register('title', { required: 'Başlık gereklidir' })}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>                <Input
                  id="slug"
                  {...register('slug', { required: 'Slug gereklidir' })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  {...register('metaTitle')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Sıra</Label>
                <Input
                  id="order"
                  type="number"
                  {...register('order', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Açıklama</Label>
              <Input
                id="metaDescription"
                {...register('metaDescription')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Özet</Label>
              <Input
                id="excerpt"
                {...register('excerpt')}
              />
            </div>

            <div className="space-y-2">
              <Label>Görsel</Label>              <GlobalMediaSelector
                onSelect={handleMediaSelect}
                title="Sayfa Görseli Seç"
                description="Sayfa için kullanılacak görseli seçin"
                defaultCategory="content-images"
                acceptedTypes={['image/*']}
                buttonText="Görsel Seç"
              />
              {watch('imageUrl') && (
                <div className="mt-2">
                  <img
                    src={watch('imageUrl')}
                    alt="Seçilen görsel"
                    className="w-32 h-20 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">İçerik</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Sayfa içeriğini buraya yazın..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                {...register('isActive')}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
