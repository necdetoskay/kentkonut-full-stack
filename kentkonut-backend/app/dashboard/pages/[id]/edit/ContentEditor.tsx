'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import BlockTypeTooltip from '@/components/help/BlockTypeTooltip';
import ContentBlocksHelpModal from '@/components/help/ContentBlocksHelpModal';

interface Page {
  id: string;
  slug: string;
  title: string;
  contents: PageContent[];
}

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
  createdAt: string;
  updatedAt: string;
}

interface ContentEditorProps {
  page: Page;
  onContentUpdate: () => void;
}

export default function ContentEditor({ page, onContentUpdate }: ContentEditorProps) {
  const router = useRouter();  const [contents, setContents] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);

  useEffect(() => {
    if (page?.id) {
      fetchContents();
    }
  }, [page?.id]);

  if (!page) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Sayfa bilgisi yükleniyor...</div>
      </div>
    );
  }

  const fetchContents = async () => {
    try {
      console.log('🔄 Fetching contents for page:', page.id);
      const response = await fetch(`/api/page-contents?pageId=${page.id}`);
      const data = await response.json();
      console.log('📋 Contents data received:', data);

      if (data.success) {
        setContents(data.data);
        console.log('✅ Contents state updated, count:', data.data.length);
      }
    } catch (error) {
      console.error('💥 Error fetching contents:', error);
    }
  };

  const createContent = async (type: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/page-contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageId: page.id,
          type,
          title: `Yeni ${getContentTypeLabel(type)}`,
          order: contents.length + 1,
          isActive: true,
          fullWidth: false
        })
      });

      const data = await response.json();      if (data.success) {
        await fetchContents();
        setShowAddContent(false);
        onContentUpdate();
        // Yeni oluşturulan içeriği düzenleme sayfasına yönlendir
        router.push(`/dashboard/pages/${page.id}/edit/content/${data.data.id}`);
      } else {
        alert('İçerik oluşturulurken hata oluştu: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating content:', error);
      alert('İçerik oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (contentId: string, data: Partial<PageContent>) => {
    try {
      const response = await fetch(`/api/page-contents/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        await fetchContents();
        onContentUpdate();
      } else {
        alert('İçerik güncellenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating content:', error);
      alert('İçerik güncellenirken hata oluştu');
    }
  };

  const deleteContent = async (contentId: string) => {
    if (!confirm('Bu içeriği silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/page-contents/${contentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await fetchContents();
        onContentUpdate();
      } else {
        alert('İçerik silinirken hata oluştu: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('İçerik silinirken hata oluştu');
    }
  };

  const toggleContentVisibility = async (content: PageContent) => {
    await updateContent(content.id, { isActive: !content.isActive });
  };

  const reorderContents = async (newOrder: string[]) => {
    try {
      const response = await fetch('/api/page-contents/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reorder',
          pageId: page.id,
          contentIds: newOrder
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchContents();
        onContentUpdate();
      }
    } catch (error) {
      console.error('Error reordering contents:', error);
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels = {
      TEXT: 'Metin',
      IMAGE: 'Görsel',
      VIDEO: 'Video',
      GALLERY: 'Galeri',
      BANNER: 'Banner',
      CTA: 'Çağrı',
      STATISTICS: 'İstatistik',
      TESTIMONIAL: 'Referans'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getContentTypeColor = (type: string) => {
    const colors = {
      TEXT: 'bg-blue-100 text-blue-800',
      IMAGE: 'bg-green-100 text-green-800',
      VIDEO: 'bg-purple-100 text-purple-800',
      GALLERY: 'bg-yellow-100 text-yellow-800',
      BANNER: 'bg-red-100 text-red-800',
      CTA: 'bg-orange-100 text-orange-800',
      STATISTICS: 'bg-cyan-100 text-cyan-800',
      TESTIMONIAL: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  return (
    <div className="space-y-6">
      {/* Add Content Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>İçerik Blokları</CardTitle>
              <CardDescription>Sayfa içeriğini oluşturun ve düzenleyin</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ContentBlocksHelpModal />
              <Button onClick={() => setShowAddContent(!showAddContent)}>
                <Plus className="w-4 h-4 mr-2" />
                İçerik Ekle
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showAddContent && (
          <CardContent className="border-t">
            <div className="space-y-4 pt-4">
              <div className="text-sm text-gray-600 mb-3">
                💡 Her blok türü hakkında detaylı bilgi almak için blok adının yanındaki yardım simgesine tıklayın
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { type: 'text', label: 'Metin Bloğu' },
                  { type: 'image', label: 'Görsel Bloğu' },
                  { type: 'video', label: 'Video Bloğu' },
                  { type: 'gallery', label: 'Galeri Bloğu' },
                  { type: 'cta', label: 'Eylem Çağrısı' },
                  { type: 'quote', label: 'Alıntı Bloğu' },
                  { type: 'list', label: 'Liste Bloğu' },
                  { type: 'divider', label: 'Ayırıcı Bloğu' }
                ].map((blockType) => (
                  <BlockTypeTooltip key={blockType.type} blockType={blockType.type}>
                    <Button
                      variant="outline"
                      onClick={() => createContent(blockType.type.toUpperCase())}
                      disabled={loading}
                      className="justify-start h-auto p-3 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">{blockType.label}</span>
                      </div>
                    </Button>
                  </BlockTypeTooltip>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Content List */}
      <div className="space-y-4">
        {contents.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-500 text-lg">Henüz içerik eklenmemiş</p>
              <p className="text-gray-400 mt-2">İlk içeriğinizi eklemek için yukarıdaki butonu kullanın</p>
            </CardContent>
          </Card>
        ) : (
          contents.map((content, index) => (
            <Card key={content.id} className={`${!content.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <Badge className={getContentTypeColor(content.type)}>
                      {getContentTypeLabel(content.type)}
                    </Badge>
                    <h3 className="font-semibold">{content.title || 'Başlıksız İçerik'}</h3>
                    {content.fullWidth && (
                      <Badge variant="outline">Tam Genişlik</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleContentVisibility(content)}
                    >
                      {content.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/pages/${page.id}/edit/content/${content.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteContent(content.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  {content.type === 'TEXT' && (
                    <div>
                      {content.subtitle && (
                        <p className="text-sm text-gray-600 mb-2">{content.subtitle}</p>
                      )}
                      <div className="text-sm line-clamp-3" dangerouslySetInnerHTML={{
                        __html: content.content || 'İçerik boş...'
                      }} />
                    </div>
                  )}
                  
                  {content.type === 'IMAGE' && (
                    <div className="flex items-center gap-4">
                      {content.imageUrl && (
                        <img 
                          src={content.imageUrl} 
                          alt={content.alt || content.title || ''} 
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{content.alt || 'Alt text yok'}</p>
                        <p className="text-sm text-gray-600">{content.caption || 'Açıklama yok'}</p>
                      </div>
                    </div>
                  )}

                  {content.type === 'CTA' && (
                    <div>
                      <p className="font-medium">{content.title}</p>
                      {content.content && (
                        <p className="text-sm text-gray-600 mt-1">
                          {JSON.parse(content.content).description || ''}
                        </p>
                      )}
                    </div>
                  )}

                  {!['TEXT', 'IMAGE', 'CTA'].includes(content.type) && (
                    <p className="text-sm text-gray-600">
                      {getContentTypeLabel(content.type)} içeriği - Sıra: {content.order}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}      </div>
    </div>
  );
}
