"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GlobalMediaSelector } from "@/components/media/GlobalMediaSelector";
import {
  Plus,
  Folder,
  Image as ImageIcon,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Upload,
  Save,
  Loader2,
  Eye,
  FileText,
  Video,
  File
} from "lucide-react";

// Types based on new API structure
interface ProjectGallery {
  id: number;
  projectId: number;
  parentId?: number;
  title: string;
  description?: string;
  coverImage?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: ProjectGallery[];
  media?: ProjectGalleryMedia[];
  _count?: {
    children: number;
    media: number;
  };
}

interface ProjectGalleryMedia {
  id: number;
  galleryId: number;
  fileName: string;
  originalName: string;
  fileSize: string; // BigInt serialization için string
  mimeType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  alt?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectGalleryManagerProps {
  projectId: number;
  onGalleryChange?: (galleries: ProjectGallery[]) => void;
}

export function NewProjectGalleryManager({ projectId, onGalleryChange }: ProjectGalleryManagerProps) {
  const [galleries, setGalleries] = useState<ProjectGallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<ProjectGallery | null>(null);
  const [galleryMedia, setGalleryMedia] = useState<ProjectGalleryMedia[]>([]);
  const [expandedGalleries, setExpandedGalleries] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ProjectGalleryMedia | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<ProjectGalleryMedia | null>(null);
  const [isGalleryDeleteModalOpen, setIsGalleryDeleteModalOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState<ProjectGallery | null>(null);
  const [editingGallery, setEditingGallery] = useState<ProjectGallery | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  
  // Form states
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    description: "",
    parentId: null as number | null,
    order: 0
  });

  const [mediaForm, setMediaForm] = useState({
    fileName: "",
    originalName: "",
    fileSize: "0",
    mimeType: "",
    fileUrl: "",
    thumbnailUrl: "",
    title: "",
    description: "",
    alt: "",
    order: 0,
    mediaType: "file", // "file" veya "video"
    videoUrl: "", // Embed video URL
    selectedMedia: null as any // GlobalMediaSelector'dan seçilen medya
  });

  // Load galleries from API
  const loadGalleries = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/projects/${projectId}/galleries/all`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Hiyerarşik olarak gelen root galerileri doğrudan state'e ata
          const rootGalleries = data.data.galleries;
          setGalleries(rootGalleries);
          
          if (onGalleryChange) {
            onGalleryChange(rootGalleries);
          }
        } else {
          throw new Error('Failed to load galleries');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading galleries:', error);
      toast.error('Galeriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };



  // Create gallery
  const createGallery = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/projects/${projectId}/galleries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(galleryForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          toast.success('Galeri başarıyla oluşturuldu');
          setIsGalleryModalOpen(false);
          setGalleryForm({ title: "", description: "", parentId: null, order: 0 });
          await loadGalleries();
        } else {
          throw new Error('Failed to create gallery');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating gallery:', error);
      toast.error('Galeri oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Update gallery
  const updateGallery = async () => {
    if (!editingGallery) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/projects/${projectId}/galleries/${editingGallery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(galleryForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          toast.success('Galeri başarıyla güncellendi');
          setIsGalleryModalOpen(false);
          setEditingGallery(null);
          setGalleryForm({ title: "", description: "", parentId: null, order: 0 });
          await loadGalleries();
        } else {
          throw new Error('Failed to update gallery');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('[NEW_GALLERY_MANAGER] Error updating gallery:', error);
      toast.error('Galeri güncellenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete gallery
  const deleteGallery = async (galleryId: number) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/projects/${projectId}/galleries/${galleryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Galeri başarıyla silindi');
        await loadGalleries();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('[NEW_GALLERY_MANAGER] Error deleting gallery:', error);
      toast.error('Galeri silinirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Add media to gallery
  const addMedia = async () => {
    if (!selectedGallery) return;
    
    // Validation
    if (mediaForm.mediaType === "file" && !mediaForm.selectedMedia) {
      toast.error("Lütfen bir medya seçin");
      return;
    }
    
    if (mediaForm.mediaType === "video" && !mediaForm.videoUrl) {
      toast.error("Lütfen video URL'i girin");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const requestData = mediaForm.mediaType === "video" 
        ? {
            fileName: `video_${Date.now()}`,
            originalName: "Embed Video",
            fileSize: "0",
            mimeType: "video/embed",
            fileUrl: mediaForm.videoUrl,
            thumbnailUrl: "",
            title: mediaForm.title || "Embed Video",
            description: mediaForm.description,
            alt: mediaForm.alt,
            order: mediaForm.order
          }
        : {
            fileName: mediaForm.selectedMedia?.filename || "",
            originalName: mediaForm.selectedMedia?.filename || "",
            fileSize: String(mediaForm.selectedMedia?.fileSize || 0),
            mimeType: mediaForm.selectedMedia?.mimeType || "image/jpeg",
            fileUrl: mediaForm.selectedMedia?.url || "",
            thumbnailUrl: mediaForm.selectedMedia?.thumbnailUrl || "",
            title: mediaForm.title || mediaForm.selectedMedia?.filename || "",
            description: mediaForm.description,
            alt: mediaForm.alt || mediaForm.selectedMedia?.alt || "",
            order: mediaForm.order
          };
      
      
      const response = await fetch(`/api/projects/${projectId}/galleries/${selectedGallery.id}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          toast.success('Medya başarıyla eklendi');
          setIsMediaModalOpen(false);
          setMediaForm({
            fileName: "",
            originalName: "",
            fileSize: "0",
            mimeType: "",
            fileUrl: "",
            thumbnailUrl: "",
            title: "",
            description: "",
            alt: "",
            order: 0,
            mediaType: "file",
            videoUrl: "",
            selectedMedia: null
          });
          // Medya eklendikten sonra tüm galerileri yeniden yükle (medyalar dahil)
          await loadGalleries();
          
