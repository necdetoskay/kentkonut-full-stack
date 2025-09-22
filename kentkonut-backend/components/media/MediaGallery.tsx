"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaItem } from "./MediaItem";
import { MediaUploader } from "./MediaUploader";
import { EnhancedMediaUploader } from "./enhanced/EnhancedMediaUploader";
import { MediaManager } from "./MediaManager";
import { useMediaCategories } from "@/app/context/MediaCategoryContext";
import {
  Search,
  Grid3X3,
  List,
  Upload,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Image,
  Film,
  FileText,
  File
} from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/media-utils";
import { GlobalMediaFile } from "./GlobalMediaSelector";

interface MediaGalleryProps {
  categoryId?: number;
  showUploader?: boolean;
  selectionMode?: boolean;
  onSelectionChange?: (selectedFiles: GlobalMediaFile[]) => void;
  onImageClick?: (file: GlobalMediaFile) => void;
  className?: string;
  useEnhancedUploader?: boolean; // New prop to enable enhanced uploader
}

export function MediaGallery({
  categoryId,
  showUploader = true,
  selectionMode = false,
  onSelectionChange,
  onImageClick,
  className = "",
  useEnhancedUploader = false
}: MediaGalleryProps) {
  const { categories } = useMediaCategories();
  const [mediaFiles, setMediaFiles] = useState<GlobalMediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId?.toString() || "all");
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<GlobalMediaFile[]>([]);
  const [showUploaderModal, setShowUploaderModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch media files
  const fetchMediaFiles = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        sortBy,
        sortOrder,
      });

      if (selectedCategory !== "all") {
        params.append("categoryId", selectedCategory);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (fileTypeFilter !== "all") {
        params.append("type", fileTypeFilter);
      }

      const response = await fetch(`/api/media?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch media files");
      }

      const result = await response.json();

      if (reset) {
        setMediaFiles(result.data);
        setPage(1);
      } else {
        setMediaFiles(prev => [...prev, ...result.data]);
      }

      setHasMore(result.pagination.hasNextPage);

    } catch (error) {
      console.error("Error fetching media files:", error);
      toast.error("Medya dosyaları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Load more files
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Handle file selection
  const handleFileSelection = (file: GlobalMediaFile, selected: boolean) => {
    if (!selectionMode) return;

    const newSelection = selected
      ? [...selectedFiles, file]
      : selectedFiles.filter(f => f.id !== file.id);

    setSelectedFiles(newSelection);
    onSelectionChange?.(newSelection);
  };

  // Handle upload complete
  const handleUploadComplete = (uploadedFiles: any[]) => {
    setShowUploaderModal(false);
    fetchMediaFiles(true); // Refresh the gallery
    toast.success(`${uploadedFiles.length} dosya başarıyla yüklendi`);
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, data?: any) => {
    try {
      const response = await fetch('/api/media/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bulk operation failed');
      }

      const result = await response.json();

      // Refresh the gallery after bulk operation
      fetchMediaFiles(true);

      return result;
    } catch (error) {
      console.error('Bulk action error:', error);
      throw error;
    }
  };

  // Handle file delete
  const handleFileDelete = async (fileId: number) => {
    try {
      const response = await fetch(`/api/media/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      setMediaFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success("Dosya başarıyla silindi");

    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Dosya silinirken bir hata oluştu");
    }
  };

  // Handle file update
  const handleFileUpdate = (updatedFile: GlobalMediaFile) => {
    setMediaFiles(prev => prev.map(f =>
      f.id === updatedFile.id ? updatedFile : f
    ));
  };

  // Get file type icon
  const getFileTypeIcon = (type: string) => {
    if (type === "image") return Image;
    if (type === "video") return Film;
    if (type === "document") return FileText;
    return File;
  };

  // Effects
  useEffect(() => {
    fetchMediaFiles(true);
  }, [selectedCategory, fileTypeFilter, sortBy, sortOrder, searchQuery]);

  useEffect(() => {
    if (page > 1) {
      fetchMediaFiles();
    }
  }, [page]);

  return (
    <div className={`${className}`}>
      {/* Main Content Container */}
      <div className={`${selectionMode ? 'flex gap-6 items-start' : ''}`}>
        {/* MediaManager Sidebar - Only show in selection mode */}
        {selectionMode && (
          <div className="w-80 flex-shrink-0">
            <MediaManager
              selectedFiles={selectedFiles}
              onSelectionChange={setSelectedFiles}
              onBulkAction={handleBulkAction}
              allFiles={mediaFiles}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Medya ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* File Type Filter */}
          <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Tipler</SelectItem>
              <SelectItem value="image">Resimler</SelectItem>
              <SelectItem value="video">Videolar</SelectItem>
              <SelectItem value="document">Belgeler</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">En Yeni</SelectItem>
              <SelectItem value="createdAt-asc">En Eski</SelectItem>
              <SelectItem value="originalName-asc">İsim A-Z</SelectItem>
              <SelectItem value="originalName-desc">İsim Z-A</SelectItem>
              <SelectItem value="size-desc">Boyut Büyük</SelectItem>
              <SelectItem value="size-asc">Boyut Küçük</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              type="button"
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload Button */}
          {showUploader && (
            <Button type="button" onClick={() => setShowUploaderModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Yükle
            </Button>
          )}

          {/* Refresh */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchMediaFiles(true)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploaderModal && (
        <Dialog open={showUploaderModal} onOpenChange={setShowUploaderModal}>
          <DialogContent className={`w-full max-h-[90vh] overflow-y-auto ${useEnhancedUploader ? 'max-w-4xl' : 'max-w-2xl'}`} aria-describedby="media-uploader-description">
            <DialogHeader>
              <DialogTitle>
                {useEnhancedUploader ? 'Gelişmiş Medya Yükleme' : 'Medya Yükle'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground" id="media-uploader-description">
                {useEnhancedUploader
                  ? 'Çoklu format desteği ile dosyalarınızı yükleyin veya video URL\'si ekleyin.'
                  : 'Sistem içerisinde kullanılacak medya dosyalarını buradan yükleyebilirsiniz.'
                }
              </p>
            </DialogHeader>
            <div className="p-4">
              {useEnhancedUploader ? (
                <EnhancedMediaUploader
                  categoryId={selectedCategory !== "all" ? parseInt(selectedCategory) : undefined}
                  onUploadComplete={handleUploadComplete}
                  enableFolderSelection={true}
                  enableEmbeddedVideo={true}
                  enableMultiFormat={true}
                  showFileTypeSelector={true}
                  enableAdvancedPreview={true}
                  layout="expanded"
                  theme="professional"
                  showHeader={false}
                />
              ) : (
                <MediaUploader
                  categoryId={selectedCategory !== "all" ? parseInt(selectedCategory) : undefined}
                  onUploadComplete={handleUploadComplete}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Results Info */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-600">
          {mediaFiles.length} dosya bulundu
        </p>
        {selectionMode && selectedFiles.length > 0 && (
          <Badge variant="secondary">
            {selectedFiles.length} dosya seçili
          </Badge>
        )}
      </div>

      {/* Media Grid/List */}
      {loading && mediaFiles.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : mediaFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Image className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Medya bulunamadı</h3>
            <p className="text-gray-500 text-center mb-4">
              Bu kriterlere uygun medya dosyası bulunamadı.
            </p>
            {showUploader && (
              <Button type="button" onClick={() => setShowUploaderModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                İlk dosyayı yükle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              : "space-y-2"
          }>
            {mediaFiles.map((file) => (
              <MediaItem
                key={file.id}
                file={file}
                viewMode={viewMode}
                selectionMode={selectionMode}
                selected={selectedFiles.some(f => f.id === file.id)}
                onSelectionChange={(selected) => handleFileSelection(file, selected)}
                onDelete={() => handleFileDelete(file.id)}
                onUpdate={handleFileUpdate}
                onImageClick={onImageClick}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  'Daha Fazla Yükle'
                )}
              </Button>
            </div>
          )}
        </>
      )}
        </div>
      </div>
    </div>
  );
}
