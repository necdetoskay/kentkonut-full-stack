import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Sharp'ı güvenli bir şekilde import et
let sharp: any = null;
try {
  sharp = require('sharp');
} catch (error: any) {
  console.warn('Sharp module not available:', error?.message || 'Unknown error');
}

// Thumbnail boyutları
export const THUMBNAIL_SIZES = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 },
} as const;

export type ThumbnailSize = keyof typeof THUMBNAIL_SIZES;

// Thumbnail oluşturma seçenekleri
interface ThumbnailOptions {
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
}

// Thumbnail dosya adı oluşturma
export function generateThumbnailFilename(
  originalFilename: string, 
  size: ThumbnailSize, 
  format: string = 'jpeg'
): string {
  const ext = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, ext);
  return `${nameWithoutExt}_${size}.${format}`;
}

// Thumbnail klasör yolu
export function getThumbnailDirectory(): string {
  return path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
}

// Thumbnail URL'i oluşturma
export function getThumbnailUrl(filename: string, size: ThumbnailSize): string {
  return `/uploads/thumbnails/${generateThumbnailFilename(filename, size)}`;
}

// Klasör oluşturma
async function ensureThumbnailDirectory(): Promise<void> {
  const thumbnailDir = getThumbnailDirectory();
  if (!existsSync(thumbnailDir)) {
    await mkdir(thumbnailDir, { recursive: true });
  }
}

// Tek thumbnail oluşturma
export async function createThumbnail(
  inputBuffer: Buffer,
  outputPath: string,
  size: ThumbnailSize,
  options: ThumbnailOptions = {}
): Promise<void> {
  if (!sharp) {
    console.warn('Sharp not available, skipping thumbnail creation');
    return;
  }

  const {
    quality = 80,
    format = 'jpeg',
    fit = 'cover',
    background = '#ffffff'
  } = options;

  const { width, height } = THUMBNAIL_SIZES[size];

  let sharpInstance = sharp(inputBuffer)
    .resize(width, height, {
      fit,
      background,
      withoutEnlargement: false
    });

  // Format'a göre çıktı ayarları
  switch (format) {
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({ quality });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({ quality });
      break;
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality });
      break;
  }

  await sharpInstance.toFile(outputPath);
}

// Tüm boyutlarda thumbnail oluşturma
export async function createAllThumbnails(
  inputBuffer: Buffer,
  originalFilename: string,
  options: ThumbnailOptions = {}
): Promise<{ [K in ThumbnailSize]: string }> {
  await ensureThumbnailDirectory();
  
  const thumbnailDir = getThumbnailDirectory();
  const results = {} as { [K in ThumbnailSize]: string };

  // Her boyut için thumbnail oluştur
  for (const [sizeKey, _] of Object.entries(THUMBNAIL_SIZES)) {
    const size = sizeKey as ThumbnailSize;
    const thumbnailFilename = generateThumbnailFilename(originalFilename, size, options.format);
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
    
    try {
      await createThumbnail(inputBuffer, thumbnailPath, size, options);
      results[size] = getThumbnailUrl(originalFilename, size);
    } catch (error) {
      console.error(`Error creating ${size} thumbnail for ${originalFilename}:`, error);
      // Hata durumunda orijinal dosyayı kullan
      results[size] = `/uploads/${originalFilename}`;
    }
  }

  return results;
}

// Resim dosyası kontrolü
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/') && 
         !mimeType.includes('svg'); // SVG'ler için thumbnail oluşturmayız
}

// Thumbnail silme
export async function deleteThumbnails(originalFilename: string): Promise<void> {
  const thumbnailDir = getThumbnailDirectory();
  
  for (const size of Object.keys(THUMBNAIL_SIZES) as ThumbnailSize[]) {
    const thumbnailFilename = generateThumbnailFilename(originalFilename, size);
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
    
    try {
      if (existsSync(thumbnailPath)) {
        const fs = await import('fs/promises');
        await fs.unlink(thumbnailPath);
      }
    } catch (error) {
      console.error(`Error deleting thumbnail ${thumbnailPath}:`, error);
    }
  }
}

// Thumbnail boyutlarını al
export function getThumbnailSizes(): typeof THUMBNAIL_SIZES {
  return THUMBNAIL_SIZES;
}

// En uygun thumbnail boyutunu seç
export function selectBestThumbnailSize(
  requestedWidth: number, 
  requestedHeight: number
): ThumbnailSize {
  const requestedArea = requestedWidth * requestedHeight;
  
  // En yakın boyutu bul
  let bestSize: ThumbnailSize = 'small';
  let bestDifference = Infinity;
  
  for (const [sizeKey, dimensions] of Object.entries(THUMBNAIL_SIZES)) {
    const size = sizeKey as ThumbnailSize;
    const thumbnailArea = dimensions.width * dimensions.height;
    const difference = Math.abs(thumbnailArea - requestedArea);
    
    if (difference < bestDifference) {
      bestDifference = difference;
      bestSize = size;
    }
  }
  
  return bestSize;
}

// Responsive thumbnail URL'leri oluşturma
export function getResponsiveThumbnailUrls(filename: string): {
  small: string;
  medium: string;
  large: string;
  original: string;
} {
  return {
    small: getThumbnailUrl(filename, 'small'),
    medium: getThumbnailUrl(filename, 'medium'),
    large: getThumbnailUrl(filename, 'large'),
    original: `/uploads/${filename}`
  };
}

// Thumbnail metadata'sı
export interface ThumbnailMetadata {
  size: ThumbnailSize;
  width: number;
  height: number;
  url: string;
  fileSize?: number;
}

// Thumbnail bilgilerini al
export function getThumbnailMetadata(filename: string): ThumbnailMetadata[] {
  return Object.entries(THUMBNAIL_SIZES).map(([sizeKey, dimensions]) => ({
    size: sizeKey as ThumbnailSize,
    width: dimensions.width,
    height: dimensions.height,
    url: getThumbnailUrl(filename, sizeKey as ThumbnailSize)
  }));
}
