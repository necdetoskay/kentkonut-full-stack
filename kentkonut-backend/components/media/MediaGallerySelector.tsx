"use client";

import { useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  Upload,
  Plus,
  Image as ImageIcon,
  Trash2,
  Download,
  Crop,
  Loader2,
  Check,
  Settings
} from "lucide-react";
import { GlobalMediaFile } from "@/components/media/GlobalMediaSelector";
import { MediaBrowserSimple } from "@/components/media/MediaBrowserSimple";
import { MEDIA_CATEGORIES } from "@/lib/media-categories";
import { formatFileSize } from "@/lib/media-utils";
import { toast } from "sonner";

// Types for enhanced functionality
interface MediaActionState {
  isDeleting: boolean;
  isDownloading: boolean;
  isCropping: boolean;
  selectedForAction: string[];
  isSelectMode: boolean;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

interface UploadResponse {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  alt?: string;
  caption?: string;
  mimeType: string;
  categoryId: number;
}

interface MediaGallerySelectorProps {
  selectedItems: GlobalMediaFile[];
  onSelectionChange: (items: GlobalMediaFile[]) => void;
  categoryId?: number; // Hangi kategori kullanılacak (default: CONTENT_IMAGES)
  customFolder?: string; // Hangi klasör kullanılacak (default: "media/icerik")
  title?: string; // Modal başlığı (default: "Görselleri Seç")
  buttonText?: string; // Buton metni (default: "Galeri Görselleri Seç")
  addButtonText?: string; // Ekleme buton metni (default: "Görsel Ekle")
  replaceButtonText?: string; // Değiştirme buton metni (default: "Değiştir")
  className?: string;
}

export function MediaGallerySelector({ 
  selectedItems, 
  onSelectionChange,
  categoryId = MEDIA_CATEGORIES.CONTENT_IMAGES.id, // Default: İçerik Resimleri (ID: 5)
  customFolder = "media/icerik", // Default: İçerik klasörü
  title = "Görselleri Seç",
  buttonText = "Galeri Görselleri Seç",
  addButtonText = "Görsel Ekle",
  replaceButtonText = "Değiştir",
  className = ""
}: MediaGallerySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [actionMode, setActionMode] = useState<'replace' | 'add'>('replace');

  // Selection and action states
  const [selectedForAction, setSelectedForAction] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageData, setCropImageData] = useState<GlobalMediaFile | null>(null);

  // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const handleMediaSelected = (selectedFiles: GlobalMediaFile[]) => {
    onSelectionChange(selectedFiles);
    setIsOpen(false);
    toast.success(`${selectedFiles.length} görsel seçildi`);
  };

  const handleAddMoreImages = (selectedFiles: GlobalMediaFile[]) => {
    // Mevcut seçime ekleme yapar (duplicate kontrolü ile)
    const existingIds = selectedItems.map(item => item.id);
    const newFiles = selectedFiles.filter(file => !existingIds.includes(file.id));
    const combinedSelection = [...selectedItems, ...newFiles];
    onSelectionChange(combinedSelection);
    setIsOpen(false);
    toast.success(`${newFiles.length} yeni görsel eklendi`);
  };

  const handleConfirmSelection = (selectedFiles: GlobalMediaFile[]) => {
    if (actionMode === 'add') {
      handleAddMoreImages(selectedFiles);
    } else {
      handleMediaSelected(selectedFiles);
    }
  };

  const openModalForReplace = () => {
    setActionMode('replace');
    setIsOpen(true);
  };

  const openModalForAdd = () => {
    setActionMode('add');
    setIsOpen(true);
  };

  // Selection management
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedForAction([]);
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedForAction(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedForAction.length === selectedItems.length) {
      setSelectedForAction([]);
    } else {
      setSelectedForAction(selectedItems.map(item => item.id));
    }
  };

  // Delete functionality with enhanced error handling
  const handleDeleteSelected = async (): Promise<void> => {
    if (selectedForAction.length === 0) {
      toast.error('Silinecek görsel seçilmedi');
      return;
    }

    setIsDeleting(true);
    const failedDeletions: number[] = [];
    const successfulDeletions: number[] = [];

    try {
      // API call to delete selected media files with individual error handling
      const deletePromises = selectedForAction.map(async (fileId): Promise<number | null> => {
        try {
          const response = await fetch(`/api/media/${fileId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
          }

          successfulDeletions.push(fileId);
          return fileId;
        } catch (error) {
          console.error(`Failed to delete file ${fileId}:`, error);
          failedDeletions.push(fileId);
          return null;
        }
      });

      await Promise.all(deletePromises);

      // Update local state with successfully deleted items
      if (successfulDeletions.length > 0) {
        const remainingItems = selectedItems.filter(item => !successfulDeletions.includes(item.id));
        onSelectionChange(remainingItems);
      }

      // Reset selection
      setSelectedForAction([]);
      setDeleteModalOpen(false);
      setIsSelectMode(false);

      // Show appropriate success/error messages
      if (successfulDeletions.length > 0 && failedDeletions.length === 0) {
        toast.success(`${successfulDeletions.length} görsel başarıyla silindi`);
      } else if (successfulDeletions.length > 0 && failedDeletions.length > 0) {
        toast.warning(`${successfulDeletions.length} görsel silindi, ${failedDeletions.length} görsel silinemedi`);
      } else {
        toast.error('Hiçbir görsel silinemedi');
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
      toast.error('Silme işlemi sırasında beklenmeyen bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  // Download functionality with enhanced error handling
  const downloadSingleImage = async (item: GlobalMediaFile): Promise<void> => {
    try {
      if (!item.url) {
        throw new Error('Görsel URL\'si bulunamadı');
      }

      const response = await fetch(item.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Görsel dosyası boş');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.originalName || item.filename || `image_${item.id}`;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Görsel başarıyla indirildi');
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error(`Görsel indirilemedi: ${errorMessage}`);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedForAction.length === 0) return;

    setIsDownloading(true);
    try {
      if (selectedForAction.length === 1) {
        // Single file download
        const item = selectedItems.find(item => item.id === selectedForAction[0]);
        if (item) {
          await downloadSingleImage(item);
        }
      } else {
        // Multiple files - create zip
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        const downloadPromises = selectedForAction.map(async (fileId) => {
          const item = selectedItems.find(item => item.id === fileId);
          if (!item) return;

          try {
            const response = await fetch(item.url);
            const blob = await response.blob();
            const fileName = item.originalName || item.filename || `image_${fileId}`;
            zip.file(fileName, blob);
          } catch (error) {
            console.error(`Failed to download ${item.originalName}:`, error);
          }
        });

        await Promise.all(downloadPromises);

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gallery_images_${new Date().getTime()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`${selectedForAction.length} görsel zip olarak indirildi`);
      }

      setSelectedForAction([]);
      setIsSelectMode(false);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Görseller indirilemedi');
    } finally {
      setIsDownloading(false);
    }
  };

  // Crop functionality
  const handleCropImage = (item: GlobalMediaFile) => {
    setCropImageData(item);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!cropImageData) return;

    setIsCropping(true);
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', croppedImageBlob, `cropped_${cropImageData.originalName}`);
      formData.append('categoryId', categoryId.toString());
      formData.append('customFolder', customFolder);
      formData.append('alt', cropImageData.alt || '');
      formData.append('caption', cropImageData.caption || '');

      // Upload cropped image
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload cropped image');
      }

      const result = await response.json();
      const newImageData: GlobalMediaFile = {
        id: result.id,
        url: result.url,
        filename: result.filename,
        originalName: result.originalName,
        alt: result.alt,
        caption: result.caption,
        mimeType: result.mimeType,
        size: result.size || cropImageData.size,
        categoryId: result.categoryId,
        createdAt: result.createdAt || new Date().toISOString()
      };

      // Replace the original image with cropped version
      const updatedItems = selectedItems.map(item =>
        item.id === cropImageData.id ? newImageData : item
      );
      onSelectionChange(updatedItems);

      setCropModalOpen(false);
      setCropImageData(null);
      toast.success('Görsel başarıyla kırpıldı ve güncellendi');
    } catch (error) {
      console.error('Crop error:', error);
      toast.error('Görsel kırpılırken bir hata oluştu');
    } finally {
      setIsCropping(false);
    }
  };

  // Generic getMediaUrl function - klasöre göre dinamik
  const getMediaUrl = (url?: string) => {
    if (!url) return '';
    let normalizedUrl = url;
    if (normalizedUrl.startsWith('http')) return normalizedUrl;
    
    // Remove common prefixes
    normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/');
    
    // Ensure it starts with /
    if (!normalizedUrl.startsWith('/')) {
      normalizedUrl = '/' + normalizedUrl;
    }
    
    return normalizedUrl;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Eğer hiç görsel yoksa tek buton, varsa iki buton göster */}
      {selectedItems.length === 0 ? (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-12 flex items-center gap-2"
          onClick={openModalForReplace}
        >
          <Upload className="h-4 w-4" />
          {buttonText}
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 h-12 flex items-center gap-2"
            onClick={openModalForAdd}
          >
            <Plus className="h-4 w-4" />
            {addButtonText}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 h-12 flex items-center gap-2"
            onClick={openModalForReplace}
          >
            <Upload className="h-4 w-4" />
            {replaceButtonText} ({selectedItems.length})
          </Button>
        </div>
      )}

      <MediaBrowserSimple 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleConfirmSelection}
        multiple={true}
        categoryFilter={categoryId}
        restrictCategorySelection={true}
        title={actionMode === 'add' ? `${title} - Ekle` : title}
        allowedTypes={['image']}
        preSelected={actionMode === 'add' ? selectedItems : []}
        customFolder={customFolder}
      />

      {selectedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                Seçilen medya dosyaları: {selectedItems.length}
                {isSelectMode && selectedForAction.length > 0 && (
                  <span className="ml-2 text-primary">
                    ({selectedForAction.length} işlem için seçili)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {!isSelectMode ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectMode}
                    className="text-xs sm:text-sm"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">İşlemler</span>
                    <span className="sm:hidden">İşlem</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectionChange([])}
                    className="text-xs sm:text-sm"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Tümünü Kaldır</span>
                    <span className="sm:hidden">Temizle</span>
                  </Button>
                </>
              ) : (
                <>
                  <div
                    className="flex items-center gap-2 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer text-sm"
                    onClick={selectAllItems}
                  >
                    <Checkbox
                      checked={selectedForAction.length === selectedItems.length && selectedItems.length > 0}
                      onCheckedChange={() => {}}
                    />
                    <span>{selectedForAction.length === selectedItems.length ? 'Hiçbirini Seçme' : 'Tümünü Seç'}</span>
                  </div>
                  {selectedForAction.length > 0 && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadSelected}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        İndir ({selectedForAction.length})
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteModalOpen(true)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Sil ({selectedForAction.length})
                      </Button>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectMode}
                  >
                    <X className="h-4 w-4 mr-1" />
                    İptal
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Kompakt Liste Görünümü - Grid kaldırıldı */}
          <div className="space-y-3">
            {selectedItems.map((item, index) => {
              const isSelectedForAction = selectedForAction.includes(item.id);

              return (
                <Card
                  key={item.id}
                  className={`transition-all ${
                    isSelectMode
                      ? isSelectedForAction
                        ? 'ring-2 ring-primary'
                        : 'hover:ring-2 hover:ring-gray-300'
                      : 'hover:shadow-md'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Görsel Önizlemesi - Büyütüldü */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden relative group">
                          <img
                            src={getMediaUrl(item.url)}
                            alt={item.alt || item.originalName}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => {
                              // Görsel büyütme modalı açılabilir
                              console.log('Görsel büyütme:', item.originalName);
                            }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              console.error('Image load error:', item.url);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />

                          {/* Selection checkbox (in select mode) */}
                          {isSelectMode && (
                            <div
                              className="absolute top-1 left-1 cursor-pointer"
                              onClick={() => toggleItemSelection(item.id)}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isSelectedForAction
                                  ? 'bg-primary border-primary text-white'
                                  : 'bg-white border-gray-300'
                              }`}>
                                {isSelectedForAction && <Check className="w-2.5 h-2.5" />}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Görsel Bilgileri ve Düzenleme Alanları */}
                      <div className="flex-1 space-y-3">
                        {/* Dosya Adı ve Hızlı Eylemler */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.originalName || item.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(item.size || 0)} • {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>

                          {/* Hızlı Eylem Butonları */}
                          {!isSelectMode && (
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => downloadSingleImage(item)}
                                title="İndir"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleCropImage(item)}
                                title="Kırp"
                              >
                                <Crop className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  const newItems = selectedItems.filter((_, i) => i !== index);
                                  onSelectionChange(newItems);
                                  toast.success('Görsel kaldırıldı');
                                }}
                                title="Kaldır"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Alt Text ve Açıklama - Yan Yana */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">
                              Alt Text
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-md px-3 py-2 text-gray-900 dark:text-gray-200 dark:bg-gray-800"
                              placeholder="Alt text"
                              value={item.alt || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                const updated = selectedItems.map((it, i) => i === index ? { ...it, alt: value } : it);
                                onSelectionChange(updated);
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1">
                              Açıklama
                            </label>
                            <textarea
                              className="w-full border rounded-md px-3 py-2 text-gray-900 dark:text-gray-200 dark:bg-gray-800"
                              placeholder="Caption"
                              rows={3}
                              value={item.caption || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                const value = e.target.value;
                                const updated = selectedItems.map((it, i) => i === index ? { ...it, caption: value } : it);
                                onSelectionChange(updated);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Görselleri Sil</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              {selectedForAction.length} görseli kalıcı olarak silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              İptal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil ({selectedForAction.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crop Modal - Placeholder for now */}
      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Görseli Kırp</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {cropImageData && (
              <div className="text-center">
                <img
                  src={getMediaUrl(cropImageData.url)}
                  alt={cropImageData.alt || cropImageData.originalName}
                  className="max-w-full max-h-96 mx-auto"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Kırpma özelliği yakında eklenecek: {cropImageData.originalName}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCropModalOpen(false)}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={() => {
                // Placeholder for crop functionality
                toast.info('Kırpma özelliği yakında eklenecek');
                setCropModalOpen(false);
              }}
              disabled={isCropping}
            >
              {isCropping ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kırpılıyor...
                </>
              ) : (
                <>
                  <Crop className="h-4 w-4 mr-2" />
                  Kırp ve Kaydet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
