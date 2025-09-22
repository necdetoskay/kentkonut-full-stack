"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

interface MediaBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedFiles: GlobalMediaFile[]) => void;
  multiple?: boolean;
  allowedTypes?: string[]; // ['image', 'video', 'document']
  categoryFilter?: number; // Pre-filter by category
  restrictCategorySelection?: boolean; // Kategori seçiminin değiştirilememesini sağlar
  title?: string;
  className?: string;
  customFolder?: string; // Custom upload folder for consistency with MediaSelector
}

export function MediaBrowser({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  allowedTypes,
  categoryFilter,
  restrictCategorySelection = false,
  title = "Medya Seç",
  className = "",
  customFolder = "media"
}: MediaBrowserProps) {

  // Debug props on component initialization
  console.log('🏗️ MediaBrowser: Component initialized with props:', {
    isOpen,
    multiple,
    allowedTypes,
    categoryFilter,
    restrictCategorySelection,
    title,
    customFolder
  });
  const { categories } = useMediaCategories();
  const [mediaFiles, setMediaFiles] = useState<GlobalMediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter?.toString() || "all");
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<GlobalMediaFile[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showUploaderModal, setShowUploaderModal] = useState(false);

  // Fetch media files
  const fetchMediaFiles = async (reset = false) => {
    try {
      console.log("🔍 MediaBrowser: fetchMediaFiles called", {
        reset,
        selectedCategory,
        categoryFilter,
        restrictCategorySelection,
        customFolder,
        searchQuery,
        fileTypeFilter
      });
      setLoading(true);
      const currentPage = reset ? 1 : page;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (selectedCategory !== "all") {
        params.append("categoryId", selectedCategory);
        console.log("📂 MediaBrowser: Added categoryId from selectedCategory:", selectedCategory);
      } else if (categoryFilter && restrictCategorySelection) {
        // Eğer kategori kısıtlaması varsa ve bir kategori filtresi belirlenmiş fakat seçim değişmediyse
        params.append("categoryId", categoryFilter.toString());
        console.log("📂 MediaBrowser: Added categoryId from categoryFilter:", categoryFilter);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
        console.log("🔍 MediaBrowser: Added search query:", searchQuery);
      }

      if (fileTypeFilter !== "all") {
        params.append("type", fileTypeFilter);
        console.log("📄 MediaBrowser: Added file type filter:", fileTypeFilter);
      }

      // Add customFolder parameter for consistency with uploads
      if (customFolder) {
        params.append("customFolder", customFolder);
        console.log("📁 MediaBrowser: Added customFolder parameter:", customFolder);
      } else {
        console.log("⚠️ MediaBrowser: No customFolder provided!");
      }

      const finalUrl = `/api/media?${params}`;
      console.log("🌐 MediaBrowser: Making API call to:", finalUrl);
      console.log("📋 MediaBrowser: Full parameters:", Object.fromEntries(params));

      const response = await fetch(finalUrl);

      console.log("📡 MediaBrowser: API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ MediaBrowser: API error:", errorText);
        throw new Error(`Failed to fetch media files: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      console.log("📦 MediaBrowser: API response received", {
        dataLength: result.data?.length || 0,
        total: result.pagination?.total || 0,
        resetMode: reset,
        hasData: !!result.data,
        firstItem: result.data?.[0]?.originalName || 'No items'
      });

      if (result.data && result.data.length > 0) {
        console.log("📸 MediaBrowser: First few items:", result.data.slice(0, 3).map((item: GlobalMediaFile) => ({
          name: item.originalName,
          url: item.url,
          categoryId: item.categoryId
        })));
      } else {
        console.log("📭 MediaBrowser: No media files returned from API");
      }
      
      // Filter by allowed types if specified
      let filteredData = result.data;
      if (allowedTypes && allowedTypes.length > 0) {
        filteredData = result.data.filter((file: GlobalMediaFile) => {
          const fileType = getFileTypeCategory(file.mimeType);
          return allowedTypes.includes(fileType);
        });
      }
      
      if (reset) {
        setMediaFiles(filteredData);
        setPage(1);
        console.log("🔄 MediaBrowser: Media files reset", { count: filteredData.length });
      } else {
        setMediaFiles(prev => [...prev, ...filteredData]);
        console.log("🔄 MediaBrowser: Media files appended", { newCount: filteredData.length });
      }
      
-      setHasMore(result.pagination.hasNextPage);
+      setHasMore(Boolean(result.pagination?.hasNextPage));
      
    } catch (error) {
      console.error("Error fetching media files:", error);
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

  // Handle file selection
  const handleFileSelection = (file: GlobalMediaFile, selected: boolean) => {
    if (multiple) {
      const newSelection = selected
        ? [...selectedFiles, file]
        : selectedFiles.filter(f => f.id !== file.id);
      setSelectedFiles(newSelection);
    } else {
      setSelectedFiles(selected ? [file] : []);
    }
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    onSelect(selectedFiles);
    onClose();
  };

  // Handle file click for selection
  const handleFileClick = (file: GlobalMediaFile) => {
    if (multiple) {
      const isSelected = selectedFiles.some(f => f.id === file.id);
      if (isSelected) {
        setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
      } else {
        setSelectedFiles([...selectedFiles, file]);
      }
    } else {
      // Single selection - immediately select and close
      onSelect([file]);
      onClose();
    }
  };

  // Load more files
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Handle select all/none
  const handleSelectAll = () => {
    if (selectedFiles.length === mediaFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...mediaFiles]);
    }
  };

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      setSearchQuery("");
      setPage(1);
      
      // Kategori filtresi varsa ve kısıtlama etkinse, kategoriyi ayarla
      if (categoryFilter && restrictCategorySelection) {
        setSelectedCategory(categoryFilter.toString());
      }
      
      fetchMediaFiles(true);
    }
  }, [isOpen, categoryFilter, restrictCategorySelection]);
  
  // Refetch when filters change
  useEffect(() => {
    if (isOpen) {
      fetchMediaFiles(true);
    }
  }, [selectedCategory, fileTypeFilter, searchQuery]);

  useEffect(() => {
    if (page > 1) {
      fetchMediaFiles();
    }
  }, [page]);

  // Dosya yükleme tamamlandığında çalışacak fonksiyon
  const handleUploadComplete = (uploadedFiles: any[]) => {
    console.log("🎯 MediaBrowser: Upload complete, refreshing media list...");
    setShowUploaderModal(false);
    
    // Media listesini yenile ve doğru kategoride olduğundan emin ol
    if (categoryFilter && restrictCategorySelection) {
      setSelectedCategory(categoryFilter.toString());
    }
    
    // Önce hemen bir yenileme dene
    fetchMediaFiles(true);
    
    // Sonra biraz gecikme ile tekrar yenile (dosya işleme zamanı için)
    setTimeout(() => {
      console.log("🔄 MediaBrowser: Secondary refresh after upload");
      fetchMediaFiles(true); // Medya galeriyi yenile
    }, 1000); // Gecikmeyi 1 saniyeye çıkar
    
    toast.success(`${uploadedFiles.length} dosya başarıyla yüklendi`);
  };

  // Debug logger for mediaFiles state
  useEffect(() => {
    console.log("📊 MediaBrowser: mediaFiles state changed", {
      count: mediaFiles.length,
      files: mediaFiles.map(f => ({ id: f.id, filename: f.filename, categoryId: f.categoryId }))
    });
  }, [mediaFiles]);

  // Filter available file types based on allowedTypes
  const getAvailableFileTypes = () => {
    const types = [
      { value: "all", label: "Tüm Tipler" },
      { value: "image", label: "Resimler" },
      { value: "video", label: "Videolar" },
      { value: "document", label: "Belgeler" },
    ];

    if (allowedTypes && allowedTypes.length > 0) {
      return types.filter(type => type.value === "all" || allowedTypes.includes(type.value));
    }

    return types;
  };

  const getMediaUrl = (url?: string) => {
    if (!url) return '';
    let normalizedUrl = url;
    if (normalizedUrl.startsWith('http')) return normalizedUrl;
    
    // Remove /public/ prefix if exists
    normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
    
    // Normalize legacy paths under /uploads/media/<tr-folder>/
    normalizedUrl = normalizedUrl
      .replace(/^\/uploads\/media\/bannerlar\//, '/banners/')
      .replace(/^\/public\/uploads\/media\/bannerlar\//, '/banners/')
      .replace(/^\/uploads\/media\/haberler\//, '/haberler/')
      .replace(/^\/public\/uploads\/media\/haberler\//, '/haberler/')
      .replace(/^\/uploads\/media\/projeler\//, '/projeler/')
      .replace(/^\/public\/uploads\/media\/projeler\//, '/projeler/');
    
    // Handle different folder structures based on customFolder or URL path
    if (customFolder === 'banners' || normalizedUrl.includes('/banners/')) {
      normalizedUrl = normalizedUrl.replace(/^\/public\/banners\//, '/banners/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\/banners\//, '/banners/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/banners/');
      if (!normalizedUrl.startsWith('/banners/')) {
        normalizedUrl = '/banners/' + normalizedUrl.replace(/^\//, '');
      }
    } else if (customFolder === 'projeler' || normalizedUrl.includes('/projeler/')) {
      normalizedUrl = normalizedUrl.replace(/^\/public\/projeler\//, '/projeler/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\/projeler\//, '/projeler/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/projeler/');
      if (!normalizedUrl.startsWith('/projeler/')) {
        normalizedUrl = '/projeler/' + normalizedUrl.replace(/^\//, '');
      }
    } else {
      normalizedUrl = normalizedUrl.replace(/^\/public\/haberler\//, '/haberler/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\/haberler\//, '/haberler/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/haberler/');
      if (!normalizedUrl.startsWith('/haberler/')) {
        normalizedUrl = '/haberler/' + normalizedUrl.replace(/^\//, '');
      }
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
          {/* Filters */}
          <div className="flex gap-4 mb-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Medya ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            {!restrictCategorySelection ? (
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
            ) : (
              <div className="w-[150px] px-3 py-2 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
                <Badge variant="secondary">Kategori</Badge>
                <span className="text-sm truncate">
                  {categories.find(cat => cat.id.toString() === selectedCategory)?.name || 'Tüm Kategoriler'}
                </span>
              </div>
            )}

            {/* File Type Filter */}
            <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailableFileTypes().map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Upload Button */}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setShowUploaderModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Yükle
            </Button>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMediaFiles(true)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Selection Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                {mediaFiles.length} dosya bulundu
              </p>
              {multiple && mediaFiles.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedFiles.length === mediaFiles.length ? 'Hiçbirini Seçme' : 'Tümünü Seç'}
                </Button>
              )}
            </div>
            {selectedFiles.length > 0 && (
              <Badge variant="secondary">
                {selectedFiles.length} dosya seçili
              </Badge>
            )}
          </div>

          {/* Media Grid/List */}
          <div className="flex-1 overflow-y-auto">
            {loading && mediaFiles.length === 0 ? (
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
              <>
                <div className={
                  viewMode === "grid" 
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    : "space-y-2"
                }>
                  {mediaFiles.map((file) => {
                    const FileIcon = getFileTypeIcon(file.mimeType);
                    const isSelected = selectedFiles.some(f => f.id === file.id);
                    const isImage = file.mimeType.startsWith('image/');

                    if (viewMode === "grid") {
                      return (
                        <Card 
                          key={file.id} 
                          className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                          onClick={() => handleFileSelection(file, !isSelected)}
                        >
                          <CardContent className="p-0 relative">
                            {/* Selection indicator */}
                            <div className="absolute top-2 left-2 z-10">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-primary border-primary text-white' 
                                  : 'bg-white border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
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
                    } else {
                      return (
                        <Card 
                          key={file.id} 
                          className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                          onClick={() => handleFileSelection(file, !isSelected)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              {/* Selection checkbox */}
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-primary border-primary text-white' 
                                  : 'bg-white border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>

                              {/* File preview/icon */}
                              <div className="flex-shrink-0">
                                {isImage ? (
                                  <img
                                    src={getMediaUrl(file.url)}
                                    alt={file.alt || file.originalName}
                                    className="w-12 h-12 object-cover rounded border"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                                    <FileIcon className="w-6 h-6 text-gray-500" />
                                  </div>
                                )}
                              </div>

                              {/* File info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.originalName}</p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span>{formatFileSize(file.size)}</span>
                                  <span>•</span>
                                  <span>{file.category?.name || 'Kategorisiz'}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                  })}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-4">
                    <Button
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
                customFolder={customFolder}
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
