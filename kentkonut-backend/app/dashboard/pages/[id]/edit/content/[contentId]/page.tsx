'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Import our new components
import ContentHeader from './components/ContentHeader';
import ContentFormFields from './components/ContentFormFields';
import ContentSettings from './components/ContentSettings';

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
        // Eğer data doğrudan content ise
        setContent(data);
        setFormData(data);
      } else {
        throw new Error('Geçersiz veri formatı');
      }
    } catch (error) {
      console.error('❌ İçerik yükleme hatası:', error);
      toast.error('İçerik yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [contentId]);

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

      const result = await response.json();

      toast.success('İçerik başarıyla kaydedildi');
      router.push(`/dashboard/pages/${pageId}/edit`);
    } catch (error) {
      console.error('❌ Kaydetme hatası:', error);
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

  const handleFormUpdate = useCallback((updates: Partial<PageContent>) => {
    setFormData(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">İçerik yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content || !formData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">İçerik bulunamadı</p>
          <Button onClick={() => router.push(`/dashboard/pages/${pageId}/edit`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ContentHeader
        pageId={pageId as string}
        contentId={contentId as string}
        contentType={formData.type}
        order={formData.order}
        isActive={formData.isActive}
        saving={saving}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>İçerik Detayları</CardTitle>
              <CardDescription>
                İçerik bilgilerini düzenleyin ve kaydedin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ContentFormFields 
                formData={formData}
                onUpdate={handleFormUpdate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <ContentSettings 
            formData={formData}
            onUpdate={handleFormUpdate}
          />
        </div>
      </div>
    </div>
  );
}
