"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMediaCategories, MediaCategory } from "@/app/context/MediaCategoryContext";
import { Upload, X, FileImage, FileText, Film, File, CheckCircle, AlertCircle, Crop } from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/media-utils";
import { ImageEditorModal } from "./ImageEditorModal";



interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  alt?: string;
  caption?: string;
  // File properties
  name: string;
  size: number;
  type: string;
}

interface MediaUploaderProps {
  categoryId?: number;
  defaultCategoryId?: number; // Varsayılan kategori
  onUploadComplete?: (uploadedFiles: any[]) => void;
  onUploadStart?: () => void;
  maxFiles?: number;
  className?: string;
  targetWidth?: number;
  targetHeight?: number;
  width?: number;          // Yeni: Genişlik parametresi
  height?: number;         // Yeni: Yükseklik parametresi
  acceptedTypes?: string[]; // Kabul edilen dosya türleri
  customFolder?: string; // Custom upload folder
}

export function MediaUploader({
  categoryId,
  defaultCategoryId,
  onUploadComplete,
  onUploadStart,
  maxFiles = 10,
  className = "",
  targetWidth,
  targetHeight,
  width = 800,           // Yeni: Varsayılan genişlik
  height = 600,          // Yeni: Varsayılan yükseklik
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', 'text/plain'],
  customFolder = 'media'  // Yeni: Varsayılan klasör
}: MediaUploaderProps) {
  const { data: session, status } = useSession();
  const { categories } = useMediaCategories();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    categoryId || defaultCategoryId || (categories.length > 0 ? categories[0].id : 0)
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set()); // Track all blob URLs

  // Image Editor Modal States
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<UploadFile | null>(null);

  // Update selected category when categories load or categoryId prop changes
  useEffect(() => {
    // Kategori ID'si props olarak gönderildiyse, onu doğrudan kullan
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    } else if (defaultCategoryId) {
      setSelectedCategoryId(defaultCategoryId);
    } else if (categories.length > 0 && selectedCategoryId === 0) {
      // Eğer hiç kategori seçilmemişse, varsayılan olarak content-images kategorisini kullan
      const contentCategory = categories.find(cat => cat.name === 'İçerik Resimleri');
      setSelectedCategoryId(contentCategory ? contentCategory.id : categories[0].id);
    }
  }, [categories, categoryId, defaultCategoryId, selectedCategoryId]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup all tracked blob URLs when component unmounts
      cleanupAllBlobUrls();
    };
  }, []);

  // Debug logging for customFolder
  useEffect(() => {
    console.log("🔍 [MEDIA_UPLOADER_DEBUG] Component props:", {
      customFolder,
      defaultCategoryId,
      categoryId,
      hasCustomFolder: !!customFolder
    });
  }, [customFolder, defaultCategoryId, categoryId]);

  // Get file type icon
  const getFileIcon = (file: UploadFile) => {
    if (file.type.startsWith('image/')) return FileImage;
    if (file.type.startsWith('video/')) return Film;
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText;
    return File;
  };

  // Create blob URL with tracking
  const createTrackedBlobUrl = (file: File): string | undefined => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return undefined;

    const blobUrl = URL.createObjectURL(file);
    blobUrlsRef.current.add(blobUrl);
    return blobUrl;
  };

  // Cleanup specific blob URL
  const cleanupBlobUrl = (blobUrl: string) => {
    if (blobUrlsRef.current.has(blobUrl)) {
      URL.revokeObjectURL(blobUrl);
      blobUrlsRef.current.delete(blobUrl);
    }
  };

  // Cleanup all blob URLs
  const cleanupAllBlobUrls = () => {
    const urlCount = blobUrlsRef.current.size;
    blobUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url);
    });
    blobUrlsRef.current.clear();
  };

  // Image cropping utility functions
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    rotation: number = 0,
    targetWidth?: number,
    targetHeight?: number
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Calculate final dimensions
    let finalWidth = pixelCrop.width;
    let finalHeight = pixelCrop.height;

    if (targetWidth && targetHeight) {
      finalWidth = targetWidth;
      finalHeight = targetHeight;
    }

    // Set canvas size
    const rotRad = (rotation * Math.PI) / 180;
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(finalWidth, finalHeight, rotation);

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate canvas context to center point
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-finalWidth / 2, -finalHeight / 2);

    // Draw the cropped and rotated image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      finalWidth,
      finalHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  // Helper function for rotation calculations
  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = (rotation * Math.PI) / 180;
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const calculateOptimalZoom = (
    imageWidth: number,
    imageHeight: number,
    targetWidth: number,
    targetHeight: number
  ): number => {
    const scaleX = targetWidth / imageWidth;
    const scaleY = targetHeight / imageHeight;
    // Use the larger scale to ensure the image covers the target area
    return Math.max(scaleX, scaleY);
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file sizes based on type
    const validFiles = acceptedFiles.filter(file => {
      if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: Resim dosyası 5MB'dan büyük olamaz`);
        return false;
      }
      if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name}: Video dosyası 50MB'dan büyük olamaz`);
        return false;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: Dosya 10MB'dan büyük olamaz`);
        return false;
      }
      return true;
    });

    const newFiles: UploadFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      progress: 0,
      status: 'pending' as const,
      preview: createTrackedBlobUrl(file),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} dosya seçildi`);
    }
  }, [maxFiles]);

  // Handle manual file selection
  const handleManualFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      onDrop(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  // Dynamic accept object based on acceptedTypes
  const getAcceptObject = () => {
    const acceptObj: { [key: string]: string[] } = {};
    
    acceptedTypes.forEach(type => {
      if (type === 'image/*') {
        acceptObj['image/*'] = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.avif'];
      } else if (type === 'video/*') {
        acceptObj['video/*'] = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
      } else if (type === 'application/pdf') {
        acceptObj['application/pdf'] = ['.pdf'];
      } else if (type === 'text/plain') {
        acceptObj['text/plain'] = ['.txt'];
      } else if (type === 'application/msword') {
        acceptObj['application/msword'] = ['.doc'];
      } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        acceptObj['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = ['.docx'];
      }
    });
    
    return acceptObj;
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: getAcceptObject(),
    maxSize: 50 * 1024 * 1024, // 50MB (to accommodate video files)
    multiple: true,
    noClick: true, // Disable click on the root element
    noKeyboard: true, // Disable keyboard events
  });

  // Remove file from list with proper cleanup
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        // Cleanup blob URL using tracked cleanup
        cleanupBlobUrl(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Update file metadata
  const updateFileMetadata = (fileId: string, field: 'alt' | 'caption', value: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, [field]: value } : f
    ));
  };

  // Handle image editor save
  const handleImageEditorSave = (editedFile: UploadFile) => {
    // Update the file with edited version while preserving necessary properties
    setFiles(prev => prev.map(f =>
      f.id === editedFile.id ? {
        ...editedFile,
        status: 'pending' as const, // Ensure status is pending for upload
        progress: 0, // Reset progress
        error: undefined // Clear any previous errors
      } : f
    ));

    setSelectedImageForEdit(null);
    setIsImageEditorOpen(false);
    toast.success("Resim başarıyla düzenlendi");
  };





  // Upload files to the API
  const uploadFiles = async (filesToUpload: UploadFile[]): Promise<any> => {
    // Determine effective category ID
    const effectiveCategoryId = selectedCategoryId || categoryId || defaultCategoryId;
    
    // Upload files one by one since the API expects single file uploads
    const uploadPromises = filesToUpload.map(async (fileData: UploadFile) => {
      const formData = new FormData();
      formData.append('file', fileData.file);
      
      // Kategorinin seçildiğinden emin olun - artık daha güvenli kontrol
      const catId = effectiveCategoryId; // Use the validated category ID
      formData.append('categoryId', catId!.toString());
      
      // Add custom folder if specified
      if (customFolder) {
        formData.append('customFolder', customFolder);
      }

      // Add width and height parameters if specified
      if (width) {
        formData.append('width', width.toString());
      }
      if (height) {
        formData.append('height', height.toString());
      }

      // Debug logging for upload request
      console.log("🔍 [MEDIA_UPLOADER_DEBUG] Upload request:", {
        filename: fileData.file.name,
        categoryId: catId?.toString(),
        customFolder,
        width,
        height,
        hasCustomFolder: !!customFolder,
        formDataCustomFolder: formData.get('customFolder')
      });
      
      if (fileData.alt) {
        formData.append('alt', fileData.alt);
      }
      
      if (fileData.caption) {
        formData.append('caption', fileData.caption);
      }

      const response = await fetch('/api/media', {
        method: 'POST',
        credentials: 'include', // Include session cookies
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
          throw new Error('Session expired');
        }
        
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Return the actual media data, not the wrapper response
      return result.data || result;
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    return {
      success: true,
      message: `${results.length} dosya başarıyla yüklendi`,
      uploadedFiles: results
    };
  };

  // Handle upload all files
  const handleUpload = async () => {
    // Check authentication before upload
    if (status === 'loading') {
      toast.error("Kimlik doğrulama kontrol ediliyor, lütfen bekleyin...");
      return;
    }

    if (status === 'unauthenticated' || !session) {
      toast.error("Dosya yüklemek için giriş yapmanız gerekiyor");
      return;
    }

    if (files.length === 0) {
      toast.error("Yüklenecek dosya seçin");
      return;
    }

    // Kategori belirlenmediyse ve sabit bir kategori de yoksa hata ver
    const effectiveCategoryId = selectedCategoryId || categoryId || defaultCategoryId;
    if (!effectiveCategoryId || effectiveCategoryId === 0) {
      toast.error("Lütfen dosyaların yükleneceği kategoriyi seçin");
      return;
    }

    setIsUploading(true);
    onUploadStart?.();

    const pendingFiles = files.filter(f => f.status === 'pending');

    try {
      // Update all files to uploading status
      setFiles(prev => prev.map(f =>
        pendingFiles.some(pf => pf.id === f.id)
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      ));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f =>
          f.status === 'uploading' && f.progress < 90
            ? { ...f, progress: f.progress + 10 }
            : f
        ));
      }, 200);

      // Upload all files
      const result = await uploadFiles(pendingFiles);

      clearInterval(progressInterval);

      if (result.success) {
        // Update successful files
        const uploadedFileNames = result.uploadedFiles.map((uf: any) => uf.originalName);

        setFiles(prev => prev.map(f => {
          if (pendingFiles.some(pf => pf.id === f.id)) {
            const wasUploaded = uploadedFileNames.includes(f.name);
            return {
              ...f,
              status: wasUploaded ? 'success' as const : 'error' as const,
              progress: 100,
              error: wasUploaded ? undefined : 'Yükleme başarısız'
            };
          }
          return f;
        }));

        toast.success(result.message);
        console.log("📤 MediaUploader: Upload complete, calling onUploadComplete", {
          uploadedFilesCount: result.uploadedFiles.length,
          files: result.uploadedFiles.map((f: any) => ({ id: f.id, filename: f.filename, categoryId: f.categoryId }))
        });
        onUploadComplete?.(result.uploadedFiles);

        // Clear successful uploads after a delay with proper cleanup
        setTimeout(() => {
          setFiles(prev => {
            const successfulFiles = prev.filter(f => f.status === 'success');
            // Cleanup blob URLs for successful files using tracked cleanup
            successfulFiles.forEach(file => {
              if (file.preview) {
                cleanupBlobUrl(file.preview);
              }
            });
            return prev.filter(f => f.status !== 'success');
          });
        }, 3000);

        // Show errors if any
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error: string) => {
            toast.error(error);
          });
        }
      }

    } catch (error) {
      // Update all uploading files to error status
      setFiles(prev => prev.map(f =>
        f.status === 'uploading'
          ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Yükleme başarısız' }
          : f
      ));

      toast.error("Dosya yükleme sırasında hata oluştu");
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4 h-full flex flex-col overflow-y-auto max-h-[65vh]">
        {/* Category Selection */}
        {customFolder ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 mt-1 bg-purple-50 border-purple-200">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">Özel Klasör</Badge>
              <span className="text-sm font-medium">/{customFolder}/</span>
            </div>
            <p className="text-xs text-purple-600 mt-1">
              ✓ Dosyalar /{customFolder}/ klasörüne yüklenecek
            </p>
          </div>
        ) : (
          !categoryId && (
            <div className="mb-4">
              <Label htmlFor="category" className="text-sm font-medium">
                Kategori <span className="text-red-500">*</span>
              </Label>
              {/* Eğer kategori ID'si props olarak geldiyse, sabit kategori göster */}
              {(categoryId || defaultCategoryId) ? (
                <div className="flex items-center gap-2 border rounded-md px-3 py-2 mt-1 bg-blue-50 border-blue-200">
                  <Badge variant="secondary">Kategori</Badge>
                  <span className="text-sm font-medium">
                    {categories.find(cat => cat.id === selectedCategoryId)?.name || 'Yükleniyor...'}
                  </span>
                </div>
              ) : (
                <Select
                  value={selectedCategoryId.toString()}
                  onValueChange={(value) => setSelectedCategoryId(parseInt(value))}
                >
                  <SelectTrigger className={selectedCategoryId === 0 ? "border-red-300" : ""}>
                    <SelectValue placeholder="Dosyaların yükleneceği kategoriyi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                        {category.isBuiltIn && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-1 py-0.5 rounded">
                            Sistem
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedCategoryId > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Dosyalar &quot;{categories.find(c => c.id === selectedCategoryId)?.name}&quot; kategorisine yüklenecek
                </p>
              )}
            </div>
          )
        )}

        {/* Hidden File Input for Manual Selection */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleManualFileSelect}
          accept={acceptedTypes.join(',')}
          multiple
          style={{ display: 'none' }}
        />

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center transition-colors
            ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-base font-medium mb-1">
            {isDragActive ? 'Dosyaları buraya bırakın' : 'Dosyaları sürükleyip bırakın'}
          </p>
          <p className="text-xs text-gray-500 mb-2">
            veya
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // Try dropzone open first
              if (typeof open === 'function') {
                try {
                  open();
                  return;
                } catch (error) {
                  console.error('Error calling dropzone open function:', error);
                }
              }

              // Fallback to manual file input click
              if (fileInputRef.current) {
                fileInputRef.current.click();
              } else {
                console.error('File input ref not available');
              }
            }}
            className="mb-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Yükleme için tıklayınız
          </Button>
          <p className="text-xs text-gray-400 text-center">
            Desteklenen formatlar: JPG, PNG, GIF, WebP, MP4, WebM, OGG, MOV, AVI, PDF, DOC, DOCX, TXT
            <br />
            Maksimum dosya boyutu: Resimler 5MB, Videolar 50MB, Diğer dosyalar 10MB
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4 flex-1 flex flex-col min-h-0">
            <h3 className="text-base font-medium mb-3 flex-shrink-0">Seçilen Dosyalar ({files.length})</h3>
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[30vh] pr-2">
              {files.map((file) => {
                const FileIcon = getFileIcon(file);
                return (
                  <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        file.type.startsWith('image/') ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : file.type.startsWith('video/') ? (
                          <video
                            src={file.preview}
                            className="w-12 h-12 object-cover rounded"
                            muted
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <FileIcon className="w-6 h-6 text-gray-500" />
                          </div>
                        )
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <FileIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

                      {/* Progress Bar */}
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-2" />
                      )}

                      {/* Error Message */}
                      {file.status === 'error' && (
                        <p className="text-xs text-red-500 mt-1">{file.error}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {/* Edit Button for Images */}
                      {file.type.startsWith('image/') && file.status === 'pending' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!file.type.startsWith('image/')) {
                              toast.error("Sadece resim dosyaları düzenlenebilir");
                              return;
                            }
                            setSelectedImageForEdit(file);
                            setIsImageEditorOpen(true);
                          }}
                          title="Resmi düzenle"
                        >
                          <Crop className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Status Icons */}
                      {file.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      {file.status === 'pending' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          title="Dosyayı kaldır"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Button - Always visible when files exist */}
        {files.length > 0 && (
          <div className="mt-4 flex justify-end flex-shrink-0 border-t pt-4">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0 || files.every(f => f.status !== 'pending')}
              className="min-w-[120px]"
            >
              {isUploading ? 'Yükleniyor...' : 'Dosyaları Yükle'}
            </Button>
          </div>
        )}

        {/* Image Editor Modal */}
        <ImageEditorModal
          isOpen={isImageEditorOpen}
          onClose={() => setIsImageEditorOpen(false)}
          imageFile={selectedImageForEdit}
          onSave={handleImageEditorSave}
          targetDimensions={targetWidth && targetHeight ? { width: targetWidth, height: targetHeight } : undefined}
        />
      </CardContent>
    </Card>
  );
}
