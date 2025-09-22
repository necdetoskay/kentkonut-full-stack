'use client';

import { useState, useEffect } from 'react';
import Link from "next/link"
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Eye, Save } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import PageEditForm from './PageEditForm';
import NewContentEditor from './NewContentEditor';
import ErrorBoundary from '@/app/components/ui/error-boundary';
import { QuickAccessLinksManager } from '@/components/quick-access/QuickAccessLinksManager';

interface FullPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  hasQuickAccess?: boolean; // Hızlı erişim aktif mi?
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  seoMetrics: any[];
  _count?: {
    seoMetrics: number;
  };
}

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  publishedAt?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
}



export default function PageEditPage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<FullPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  const fetchPage = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching page with ID:', params.id);
      const response = await fetch(`/api/pages/${params.id}`);
      const data = await response.json();
      console.log('📄 Page data received:', data);

      if (data.success) {
        setPage(data.data);
        console.log('✅ Page state updated:', data.data.title);
      } else {
        console.error('❌ Error fetching page:', data.error);
      }
    } catch (error) {
      console.error('💥 Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };  const handlePageUpdate = (updatedPage: Page) => {
    // Only update the basic page fields, keep the full page structure
    if (page) {
      setPage({
        ...page,
        ...updatedPage,
        // Preserve fields that might not be in the update
        seoMetrics: page.seoMetrics,
        _count: page._count
      });
    }
  };

  const handleContentUpdate = () => {
    // Refresh page to get updated contents
    fetchPage();
  };

  useEffect(() => {
    if (params.id) {
      fetchPage();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Sayfa yükleniyor...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Sayfa bulunamadı</div>
      </div>
    );
  }
  const breadcrumbSegments = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Sayfalar', href: '/dashboard/pages' },
    { name: page?.title || 'Sayfa Düzenle', href: '#' }
  ];

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
          <div>            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
              <Badge variant={page.isActive ? "default" : "secondary"}>
                {page.isActive ? "Aktif" : "Pasif"}
              </Badge>
              {page.category && (
                <Badge variant="outline">{page.category.name}</Badge>
              )}
            </div>
            <p className="text-gray-600">/{page.slug}</p>
          </div>
        </div>        <div className="flex items-center gap-2">
          <Link href={`/pages/${page.slug}`} target="_blank">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Önizle
            </Button>
          </Link>
          <Button onClick={() => setActiveTab('settings')}>
            <Save className="w-4 h-4 mr-2" />
            Ayarları Düzenle
          </Button>
        </div>
      </div>      {/* Page Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{page.content ? 1 : 0}</div>
            <p className="text-sm text-gray-600">İçerik Mevcut</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{page.seoMetrics?.length || 0}</div>
            <p className="text-sm text-gray-600">SEO Metriği</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{page.category?.name || 'Kategori Yok'}</div>
            <p className="text-sm text-gray-600">Kategori</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Date(page.updatedAt).toLocaleDateString('tr-TR')}
            </div>
            <p className="text-sm text-gray-600">Son Güncelleme</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${page?.hasQuickAccess ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="content">İçerik Yönetimi</TabsTrigger>
          <TabsTrigger value="settings">Sayfa Ayarları</TabsTrigger>
          <TabsTrigger value="seo">SEO & Analytics</TabsTrigger>
          {page?.hasQuickAccess && (
            <TabsTrigger value="quickaccess">Hızlı Erişim</TabsTrigger>
          )}
        </TabsList>        <TabsContent value="content" className="space-y-6">
          <ErrorBoundary>
            {page && (
              <NewContentEditor 
                page={page as any} 
                onContentUpdate={handleContentUpdate}
              />
            )}
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <ErrorBoundary>            {page && (
              <PageEditForm 
                page={page as any} 
                onUpdate={handlePageUpdate as any}
              />
            )}
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Analytics</CardTitle>
              <CardDescription>Sayfa performansı ve SEO metrikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">SEO analytics ve performans metrikleri yakında eklenecek.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {page?.hasQuickAccess && !loading && page.id && (
          <TabsContent value="quickaccess" className="space-y-6">
            <QuickAccessLinksManager
              moduleType="page"
              moduleId={page.id}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
