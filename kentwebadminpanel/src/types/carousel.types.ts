export interface LocalizedText {
  tr: string;
  en: string;
}

export interface CarouselButton {
  text: LocalizedText;
  url: string;
}

export interface SeoMetadata {
  title: LocalizedText;
  description: LocalizedText;
  altText: LocalizedText;
}

export interface CarouselItem {
  id?: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  button?: CarouselButton;
  imageUrl: string;
  order: number;
  isActive: boolean;
  seoMetadata: SeoMetadata;
  imageFile?: File;
}

// Resim kırpma ile ilgili tipler
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PixelCropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Form durumu için tipler
export interface CarouselFormData {
  title: LocalizedText;
  subtitle: LocalizedText;
  buttonText: LocalizedText;
  buttonUrl: string;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  seoAltText: LocalizedText;
  imageUrl: string;
  imageFile?: File;
  isActive: boolean;
  order: number;
}

// API istekleri için tipler
export interface CreateCarouselItemRequest {
  item: Omit<CarouselItem, 'id' | 'imageUrl'>;
  imageFile: File;
}

export interface UpdateCarouselItemRequest {
  item: Omit<CarouselItem, 'imageUrl'>;
  imageFile?: File;
}

export interface CarouselResponse {
  success: boolean;
  message: string;
  data?: {
    items?: CarouselItem[];
    item?: CarouselItem;
  };
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
  dimensions: ImageDimensions;
  message?: string;
}

// Resim kırpma ayarları
export interface CropConfig {
  unit: 'px' | '%';
  x: number;
  y: number;
  width: number;
  height: number;
  aspect?: number;
} 