          // Alt galeriye resim eklediyse o galeriyi aç
          if (selectedGallery && selectedGallery.parentId !== null) {
            setExpandedGalleries(prev => new Set([...prev, selectedGallery.id]));
          }
        } else {
          throw new Error('Failed to add media');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('[NEW_GALLERY_MANAGER] Error adding media:', error);
      toast.error('Medya eklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle gallery expansion
  const toggleGallery = (galleryId: number) => {
    const newExpanded = new Set(expandedGalleries);
    if (newExpanded.has(galleryId)) {
      newExpanded.delete(galleryId);
    } else {
      newExpanded.add(galleryId);
    }
    setExpandedGalleries(newExpanded);
  };

  // Open gallery modal for creating
  const openCreateGalleryModal = (parentId?: number) => {
    setEditingGallery(null);
    setSelectedParentId(parentId || null);
    setGalleryForm({
      title: "",
      description: "",
      parentId: parentId || null,
      order: 0
    });
    setIsGalleryModalOpen(true);
  };

  // Open gallery modal for editing
  const openEditGalleryModal = (gallery: ProjectGallery) => {
    setEditingGallery(gallery);
    setGalleryForm({
      title: gallery.title,
      description: gallery.description || "",
      parentId: gallery.parentId || null,
      order: gallery.order
    });
    setIsGalleryModalOpen(true);
  };

  // Open media modal
  const openMediaModal = (gallery: ProjectGallery) => {
    setSelectedGallery(gallery);
    setMediaForm({
      fileName: "",
      originalName: "",
                    fileSize: "0",
      mimeType: "",
      fileUrl: "",
      thumbnailUrl: "",
      title: "",
      description: "",
      alt: "",
      order: 0
    });
    setIsMediaModalOpen(true);
  };

  // Open lightbox for media
  const openLightbox = (media: ProjectGalleryMedia) => {
    setSelectedMedia(media);
    setIsLightboxOpen(true);
  };

  // Close lightbox
  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedMedia(null);
  };

  // Open delete confirmation modal
  const openDeleteModal = (media: ProjectGalleryMedia) => {
    setMediaToDelete(media);
    setIsDeleteModalOpen(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMediaToDelete(null);
  };

  // Open gallery delete confirmation modal
  const openGalleryDeleteModal = (gallery: ProjectGallery) => {
    setGalleryToDelete(gallery);
    setIsGalleryDeleteModalOpen(true);
  };

  // Close gallery delete modal
  const closeGalleryDeleteModal = () => {
    setIsGalleryDeleteModalOpen(false);
    setGalleryToDelete(null);
  };

  // Delete media from gallery
  const deleteMedia = async (mediaId: number) => {
    if (!selectedGallery) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/projects/${projectId}/galleries/${selectedGallery.id}/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          toast.success('Medya başarıyla silindi');
          closeDeleteModal();
          await loadGalleries();
        } else {
          throw new Error('Failed to delete media');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Medya silinirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Video URL'den thumbnail URL'i oluştur
  const getVideoThumbnail = (videoUrl: string) => {
    // YouTube
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    // Vimeo
    if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
      if (videoId) {
        return `https://vumbnail.com/${videoId}.jpg`;
      }
    }
    
    return null;
  };

  // Get file type icon
  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (mimeType.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  // Render gallery tree
  const renderGallery = (gallery: ProjectGallery, level: number = 0) => {
    const isExpanded = expandedGalleries.has(gallery.id);
    const hasChildren = gallery.children && gallery.children.length > 0;
    const mediaCount = gallery.media?.length || 0;
    const hasContent = hasChildren || mediaCount > 0;
    
    return (
      <div key={gallery.id} className={`ml-${level * 4}`}>
        <div className="flex items-center justify-between p-2 border rounded-lg mb-2 bg-white hover:bg-gray-50">
          <div className="flex items-center gap-2">
            {hasContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleGallery(gallery.id)}
                className="p-1 h-auto"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <Folder className="h-4 w-4 text-blue-600" />
            
            <div>
              <div className="font-medium">{gallery.title}</div>
              {gallery.description && (
                <div className="text-sm text-gray-500">{gallery.description}</div>
              )}
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {gallery._count?.children || 0} alt galeri
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {mediaCount} medya
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openCreateGalleryModal(gallery.id)}
              title="Alt galeri ekle"
            >
              <Plus className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => openMediaModal(gallery)}
              title="Medya ekle"
            >
              <Upload className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditGalleryModal(gallery)}
              title="Düzenle"
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => openGalleryDeleteModal(gallery)}
              title="Sil"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </div>
        
        {/* Show media when expanded - YENİ VERSİYON: Hem gallery.media hem de children medyaları */}
        {isExpanded && (
          <div className="ml-6 mb-2">
            {/* Root galeri medyaları */}
            {gallery.media && gallery.media.length > 0 && (
              <>
                <div className="text-sm font-medium text-gray-700 mb-2">Medyalar:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {gallery.media.map((media) => (
                <div key={media.id} className="border rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group relative">
                  {/* Silme butonu - resmin tam ortasında */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black bg-opacity-30 rounded pointer-events-none">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0 shadow-lg pointer-events-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openDeleteModal(media);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    {getFileTypeIcon(media.mimeType)}
                    <span className="text-xs font-medium truncate">
                      {media.title || media.fileName}
                    </span>
                    {media.mimeType === "video/embed" && (
                      <Badge variant="outline" className="text-xs">Video</Badge>
                    )}
                  </div>
                  {media.mimeType === "video/embed" ? (
                    <div 
                      className="w-full h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center group-hover:from-gray-300 group-hover:to-gray-400 transition-all relative cursor-pointer overflow-hidden"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openLightbox(media);
                      }}
                    >
                      {(() => {
                        const thumbnailUrl = getVideoThumbnail(media.fileUrl);
                        if (thumbnailUrl) {
                          return (
                            <img
                              src={thumbnailUrl}
                              alt={media.title || "Video thumbnail"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                // Thumbnail yüklenemezse fallback göster
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Fallback video icon */}
                      <div className="w-full h-full flex items-center justify-center hidden group-hover:from-gray-300 group-hover:to-gray-400 transition-all relative">
                        <Video className="h-8 w-8 text-gray-600" />
                        <span className="text-xs text-gray-600 ml-2 font-medium">Video</span>
                      </div>
                    </div>
                  ) : media.thumbnailUrl ? (
                    <div 
                      className="relative cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openLightbox(media);
                      }}
                    >
                      <img
                        src={media.thumbnailUrl}
                        alt={media.alt || media.fileName}
                        className="w-full h-20 object-cover rounded group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Thumbnail yüklenemezse fallback göster
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    </div>
                  ) : media.mimeType.startsWith('image/') ? (
                    <div 
                      className="relative cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openLightbox(media);
                      }}
                    >
                      <img
                        src={media.fileUrl}
                        alt={media.alt || media.fileName}
                        className="w-full h-20 object-cover rounded group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Resim yüklenemezse fallback göster
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    </div>
                  ) : null}
                  
                  {/* Fallback icon - hidden by default */}
                  <div className="w-full h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center hidden group-hover:from-gray-300 group-hover:to-gray-400 transition-all relative">
                    {getFileTypeIcon(media.mimeType)}
                    <span className="text-xs text-gray-600 ml-2 font-medium">
                      {media.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(parseInt(media.fileSize) / 1024).toFixed(1)} KB
                  </div>
                </div>
              ))}
            </div>
              </>
            )}
            
            {/* Child galeriler */}
            {hasChildren && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Alt Galeriler:</div>
                {gallery.children.map((child) => renderGallery(child, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Load galleries on component mount
  useEffect(() => {
    loadGalleries();
  }, [projectId]);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Proje Galerisi</h3>
          <p className="text-sm text-gray-500">
            Hiyerarşik galeri yapısı oluşturun ve medyaları organize edin
          </p>
        </div>
        
        <Button 
          onClick={() => {
            openCreateGalleryModal();
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Root Galeri Ekle
        </Button>
      </div>

      {/* Gallery Tree */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Yükleniyor...</span>
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Henüz galeri oluşturulmamış</p>
          <p className="text-sm">İlk galeriyi oluşturmak için "Root Galeri Ekle" butonunu kullanın</p>
        </div>
      ) : (
        <div className="space-y-2">
          {galleries.map((gallery) => renderGallery(gallery))}
        </div>
      )}

      {/* Gallery Modal - Portal ile body'ye taşı */}
      {isGalleryModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
           onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
           }}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingGallery ? 'Galeri Düzenle' : 'Yeni Galeri'}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                 onClick={() => {
                   setIsGalleryModalOpen(false);
                 }}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="gallery-title">Başlık *</Label>
                <Input
                  id="gallery-title"
                  value={galleryForm.title}
                   onChange={(e) => {
                     setGalleryForm(prev => ({ ...prev, title: e.target.value }));
                   }}
                  placeholder="Galeri başlığı"
                  required
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      // Enter tuşuna basıldığında form submit et
                      if (editingGallery) {
                        updateGallery();
                      } else {
                        createGallery();
                      }
                    }
                  }}
                />
              </div>
              
              <div>
                <Label htmlFor="gallery-description">Açıklama</Label>
                <Textarea
                  id="gallery-description"
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Galeri açıklaması"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
              
              <div>
                <Label htmlFor="gallery-order">Sıra</Label>
                <Input
                  id="gallery-order"
                  type="number"
                  value={galleryForm.order}
                  onChange={(e) => setGalleryForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                type="button"
                variant="outline" 
                 onClick={() => {
                   setIsGalleryModalOpen(false);
                 }}
              >
                İptal
              </Button>
              <Button
                type="button"
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   
                   if (editingGallery) {
                     updateGallery();
                   } else {
                     createGallery();
                   }
                 }}
                disabled={!galleryForm.title || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingGallery ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Media Modal - Portal ile body'ye taşı */}
      {isMediaModalOpen && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Medya Ekle - {selectedGallery?.title}</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsMediaModalOpen(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Media Type Selection */}
              <div>
                <Label htmlFor="media-type">Medya Tipi</Label>
                <Select
                  value={mediaForm.mediaType}
                  onValueChange={(value) => setMediaForm(prev => ({ ...prev, mediaType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Medya tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">Dosya (Galeriden Seç)</SelectItem>
                    <SelectItem value="video">Embed Video (URL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Selection */}
              {mediaForm.mediaType === "file" && (
                <div>
                  <Label>Medya Seç</Label>
                  <GlobalMediaSelector
                     onSelect={(media) => {
                       setMediaForm(prev => ({ 
                         ...prev, 
                         selectedMedia: media,
                         fileName: media.filename,
                         originalName: media.filename,
                         fileSize: media.fileSize || 0,
                         mimeType: media.mimeType || "image/jpeg",
                         fileUrl: media.url,
                         thumbnailUrl: media.thumbnailUrl || "",
                         title: media.filename,
                         alt: media.alt || ""
                       }));
                     }}
                    defaultCategory="project-images"
                    restrictToCategory={false}
                    customFolder="media/projeler"
                    trigger={
                      <Button variant="outline" className="w-full h-12 flex items-center gap-2">
                        {mediaForm.selectedMedia ? (
                          <>
                            <ImageIcon className="h-4 w-4" />
                            {mediaForm.selectedMedia.filename}
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-4 w-4" />
                            Medya Seç
                          </>
                        )}
                      </Button>
                    }
                  />
                </div>
              )}

              {/* Video URL */}
              {mediaForm.mediaType === "video" && (
                <div>
                  <Label htmlFor="video-url">Video URL *</Label>
                  <Input
                    id="video-url"
                    value={mediaForm.videoUrl}
                    onChange={(e) => setMediaForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    YouTube, Vimeo veya diğer video platformlarından embed URL'i
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="media-title">Başlık</Label>
                <Input
                  id="media-title"
                  value={mediaForm.title}
                  onChange={(e) => setMediaForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Medya başlığı"
                />
              </div>
              
              <div>
                <Label htmlFor="media-description">Açıklama</Label>
                <Textarea
                  id="media-description"
                  value={mediaForm.description}
                  onChange={(e) => setMediaForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Medya açıklaması"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="media-alt">Alt Metin</Label>
                <Input
                  id="media-alt"
                  value={mediaForm.alt}
                  onChange={(e) => setMediaForm(prev => ({ ...prev, alt: e.target.value }))}
                  placeholder="Alt metin"
                />
              </div>
              
              <div>
                <Label htmlFor="media-order">Sıra</Label>
                <Input
                  id="media-order"
                  type="number"
                  value={mediaForm.order}
                  onChange={(e) => setMediaForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsMediaModalOpen(false)}
              >
                İptal
              </Button>
              <Button
                type="button"
                onClick={addMedia}
                disabled={
                (mediaForm.mediaType === "file" && !mediaForm.selectedMedia) ||
                (mediaForm.mediaType === "video" && !mediaForm.videoUrl) ||
                isLoading
              }
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Ekle
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedMedia && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div className="max-w-4xl max-h-[90vh] p-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 bg-white hover:bg-gray-100"
                onClick={closeLightbox}
              >
                ✕
              </Button>
              
            {selectedMedia.mimeType === "video/embed" ? (
              <div className="bg-white rounded-lg p-8 text-center">
                {(() => {
                  const thumbnailUrl = getVideoThumbnail(selectedMedia.fileUrl);
                  if (thumbnailUrl) {
                    return (
                      <div className="mb-4">
                        <img
                          src={thumbnailUrl}
                          alt={selectedMedia.title || "Video thumbnail"}
                          className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full max-w-md mx-auto rounded-lg shadow-lg bg-gray-100 p-8">
                          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Video Thumbnail</h3>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  );
                })()}
                <h3 className="text-lg font-semibold mb-2">Embed Video</h3>
                <p className="text-gray-600 mb-4">{selectedMedia.title}</p>
                <div className="bg-gray-100 rounded p-4">
                  <code className="text-sm break-all">{selectedMedia.fileUrl}</code>
                </div>
              </div>
              ) : (
                <img
                  src={selectedMedia.thumbnailUrl || selectedMedia.fileUrl}
                  alt={selectedMedia.alt || selectedMedia.fileName}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              
              <div className="text-center mt-4 text-white">
                <h3 className="text-lg font-semibold">{selectedMedia.title || selectedMedia.fileName}</h3>
                {selectedMedia.description && (
                  <p className="text-sm text-gray-300 mt-2">{selectedMedia.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && mediaToDelete && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeDeleteModal}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Medyayı Sil</h3>
                <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                <strong>"{mediaToDelete.title || mediaToDelete.fileName}"</strong> medyasını silmek istediğinizden emin misiniz?
              </p>
              {mediaToDelete.description && (
                <p className="text-sm text-gray-500 mt-2">{mediaToDelete.description}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={closeDeleteModal}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                 onClick={() => {
                   if (mediaToDelete) {
                     deleteMedia(mediaToDelete.id);
                   }
                 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Sil
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Gallery Delete Confirmation Modal */}
      {isGalleryDeleteModalOpen && galleryToDelete && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeGalleryDeleteModal}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Galeriyi Sil</h3>
                <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                <strong>"{galleryToDelete.title}"</strong> galerisini silmek istediğinizden emin misiniz?
              </p>
              {galleryToDelete.description && (
                <p className="text-sm text-gray-500 mt-2">{galleryToDelete.description}</p>
              )}
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Uyarı:</strong> Bu galeri içindeki tüm alt galeriler ve medyalar da silinecektir.
                </p>
                <div className="flex gap-4 mt-2 text-xs text-yellow-700">
                  <span>Alt Galeri: {galleryToDelete._count?.children || 0}</span>
                  <span>Medya: {galleryToDelete._count?.media || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={closeGalleryDeleteModal}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (galleryToDelete) {
                    deleteGallery(galleryToDelete.id);
                    closeGalleryDeleteModal();
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Sil
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
