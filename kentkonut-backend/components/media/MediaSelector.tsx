"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaCategories } from "@/app/context/MediaCategoryContext";
import { MediaUploader } from "./MediaUploader";
import { Image, Search, Upload, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/media-utils";
import { GlobalMediaFile as MediaFile } from "./GlobalMediaSelector";
import { corporateApiFetch } from "@/utils/corporateApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MediaSelectorProps {
  onSelect: (media: MediaFile) => void;
  selectedMedia?: MediaFile | null;
  acceptedTypes?: string[];
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  targetWidth?: number;
  targetHeight?: number;
  width?: number;
  height?: number;
  defaultCategoryId?: number; // Varsayılan kategori ID'si
  filterToCategory?: number; // Sadece belirli kategorideki dosyaları göster
  customFolder?: string; // Custom upload folder
}

export function MediaSelector({
  onSelect,
  selectedMedia,
  acceptedTypes = ['image/*'],
  trigger,
  title = "Medya Seç",
  description = "Galeri'den bir medya dosyası seçin veya yeni dosya yükleyin",
  targetWidth,
  targetHeight,
  width = 800,
  height = 600,
  defaultCategoryId,
  filterToCategory,
  customFolder = 'media'
}: MediaSelectorProps) {
  const { categories } = useMediaCategories();
  const [open, setOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    filterToCategory ? filterToCategory.toString() : 
    defaultCategoryId ? defaultCategoryId.toString() : 
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter media files based on accepted types
  const isFileTypeAccepted = (mimeType: string): boolean => {
    if (acceptedTypes.includes('*/*')) return true;

    const accepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return mimeType.startsWith(baseType);
      }
      return mimeType === type;
    });
    
    return accepted;
  };
  
  // If filterToCategory is defined, disable the category selection
  const isCategorySelectionDisabled = filterToCategory !== undefined;

  // Get best thumbnail URL for given size
  const getThumbnailUrl = (media: MediaFile, preferredSize: 'small' | 'medium' | 'large' = 'small') => {
    if (!media.mimeType.startsWith('image/')) return media.url;

    // Try to get the preferred size, fallback to others
    switch (preferredSize) {
      case 'small':
        return media.thumbnailSmall || media.thumbnailMedium || media.thumbnailLarge || media.url;
      case 'medium':
        return media.thumbnailMedium || media.thumbnailLarge || media.thumbnailSmall || media.url;
      case 'large':
        return media.thumbnailLarge || media.thumbnailMedium || media.thumbnailSmall || media.url;
      default:
        return media.url;
    }
  };

  // Fetch media files
  const fetchMediaFiles = async (page = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Eğer filterToCategory belirtilmişse, sadece o kategoriyi getir
      const categoryToUse = filterToCategory ? filterToCategory.toString() : selectedCategory;
      
      if (categoryToUse !== "all") {
        params.append("categoryId", categoryToUse);
      }

      // Custom folder belirtilmişse, sadece o klasördeki dosyaları getir
      if (customFolder) {
        params.append("customFolder", customFolder);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const url = `/api/media?${params}`;

      const response_data = await corporateApiFetch<any>(url);
      console.log('MediaSelector: API response:', response_data);

      // Check if response_data and response_data.data exist
      if (!response_data || !Array.isArray(response_data.data)) {
        console.warn("Invalid media data structure:", response_data);
        setMediaFiles([]);
        setTotalPages(0);
        setCurrentPage(page);
        return;
      }

      // Filter by accepted types
      const filteredMedia = response_data.data.filter((file: MediaFile) =>
        isFileTypeAccepted(file.mimeType)
      );
      
      console.log('MediaSelector: Filtered media files:', filteredMedia);

      if (reset) {
        setMediaFiles(filteredMedia);
      } else {
        setMediaFiles(prev => [...prev, ...filteredMedia]);
      }

      setTotalPages(response_data.pagination?.totalPages || Math.ceil((response_data.pagination?.total || 0) / 12));
      setCurrentPage(page);
    } catch (error) {
      console.error("❌ MediaSelector: Error fetching media:", error);
      toast.error("Medya dosyaları yüklenirken hata oluştu");
      setMediaFiles([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Load more media files
  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchMediaFiles(currentPage + 1, false);
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchMediaFiles(1, true);
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    fetchMediaFiles(1, true);
  };

  // Handle media selection
  const handleMediaSelect = (media: MediaFile) => {
    console.log('MediaSelector: Selecting media:', media);
    onSelect(media);
    setOpen(false);
    toast.success("Medya seçildi");
  };

  // Handle media deletion
  const handleMediaDelete = async (media: MediaFile, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering selection
    setMediaToDelete(media);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;
    setDeleting(true);
    try {
      await corporateApiFetch<any>(`/api/media/${mediaToDelete.id}`, {
        method: 'DELETE',
      });

      toast.success('Medya dosyası silindi');
      
      // Refresh media list
      fetchMediaFiles(1, true);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Medya dosyası silinirken hata oluştu');
    } finally {
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
      setDeleting(false);
    }
  };

  // Handle upload start
  const handleUploadStart = () => {
    setUploadLoading(true);
  };

  // Handle upload complete
  const handleUploadComplete = (uploadedFiles: any[]) => {
    setUploadLoading(false);
    // Refresh media list
    fetchMediaFiles(1, true);

    // Auto-select first uploaded file if available
    if (uploadedFiles && uploadedFiles.length > 0) {
      const firstFile = uploadedFiles[0];

      // Convert uploaded file to MediaFile format for selection
      const mediaFile: MediaFile = {
        id: firstFile.id || Date.now(),
        filename: firstFile.filename || firstFile.name,
        originalName: firstFile.originalName || firstFile.name,
        mimeType: firstFile.mimeType || firstFile.type || 'image/jpeg',
        size: firstFile.size || 0,
        url: firstFile.url,
        alt: firstFile.alt,
        caption: firstFile.caption,
        category: firstFile.category,
        createdAt: firstFile.createdAt || new Date().toISOString()
      };

      handleMediaSelect(mediaFile);
    }
  };

  // Load media files when dialog opens
  useEffect(() => {
    if (open) {
      fetchMediaFiles(1, true);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Image className="w-4 h-4 mr-2" />
            {selectedMedia ? selectedMedia.originalName : "Medya Seç"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="gallery" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Galeri</TabsTrigger>
            <TabsTrigger value="upload">Yükle</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Search and Filter */}
            <div className="flex gap-4 flex-shrink-0">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Dosya ara..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Custom folder belirtilmişse, klasör bilgisini göster */}
              {customFolder ? (
                <div className="w-48 px-3 py-2 bg-purple-50 border border-purple-200 rounded-md text-sm flex items-center">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 mr-2">Klasör</Badge>
                  <span className="font-medium">/{customFolder}/</span>
                </div>
              ) : (
                <>
                  {/* Kategori dropdown'unu sadece filterToCategory yoksa göster */}
                  {!filterToCategory && (
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Kategori" />
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
                  )}
                  
                  {/* Eğer filterToCategory varsa, kategori adını göster */}
                  {filterToCategory && (
                    <div className="w-48 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm flex items-center">
                      <Badge variant="secondary" className="mr-2">Kategori</Badge>
                      {categories.find(cat => cat.id === filterToCategory)?.name || 'İçerik Resimleri'}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Selected Media Preview */}
            {selectedMedia && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      {selectedMedia.mimeType?.startsWith('image/') ? (
                        <img
                          src={getThumbnailUrl(selectedMedia, 'small')}
                          alt={selectedMedia.alt || selectedMedia.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedMedia.originalName || 'Seçilen dosya'}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedMedia.size || 0)}</p>
                    </div>
                    <Badge variant="secondary">Seçili</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(null as any)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto">
              {loading && mediaFiles.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Medya dosyaları yükleniyor...</p>
                  </div>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">
                      {customFolder 
                        ? `/${customFolder}/ klasöründe henüz dosya yok`
                        : 'Henüz medya dosyası yok'
                      }
                    </p>
                    <p className="text-sm text-gray-400">Yükle sekmesinden dosya ekleyebilirsiniz</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {mediaFiles.map((media) => (
                  <div
                    key={media.id}
                    className={`
                      relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all
                      ${selectedMedia?.id === media.id
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => handleMediaSelect(media)}
                  >
                    <div className="aspect-square bg-gray-100">
                      {media.mimeType.startsWith('image/') ? (
                        <img
                          src={getThumbnailUrl(media, 'small')}
                          alt={media.alt || media.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {selectedMedia?.id === media.id && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    {/* Delete Button */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => handleMediaDelete(media, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* File Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs truncate">{media.originalName || media.filename || 'Dosya'}</p>
                      <p className="text-xs text-gray-300">{formatFileSize(media.size || 0)}</p>
                    </div>
                  </div>
                ))}
                </div>
              )}

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="text-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 overflow-y-auto">
            <MediaUploader
              onUploadStart={handleUploadStart}
              onUploadComplete={handleUploadComplete}
              className="border-0 shadow-none h-full"
              targetWidth={targetWidth}
              targetHeight={targetHeight}
              width={width}
              height={height}
              defaultCategoryId={defaultCategoryId || filterToCategory}
              acceptedTypes={acceptedTypes}
              customFolder={customFolder}
            />
          </TabsContent>
        </Tabs>
        </div>

        {/* Upload Loading Overlay */}
        {uploadLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700">Resim Yükleniyor...</p>
              <p className="text-sm text-gray-500 mt-1">Lütfen bekleyin, resim işleniyor</p>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Medya Dosyasını Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {mediaToDelete && (
                <>
                  <strong>{mediaToDelete.originalName || mediaToDelete.filename}</strong> dosyasını silmek istediğinizden emin misiniz? 
                  Bu işlem geri alınamaz.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
