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
  X
} from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/media-utils";
import { GlobalMediaFile } from "./GlobalMediaSelector";
import { MediaUploader } from "./MediaUploader";

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

      const url = `/api/media?${params}`;
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
    console.log("🎯 MediaBrowserSimple: Upload complete, refreshing...");
    setShowUploaderModal(false);
    toast.success(`${uploadedFiles.length} dosya başarıyla yüklendi`);
    
    // Force refresh after upload
    setTimeout(() => {
      forceRefresh();
    }, 500);
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
          {/* Simple toolbar */}
          <div className="flex gap-4 mb-4 justify-between">
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
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setShowUploaderModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Yükle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={forceRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
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
                  const isImage = file.mimeType.startsWith('image/');

                  return (
                    <Card
                      key={file.id}
                      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                      onClick={() => handleImageClick(file)}
                    >
                      <CardContent className="p-0 relative">
                        {/* Selection checkbox */}
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
                        </div>                        {/* File preview */}
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
    </Dialog>
  );
}
