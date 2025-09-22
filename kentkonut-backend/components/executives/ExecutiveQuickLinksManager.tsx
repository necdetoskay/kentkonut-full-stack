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
  FolderOpen,
  FileText,
} from 'lucide-react';
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CorporateAPI } from '@/utils/corporateApi';

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

// Using GlobalMediaFile from GlobalMediaSelector import above

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
  const [urlInputMode, setUrlInputMode] = useState<'manual' | 'browse'>('manual');
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null);

  // Fetch links
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const result = await CorporateAPI.executives.getQuickLinks(executiveId);
      setLinks(result || []);
    } catch (error) {
      console.error('Error fetching executive quick links:', error);
      toast.error('Hızlı erişim linkleri yüklenemedi');
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
    setUrlInputMode('manual');
    setSelectedMedia(null);
  };

  const handleMediaSelect = (media: GlobalMediaFile) => {
    setSelectedMedia(media);
    setFormData(prev => ({ ...prev, url: media.url }));
    // Auto-detect icon based on file type
    const mimeType = media.mimeType.toLowerCase();
    let icon = 'link';
    if (mimeType.startsWith('image/')) {
      icon = 'image';
    } else if (mimeType === 'application/pdf') {
      icon = 'file-text';
    } else if (mimeType.startsWith('video/')) {
      icon = 'video';
    }
    setFormData(prev => ({ ...prev, icon }));
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

    // Reset URL input mode and selected media for editing
    setUrlInputMode('manual');
    setSelectedMedia(null);
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

      if (editingId) {
        await CorporateAPI.executives.updateQuickLink(editingId, linkData);
        toast.success('Link güncellendi');
      } else {
        await CorporateAPI.executives.createQuickLink(executiveId, linkData);
        toast.success('Link eklendi');
      }

      resetForm();
      fetchLinks();
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
      await CorporateAPI.executives.deleteQuickLink(linkId);
      toast.success('Link silindi');
      fetchLinks();
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
      await CorporateAPI.executives.updateQuickLink(linkId, { isActive });
      toast.success(isActive ? 'Link aktifleştirildi' : 'Link pasifleştirildi');
      fetchLinks();
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

      await CorporateAPI.executives.reorderQuickLinks(reorderData);
      toast.success('Sıralama kaydedildi');
      setHasUnsavedChanges(false);
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

                      {/* URL Input Mode Tabs */}
                      <Tabs value={urlInputMode} onValueChange={(value) => setUrlInputMode(value as 'manual' | 'browse')} className="mt-2">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="manual" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Manuel Giriş
                          </TabsTrigger>
                          <TabsTrigger value="browse" className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            Dosya Seç
                          </TabsTrigger>
                        </TabsList>

                        {/* Manual URL Entry */}
                        <TabsContent value="manual" className="mt-3">
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
                        </TabsContent>

                        {/* File Browser */}
                        <TabsContent value="browse" className="mt-3">
                          <div className="space-y-3">
                            {/* Selected File Preview */}
                            {selectedMedia && (
                              <div className="p-3 bg-gray-50 rounded-lg border">
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0">
                                    {selectedMedia.mimeType.startsWith('image/') ? (
                                      <img
                                        src={selectedMedia.url}
                                        alt={selectedMedia.originalName}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-gray-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {selectedMedia.originalName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {selectedMedia.mimeType} • {(selectedMedia.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMedia(null);
                                      setFormData(prev => ({ ...prev, url: '' }));
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Media Selector */}
                            <GlobalMediaSelector
                              onSelect={handleMediaSelect}
                              selectedMedia={selectedMedia}
                              acceptedTypes={['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/*']}
                              defaultCategory="general"
                              restrictToCategory={false}
                              buttonText={selectedMedia ? "Dosyayı Değiştir" : "Dosya Seç"}
                              title="Link için Dosya Seçin"
                              description="Medya kütüphanesinden bir dosya seçin veya yeni dosya yükleyin"
                            />

                            {/* URL Display */}
                            {formData.url && (
                              <div className="mt-2">
                                <Label className="text-xs text-gray-500">Seçilen dosya URL'si:</Label>
                                <Input
                                  value={formData.url}
                                  readOnly
                                  className="mt-1 bg-gray-50 text-sm"
                                />
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
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
