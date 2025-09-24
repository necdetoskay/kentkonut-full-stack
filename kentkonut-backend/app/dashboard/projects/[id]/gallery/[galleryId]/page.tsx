"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  Link,
  Edit,
  Trash2,
  Folder,
  ChevronRight
} from "lucide-react";
import { GlobalMediaSelector, GlobalMediaFile } from "@/components/media/GlobalMediaSelector";

// Types
interface GalleryItem {
  id: number;
  projectId: number;
  mediaId?: string;
  order: number;
  title: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
  isFolder: boolean;
  createdAt: string;
  updatedAt: string;
  media?: {
    id: string;
    url: string;
    filename: string;
    alt?: string;
    type: string;
    mimeType?: string;
  };
  parent?: GalleryItem;
  children?: GalleryItem[];
}

interface GalleryDetail {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
  isFolder: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: GalleryItem;
  children?: GalleryItem[];
  items?: GalleryItem[]; // Bu galerinin içeriği
}

export default function GalleryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const galleryId = params.galleryId as string;

  const [gallery, setGallery] = useState<GalleryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isAddingGallery, setIsAddingGallery] = useState(false);
  const [isDeletingGallery, setIsDeletingGallery] = useState(false);
  const [allGalleries, setAllGalleries] = useState<GalleryItem[]>([]);
  
  // Form states for new gallery
  const [newGalleryForm, setNewGalleryForm] = useState({
    title: "",
    description: "",
    parentId: parseInt(galleryId),
    order: 0
  });

  // Form states for new content
  const [newContentForm, setNewContentForm] = useState({
    title: "",
    description: "",
    mediaId: "",
    order: 0
  });

  // Selected media state
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null);

  // Load all galleries for parent selection
  const loadAllGalleries = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/gallery`);
      if (response.ok) {
        const data = await response.json();
        setAllGalleries(data.data || []);
      }
    } catch (error) {
      console.error("Error loading all galleries:", error);
    }
  };

  // Load gallery detail
  const loadGalleryDetail = async () => {
    try {
      setIsLoading(true);
      console.log(`[FRONTEND] Loading gallery detail for project: ${projectId}, gallery: ${galleryId}`);
      const response = await fetch(`/api/projects/${projectId}/gallery/${galleryId}/detail`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        next: { revalidate: 0 }
      });
      console.log(`[FRONTEND] Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[FRONTEND] Gallery data:`, data);
        setGallery(data.data);
      } else {
        const errorText = await response.text();
        console.error(`[FRONTEND] API Error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to load gallery detail: ${response.status}`);
      }
    } catch (error) {
      console.error("Error loading gallery detail:", error);
      toast.error("Galeri detayı yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Add content to gallery
  const handleAddContent = async () => {
    if (!newContentForm.title.trim()) {
      toast.error("Başlık alanı zorunludur");
      return;
    }

    if (!selectedMedia) {
      toast.error("Lütfen bir medya dosyası seçin");
      return;
    }

    const requestData = {
      title: newContentForm.title,
      description: newContentForm.description,
      isFolder: false, // Bu bir içerik öğesi, galeri değil
      mediaId: selectedMedia.id,
      parentId: parseInt(galleryId),
      order: newContentForm.order,
      category: 'DIS_MEKAN' // Default category
    };

    console.log('🎯 [GALLERY] Adding content with data:', requestData);
    console.log('🎯 [GALLERY] API URL:', `/api/projects/${projectId}/gallery`);
    console.log('🎯 [GALLERY] Full URL:', `${window.location.origin}/api/projects/${projectId}/gallery`);

    try {
      const response = await fetch(`/api/projects/${projectId}/gallery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log('🎯 [GALLERY] Response status:', response.status);
      console.log('🎯 [GALLERY] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ [GALLERY] Content added successfully:', result);
        toast.success("İçerik eklendi");
        setIsAddingContent(false);
        setNewContentForm({
          title: "",
          description: "",
          mediaId: "",
          order: 0
        });
        setSelectedMedia(null);
        await loadGalleryDetail();
      } else {
        const errorText = await response.text();
        console.error('❌ [GALLERY] API Error:', response.status, errorText);
        
        if (response.status === 401) {
          toast.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        } else {
          toast.error("İçerik eklenirken hata oluştu");
        }
      }
    } catch (error) {
      console.error("Error adding content:", error);
      toast.error("İçerik eklenirken hata oluştu");
    }
  };

  // Add new gallery
  const handleAddGallery = async () => {
    if (!newGalleryForm.title.trim()) {
      toast.error("Başlık alanı zorunludur");
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/gallery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newGalleryForm,
          isFolder: true
        }),
      });

      if (response.ok) {
        toast.success("Yeni galeri eklendi");
        setIsAddingGallery(false);
        setNewGalleryForm({
          title: "",
          description: "",
          parentId: parseInt(galleryId),
          order: 0
        });
        await loadGalleryDetail();
        await loadAllGalleries();
      } else {
        throw new Error("Failed to add gallery");
      }
    } catch (error) {
      console.error("Error adding gallery:", error);
      toast.error("Galeri eklenirken hata oluştu");
    }
  };

  // Delete content
  const handleDeleteContent = async (itemId: number) => {
    console.log('🗑️ [GALLERY] Deleting content with ID:', itemId);
    console.log('🗑️ [GALLERY] Delete API URL:', `/api/projects/${projectId}/gallery/${itemId}`);
    
    if (!confirm("Bu içeriği silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/gallery/${itemId}`, {
        method: "DELETE",
      });

      console.log('🗑️ [GALLERY] Delete response status:', response.status);
      console.log('🗑️ [GALLERY] Delete response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [GALLERY] Content deleted successfully:', result);
        toast.success("İçerik silindi");
        await loadGalleryDetail();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [GALLERY] Delete API Error:', response.status, errorData);
        throw new Error(errorData.message || "Failed to delete content");
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("İçerik silinirken hata oluştu");
    }
  };

  // Delete gallery
  const handleDeleteGallery = async () => {
    if (!gallery) return;

    // Check if gallery has content or children
    const hasContent = gallery.items && gallery.items.length > 0;
    const hasChildren = gallery.children && gallery.children.length > 0;

    if (hasContent || hasChildren) {
      const contentCount = gallery.items?.length || 0;
      const childrenCount = gallery.children?.length || 0;
      
      const message = `Bu galeri silinemez çünkü içinde ${contentCount} içerik ve ${childrenCount} alt galeri bulunuyor. Önce içerikleri ve alt galerileri silin.`;
      toast.error(message);
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/gallery/${galleryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Galeri silindi");
        // Navigate back to parent gallery or project
        if (gallery.parent) {
          router.push(`/dashboard/projects/${projectId}/gallery/${gallery.parent.id}`);
        } else {
          router.push(`/dashboard/projects/${projectId}/edit`);
        }
      } else {
        throw new Error("Failed to delete gallery");
      }
    } catch (error) {
      console.error("Error deleting gallery:", error);
      toast.error("Galeri silinirken hata oluştu");
    }
  };

  // Navigate to child gallery
  const navigateToChildGallery = (childGalleryId: number) => {
    router.push(`/dashboard/projects/${projectId}/gallery/${childGalleryId}`);
  };

  // Get media URL
  const getMediaUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  // Get media icon
  const getMediaIcon = (type: string) => {
    switch (type) {
      case "IMAGE":
        return <ImageIcon className="h-4 w-4" />;
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "PDF":
      case "WORD":
        return <FileText className="h-4 w-4" />;
      case "EMBED":
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Build breadcrumb
  const buildBreadcrumb = () => {
    const breadcrumb = [];
    let current = gallery?.parent;
    
    while (current) {
      breadcrumb.unshift({
        id: current.id,
        title: current.title
      });
      current = current.parent;
    }
    
    return breadcrumb;
  };

  // Load initial data
  useEffect(() => {
    if (projectId && galleryId) {
      loadGalleryDetail();
      loadAllGalleries();
    }
  }, [projectId, galleryId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Galeri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Galeri bulunamadı</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumb = buildBreadcrumb();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </Button>
            
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Projeler</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Galeri</span>
              {breadcrumb.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <button
                    onClick={() => router.push(`/dashboard/projects/${projectId}/gallery/${item.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {item.title}
                  </button>
                </div>
              ))}
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{gallery.title}</span>
            </nav>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{gallery.title}</h1>
              {gallery.description && (
                <p className="text-gray-600 mt-1">{gallery.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAddingGallery(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Galeri Ekle
              </Button>
              <Button onClick={() => setIsAddingContent(true)}>
                <Plus className="h-4 w-4 mr-2" />
                İçerik Ekle
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setIsDeletingGallery(true)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Galeriyi Sil
              </Button>
            </div>
          </div>
        </div>

        {/* Child Galleries */}
        {gallery.children && gallery.children.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Alt Galeriler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.children.map((child) => (
                  <Card
                    key={child.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigateToChildGallery(child.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Folder className="h-8 w-8 text-blue-600" />
                        <div className="flex-1">
                          <h3 className="font-medium">{child.title}</h3>
                          {child.description && (
                            <p className="text-sm text-gray-600 mt-1">{child.description}</p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gallery Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Galeri İçeriği
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gallery.items && gallery.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {gallery.items.map((item) => (
                  <Card key={item.id} className="group">
                    <CardContent className="p-4">
                      <div className="relative">
                        {item.media && (
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                            <img
                              src={getMediaUrl(item.media.url)}
                              alt={item.media.alt || item.media.filename}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.media && getMediaIcon(item.media.type)}
                            <span className="text-sm font-medium truncate">
                              {item.title}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteContent(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz içerik yok
                </h3>
                <p className="text-gray-600 mb-4">
                  Bu galeriye içerik ekleyerek başlayın
                </p>
                <Button onClick={() => setIsAddingContent(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  İçerik Ekle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Gallery Modal */}
        <Dialog open={isAddingGallery} onOpenChange={setIsAddingGallery}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Galeri Ekle</DialogTitle>
              <p className="text-sm text-gray-600">Yeni bir alt galeri oluşturun</p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gallery-title">Başlık</Label>
                <Input
                  id="gallery-title"
                  value={newGalleryForm.title}
                  onChange={(e) => setNewGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Örn: 2+1 Daireler, 3+1 Daireler"
                />
              </div>
              <div>
                <Label htmlFor="gallery-description">Açıklama</Label>
                <Textarea
                  id="gallery-description"
                  value={newGalleryForm.description}
                  onChange={(e) => setNewGalleryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Galeri açıklaması"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="gallery-parent">Parent Galeri</Label>
                <Select
                  value={newGalleryForm.parentId?.toString() || galleryId}
                  onValueChange={(value) => setNewGalleryForm(prev => ({ ...prev, parentId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Parent galeri seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={galleryId}>Mevcut galeri altında</SelectItem>
                    {allGalleries
                      .filter(item => item.isFolder && item.id !== parseInt(galleryId))
                      .map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gallery-order">Sıralama</Label>
                <Input
                  id="gallery-order"
                  type="number"
                  value={newGalleryForm.order}
                  onChange={(e) => setNewGalleryForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingGallery(false)}>
                İptal
              </Button>
              <Button onClick={handleAddGallery}>
                <Plus className="h-4 w-4 mr-2" />
                Galeri Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Gallery Modal */}
        <Dialog open={isDeletingGallery} onOpenChange={setIsDeletingGallery}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Galeriyi Sil</DialogTitle>
              <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                <strong>{gallery?.title}</strong> galerisini silmek istediğinizden emin misiniz?
              </p>
              
              {gallery && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Trash2 className="h-4 w-4" />
                    <span className="font-medium">Dikkat!</span>
                  </div>
                  <div className="mt-2 text-sm text-yellow-700">
                    {gallery.items && gallery.items.length > 0 && (
                      <p>• {gallery.items.length} içerik bulunuyor</p>
                    )}
                    {gallery.children && gallery.children.length > 0 && (
                      <p>• {gallery.children.length} alt galeri bulunuyor</p>
                    )}
                    {(gallery.items && gallery.items.length > 0) || (gallery.children && gallery.children.length > 0) ? (
                      <p className="mt-2 font-medium">Önce içerikleri ve alt galerileri silin.</p>
                    ) : (
                      <p className="mt-2">Bu galeri boş, güvenle silinebilir.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeletingGallery(false)}>
                İptal
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteGallery}
                disabled={gallery && ((gallery.items && gallery.items.length > 0) || (gallery.children && gallery.children.length > 0))}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Galeriyi Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Content Modal */}
        <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>İçerik Ekle</DialogTitle>
              <p className="text-sm text-gray-600">Galeriye yeni içerik ekleyin</p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="content-title">Başlık</Label>
                <Input
                  id="content-title"
                  value={newContentForm.title}
                  onChange={(e) => setNewContentForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="İçerik başlığı"
                />
              </div>
              <div>
                <Label htmlFor="content-description">Açıklama</Label>
                <Textarea
                  id="content-description"
                  value={newContentForm.description}
                  onChange={(e) => setNewContentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="İçerik açıklaması"
                  rows={3}
                />
              </div>
              <div>
                <Label>Medya Dosyası</Label>
                <GlobalMediaSelector
                  onSelect={(media) => {
                    console.log('🎯 [GALLERY] Media selected:', media);
                    setSelectedMedia(media);
                    // Title'ı otomatik doldurma - kullanıcı manuel girecek
                  }}
                  defaultCategory="project-images"
                  restrictToCategory={false}
                  customFolder="media/projeler"
                  trigger={
                    <Button type="button" variant="outline" className="w-full h-10 flex items-center gap-2">
                      {selectedMedia ? (
                        <>
                          <ImageIcon className="h-4 w-4" />
                          Medya Seçildi
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Medya Seç
                        </>
                      )}
                    </Button>
                  }
                />
                {selectedMedia && (
                  <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getMediaUrl(selectedMedia.url)} 
                        alt={selectedMedia.alt || selectedMedia.filename} 
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{selectedMedia.filename}</p>
                        <p className="text-xs text-gray-600">{selectedMedia.type}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedMedia(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="content-order">Sıralama</Label>
                <Input
                  id="content-order"
                  type="number"
                  value={newContentForm.order}
                  onChange={(e) => setNewContentForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingContent(false)}>
                İptal
              </Button>
              <Button onClick={handleAddContent}>
                <Plus className="h-4 w-4 mr-2" />
                İçerik Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
