"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Copy,
  Eye,
  FileImage,
  FileText,
  Film,
  File,
  Calendar,
  HardDrive,
  Tag,
  Save,
  X
} from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/media-utils";
import { ResponsiveImage, AspectRatioImage } from "./ResponsiveImage";
import { GlobalMediaFile } from "./GlobalMediaSelector";

interface MediaItemProps {
  file: GlobalMediaFile;
  viewMode: "grid" | "list";
  selectionMode?: boolean;
  selected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  onDelete?: () => void;
  onUpdate?: (updatedFile: GlobalMediaFile) => void;
  onImageClick?: (file: GlobalMediaFile) => void;
}

export function MediaItem({
  file,
  viewMode,
  selectionMode = false,
  selected = false,
  onSelectionChange,
  onDelete,
  onUpdate,
  onImageClick
}: MediaItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editAlt, setEditAlt] = useState(file.alt || "");
  const [editCaption, setEditCaption] = useState(file.caption || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);

  // Get file type icon
  const getFileIcon = () => {
    if (file.mimeType.startsWith('image/')) return FileImage;
    if (file.mimeType.startsWith('video/')) return Film;
    if (file.mimeType.includes('pdf') || file.mimeType.includes('document')) return FileText;
    return File;
  };

  // Get file type category
  const getFileTypeCategory = () => {
    if (file.mimeType.startsWith('image/')) return 'image';
    if (file.mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  // Get best thumbnail URL for given size
  const getThumbnailUrl = (preferredSize: 'small' | 'medium' | 'large' = 'medium') => {
    if (!isImage) return file.url;

    // Try to get the preferred size, fallback to others
    let url;
    switch (preferredSize) {
      case 'small':
        url = file.thumbnailSmall || file.thumbnailMedium || file.thumbnailLarge || file.url;
        break;
      case 'medium':
        url = file.thumbnailMedium || file.thumbnailLarge || file.thumbnailSmall || file.url;
        break;
      case 'large':
        url = file.thumbnailLarge || file.thumbnailMedium || file.thumbnailSmall || file.url;
        break;
      default:
        url = file.url;
    }

    return url;
  };

  // Copy URL to clipboard
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + file.url);
      toast.success("URL panoya kopyalandı");
    } catch (error) {
      toast.error("URL kopyalanamadı");
    }
  };

  // Download file
  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update file metadata
  const handleUpdate = async () => {
    try {
      setIsUpdating(true);

      const response = await fetch(`/api/media/${file.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alt: editAlt || null,
          caption: editCaption || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update file');
      }

      const updatedFile = await response.json();
      onUpdate?.(updatedFile);
      setIsEditDialogOpen(false);
      toast.success("Dosya bilgileri güncellendi");

    } catch (error) {
      console.error('Error updating file:', error);
      toast.error("Dosya güncellenirken bir hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get image dimensions
  const getImageDimensions = (imageUrl: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  };

  // Load image dimensions when preview opens
  const handlePreviewOpen = async () => {
    setIsPreviewDialogOpen(true);
    if (isImage && !imageDimensions) {
      try {
        const dimensions = await getImageDimensions(file.url);
        setImageDimensions(dimensions);
      } catch (error) {
        console.error('Error loading image dimensions:', error);
      }
    }
  };

  // Handle image click - use onImageClick if provided, otherwise open preview
  const handleImageClick = () => {
    if (onImageClick && isImage) {
      onImageClick(file);
    } else {
      handlePreviewOpen();
    }
  };

  const FileIcon = getFileIcon();
  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');

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
    
    // Handle different folder structures based on URL path
    if (normalizedUrl.includes('/banners/')) {
      normalizedUrl = normalizedUrl.replace(/^\/public\/banners\//, '/banners/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\/banners\//, '/banners/');
      normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/banners/');
      if (!normalizedUrl.startsWith('/banners/')) {
        normalizedUrl = '/banners/' + normalizedUrl.replace(/^\//, '');
      }
    } else if (normalizedUrl.includes('/projeler/')) {
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

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Selection Checkbox */}
            {selectionMode && (
              <Checkbox
                checked={selected}
                onCheckedChange={onSelectionChange}
              />
            )}

            {/* File Preview/Icon */}
            <div className="flex-shrink-0">
              {isImage ? (
                <div
                  className="w-16 h-16 rounded border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    backgroundImage: `url(${getThumbnailUrl('small')})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundColor: '#f9fafb'
                  }}
                  title={file.alt || file.originalName}
                  onClick={handleImageClick}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">{file.originalName}</h3>
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                <span className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {file.category?.name || 'Uncategorized'}
                </span>
                <span className="flex items-center">
                  <HardDrive className="w-3 h-3 mr-1" />
                  {formatFileSize(file.size)}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(file.createdAt)}
                </span>
              </div>
              {file.caption && (
                <p className="text-xs text-gray-600 mt-1 truncate">{file.caption}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePreviewOpen}>
                    <Eye className="w-4 h-4 mr-2" />
                    Önizle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyUrl}>
                    <Copy className="w-4 h-4 mr-2" />
                    URL Kopyala
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadFile}>
                    <Download className="w-4 h-4 mr-2" />
                    İndir
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 relative">
        <CardContent className="p-0">
          {/* Selection Checkbox */}
          {selectionMode && (
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selected}
                onCheckedChange={onSelectionChange}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>
          )}

          {/* Actions Menu */}
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="bg-white/80 backdrop-blur-sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePreviewOpen}>
                  <Eye className="w-4 h-4 mr-2" />
                  Önizle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyUrl}>
                  <Copy className="w-4 h-4 mr-2" />
                  URL Kopyala
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadFile}>
                  <Download className="w-4 h-4 mr-2" />
                  İndir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* File Preview */}
          <div
            className="aspect-square media-thumbnail-container cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9fafb'
            }}
            onClick={handleImageClick}
          >
            {isImage ? (
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${getThumbnailUrl('medium')})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundColor: '#f9fafb'
                }}
                title={file.alt || file.originalName}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="p-3">
            <h3 className="text-sm font-medium truncate mb-1">{file.originalName}</h3>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatFileSize(file.size)}</span>
              <Badge variant="secondary" className="text-xs">
                {file.category?.name || 'Uncategorized'}
              </Badge>
            </div>
            {file.caption && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{file.caption}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dosya Bilgilerini Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Dosya Adı</label>
              <Input value={file.originalName} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Alt Metin</label>
              <Input
                value={editAlt}
                onChange={(e) => setEditAlt(e.target.value)}
                placeholder="Resim açıklaması..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Açıklama</label>
              <Textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Dosya açıklaması..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                İptal
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{file.originalName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isImage && (
              <div className="relative max-h-96 overflow-hidden rounded">
                <img
                  src={getMediaUrl(file.url)}
                  alt={file.alt || file.originalName}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    console.error('Preview image load error:', e.currentTarget.src);
                  }}
                />
              </div>
            )}
            {isVideo && (
              <video
                src={getMediaUrl(file.url)}
                controls
                className="w-full max-h-96 rounded"
              />
            )}
            {!isImage && !isVideo && (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded">
                <FileIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Kategori:</strong> {file.category?.name || 'Uncategorized'}
              </div>
              <div>
                <strong>Dosya Boyutu:</strong> {formatFileSize(file.size)}
              </div>
              {isImage && imageDimensions && (
                <div>
                  <strong>Ebatlar:</strong> {imageDimensions.width} × {imageDimensions.height} px
                </div>
              )}
              <div>
                <strong>Tür:</strong> {file.mimeType}
              </div>
              <div>
                <strong>Yüklenme:</strong> {formatDate(file.createdAt)}
              </div>
              {isImage && imageDimensions && (
                <div>
                  <strong>Aspect Ratio:</strong> {(imageDimensions.width / imageDimensions.height).toFixed(2)}:1
                </div>
              )}
            </div>
            {file.caption && (
              <div>
                <strong>Açıklama:</strong>
                <p className="mt-1 text-gray-600">{file.caption}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dosyayı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{file.originalName}</strong> dosyasını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
