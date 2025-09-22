"use client"

import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { X, Eye, Edit, Upload as UploadIcon, Tag } from 'lucide-react';

// Gallery image interface
export interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  description: string;
}

interface HafriyatImageUploaderProps {
  /** Gallery images */
  galleryImages: GalleryImage[];
  /** Callback when gallery images change */
  onGalleryChange: (images: GalleryImage[]) => void;
  /** Custom folder for uploads */
  customFolder?: string;
  /** Enable multiple image uploads */
  enableGallery?: boolean;
  /** Maximum number of images allowed */
  maxImages?: number;
  /** Class name for styling */
  className?: string;
  /** Aspect ratio for cropping */
  aspectRatio?: number;
  /** Title for the image uploader section */
  title?: string;
  /** Description for the image uploader section */
  description?: string;
}

export const HafriyatImageUploader: React.FC<HafriyatImageUploaderProps> = ({
  galleryImages,
  onGalleryChange,
  customFolder = 'uploads/media/hafriyat',
  enableGallery = true,
  maxImages = 20,
  className,
  aspectRatio = 16 / 9,
  title = 'Saha Galerisi',
  description = 'Saha ile ilgili fotoğrafları yükleyin ve yönetin'
}) => {
  // Image uploader state
  const [cropperImgSrc, setCropperImgSrc] = useState<string | null>(null);
  const [croppedImageData, setCroppedImageData] = useState<{ file: File; url: string } | null>(null);
  const [showCropTool, setShowCropTool] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Image view/edit dialog state
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ alt: '', description: '' });

  // Alt text dialog state for new uploads
  const [isAltTextDialogOpen, setIsAltTextDialogOpen] = useState(false);
  const [pendingImageData, setPendingImageData] = useState<{ file: File; url: string } | null>(null);
  const [altTextForm, setAltTextForm] = useState({ alt: '', description: '' });
  // Quick alt text dialog state
  const [isQuickAltDialogOpen, setIsQuickAltDialogOpen] = useState(false);
  const [quickAltImage, setQuickAltImage] = useState<GalleryImage | null>(null);
  const [quickAltForm, setQuickAltForm] = useState({ alt: '', description: '' });

  // Handle image cropped
  const handleImageCropped = useCallback(async (imageData: { file: File; url: string } | null) => {
    if (imageData) {
      setCroppedImageData(imageData);
      setShowCropTool(false);
      
      // Show alt text dialog before uploading
      setPendingImageData(imageData);
      setAltTextForm({ alt: `${title} görseli`, description: '' });
      setIsAltTextDialogOpen(true);
    }
  }, [title]);

  // Upload image to server
  const uploadImage = async (file: File) => {
    if (!enableGallery && galleryImages.length >= maxImages) {
      toast.error(`Maksimum ${maxImages} resim yükleyebilirsiniz`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('files', file);
    formData.append('category', 'hafriyat-images');
    formData.append('customFolder', customFolder);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.uploadedFiles && result.uploadedFiles.length > 0) {
        const uploadedFile = result.uploadedFiles[0];
        const newImage: GalleryImage = {
          id: Date.now(),
          url: uploadedFile.url,
          alt: `${title} görseli`,
          description: ''
        };

        onGalleryChange([...galleryImages, newImage]);
        toast.success('Fotoğraf başarıyla yüklendi');
        
        // Reset uploader state
        setCropperImgSrc(null);
        setCroppedImageData(null);
        setShowCropTool(false);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload image to server with alt text
  const uploadImageWithAltText = async (file: File, altText: string, description: string) => {
    if (!enableGallery && galleryImages.length >= maxImages) {
      toast.error(`Maksimum ${maxImages} resim yükleyebilirsiniz`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('files', file);
    formData.append('category', 'hafriyat-images');
    formData.append('customFolder', customFolder);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.uploadedFiles && result.uploadedFiles.length > 0) {
        const uploadedFile = result.uploadedFiles[0];
        const newImage: GalleryImage = {
          id: Date.now(),
          url: uploadedFile.url,
          alt: altText || `${title} görseli`,
          description: description || ''
        };

        onGalleryChange([...galleryImages, newImage]);
        toast.success('Fotoğraf başarıyla yüklendi');
        
        // Reset all uploader state
        setCropperImgSrc(null);
        setCroppedImageData(null);
        setShowCropTool(false);
        setPendingImageData(null);
        setIsAltTextDialogOpen(false);
        setAltTextForm({ alt: '', description: '' });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle alt text save for new upload
  const handleAltTextSave = () => {
    if (pendingImageData) {
      uploadImageWithAltText(pendingImageData.file, altTextForm.alt, altTextForm.description);
    }
  };

  // Skip alt text and upload with default
  const handleAltTextSkip = () => {
    if (pendingImageData) {
      uploadImageWithAltText(pendingImageData.file, `${title} görseli`, '');
    }
  };

  // Handle image view
  const handleImageView = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsViewDialogOpen(true);
  };

  // Handle image edit
  const handleImageEdit = (image: GalleryImage) => {
    setSelectedImage(image);
    setEditForm({ alt: image.alt, description: image.description });
    setIsEditDialogOpen(true);
  };

  // Save image edit
  const handleImageEditSave = () => {
    if (selectedImage) {
      const updatedImages = galleryImages.map(img => 
        img.id === selectedImage.id 
          ? { ...img, alt: editForm.alt, description: editForm.description }
          : img
      );
      onGalleryChange(updatedImages);
      setIsEditDialogOpen(false);
      setSelectedImage(null);
      toast.success('Resim bilgileri güncellendi');
    }
  };

  // Handle image delete
  const handleImageDelete = (imageId: number) => {
    const updatedImages = galleryImages.filter(img => img.id !== imageId);
    onGalleryChange(updatedImages);
    toast.success('Resim galeriden kaldırıldı');
  };

  // Hızlı alt text ikonuna tıklama
  const handleQuickAltEdit = (image: GalleryImage) => {
    setQuickAltImage(image);
    setQuickAltForm({ alt: image.alt, description: image.description });
    setIsQuickAltDialogOpen(true);
  };

  // Hızlı alt text kaydet
  const handleQuickAltSave = () => {
    if (quickAltImage) {
      const updatedImages = galleryImages.map(img =>
        img.id === quickAltImage.id
          ? { ...img, alt: quickAltForm.alt, description: quickAltForm.description }
          : img
      );
      onGalleryChange(updatedImages);
      setIsQuickAltDialogOpen(false);
      setQuickAltImage(null);
      toast.success('Alt metin güncellendi');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Image Uploader */}
        <div className="space-y-4">
          <ImageUploader
            cropperImgSrc={cropperImgSrc}
            displayImageUrl={croppedImageData?.url || null}
            showCropTool={showCropTool}
            onImageCropped={handleImageCropped}
            onSetCropperImgSrc={setCropperImgSrc}
            onSetShowCropTool={setShowCropTool}
            onSetCroppedImageData={setCroppedImageData}
            aspectRatio={aspectRatio}
          />
          
          {isUploading && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Fotoğraf yükleniyor...</p>
            </div>
          )}
        </div>

        {/* Gallery */}
        {enableGallery && galleryImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Yüklenen Resimler ({galleryImages.length}/{maxImages})
              </h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Image overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleImageView(image)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleImageEdit(image)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleQuickAltEdit(image)}
                      title="Alt metin düzenle"
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleImageDelete(image.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Image description */}
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground truncate" title={image.alt}>
                      {image.alt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Image View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resim Önizleme</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              <div className="space-y-2">
                <p><strong>Alt Metin:</strong> {selectedImage.alt}</p>
                {selectedImage.description && (
                  <p><strong>Açıklama:</strong> {selectedImage.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resim Bilgilerini Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Metin</Label>
              <Input
                id="alt"
                value={editForm.alt}
                onChange={(e) => setEditForm(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="Resim açıklaması"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detaylı açıklama"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleImageEditSave}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hızlı Alt Text Dialog */}
      <Dialog open={isQuickAltDialogOpen} onOpenChange={setIsQuickAltDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alt Metin Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-alt">Alt Metin</Label>
              <Input
                id="quick-alt"
                value={quickAltForm.alt}
                onChange={(e) => setQuickAltForm(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="Resim açıklaması"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-description">Açıklama (Opsiyonel)</Label>
              <Textarea
                id="quick-description"
                value={quickAltForm.description}
                onChange={(e) => setQuickAltForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detaylı açıklama"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuickAltDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleQuickAltSave}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
