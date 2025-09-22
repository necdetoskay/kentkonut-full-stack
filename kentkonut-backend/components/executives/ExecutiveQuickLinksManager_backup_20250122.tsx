'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Link as LinkIcon,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';

interface ExecutiveQuickLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon: string;
  order: number;
  isActive: boolean;
  executiveId: string;
  createdAt: string;
  updatedAt: string;
}

interface ExecutiveQuickLinksManagerProps {
  executiveId: string;
  className?: string;
}

interface LinkFormData {
  title: string;
  url: string;
  description: string;
  icon: string;
  isActive: boolean;
}

const defaultFormData: LinkFormData = {
  title: '',
  url: '',
  description: '',
  icon: 'link',
  isActive: true
};

// Available icons
const iconOptions = [
  { value: 'link', label: 'Link' },
  { value: 'external-link', label: 'External Link' },
  { value: 'file-text', label: 'Document' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'download', label: 'Download' },
  { value: 'mail', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'map-pin', label: 'Location' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'user', label: 'Profile' },
  { value: 'building', label: 'Building' },
  { value: 'briefcase', label: 'Business' },
  { value: 'award', label: 'Award' },
  { value: 'star', label: 'Star' },
  { value: 'heart', label: 'Heart' },
  { value: 'home', label: 'Home' },
  { value: 'settings', label: 'Settings' },
  { value: 'info', label: 'Info' },
  { value: 'help-circle', label: 'Help' }
];

// Drag & Drop Types
const ItemType = 'EXECUTIVE_QUICK_LINK';

interface DragItem {
  id: string;
  index: number;
}

// Draggable Link Component
function DraggableLink({
  link,
  index,
  moveLink,
  onEdit,
  onDelete,
  onToggleActive,
  disabled
}: {
  link: ExecutiveQuickLink;
  index: number;
  moveLink: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (link: ExecutiveQuickLink) => void;
  onDelete: (linkId: string) => void;
  onToggleActive: (linkId: string, isActive: boolean) => void;
  disabled: boolean;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: link.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !disabled,
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item: DragItem) => {
      if (!disabled && item.index !== index) {
        moveLink(item.index, index);
        item.index = index;
      }
    },
    canDrop: () => !disabled,
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`
        flex items-center justify-between p-3 border rounded-lg bg-white
        ${isDragging ? 'opacity-50' : ''}
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-move'}
        ${!link.isActive ? 'bg-gray-50 border-gray-200' : 'border-gray-300'}
      `}
    >
      <div className="flex items-center space-x-3 flex-1">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className={`font-medium ${!link.isActive ? 'text-gray-500' : ''}`}>
              {link.title}
            </h4>
            {!link.isActive && (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                Pasif
              </span>
            )}
          </div>
          <p className={`text-sm ${!link.isActive ? 'text-gray-400' : 'text-gray-600'}`}>
            {link.url}
          </p>
          {link.description && (
            <p className={`text-xs ${!link.isActive ? 'text-gray-400' : 'text-gray-500'}`}>
              {link.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(link.url, '_blank')}
          disabled={disabled}
          title="Linki aç"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Switch
          checked={link.isActive}
          onCheckedChange={(checked) => onToggleActive(link.id, checked)}
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(link)}
          disabled={disabled}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(link.id)}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

