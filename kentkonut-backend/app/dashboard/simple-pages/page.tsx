'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Search, Edit, Trash2, Eye } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { SimplePagesAPI } from '@/utils/simplePagesApi';
import { handleApiError } from '@/utils/apiClient';

interface Page {
  id: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  order: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  categoryId?: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
}

export default function SimplePagesList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Sayfaları yükle
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setIsLoading(true);
        const data = await SimplePagesAPI.getAll();
        setPages(data);
      } catch (error) {
        const { message } = handleApiError(error);
        console.error('Sayfaları yükleme hatası:', error);
        console.error('Hata detayı:', message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, []);

  // Sayfa silme işlemi
  const handleDeletePage = async (id: string) => {
    if (!confirm('Bu sayfayı silmek istediğinize emin misiniz?')) return;
    
    try {
      await SimplePagesAPI.delete(id);
      setPages(pages.filter(page => page.id !== id));
    } catch (error) {
      const { message } = handleApiError(error);
      console.error('Sayfa silme hatası:', error);
      console.error('Hata detayı:', message);
    }
  };

  // Filtreleme işlevi
  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sayfalar</h1>
        <Button onClick={() => router.push('/dashboard/simple-pages/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Sayfa
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sayfa Yönetimi</CardTitle>
          <CardDescription>
            Web sitesi sayfalarını buradan yönetebilirsiniz.
          </CardDescription>
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Sayfa ara..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Sayfalar yükleniyor...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Arama kriterlerine uygun sayfa bulunamadı.' : 'Henüz sayfa eklenmemiş.'}
              </p>
              {searchTerm ? (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Tüm sayfaları göster
                </Button>
              ) : (
                <Button onClick={() => router.push('/dashboard/simple-pages/new')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  İlk sayfayı ekle
                </Button>
              )}
            </div>
          ) : (
            <Table>              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Son Güncelleme</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead></TableRow>
              </TableHeader>
              <TableBody>{filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        page.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {page.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(page.updatedAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const url = `/pages/${page.slug}`;
                            console.log('Preview button clicked for:', page.slug);
                            console.log('Opening URL:', url);
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Görüntüle</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/dashboard/simple-pages/${page.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Düzenle</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePage(page.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Sil</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>))}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
