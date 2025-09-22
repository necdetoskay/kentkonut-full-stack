'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Eye, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  isActive: boolean;
  isDeletable?: boolean;
  categoryId?: string;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    seoMetrics: number;
  };
}

export default function PagesManagement() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch pages
  const fetchPages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter === 'active' ? 'true' : 'false');
      }
      if (categoryFilter !== 'all') {
        params.append('categoryId', categoryFilter);
      }      const response = await fetch(`/api/pages?${params.toString()}`);
      
      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        return;
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!responseText) {
        console.error('Empty response from API');
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', responseText);
        return;
      }

      if (data.success) {
        setPages(data.data);
      } else {
        console.error('Error fetching pages:', data.error);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete page
  const deletePage = async (pageId: string) => {
    if (!confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        setPages(pages.filter(p => p.id !== pageId));
      } else {
        alert('Sayfa silinirken hata oluştu: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Sayfa silinirken hata oluştu');
    }
  };

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    fetchPages();
  }, [statusFilter, categoryFilter]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Sayfalar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sayfa Yönetimi</h1>
          <p className="text-gray-600">Web sitenizdeki sayfaları yönetin</p>
        </div>
        <Link href="/dashboard/pages/new">
          <Button className="mt-4 lg:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Sayfa Oluştur
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Sayfa ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                <SelectItem value="genel-sayfalar">Genel Sayfalar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pages.length}</div>
            <p className="text-sm text-gray-600">Toplam Sayfa</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pages.filter(p => p.isActive).length}</div>
            <p className="text-sm text-gray-600">Aktif Sayfa</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pages.filter(p => p.publishedAt).length}</div>
            <p className="text-sm text-gray-600">Yayınlanan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pages.reduce((acc, p) => acc + p._count.seoMetrics, 0)}</div>
            <p className="text-sm text-gray-600">SEO Metrikleri</p>
          </CardContent>
        </Card>
      </div>

      {/* Pages List */}
      <div className="grid gap-4">
        {filteredPages.map((page) => (
          <Card key={page.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{page.title}</h3>
                    {page.category && (
                      <Badge variant="outline">{page.category.name}</Badge>
                    )}
                    {page.isActive ? (
                      <Badge variant="default">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Pasif</Badge>
                    )}
                    {page.publishedAt && (
                      <Badge variant="outline">Yayınlandı</Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-2">/{page.slug}</p>
                  {page.excerpt && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{page.excerpt}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>İçerik uzunluğu: {page.content.length} karakter</span>
                    <span>Sıra: {page.order}</span>
                    <span>Son güncelleme: {new Date(page.updatedAt).toLocaleDateString('tr-TR')}</span>
                    {page.publishedAt && (
                      <span>Yayın tarihi: {new Date(page.publishedAt).toLocaleDateString('tr-TR')}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 lg:mt-0">
                  <Link href={`/pages/${page.slug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/pages/${page.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  {page.isDeletable !== false && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePage(page.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredPages.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-500 text-lg">Henüz sayfa bulunamadı</p>
              <p className="text-gray-400 mt-2">İlk sayfanızı oluşturmak için yukarıdaki butonu kullanın</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