export function ExecutiveQuickLinksManager({
  executiveId,
  className = ''
}: ExecutiveQuickLinksManagerProps) {
  const [links, setLinks] = useState<ExecutiveQuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<LinkFormData>(defaultFormData);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch links
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/yoneticiler/${executiveId}/quick-links`);
      
      if (response.ok) {
        const result = await response.json();
        setLinks(result.data || []);
      } else {
        toast.error('Hızlı erişim linkleri yüklenemedi');
      }
    } catch (error) {
      console.error('Error fetching executive quick links:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (executiveId) {
      fetchLinks();
    }
  }, [executiveId]);

  // Form handlers
  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setShowAddForm(false);
  };

  const startEdit = (link: ExecutiveQuickLink) => {
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
      icon: link.icon,
      isActive: link.isActive
    });
    setEditingId(link.id);
    setShowAddForm(false);
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    // Prevent default behavior if it's an event
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Başlık ve URL alanları zorunludur');
      return;
    }

    try {
      setSaving(true);

      const linkData = {
        ...formData,
        order: editingId ? undefined : links.length
      };

      const url = editingId
        ? `/api/yoneticiler/quick-links/${editingId}`
        : `/api/yoneticiler/${executiveId}/quick-links`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(linkData)
      });

      if (response.ok) {
        toast.success(editingId ? 'Link güncellendi' : 'Link eklendi');
        resetForm();
        fetchLinks();
      } else {
        const error = await response.json();
        toast.error(error.error || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Error saving executive quick link:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  // Delete link
  const deleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/yoneticiler/quick-links/${linkId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Link silindi');
        fetchLinks();
      } else {
        toast.error('Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error deleting executive quick link:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleDeleteClick = (linkId: string) => {
    setLinkToDelete(linkId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (linkToDelete) {
      deleteLink(linkToDelete);
    }
    setDeleteDialogOpen(false);
    setLinkToDelete(null);
  };

  // Toggle link active status
  const toggleActive = async (linkId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/yoneticiler/quick-links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        toast.success(isActive ? 'Link aktifleştirildi' : 'Link pasifleştirildi');
        fetchLinks();
      } else {
        toast.error('Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Error toggling link status:', error);
      toast.error('Bir hata oluştu');
    }
  };

  // Move link (drag & drop)
  const moveLink = (dragIndex: number, hoverIndex: number) => {
    const draggedLink = links[dragIndex];
    const newLinks = [...links];
    newLinks.splice(dragIndex, 1);
    newLinks.splice(hoverIndex, 0, draggedLink);
    setLinks(newLinks);
    setHasUnsavedChanges(true);
  };

  // Save reorder
  const saveReorder = async () => {
    try {
      const reorderData = links.map((link, index) => ({
        id: link.id,
        order: index
      }));

      const response = await fetch('/api/yoneticiler/quick-links/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: reorderData })
      });

      if (response.ok) {
        toast.success('Sıralama kaydedildi');
        setHasUnsavedChanges(false);
      } else {
        toast.error('Sıralama kaydedilemedi');
        fetchLinks(); // Revert to original order
      }
    } catch (error) {
      console.error('Error saving reorder:', error);
      toast.error('Bir hata oluştu');
      fetchLinks(); // Revert to original order
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p>Hızlı erişim linkleri yükleniyor...</p>
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
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Button
                  onClick={saveReorder}
                  size="sm"
                  variant="outline"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Sıralamayı Kaydet
                </Button>
              )}
              <Button
                onClick={() => setShowAddForm(true)}
                size="sm"
                disabled={showAddForm || !!editingId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Link
              </Button>
            </div>
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
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Link başlığı"
                        required
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="url">URL *</Label>
                      <Input
                        id="url"
                        type="text"
                        value={formData.url}
                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="/test veya https://example.com"
                        required
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Link açıklaması (opsiyonel)"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="icon">İkon</Label>
                      <Select
                        value={formData.icon}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="isActive">Aktif</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      İptal
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
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
          {links.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Henüz hızlı erişim linki eklenmemiş</p>
              <p className="text-sm">Yukarıdaki "Yeni Link" butonunu kullanarak link ekleyebilirsiniz</p>
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((link, index) => (
                <DraggableLink
                  key={link.id}
                  link={link}
                  index={index}
                  moveLink={moveLink}
                  onEdit={startEdit}
                  onDelete={handleDeleteClick}
                  onToggleActive={toggleActive}
                  disabled={editingId !== null || showAddForm}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Linki Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu hızlı erişim linkini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndProvider>
  );
}
