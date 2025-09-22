"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMediaCategories } from "@/app/context/MediaCategoryContext";
import {
  Search,
  Grid3X3,
  List,
  Upload,
  RefreshCw,
  Image,
  Film,
  FileText,
  File,
  Check,
  X,
  Trash2,
  MoreVertical,
  CheckSquare,
  Square
} from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/media-utils";
import { GlobalMediaFile } from "./GlobalMediaSelector";
import { MediaUploader } from "./MediaUploader";
import { MediaDeletionDialog, useDeletionDialog } from "./MediaDeletionDialog";

interface MediaBrowserSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedFiles: GlobalMediaFile[]) => void;
  multiple?: boolean;
  allowedTypes?: string[];
  categoryFilter?: number;
  restrictCategorySelection?: boolean;
  title?: string;
  className?: string;
  preSelected?: GlobalMediaFile[]; // Önceden seçili dosyalar
  customFolder?: string; // <-- EKLENDİ
}

export function MediaBrowserSimple({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  allowedTypes,
  categoryFilter,
  restrictCategorySelection = false,
  title = "Medya Seç",
  className = "",
  preSelected = [],
  customFolder = 'media' // <-- EKLENDİ
}: MediaBrowserSimpleProps) {
  const { categories } = useMediaCategories();
  const [mediaFiles, setMediaFiles] = useState<GlobalMediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<GlobalMediaFile[]>([]);
  const [showUploaderModal, setShowUploaderModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [recentlyUploadedFiles, setRecentlyUploadedFiles] = useState<GlobalMediaFile[]>([]);
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
  const [bulkSelectedFiles, setBulkSelectedFiles] = useState<GlobalMediaFile[]>([]);

  // Deletion dialog hook
  const {
    isOpen: isDeletionDialogOpen,
    filesToDelete,
    isDeleting,
    openDialog: openDeletionDialog,
    closeDialog: closeDeletionDialog,
    handleDeletion
  } = useDeletionDialog();

  // Force refresh function
  const forceRefresh = () => {
    console.log("🔄 MediaBrowserSimple: Force refresh triggered");
    setRefreshKey(prev => prev + 1);
  };

  // Fetch media files - simplified version
  const fetchMediaFiles = async () => {
    try {
      console.log("🔍 MediaBrowserSimple: fetchMediaFiles called", { categoryFilter, restrictCategorySelection });
      setLoading(true);
      
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Always use categoryFilter when restrictCategorySelection is true
      if (categoryFilter && restrictCategorySelection) {
        params.append("categoryId", categoryFilter.toString());
        console.log("🎯 MediaBrowserSimple: Using category filter", categoryFilter);
      }

      // Pass customFolder to ensure we fetch files from the correct directory in Docker
      const url = `/api/media?${params}&customFolder=${encodeURIComponent(customFolder)}`;
      console.log("🌐 MediaBrowserSimple: API call", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch media files");
      }

      const result = await response.json();
        console.log("📦 MediaBrowserSimple: API response", { 
        dataLength: result.data.length, 
        total: result.pagination?.total,
        actualData: result.data
      });
      
      // Filter by allowed types if specified
      let filteredData = result.data;
      if (allowedTypes && allowedTypes.length > 0) {
        filteredData = result.data.filter((file: GlobalMediaFile) => {
          const fileType = getFileTypeCategory(file.mimeType);
          return allowedTypes.includes(fileType);
        });
        console.log("🔍 MediaBrowserSimple: Filtered by types", { original: result.data.length, filtered: filteredData.length });
      }
      
      setMediaFiles(filteredData);
      console.log("✅ MediaBrowserSimple: Media files set", { count: filteredData.length });
      
    } catch (error) {
      console.error("❌ MediaBrowserSimple: Error fetching media files:", error);
      toast.error("Medya dosyaları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Get file type category
  const getFileTypeCategory = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  // Get file type icon
  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Film;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
    return File;
  };

  // Handle file selection via checkbox (for multiple selection)
  const handleCheckboxSelection = (file: GlobalMediaFile, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering image click

    if (multiple) {
      const isSelected = selectedFiles.some(f => f.id === file.id);
      const newSelection = isSelected
        ? selectedFiles.filter(f => f.id !== file.id)
        : [...selectedFiles, file];
      setSelectedFiles(newSelection);
    } else {
      // Single selection mode - checkbox acts like normal click
      const isSelected = selectedFiles.some(f => f.id === file.id);
      setSelectedFiles(isSelected ? [] : [file]);
    }
  };

  // Handle image click (for single selection or replacing selection)
  const handleImageClick = (file: GlobalMediaFile) => {
    if (multiple) {
      // In multiple mode, image click replaces current selection with single item
      setSelectedFiles([file]);
    } else {
      // In single mode, image click selects the item
      setSelectedFiles([file]);
    }
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    onSelect(selectedFiles);
    onClose();
  };

  // Handle upload complete
  const handleUploadComplete = (uploadedFiles: any[]) => {
    console.log("🎯 MediaBrowserSimple: Upload complete, refreshing...", uploadedFiles);
    setShowUploaderModal(false);
    toast.success(`${uploadedFiles.length} dosya başarıyla yüklendi ve seçildi`);

    // Convert uploaded files to GlobalMediaFile format
    const uploadedGlobalFiles: GlobalMediaFile[] = uploadedFiles.map(file => ({
      id: file.id,
      url: file.url,
      filename: file.filename || file.originalName,
      originalName: file.originalName || file.filename,
      alt: file.alt || '',
      caption: file.caption || '',
      mimeType: file.mimeType || 'image/jpeg',
      size: file.size || 0,
      categoryId: file.categoryId || categoryFilter || 1,
      createdAt: file.createdAt || new Date().toISOString(),
      updatedAt: file.updatedAt || new Date().toISOString()
    }));

    // Store recently uploaded files for auto-selection
    setRecentlyUploadedFiles(uploadedGlobalFiles);

    // Force refresh after upload and auto-select uploaded files
    setTimeout(() => {
      forceRefresh();
    }, 500);
  };

  // Handle individual file deletion
  const handleDeleteFile = async (file: GlobalMediaFile) => {
    openDeletionDialog([file]);
  };

  // Handle bulk file deletion
  const handleBulkDelete = async () => {
    if (bulkSelectedFiles.length === 0) {
      toast.error('Silinecek dosya seçilmedi');
      return;
    }
    openDeletionDialog(bulkSelectedFiles);
  };

  // Perform actual deletion
  const performDeletion = async (files: GlobalMediaFile[]) => {
    try {
      if (files.length === 1) {
        // Single file deletion
        const response = await fetch(`/api/media/${files[0].id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete file');
        }
      } else {
        // Bulk deletion
        const response = await fetch('/api/media/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete',
            mediaIds: files.map(f => f.id),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete files');
        }
      }

      // Remove deleted files from current state
      const deletedIds = files.map(f => f.id);
      setMediaFiles(prev => prev.filter(f => !deletedIds.includes(f.id)));
      setSelectedFiles(prev => prev.filter(f => !deletedIds.includes(f.id)));
      setBulkSelectedFiles(prev => prev.filter(f => !deletedIds.includes(f.id)));

      // Refresh the gallery to ensure consistency
      setTimeout(() => {
        forceRefresh();
      }, 500);

    } catch (error) {
      console.error('Deletion error', error);
      throw error;
    }
  };

  // Toggle bulk selection mode
  const toggleBulkSelectionMode = () => {
    setBulkSelectionMode(!bulkSelectionMode);
    setBulkSelectedFiles([]);
  };

  // Handle bulk selection checkbox
  const handleBulkSelection = (file: GlobalMediaFile, event: React.MouseEvent) => {
    event.stopPropagation();

    const isSelected = bulkSelectedFiles.some(f => f.id === file.id);
    if (isSelected) {
      setBulkSelectedFiles(prev => prev.filter(f => f.id !== file.id));
    } else {
      setBulkSelectedFiles(prev => [...prev, file]);
    }
  };

  // Select all files in bulk mode
  const selectAllFiles = () => {
    setBulkSelectedFiles([...mediaFiles]);
  };

  // Clear all bulk selections
  const clearAllSelections = () => {
    setBulkSelectedFiles([]);
  };
  // Fetch files when dialog opens or refreshKey changes
  useEffect(() => {
    if (isOpen) {
      console.log("📂 MediaBrowserSimple: Dialog opened, fetching files...");
      setSelectedFiles(preSelected); // Önceden seçili dosyaları ayarla
      fetchMediaFiles();
    }
  }, [isOpen, refreshKey, preSelected]);
  // Debug log for mediaFiles state
  useEffect(() => {
    console.log("📊 MediaBrowserSimple: mediaFiles state changed", {
      count: mediaFiles.length,
      files: mediaFiles.slice(0, 3).map(f => ({ id: f.id, filename: f.filename, categoryId: f.categoryId, url: f.url })),
      allFiles: mediaFiles
    });
  }, [mediaFiles]);

  // Auto-select recently uploaded files after refresh
  useEffect(() => {
    if (recentlyUploadedFiles.length > 0 && mediaFiles.length > 0) {
      console.log("🎯 Auto-selecting recently uploaded files:", recentlyUploadedFiles);

      // Find uploaded files in the current media files list
      const uploadedFilesInList = recentlyUploadedFiles
        .map(uploadedFile =>
          mediaFiles.find(mediaFile =>
            mediaFile.id === uploadedFile.id ||
            mediaFile.url === uploadedFile.url ||
            mediaFile.filename === uploadedFile.filename
          )
        )
        .filter(Boolean) as GlobalMediaFile[];

      if (uploadedFilesInList.length > 0) {
        console.log("✅ Found uploaded files in media list, auto-selecting:", uploadedFilesInList);

        if (multiple) {
          // In multiple mode, add to existing selection or replace if no existing selection
          const existingIds = selectedFiles.map(f => f.id);
          const newFiles = uploadedFilesInList.filter(f => !existingIds.includes(f.id));
          setSelectedFiles(prev => [...prev, ...newFiles]);
        } else {
          // In single mode, select the first uploaded file
          setSelectedFiles([uploadedFilesInList[0]]);
        }

        // Clear recently uploaded files to prevent re-selection
        setRecentlyUploadedFiles([]);

        toast.success(`${uploadedFilesInList.length} yüklenen dosya otomatik olarak seçildi`);
      }
    }
  }, [mediaFiles, recentlyUploadedFiles, multiple]);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Enhanced toolbar with bulk actions */}
          <div className="space-y-3 mb-4">
            {/* Main toolbar */}
            <div className="flex gap-4 justify-between">
              <div className="flex items-center gap-2">
                {restrictCategorySelection && categoryFilter && (
                  <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
                    <Badge variant="secondary">Kategori</Badge>
                    <span className="text-sm">
                      {categories.find(cat => cat.id === categoryFilter)?.name || 'Projeler'}
                    </span>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  {mediaFiles.length} dosya bulundu
                  {bulkSelectionMode && bulkSelectedFiles.length > 0 && (
                    <span className="ml-2 text-primary font-medium">
                      ({bulkSelectedFiles.length} seçili)
                    </span>
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={bulkSelectionMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleBulkSelectionMode}
                  disabled={isDeleting}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {bulkSelectionMode ? 'Seçim Modundan Çık' : 'Çoklu Seçim'}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setShowUploaderModal(true)}
                  disabled={isDeleting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Yükle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={forceRefresh}
                  disabled={loading || isDeleting}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Bulk actions toolbar */}
            {bulkSelectionMode && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllFiles}
                    disabled={mediaFiles.length === 0 || isDeleting}
                  >
                    Tümünü Seç
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllSelections}
                    disabled={bulkSelectedFiles.length === 0}
                  >
                    Seçimi Temizle
                  </Button>
                  <span className="text-sm text-gray-600">
                    {bulkSelectedFiles.length} / {mediaFiles.length} dosya seçili
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkSelectedFiles.length === 0 || isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Seçilenleri Sil ({bulkSelectedFiles.length})
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Image className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Medya bulunamadı</h3>
                <p className="text-gray-500 text-center">
                  Bu kriterlere uygun medya dosyası bulunamadı.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaFiles.map((file) => {
                  const FileIcon = getFileTypeIcon(file.mimeType);
                  const isSelected = selectedFiles.some(f => f.id === file.id);
                  const isBulkSelected = bulkSelectedFiles.some(f => f.id === file.id);
                  const isImage = file.mimeType.startsWith('image/');
                  const isRecentlyUploaded = recentlyUploadedFiles.some(f =>
                    f.id === file.id || f.url === file.url || f.filename === file.filename
                  );

                  return (
                    <Card
                      key={file.id}
                      className={`group cursor-pointer transition-all ${
                        bulkSelectionMode
                          ? (isBulkSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md hover:ring-1 hover:ring-blue-300')
                          : (isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md')
                      }`}
                      onClick={() => bulkSelectionMode ? handleBulkSelection(file, {} as React.MouseEvent) : handleImageClick(file)}
                    >
                      <CardContent className="p-0 relative">
                        {/* Selection checkbox - different behavior for bulk mode */}
                        {!bulkSelectionMode ? (
                          <div
                            className="absolute top-2 left-2 z-10 cursor-pointer hover:scale-110 transition-transform"
                            onClick={(e) => handleCheckboxSelection(file, e)}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-gray-300 hover:border-primary'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="absolute top-2 left-2 z-10 cursor-pointer hover:scale-110 transition-transform"
                            onClick={(e) => handleBulkSelection(file, e)}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isBulkSelected
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'bg-white border-gray-300 hover:border-blue-500'
                            }`}>
                              {isBulkSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        )}

                        {/* Top right corner - NEW badge or delete button */}
                        <div className="absolute top-2 right-2 z-10">
                          {isRecentlyUploaded ? (
                            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                              YENİ
                            </div>
                          ) : !bulkSelectionMode ? (
                            <div
                              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file);
                              }}
                            >
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-6 h-6 p-0 rounded-full hover:scale-110 transition-transform"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : null}
                        </div>

                        {/* File preview */}
                        <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden rounded border">
                          {isImage ? (
                            <img
                              src={getMediaUrl(file.url)}
                              alt={file.alt || file.originalName}
                              className="max-w-full max-h-full object-contain"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* File info */}
                        <div className="p-2">
                          <p className="text-xs font-medium truncate">{file.originalName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        <Dialog open={showUploaderModal} onOpenChange={setShowUploaderModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Medya Dosyası Yükle</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <MediaUploader
                categoryId={categoryFilter || undefined}
                defaultCategoryId={categoryFilter || undefined}
                onUploadComplete={handleUploadComplete}
                acceptedTypes={allowedTypes || undefined}
                customFolder={customFolder} // <-- EKLENDİ
              />
            </div>
          </DialogContent>
        </Dialog>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
          <Button 
            onClick={handleConfirmSelection}
            disabled={selectedFiles.length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Seç ({selectedFiles.length})
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Deletion Dialog */}
      <MediaDeletionDialog
        isOpen={isDeletionDialogOpen}
        onClose={closeDeletionDialog}
        onConfirm={() => handleDeletion(performDeletion)}
        files={filesToDelete}
        isDeleting={isDeleting}
      />
    </Dialog>
  );
}
