"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
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
  Eye
} from "lucide-react";
import { GlobalMediaSelector, GlobalMediaFile } from "@/components/media/GlobalMediaSelector";

// Types
interface ProjectGalleryItem {
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
  parent?: ProjectGalleryItem;
  children?: ProjectGalleryItem[];
}

interface GalleryNode {
  item: ProjectGalleryItem;
  children: GalleryNode[];
  level: number;
}

interface ProjectGalleryManagerProps {
  projectId: number;
  onGalleryChange?: (items: ProjectGalleryItem[]) => void;
}

export function ProjectGalleryManager({ projectId, onGalleryChange }: ProjectGalleryManagerProps) {
  const [galleryItems, setGalleryItems] = useState<ProjectGalleryItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectGalleryItem | null>(null);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mediaId: "",
    order: 0
  });

  // Extract items from PRD-compliant tabs structure
  const extractItemsFromTabs = (tabs: any[]): ProjectGalleryItem[] => {
    const items: ProjectGalleryItem[] = [];
    
    console.log(`[GALLERY_MANAGER] extractItemsFromTabs called with ${tabs.length} tabs:`, tabs);
    
    const processTab = (tab: any, parentId?: number) => {
      console.log(`[GALLERY_MANAGER] Processing tab:`, tab);
      
      // Convert tab to ProjectGalleryItem format
      const item: ProjectGalleryItem = {
        id: tab.id,
        projectId: projectId,
        mediaId: null, // API'den gelen mediaId değerini kullanıyoruz
        order: tab.order || 0,
        title: tab.title || '',
        description: tab.description || '',
        parentId: parentId || null,
        isActive: true,
        isFolder: !tab.hasOwnMedia, // hasOwnMedia false ise klasördür
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: null,
        category: tab.category || 'DIS_MEKAN',
        media: null,
        parent: null,
        children: []
      };
      
      console.log(`[GALLERY_MANAGER] Created item:`, item);
      items.push(item);
      
      // Process sub-tabs recursively
      if (tab.subTabs && tab.subTabs.length > 0) {
        console.log(`[GALLERY_MANAGER] Processing ${tab.subTabs.length} subTabs for tab ${tab.id}`);
        tab.subTabs.forEach((subTab: any) => {
          processTab(subTab, tab.id);
        });
      }
    };
    
    tabs.forEach(tab => processTab(tab));
    console.log(`[GALLERY_MANAGER] extractItemsFromTabs returning ${items.length} items:`, items);
    return items;
  };

  // Load gallery items from API
  const loadGalleryItems = async () => {
    try {
      setIsLoading(true);
      console.log(`[GALLERY_MANAGER] Loading gallery items for project: ${projectId}`);
      const response = await fetch(`/api/projects/${projectId}/gallery`);
      console.log(`[GALLERY_MANAGER] Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[GALLERY_MANAGER] API Response:`, data);
        
        // Handle both old and new API response formats
        let galleryItems = [];
        if (data.success && data.data && data.data.tabs) {
          // New PRD-compliant format: extract items from tabs structure
          galleryItems = extractItemsFromTabs(data.data.tabs);
          // Store the original tabs data for debugging
          console.log(`[GALLERY_MANAGER] Original tabs data:`, data.data.tabs);
        } else if (Array.isArray(data.data)) {
          // Old format: direct array
          galleryItems = data.data;
        } else if (Array.isArray(data)) {
          // Fallback: direct array response
          galleryItems = data;
        }
        
        console.log(`[GALLERY_MANAGER] Loaded ${galleryItems.length} gallery items`);
        
        // Force a direct database query to verify data
        const dbCheckResponse = await fetch(`/api/projects/${projectId}/gallery/debug`);
        if (dbCheckResponse.ok) {
          const dbData = await dbCheckResponse.json();
          console.log(`[GALLERY_MANAGER] Direct DB check: ${dbData.count} items found`);
        }
        
        setGalleryItems(galleryItems);
        
        // Always notify parent component about gallery items
        if (onGalleryChange) {
          console.log(`[GALLERY_MANAGER] Calling onGalleryChange with ${galleryItems.length} items`);
          onGalleryChange(galleryItems);
        }
      } else {
        const errorText = await response.text();
        console.error(`[GALLERY_MANAGER] API Error: ${response.status} - ${errorText}`);
        throw new Error("Failed to load gallery items");
      }
    } catch (error) {
      console.error("Error loading gallery items:", error);
      toast.error("Galeri yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Build tree structure from flat array
  const buildGalleryTree = (items: ProjectGalleryItem[]): GalleryNode[] => {
    // Safety check: ensure items is an array
    if (!Array.isArray(items)) {
      console.warn('[GALLERY_MANAGER] buildGalleryTree received non-array:', items);
      return [];
    }

    const itemMap = new Map<number, GalleryNode>();
    const rootNodes: GalleryNode[] = [];

    // Create nodes
    items.forEach(item => {
      if (item && typeof item === 'object' && item.id) {
        itemMap.set(item.id, {
          item,
          children: [],
          level: 0
        });
      }
    });

    // Build tree
    items.forEach(item => {
      if (item && typeof item === 'object' && item.id) {
        const node = itemMap.get(item.id);
        if (node) {
          if (item.parentId) {
            const parentNode = itemMap.get(item.parentId);
            if (parentNode) {
              parentNode.children.push(node);
              node.level = parentNode.level + 1;
            }
          } else {
            rootNodes.push(node);
          }
        }
      }
    });

    return rootNodes;
  };

  // Toggle folder expansion
  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Add new gallery item
  const handleAddItem = async () => {
    if (!formData.title.trim()) {
      toast.error("Başlık alanı zorunludur");
      return;
    }

    try {
      setIsLoading(true);
      console.log(`[GALLERY_MANAGER] Adding gallery item with data:`, {
        ...formData,
        parentId: selectedParent,
        isFolder: true,
        category: 'DIS_MEKAN'
      });

      const response = await fetch(`/api/projects/${projectId}/gallery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          parentId: selectedParent,
          isFolder: true, // Tüm galeriler klasör olarak oluşturulur
          category: 'DIS_MEKAN' // Default category
        }),
      });

      console.log(`[GALLERY_MANAGER] Response status: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        console.log(`[GALLERY_MANAGER] Gallery item added successfully:`, result);
        toast.success("Galeri öğesi eklendi");
        setIsAddModalOpen(false);
        setFormData({ title: "", description: "", mediaId: "", order: 0 });
        setSelectedParent(null);
        await loadGalleryItems();
      } else {
        const errorText = await response.text();
        console.error(`[GALLERY_MANAGER] API Error: ${response.status} - ${errorText}`);
        
        if (response.status === 401) {
          toast.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        } else {
          toast.error("Galeri öğesi eklenirken hata oluştu");
        }
      }
    } catch (error) {
      console.error("Error adding gallery item:", error);
      toast.error("Galeri öğesi eklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit gallery item
  const handleEditItem = async () => {
    if (!editingItem) return;

    if (!formData.title.trim()) {
      toast.error("Başlık alanı zorunludur");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/gallery/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          order: formData.order
        }),
      });

      if (response.ok) {
        toast.success("Galeri öğesi güncellendi");
        setIsEditModalOpen(false);
        setEditingItem(null);
        setFormData({ title: "", description: "", mediaId: "", order: 0 });
        await loadGalleryItems();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update gallery item");
      }
    } catch (error) {
      console.error("Error updating gallery item:", error);
      toast.error("Galeri öğesi güncellenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete gallery item
  const handleDeleteItem = async (itemId: number) => {
    // Check if item has children
    const item = galleryItems.find(i => i.id === itemId);
    if (item && item.children && item.children.length > 0) {
      toast.error(`Bu galeri silinemez çünkü ${item.children.length} alt galeri bulunuyor. Önce alt galerileri silin.`);
      return;
    }

    if (!confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;

    try {
      setIsLoading(true);
      console.log(`[GALLERY_MANAGER] Deleting item ${itemId} from project ${projectId}`);
      
      const response = await fetch(`/api/projects/${projectId}/gallery/${itemId}`, {
        method: "DELETE",
      });

      console.log(`[GALLERY_MANAGER] Delete response status: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        console.log(`[GALLERY_MANAGER] Delete successful:`, result);
        toast.success("Galeri öğesi silindi");
        await loadGalleryItems();
      } else {
        const errorText = await response.text();
        console.error(`[GALLERY_MANAGER] Delete failed: ${response.status} - ${errorText}`);
        
        try {
          const errorData = JSON.parse(errorText);
          if (response.status === 400 && errorData.message?.includes("children")) {
            toast.error("Bu galeri silinemez çünkü alt galerileri bulunuyor. Önce alt galerileri silin.");
          } else if (response.status === 404) {
            toast.error("Galeri öğesi bulunamadı");
          } else if (response.status === 403) {
            toast.error("Bu galeri öğesini silme yetkiniz yok");
          } else {
            toast.error(errorData.message || "Galeri silinirken hata oluştu");
          }
        } catch {
          toast.error("Galeri silinirken hata oluştu");
        }
      }
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      toast.error("Galeri öğesi silinirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Open add modal
  const openAddModal = (parentId?: number) => {
    setSelectedParent(parentId || null);
    setFormData({ title: "", description: "", mediaId: "", order: 0 });
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (item: ProjectGalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      mediaId: item.mediaId || "",
      order: item.order
    });
    setIsEditModalOpen(true);
  };

  // Get media URL
  const getMediaUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  // Render gallery node
  const renderGalleryNode = (node: GalleryNode) => {
    const { item } = node;
    const isExpanded = expandedFolders.has(item.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={item.id} className="ml-4">
        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFolder(item.id)}
                  className="p-1 h-8 w-8"
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  ) : (
                    <Folder className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/dashboard/projects/${projectId}/gallery/${item.id}`, '_blank')}
                  title="Detay"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAddModal(item.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Render children if expanded */}
        {isExpanded && (
          <div className="ml-4">
            {node.children.map(child => renderGalleryNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Load initial data
  useEffect(() => {
    if (projectId) {
      console.log("[GALLERY_MANAGER] useEffect triggered with projectId:", projectId);
      loadGalleryItems();
      
      // Force refresh every 5 seconds for debugging
      const interval = setInterval(() => {
        console.log("[GALLERY_MANAGER] Auto-refresh triggered");
        loadGalleryItems();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [projectId]);

  const treeNodes = buildGalleryTree(galleryItems);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Galeri Yönetimi</h3>
        <Button type="button" onClick={() => openAddModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Öğe Ekle
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Yükleniyor...</span>
        </div>
      )}

      {!isLoading && treeNodes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Henüz galeri öğesi yok</h4>
            <p className="text-gray-600 mb-4">
              Projeniz için galeri öğeleri ekleyerek başlayın
            </p>
            <Button type="button" onClick={() => openAddModal()}>
              <Plus className="h-4 w-4 mr-2" />
              İlk Öğeyi Ekle
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && treeNodes.length > 0 && (
        <div className="space-y-2">
          {treeNodes.map(node => renderGalleryNode(node))}
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Galeri Öğesi Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Örn: Kat Planları, 2+1 Daireler"
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Galeri öğesi açıklaması"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="parent">Parent Galeri</Label>
              <Select
                value={selectedParent?.toString() || "none"}
                onValueChange={(value) => setSelectedParent(value === "none" ? null : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Parent galeri seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ana seviye (parent yok)</SelectItem>
                  {galleryItems
                    .filter(item => item.isFolder)
                    .map(item => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="order">Sıralama</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleAddItem} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Ekle
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Galeri Öğesini Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Başlık</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Örn: Kat Planları, 2+1 Daireler"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Açıklama</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Galeri öğesi açıklaması"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-order">Sıralama</Label>
              <Input
                id="edit-order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleEditItem} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Güncelle
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
