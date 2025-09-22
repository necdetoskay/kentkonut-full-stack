'use client';

import { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ExternalLink,
  GripVertical,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickAccessLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  moduleType: string;
  moduleId: string | number;
  createdAt: string;
  updatedAt: string;
}

interface QuickAccessLinksManagerProps {
  moduleType: 'page' | 'news' | 'project' | 'department';
  moduleId: string | number;
  className?: string;
}

interface LinkFormData {
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
}

const defaultFormData: LinkFormData = {
  title: '',
  url: '',
  icon: 'link',
  isActive: true
};

// Drag & Drop Types
const ItemType = 'QUICK_ACCESS_LINK';

interface DragItem {
  id: string;
  index: number;
}

// Draggable Link Component
interface DraggableLinkProps {
  link: QuickAccessLink;
  index: number;
  moveLink: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (link: QuickAccessLink) => void;
  onDelete: (linkId: string) => void;
  onToggleActive: (linkId: string, isActive: boolean) => void;
  disabled: boolean;
  onDragStart?: (linkId: string) => void;
  onDragEnd?: () => void;
}

function DraggableLink({
  link,
  index,
  moveLink,
  onEdit,
  onDelete,
  onToggleActive,
  disabled,
  onDragStart,
  onDragEnd
}: DraggableLinkProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { id: link.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !disabled,
  }), [link.id, index, disabled]);

  const [, drop] = useDrop(() => ({
    accept: ItemType,
    hover: (item: DragItem) => {
      if (!item || item.index === index) {
        return;
      }
      moveLink(item.index, index);
      item.index = index;
    },
    canDrop: () => !disabled,
  }), [index, moveLink, disabled]);

  const dragDropRef = useCallback((node: HTMLDivElement | null) => {
    drag(drop(node));
  }, [drag, drop]);

  return (
    <div
      ref={dragDropRef}
      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50 scale-105 shadow-lg border-blue-300' : ''
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-move'}`}
    >
      <div className="flex items-center space-x-3">
        <GripVertical className={`h-4 w-4 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">{link.title}</h4>
            {!link.isActive && (
              <Badge variant="secondary">Pasif</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 flex items-center">
            <ExternalLink className="h-3 w-3 mr-1" />
            {link.url}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={link.isActive}
          onCheckedChange={(checked) => onToggleActive(link.id, checked)}
          disabled={disabled}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(link)}
          disabled={disabled}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(link.id)}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function QuickAccessLinksManager({
  moduleType,
  moduleId,
  className = ''
}: QuickAccessLinksManagerProps) {
  const [links, setLinks] = useState<QuickAccessLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<LinkFormData>(defaultFormData);
  const [reordering, setReordering] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalLinks, setOriginalLinks] = useState<QuickAccessLink[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // Function to compare if order has actually changed
  const hasOrderChanged = useCallback((current: QuickAccessLink[], original: QuickAccessLink[]) => {
    if (current.length !== original.length) return true;
    return current.some((link, index) => link.id !== original[index]?.id);
  }, []);

  // Fetch links for this module
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quick-access-links/module/${moduleType}/${moduleId}`);

      if (response.ok) {
        const data = await response.json();

        // Debug logging
        console.log('API Response:', data);
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));

        // Validate that data is an array
        if (Array.isArray(data)) {
          setLinks(data);
          setOriginalLinks([...data]); // Store original order
          setHasUnsavedChanges(false);
        } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
          // Handle wrapped response format
          setLinks(data.data);
          setOriginalLinks([...data.data]); // Store original order
          setHasUnsavedChanges(false);
        } else if (data && typeof data === 'object' && data.success && Array.isArray(data.data)) {
          // Handle success wrapper format
          setLinks(data.data);
          setOriginalLinks([...data.data]); // Store original order
          setHasUnsavedChanges(false);
        } else {
          console.error('API returned non-array data:', data);
          setLinks([]);
          setOriginalLinks([]);
          setHasUnsavedChanges(false);
        }
      } else {
        console.error('Failed to fetch quick access links, status:', response.status);
        setLinks([]);
      }
    } catch (error) {
      console.error('Error fetching quick access links:', error);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      fetchLinks();
    }
  }, [moduleType, moduleId]);

  // Handle form input changes
  const handleInputChange = (field: keyof LinkFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setShowAddForm(false);
  };

  // Start editing a link
  const startEdit = (link: QuickAccessLink) => {
    setFormData({
      title: link.title,
      url: link.url,
      icon: link.icon,
      isActive: link.isActive
    });
    setEditingId(link.id);
    setShowAddForm(false);
  };

  // Save link (create or update)
  const saveLink = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Başlık ve URL alanları zorunludur');
      return;
    }

    try {
      setSaving(true);
      
      const linkData = {
        ...formData,
        moduleType,
        [`${moduleType}Id`]: moduleType === 'news' || moduleType === 'project' 
          ? Number(moduleId) 
          : moduleId,
        sortOrder: editingId ? undefined : links.length
      };

      const url = editingId 
        ? `/api/quick-access-links/${editingId}`
        : '/api/quick-access-links';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(linkData)
      });

      if (response.ok) {
        await response.json(); // Consume response
        toast.success(editingId ? 'Link güncellendi' : 'Link eklendi');
        resetForm();
        fetchLinks(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Error saving link:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  // Delete link
  const deleteLink = async (linkId: string) => {
    if (!confirm('Bu linki silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/quick-access-links/${linkId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Link silindi');
        fetchLinks(); // Refresh the list
      } else {
        toast.error('Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Bir hata oluştu');
    }
  };

  // Toggle link active status
  const toggleActive = async (linkId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/quick-access-links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        toast.success(isActive ? 'Link aktifleştirildi' : 'Link pasifleştirildi');
        fetchLinks(); // Refresh the list
      } else {
        toast.error('Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Error toggling link status:', error);
      toast.error('Bir hata oluştu');
    }
  };

  // Move link for drag & drop
  const moveLink = useCallback((dragIndex: number, hoverIndex: number) => {
    setLinks((prevLinks) => {
      if (!prevLinks || prevLinks.length === 0) return prevLinks || [];
      const newLinks = [...prevLinks];
      const draggedLink = newLinks[dragIndex];
      if (!draggedLink) return newLinks;

      newLinks.splice(dragIndex, 1);
      newLinks.splice(hoverIndex, 0, draggedLink);

      // Only mark as changed if order actually changed from original
      const orderChanged = hasOrderChanged(newLinks, originalLinks);
      setHasUnsavedChanges(orderChanged);

      return newLinks;
    });
  }, [originalLinks, hasOrderChanged]);

  // Save reordered links to backend
  const saveReorder = useCallback(async () => {
    if (reordering) return;

    try {
      setReordering(true);

      if (!Array.isArray(links)) {
        console.error('Cannot reorder: links is not an array', links);
        return;
      }

      const reorderData = links.map((link, index) => ({
        id: link.id,
        sortOrder: index
      }));

      const response = await fetch('/api/quick-access-links/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: reorderData })
      });

      if (response.ok) {
        toast.success('Sıralama kaydedildi');
        setOriginalLinks([...links]); // Update original order to current
        setHasUnsavedChanges(false); // Mark as saved
        // Don't fetch again - local state is already updated
      } else {
        toast.error('Sıralama kaydedilemedi');
        // Revert to original order by fetching fresh data
        fetchLinks();
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error saving reorder:', error);
      toast.error('Bir hata oluştu');
      // Revert to original order by fetching fresh data
      fetchLinks();
      setHasUnsavedChanges(false);
    } finally {
      setReordering(false);
    }
  }, [links, fetchLinks]);

  // Reset to original order
  const resetOrder = useCallback(() => {
    setLinks([...originalLinks]);
    setHasUnsavedChanges(false);
  }, [originalLinks]);

  // Manual save reorder - removed automatic debounced save to prevent loops

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className={className}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Hızlı Erişim Linkleri
            </CardTitle>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              disabled={showAddForm || !!editingId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Link
            </Button>
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <Card className="border-dashed">
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Başlık *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Link başlığı"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      placeholder="/sayfa-url veya https://example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">İkon</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => handleInputChange('icon', e.target.value)}
                      placeholder="link"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Aktif</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                  <Button 
                    onClick={saveLink}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Kaydet')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Links List */}
        {!Array.isArray(links) || links.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Henüz hızlı erişim linki eklenmemiş</p>
            <p className="text-sm">Yukarıdaki "Yeni Link" butonunu kullanarak link ekleyebilirsiniz</p>
          </div>
        ) : (
          <div className={`space-y-2 ${draggedItemId ? 'bg-blue-50 p-2 rounded-lg border-2 border-dashed border-blue-200' : ''}`}>
            {draggedItemId && (
              <div className="text-center py-2">
                <div className="inline-flex items-center space-x-2 text-sm text-blue-600">
                  <GripVertical className="h-4 w-4" />
                  <span>Sürükleyerek yeni konuma bırakın</span>
                </div>
              </div>
            )}
            {hasUnsavedChanges && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-yellow-800">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Sıralama değişiklikleri kaydedilmedi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={resetOrder}
                    size="sm"
                    variant="outline"
                    disabled={reordering}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Geri Al
                  </Button>
                  <Button
                    onClick={saveReorder}
                    size="sm"
                    disabled={reordering}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {reordering ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </div>
            )}
            {reordering && (
              <div className="text-center py-2">
                <div className="inline-flex items-center space-x-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Sıralama kaydediliyor...</span>
                </div>
              </div>
            )}
            {Array.isArray(links) ? links.map((link, index) => (
              <DraggableLink
                key={link.id}
                link={link}
                index={index}
                moveLink={moveLink}
                onEdit={startEdit}
                onDelete={deleteLink}
                onToggleActive={toggleActive}
                disabled={editingId !== null || showAddForm || reordering}
                onDragStart={setDraggedItemId}
                onDragEnd={() => setDraggedItemId(null)}
              />
            )) : (
              <div className="text-center py-4 text-red-600">
                <p>Hata: Linkler yüklenemedi (veri formatı hatalı)</p>
                <p className="text-sm">Lütfen sayfayı yenileyin</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </DndProvider>
  );
}
