'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Upload, 
  GalleryVertical, 
  Trash2, 
  Download, 
  Crop, 
  Eye, 
  CheckSquare, 
  Square, 
  X,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  File as FileIcon
 } from 'lucide-react';

import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { 
  KentKonutAdvancedUploaderProps, 
  GalleryFileInfo, 
  UploaderState,
  GalleryViewConfig,
  CropConfig,
  UploadProgress
} from '@/types/advanced-uploader';

// Kırpma işlemi için yardımcı fonksiyon
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 0.95);
  });
}

// Dosya türü ikonu
function getFileTypeIcon(type: string, mimeType: string) {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-4 h-4" />;
    case 'video':
      return <VideoIcon className="w-4 h-4" />;
    case 'pdf':
      return <FileText className="w-4 h-4" />;
    default:
      return <FileIcon className="w-4 h-4" />;
  }
}

// Dosya boyutu formatı
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function KentKonutAdvancedUploader({
  categoryId,
  customFolder = 'gallery',
  cropWidth = 800,
  cropHeight = 600,
  multiSelect = false,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  maxFileSize = 20 * 1024 * 1024, // 20MB
  enableCropping = true,
  onUploadComplete,
  onSelectionComplete,
  onFileDelete,
  onInsertToEditor,
  initialSelectedFiles = [],
  className = '',
  title = 'Gelişmiş Medya Galerisi',
  description = 'Dosyalarınızı yönetin, yükleyin ve düzenleyin',
  buttonText = 'Medya Galerisi',
  buttonIcon = <GalleryVertical className="w-4 h-4" />,
  modalSize = 'xl',
  showPreview = true,
  showFileDetails = true,
  enableDragDrop = true
}: KentKonutAdvancedUploaderProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<UploaderState>({
    activeTab: 'gallery',
    selectedFiles: initialSelectedFiles,
    galleryFiles: [],
    uploadProgress: [],
    isLoading: true,
    error: null,
    searchQuery: '',
    viewConfig: {
      layout: 'grid',
      itemsPerPage: 20,
      sortBy: 'date',
      sortOrder: 'desc',
      filterByType: []
    },
    cropConfig: null,
    imageToCrop: null,
    originalFile: null
  });

  // Refs
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspect = cropWidth / cropHeight;

  // Galeri dosyalarını getir
  const fetchGalleryFiles = useCallback(async () => {
    if (!session) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: state.viewConfig.itemsPerPage.toString(),
        sortBy: state.viewConfig.sortBy,
        sortOrder: state.viewConfig.sortOrder,
        ...(categoryId && { categoryId: categoryId.toString() }),
        ...(customFolder && { customFolder }),
        ...(state.searchQuery && { search: state.searchQuery }),
        ...(state.viewConfig.filterByType?.length && { type: state.viewConfig.filterByType[0] })
      });

      const response = await fetch(`/api/advanced-media/list?${params}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          galleryFiles: data.data || [],
          isLoading: false 
        }));
      } else {
        throw new Error(data.error || 'Dosyalar getirilemedi');
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message,
        isLoading: false 
      }));
      toast.error('Dosyalar yüklenirken hata oluştu');
    }
  }, [session, categoryId, customFolder, state.searchQuery, state.viewConfig]);

  // Component mount edildiğinde dosyaları getir
  useEffect(() => {
    if (isOpen && session) {
      fetchGalleryFiles();
    }
  }, [isOpen, session, fetchGalleryFiles]);

  // Dosya seçimi
  const handleFileSelect = (fileId: number) => {
    setState(prev => {
      const newSelectedFiles = prev.selectedFiles.includes(fileId)
        ? prev.selectedFiles.filter(id => id !== fileId)
        : multiSelect 
          ? [...prev.selectedFiles, fileId].slice(0, maxFiles)
          : [fileId];
      
      return { ...prev, selectedFiles: newSelectedFiles };
    });
  };

  // Dosya silme
  const handleFileDelete = async (fileId: number) => {
    const file = state.galleryFiles.find(f => f.id === fileId);
    if (!file) return;

    if (!confirm(`'${file.originalName}' dosyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/advanced-media/delete/${fileId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          galleryFiles: prev.galleryFiles.filter(f => f.id !== fileId),
          selectedFiles: prev.selectedFiles.filter(id => id !== fileId)
        }));
        
        onFileDelete?.(fileId);
        toast.success('Dosya başarıyla silindi');
      } else {
        throw new Error(data.error || 'Dosya silinemedi');
      }
    } catch (error: any) {
      toast.error(`Hata: ${error.message}`);
    }
  };

  // Dosya yükleme
  const handleFileUpload = async (files: FileList) => {
    if (!session) {
      toast.error('Dosya yüklemek için giriş yapmalısınız');
      return;
    }

    const fileArray = Array.from(files);
    
    // Dosya validasyonu
    for (const file of fileArray) {
      if (file.size > maxFileSize) {
        toast.error(`${file.name} dosyası çok büyük (maksimum ${formatFileSize(maxFileSize)})`);
        return;
      }
      
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        toast.error(`${file.name} dosya türü desteklenmiyor`);
        return;
      }
    }

    // Dosyaları yükle
    for (const file of fileArray) {
      if (file.type.startsWith('image/') && enableCropping) {
        // Resim kırpma için hazırla
        setState(prev => ({
          ...prev,
          imageToCrop: URL.createObjectURL(file),
          originalFile: file,
          activeTab: 'upload'
        }));
        return; // Tek seferde bir resim kırpılabilir
      } else {
        // Direkt yükle
        await uploadFile(file);
      }
    }
  };

  // Tek dosya yükleme
  const uploadFile = async (file: File) => {
    const uploadId = `upload_${Date.now()}_${Math.random()}`;

    // Upload progress başlat
    setState(prev => ({
      ...prev,
      uploadProgress: [...prev.uploadProgress, {
        fileId: uploadId,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }]
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (categoryId) formData.append('categoryId', categoryId.toString());
      if (customFolder) formData.append('customFolder', customFolder);

      const response = await fetch('/api/advanced-media/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Upload progress tamamla
        setState(prev => ({
          ...prev,
          uploadProgress: prev.uploadProgress.map(p =>
            p.fileId === uploadId
              ? { ...p, progress: 100, status: 'completed' }
              : p
          )
        }));

        // Galeriyi yenile
        await fetchGalleryFiles();

        // Tab'ı galeriye geç
        setState(prev => ({ ...prev, activeTab: 'gallery' }));

        toast.success(`${file.name} başarıyla yüklendi`);

        // Callback çağır
        if (onUploadComplete && data.data) {
          const galleryFile: GalleryFileInfo = {
            id: data.data.id,
            filename: data.data.filename,
            originalName: data.data.originalName,
            url: data.data.url,
            alt: data.data.alt,
            caption: data.data.caption,
            mimeType: data.data.mimeType,
            size: data.data.size,
            type: data.data.mimeType.startsWith('image/') ? 'image'
                 : data.data.mimeType.startsWith('video/') ? 'video'
                 : data.data.mimeType === 'application/pdf' ? 'pdf'
                 : 'other',
            thumbnailSmall: data.data.thumbnailSmall,
            thumbnailMedium: data.data.thumbnailMedium,
            thumbnailLarge: data.data.thumbnailLarge,
            createdAt: new Date(data.data.createdAt),
            updatedAt: new Date(data.data.updatedAt),
            categoryId: data.data.categoryId,
            category: data.data.category
          };
          onUploadComplete([galleryFile]);
        }
      } else {
        throw new Error(data.error || 'Yükleme başarısız');
      }
    } catch (error: any) {
      // Upload progress hata
      setState(prev => ({
        ...prev,
        uploadProgress: prev.uploadProgress.map(p =>
          p.fileId === uploadId
            ? { ...p, status: 'error', error: error.message }
            : p
        )
      }));

      toast.error(`Yükleme hatası: ${error.message}`);
    } finally {
      // Upload progress temizle (3 saniye sonra)
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          uploadProgress: prev.uploadProgress.filter(p => p.fileId !== uploadId)
        }));
      }, 3000);
    }
  };

  // Dosya input değişikliği
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
      e.target.value = ''; // Input'u sıfırla
    }
  };

  // Resim yükleme ve kırpma
  // Convert react-image-crop Crop to our stricter CropConfig
  const toCropConfig = (c: CropType): CropConfig => ({
    unit: (c.unit ?? '%') as '%' | 'px',
    x: Math.max(0, Math.round(c.x ?? 0)),
    y: Math.max(0, Math.round(c.y ?? 0)),
    width: Math.max(1, Math.round(c.width ?? 1)),
    height: Math.max(1, Math.round(c.height ?? 1)),
  });
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width: imgWidth, height: imgHeight } = e.currentTarget;
    const crop: CropType = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect, imgWidth, imgHeight),
      imgWidth,
      imgHeight
    );
    setState(prev => ({
      ...prev,
      cropConfig: toCropConfig(crop)
    }));
  };

  // Kırpma ve kaydetme
  const handleCropAndSave = async () => {
    const image = imgRef.current;
    const { cropConfig, originalFile } = state;

    if (!image || !cropConfig || !originalFile) {
      toast.error('Kırpma verisi veya resim bulunamadı');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const cx = Math.max(0, cropConfig.x);
      const cy = Math.max(0, cropConfig.y);
      const cw = Math.max(1, cropConfig.width);
      const ch = Math.max(1, cropConfig.height);

      canvas.width = Math.floor(cw * scaleX);
      canvas.height = Math.floor(ch * scaleY);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context bulunamadı');
      }

      ctx.drawImage(
        image,
        cx * scaleX,
        cy * scaleY,
        cw * scaleX,
        ch * scaleY,
        0,
        0,
        Math.floor(cw * scaleX),
        Math.floor(ch * scaleY)
      );

      const blob = await canvasToBlob(canvas);
      if (!blob) {
        throw new Error('Kırpma işleminde hata oluştu');
      }

      const croppedFile = new File([blob], originalFile.name, { type: 'image/png' });
      await uploadFile(croppedFile);

      // Kırpma state'ini temizle
      setState(prev => ({
        ...prev,
        imageToCrop: null,
        originalFile: null,
        cropConfig: null
      }));

    } catch (error: any) {
      toast.error(`Kırpma hatası: ${error.message}`);
    }
  };

  // Seçimi tamamla
  const handleSelectionComplete = () => {
    const selectedGalleryFiles = state.galleryFiles.filter(file =>
      state.selectedFiles.includes(file.id)
    );

    onSelectionComplete?.(selectedGalleryFiles);
    setIsOpen(false);

    toast.success(`${selectedGalleryFiles.length} dosya seçildi`);
  };

  // Arama
  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Galeri render
  const renderGallery = () => (
    <div className="space-y-4">
      {/* Arama ve Filtreler */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Dosya ara..."
              value={state.searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={state.viewConfig.layout === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setState(prev => ({
              ...prev,
              viewConfig: { ...prev.viewConfig, layout: 'grid' }
            }))}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={state.viewConfig.layout === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setState(prev => ({
              ...prev,
              viewConfig: { ...prev.viewConfig, layout: 'list' }
            }))}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {state.isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="text-center py-8">
          <p className="text-red-500">{state.error}</p>
          <Button onClick={fetchGalleryFiles} className="mt-2">
            Tekrar Dene
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!state.isLoading && !state.error && state.galleryFiles.length === 0 && (
        <div className="text-center py-8">
          <GalleryVertical className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Bu klasörde hiç dosya yok.</p>
          <Button
            onClick={() => setState(prev => ({ ...prev, activeTab: 'upload' }))}
            className="mt-2"
          >
            İlk Dosyayı Yükle
          </Button>
        </div>
      )}

      {/* Gallery Grid/List */}
      {!state.isLoading && !state.error && state.galleryFiles.length > 0 && (
        <>
          <div className={`grid gap-4 ${
            state.viewConfig.layout === 'grid'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
              : 'grid-cols-1'
          }`}>
            {state.galleryFiles.map(file => (
              <div
                key={file.id}
                className={`relative group border rounded-lg overflow-hidden ${
                  state.viewConfig.layout === 'grid'
                    ? 'aspect-square'
                    : 'flex items-center p-4'
                } ${
                  state.selectedFiles.includes(file.id)
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-md'
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={() => handleFileSelect(file.id)}
                    className="p-1 rounded bg-white/80 hover:bg-white"
                  >
                    {state.selectedFiles.includes(file.id) ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* File Content */}
                {state.viewConfig.layout === 'grid' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {file.type === 'image' ? (
                      <img
                        src={file.thumbnailMedium || file.url}
                        alt={file.alt || file.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-4">
                        {getFileTypeIcon(file.type, file.mimeType)}
                        <span className="text-xs text-gray-600 text-center mt-2 break-all">
                          {file.originalName}
                        </span>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 w-full">
                    <div className="flex-shrink-0">
                      {file.type === 'image' ? (
                        <img
                          src={file.thumbnailSmall || file.url}
                          alt={file.alt || file.originalName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {getFileTypeIcon(file.type, file.mimeType)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.category?.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Görüntüle"
                  >
                    <Eye className="w-4 h-4" />
                  </a>

                  {file.type === 'image' && enableCropping && (
                    <button
                      onClick={() => {
                        setState(prev => ({
                          ...prev,
                          imageToCrop: file.url,
                          originalFile: null // Mevcut dosya için kırpma
                        }));
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Kırp"
                    >
                      <Crop className="w-4 h-4" />
                    </button>
                  )}

                  <a
                    href={file.url}
                    download
                    className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full hover:bg-gray-100"
                    title="İndir"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleFileDelete(file.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selection Actions */}
          {state.selectedFiles.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm text-gray-600">
                {state.selectedFiles.length} dosya seçildi
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, selectedFiles: [] }))}
                >
                  Seçimi Temizle
                </Button>
                <Button onClick={handleSelectionComplete}>
                  Seçimi Tamamla
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Upload interface render
  const renderUploader = () => (
    <div className="space-y-6">
      {/* Upload Progress */}
      {state.uploadProgress.length > 0 && (
        <div className="space-y-2">
          {state.uploadProgress.map(progress => (
            <div key={progress.fileId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{progress.fileName}</span>
                  <span className={`${
                    progress.status === 'completed' ? 'text-green-600' :
                    progress.status === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {progress.status === 'completed' ? 'Tamamlandı' :
                     progress.status === 'error' ? 'Hata' :
                     `%${progress.progress}`}
                  </span>
                </div>
                {progress.status !== 'completed' && progress.status !== 'error' && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                )}
                {progress.error && (
                  <p className="text-red-600 text-xs mt-1">{progress.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          enableDragDrop ? 'border-gray-300 hover:border-blue-400' : 'border-gray-200'
        }`}
        onDragOver={enableDragDrop ? handleDragOver : undefined}
        onDrop={enableDragDrop ? handleDrop : undefined}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {enableDragDrop ? 'Dosya Sürükle veya Seç' : 'Dosya Seç'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {enableCropping
            ? 'Resimler kırpılacak, diğer dosyalar direkt yüklenecektir.'
            : 'Dosyalar direkt yüklenecektir.'}
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Maksimum dosya boyutu: {formatFileSize(maxFileSize)}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiSelect}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dosya Seç
        </Button>
      </div>

      {/* Accepted File Types */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Desteklenen dosya türleri:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {acceptedTypes.map(type => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  // Cropping modal render
  const renderCropper = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Resmi Kırp</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setState(prev => ({
              ...prev,
              imageToCrop: null,
              originalFile: null,
              cropConfig: null
            }))}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative flex-grow flex justify-center items-center overflow-hidden mb-4" style={{ height: '60vh' }}>
          {state.imageToCrop && (
            <ReactCrop
              crop={state.cropConfig as CropType | undefined}
              onChange={(c: CropType) => setState(prev => ({ ...prev, cropConfig: toCropConfig(c) }))}
              onComplete={(c: CropType) => setState(prev => ({ ...prev, cropConfig: toCropConfig(c) }))}
              aspect={aspect}
              className="max-h-full max-w-full"
            >
              <img
                ref={imgRef}
                alt="Kırpılacak resim"
                src={state.imageToCrop}
                onLoad={onImageLoad}
                className="max-h-full max-w-full"
              />
            </ReactCrop>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setState(prev => ({
              ...prev,
              imageToCrop: null,
              originalFile: null,
              cropConfig: null
            }))}
          >
            İptal
          </Button>
          <div className="text-sm text-gray-500">
            Hedef boyut: {cropWidth} x {cropHeight}px
          </div>
          <Button
            onClick={handleCropAndSave}
            disabled={!state.cropConfig}
          >
            Kırp ve Kaydet
          </Button>
        </div>
      </div>
    </div>
  );

  // Main component render
  return (
    <>
      {/* Cropping Modal */}
      {state.imageToCrop && renderCropper()}

      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className={className}>
            {buttonIcon}
            <span className="ml-2">{buttonText}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className={`max-w-${modalSize} w-full max-h-[90vh] flex flex-col`}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Tab Navigation */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setState(prev => ({ ...prev, activeTab: 'gallery' }))}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  state.activeTab === 'gallery'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <GalleryVertical className="w-4 h-4" />
                Galeri
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, activeTab: 'upload' }))}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  state.activeTab === 'upload'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                Yükle
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto">
              {state.activeTab === 'gallery' ? renderGallery() : renderUploader()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Export default only
export default KentKonutAdvancedUploader;
