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

export interface CarouselTiming { // Added Timing interface
  display_duration: number;
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
  timing?: CarouselTiming; // Added timing
  startDate?: Date | string | null; // Added startDate (allow string for form input)
  endDate?: Date | string | null;   // Added endDate (allow string for form input)
  deviceVisibility?: 'all' | 'mobile' | 'desktop'; // Added device visibility
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
  item: {
    title: LocalizedText;
    subtitle: LocalizedText;
    button?: CarouselButton; // Made button optional
    seoMetadata: SeoMetadata;
    order: number;
    isActive: boolean;
    timing?: CarouselTiming; // Added timing
    startDate?: Date | string | null; // Added startDate
    endDate?: Date | string | null;   // Added endDate
    deviceVisibility?: 'all' | 'mobile' | 'desktop'; // Added device visibility
  };
  imageFile?: File;
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