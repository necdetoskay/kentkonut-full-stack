// Advanced Uploader TypeScript Definitions for Kent Konut Project
// Integrates with existing Prisma media models and GlobalMediaSelector patterns

import { Media, MediaCategory } from '@prisma/client';

// Extended media file interface that includes database fields
export interface KentKonutMediaFile extends Media {
  category?: MediaCategory;
}

// Gallery file info for display purposes
export interface GalleryFileInfo {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  alt?: string;
  caption?: string;
  mimeType: string;
  size: number;
  type: 'image' | 'video' | 'pdf' | 'document' | 'other';
  thumbnailSmall?: string;
  thumbnailMedium?: string;
  thumbnailLarge?: string;
  createdAt: Date;
  updatedAt: Date;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    icon: string;
  };
}

// Advanced uploader component props
export interface KentKonutAdvancedUploaderProps {
  /** Medya kategorisi ID'si (mevcut kategori sistemine uyumlu) */
  categoryId?: number;
  /** Özel klasör yolu (örn: 'pages', 'gallery', 'content') */
  customFolder?: string;
  /** Kırpılacak resmin hedef genişliği */
  cropWidth?: number;
  /** Kırpılacak resmin hedef yüksekliği */
  cropHeight?: number;
  /** Çoklu seçim aktif mi? */
  multiSelect?: boolean;
  /** Maksimum seçilebilir dosya sayısı */
  maxFiles?: number;
  /** İzin verilen dosya türleri */
  acceptedTypes?: string[];
  /** Maksimum dosya boyutu (bytes) */
  maxFileSize?: number;
  /** Kırpma özelliği aktif mi? */
  enableCropping?: boolean;
  /** Yükleme tamamlandığında çağrılacak callback */
  onUploadComplete?: (files: GalleryFileInfo[]) => void;
  /** Seçim tamamlandığında çağrılacak callback */
  onSelectionComplete?: (files: GalleryFileInfo[]) => void;
  /** Dosya silme callback'i */
  onFileDelete?: (fileId: number) => void;
  /** TipTap editörüne resim ekleme callback'i */
  onInsertToEditor?: (file: GalleryFileInfo) => void;
  /** Başlangıç seçili dosyalar */
  initialSelectedFiles?: number[];
  /** Komponent sınıfı */
  className?: string;
  /** Modal başlığı */
  title?: string;
  /** Modal açıklama metni */
  description?: string;
  /** Trigger butonu metni */
  buttonText?: string;
  /** Trigger butonu ikonu */
  buttonIcon?: React.ReactNode;
  /** Modal boyutu */
  modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Önizleme modu aktif mi? */
  showPreview?: boolean;
  /** Dosya detayları gösterilsin mi? */
  showFileDetails?: boolean;
  /** Sürükle-bırak aktif mi? */
  enableDragDrop?: boolean;
}

// Upload progress tracking
export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

// Crop configuration - updated to match react-image-crop Crop type
export interface CropConfig {
  unit: '%' | 'px';
  width: number;
  height: number;
  x: number;
  y: number;
}

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Gallery view configuration
export interface GalleryViewConfig {
  layout: 'grid' | 'list' | 'masonry';
  itemsPerPage: number;
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  filterByType?: string[];
  searchQuery?: string;
}

// API response types
export interface UploadApiResponse {
  success: boolean;
  data?: KentKonutMediaFile;
  error?: string;
  message?: string;
}

export interface GalleryApiResponse {
  success: boolean;
  data?: GalleryFileInfo[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface DeleteApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Component state interfaces
export interface UploaderState {
  activeTab: 'gallery' | 'upload';
  selectedFiles: number[];
  galleryFiles: GalleryFileInfo[];
  uploadProgress: UploadProgress[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  viewConfig: GalleryViewConfig;
  cropConfig: CropConfig | null;
  imageToCrop: string | null;
  originalFile: File | null;
}

// Event handler types
export type FileSelectHandler = (fileId: number) => void;
export type FileDeleteHandler = (fileId: number) => Promise<void>;
export type FileUploadHandler = (files: FileList) => Promise<void>;
export type CropCompleteHandler = (croppedFile: File) => Promise<void>;
export type SearchHandler = (query: string) => void;
export type ViewConfigChangeHandler = (config: Partial<GalleryViewConfig>) => void;

// Integration with existing GlobalMediaSelector
export interface GlobalMediaSelectorCompatibility {
  /** GlobalMediaFile formatına dönüştürme */
  toGlobalMediaFile: (file: GalleryFileInfo) => import('@/components/media/GlobalMediaSelector').GlobalMediaFile;
  /** GlobalMediaFile'dan dönüştürme */
  fromGlobalMediaFile: (file: import('@/components/media/GlobalMediaSelector').GlobalMediaFile) => GalleryFileInfo;
}

// TipTap editor integration
export interface TipTapEditorIntegration {
  /** Editöre resim ekleme */
  insertImage: (file: GalleryFileInfo, editor: any) => void;
  /** Editöre galeri ekleme */
  insertGallery: (files: GalleryFileInfo[], editor: any) => void;
  /** Floating image ekleme */
  insertFloatingImage: (file: GalleryFileInfo, editor: any, position?: 'left' | 'right' | 'center') => void;
}

// Error types
export type UploaderError = 
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'UPLOAD_FAILED'
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'QUOTA_EXCEEDED'
  | 'CROP_FAILED'
  | 'DELETE_FAILED';

export interface UploaderErrorInfo {
  type: UploaderError;
  message: string;
  details?: any;
  fileName?: string;
}
