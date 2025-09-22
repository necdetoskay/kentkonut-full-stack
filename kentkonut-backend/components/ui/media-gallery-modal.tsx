'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, X, Upload, Image as ImageIcon, FileImage, Check } from 'lucide-react';
import { toast } from 'sonner';
import { corporateApiFetch } from '@/utils/corporateApi';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  title?: string;
  allowMultiple?: boolean;
}

export default function MediaGalleryModal({
  isOpen,
  onClose,
  onSelect,
  title = "Medya Galerisi",
  allowMultiple = false
}: MediaGalleryModalProps) {
  const { data: session, status } = useSession();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  
  console.log('🔐 MediaGalleryModal session durumu:', { 
    status, 
    hasSession: !!session,
    userEmail: session?.user?.email 
  });
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);  // Medya verilerini yükle
  const fetchMedia = async () => {
    if (!session) {
      console.log('❌ Session yok, medya yüklenemez');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Medya API çağrısı başlatılıyor...');

      const data = await corporateApiFetch<any>('/api/media');
      console.log('📦 Medya API response data:', data);
      
      const items = data.success ? data.data : data;
      
      // Array kontrolü
      const mediaArray = Array.isArray(items) ? items : [];
      
      console.log('✅ Medya yüklendi:', {
        totalCount: mediaArray.length,
        isArray: Array.isArray(mediaArray),
        sampleItem: mediaArray[0]
      });
      
      setMediaItems(mediaArray);
      setFilteredItems(mediaArray);
    } catch (error) {
      console.error('❌ Medya yükleme hatası:', error);
      toast.error('Medya galerisi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };  // Kategorileri yükle
  const fetchCategories = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/media-categories', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.success ? data.data : data);
      }
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
    }
  };
  useEffect(() => {
    if (isOpen && session) {
      fetchMedia();
      fetchCategories();
    }
  }, [isOpen, session]);
  // Filtreleme
  useEffect(() => {
    // Güvenlik kontrolü: mediaItems array olduğundan emin ol
    if (!Array.isArray(mediaItems)) {
      console.error('❌ mediaItems array değil:', typeof mediaItems, mediaItems);
      setFilteredItems([]);
      return;
    }

    let filtered = [...mediaItems]; // Shallow copy

    console.log('🔍 Filtreleme başlıyor:', {
      totalItems: filtered.length,
      searchTerm,
      selectedCategory,
      isArray: Array.isArray(filtered)
    });

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item?.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.caption?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item?.categoryId === selectedCategory);
    }

    // Sadece resimler
    filtered = filtered.filter(item => item?.mimeType?.startsWith('image/'));

    console.log('✅ Filtreleme tamamlandı:', {
      filteredCount: filtered.length,
      isFilteredArray: Array.isArray(filtered)
    });

    setFilteredItems(filtered);
  }, [mediaItems, searchTerm, selectedCategory]);

  const handleSelect = (item: MediaItem) => {
    if (allowMultiple) {
      if (selectedItems.includes(item.id)) {
        setSelectedItems(prev => prev.filter(id => id !== item.id));
      } else {
        setSelectedItems(prev => [...prev, item.id]);
      }
    } else {
      onSelect(item);
      onClose();
    }
  };

  const handleMultipleSelect = () => {
    const selected = mediaItems.filter(item => selectedItems.includes(item.id));
    selected.forEach(onSelect);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMediaUrl = (url?: string) => {
    if (!url) return '';
    let normalizedUrl = url;
    if (normalizedUrl.startsWith('http')) return normalizedUrl;
    
    // Remove /public/ prefix if exists
    normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
    
    // Handle different folder structures based on URL path
    if (normalizedUrl.includes('/banners/')) {
      // Banner images
      normalizedUrl = normalizedUrl.replace(/^\/public\/banners\//, '/banners/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\/banners\//, '/banners/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/banners/');
      if (!normalizedUrl.startsWith('/banners/')) {
        normalizedUrl = '/banners/' + normalizedUrl.replace(/^\//, '');
      }
    } else {
      // Default to haberler for other content
      normalizedUrl = normalizedUrl.replace(/^\/public\/haberler\//, '/haberler/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\/haberler\//, '/haberler/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/haberler/');
      if (!normalizedUrl.startsWith('/haberler/')) {
        normalizedUrl = '/haberler/' + normalizedUrl.replace(/^\//, '');
      }
    }
    
    return normalizedUrl;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Filtreler */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Label htmlFor="search">Arama</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Dosya adı, alt text veya açıklama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="min-w-[200px]">
            <Label htmlFor="category">Kategori</Label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>        {/* Medya Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {!session ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <FileImage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Oturum gerekli</p>
                <p className="text-sm mt-1">Medya galerisine erişmek için giriş yapın</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Medya yükleniyor...</div>
            </div>
          ) : !Array.isArray(filteredItems) || filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <FileImage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Medya bulunamadı</p>
                <p className="text-sm mt-1">Farklı arama terimleri deneyin</p>
              </div>
            </div>          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.isArray(filteredItems) && filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`
                    relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all
                    ${selectedItems.includes(item.id) 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleSelect(item)}
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={getMediaUrl(item.thumbnailUrl || item.url)}
                      alt={item.alt || item.originalName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Selection Indicator */}
                  {allowMultiple && selectedItems.includes(item.id) && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}

                  {/* Info Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-75 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-xs truncate font-medium">{item.originalName}</p>
                    <p className="text-xs text-gray-300">{formatFileSize(item.size)}</p>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {item.category.name}
                      </Badge>
                    )}                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {Array.isArray(filteredItems) ? filteredItems.length : 0} resim gösteriliyor
            {allowMultiple && selectedItems.length > 0 && (
              <span className="ml-2 font-medium">
                ({selectedItems.length} seçili)
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            {allowMultiple && selectedItems.length > 0 && (
              <Button onClick={handleMultipleSelect}>
                Seçilenleri Kullan ({selectedItems.length})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
