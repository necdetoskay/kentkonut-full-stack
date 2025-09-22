import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { unlink } from 'fs/promises';

// Dynamic import for Sharp to avoid client-side bundling
const getSharp = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('Sharp can only be used on the server side');
  }
  const sharp = await import('sharp');
  return sharp.default;
};

// Image processing configuration
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
  original: null // Keep original size
};

export const IMAGE_QUALITY = {
  jpeg: 85,
  webp: 80,
  png: 90
};

export interface ProcessedImage {
  size: string;
  width: number;
  height: number;
  format: string;
  path: string;
  url: string;
  fileSize: number;
}

export interface ImageProcessingResult {
  original: ProcessedImage;
  variants: ProcessedImage[];
  metadata: {
    originalFormat: string;
    originalSize: number;
    totalProcessedSize: number;
    compressionRatio: number;
  };
}

/**
 * Get the output directory for processed images
 */
function getProcessedImageDir(categoryName: string): string {
  const baseDir = path.join(process.cwd(), 'public', 'uploads', 'media', 'processed');
  const categoryDir = path.join(baseDir, categoryName.toLowerCase());

  // Ensure directory exists
  if (!existsSync(categoryDir)) {
    mkdirSync(categoryDir, { recursive: true });
  }

  return categoryDir;
}

/**
 * Generate filename for processed image variant
 */
function generateVariantFilename(originalFilename: string, size: string, format: string): string {
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);
  return `${basename}_${size}.${format}`;
}

/**
 * Get public URL for processed image
 */
function getProcessedImageUrl(categoryName: string, filename: string): string {
  return `/uploads/media/processed/${categoryName.toLowerCase()}/${filename}`;
}

/**
 * Process a single image variant
 */
async function processImageVariant(
  inputPath: string,
  outputPath: string,
  size: string,
  format: 'jpeg' | 'webp' | 'png' = 'webp'
): Promise<ProcessedImage> {
  const sharp = await getSharp();
  const sizeConfig = IMAGE_SIZES[size as keyof typeof IMAGE_SIZES];

  let sharpInstance = sharp(inputPath);

  // Apply resizing if size config exists
  if (sizeConfig) {
    sharpInstance = sharpInstance.resize(sizeConfig.width, sizeConfig.height, {
      fit: 'inside',
      withoutEnlargement: false // Allow upscaling for small images
    });
  }

  // Apply format and quality settings
  switch (format) {
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({
        quality: IMAGE_QUALITY.jpeg,
        progressive: true,
        mozjpeg: true
      });
      break;
    case 'webp':
      sharpInstance = sharpInstance.webp({
        quality: IMAGE_QUALITY.webp,
        effort: 6
      });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({
        quality: IMAGE_QUALITY.png,
        compressionLevel: 9,
        progressive: true
      });
      break;
  }

  // Process and save the image
  const info = await sharpInstance.toFile(outputPath);

  return {
    size,
    width: info.width,
    height: info.height,
    format,
    path: outputPath,
    url: getProcessedImageUrl(
      path.basename(path.dirname(path.dirname(outputPath))),
      path.basename(outputPath)
    ),
    fileSize: info.size
  };
}

/**
 * Extract image metadata
 */
async function extractImageMetadata(imagePath: string) {
  try {
    const sharp = await getSharp();
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: metadata.size || 0,
      density: metadata.density || 72,
      hasAlpha: metadata.hasAlpha || false,
      orientation: metadata.orientation || 1
    };
  } catch (error) {
    console.error('Error extracting image metadata:', error);
    return null;
  }
}

/**
 * Process image and generate multiple variants
 */
export async function processImage(
  inputPath: string,
  originalFilename: string,
  categoryName: string
): Promise<ImageProcessingResult> {
  try {
    // Extract original metadata
    const originalMetadata = await extractImageMetadata(inputPath);
    if (!originalMetadata) {
      throw new Error('Failed to extract image metadata');
    }

    const outputDir = getProcessedImageDir(categoryName);
    const variants: ProcessedImage[] = [];
    let totalProcessedSize = 0;

    // Process each size variant
    for (const sizeName of Object.keys(IMAGE_SIZES)) {
      if (sizeName === 'original') continue;

      // Generate WebP variant (primary format)
      const webpFilename = generateVariantFilename(originalFilename, sizeName, 'webp');
      const webpPath = path.join(outputDir, webpFilename);

      const webpVariant = await processImageVariant(
        inputPath,
        webpPath,
        sizeName,
        'webp'
      );
      variants.push(webpVariant);
      totalProcessedSize += webpVariant.fileSize;

      // Generate JPEG fallback for compatibility
      const jpegFilename = generateVariantFilename(originalFilename, sizeName, 'jpeg');
      const jpegPath = path.join(outputDir, jpegFilename);

      const jpegVariant = await processImageVariant(
        inputPath,
        jpegPath,
        sizeName,
        'jpeg'
      );
      variants.push(jpegVariant);
      totalProcessedSize += jpegVariant.fileSize;
    }

    // Create original variant info
    const originalVariant: ProcessedImage = {
      size: 'original',
      width: originalMetadata.width,
      height: originalMetadata.height,
      format: originalMetadata.format,
      path: inputPath,
      url: `/uploads/media/${categoryName.toLowerCase()}/${originalFilename}`,
      fileSize: originalMetadata.size
    };

    const compressionRatio = originalMetadata.size > 0
      ? ((originalMetadata.size - totalProcessedSize) / originalMetadata.size) * 100
      : 0;

    return {
      original: originalVariant,
      variants,
      metadata: {
        originalFormat: originalMetadata.format,
        originalSize: originalMetadata.size,
        totalProcessedSize,
        compressionRatio
      }
    };

  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(variants: ProcessedImage[], format: 'webp' | 'jpeg' = 'webp'): string {
  const filteredVariants = variants
    .filter(v => v.format === format)
    .sort((a, b) => a.width - b.width);

  return filteredVariants
    .map(variant => `${variant.url} ${variant.width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(): string {
  return [
    '(max-width: 640px) 100vw',
    '(max-width: 768px) 50vw',
    '(max-width: 1024px) 33vw',
    '25vw'
  ].join(', ');
}

/**
 * Get optimal image variant for given dimensions
 */
export function getOptimalVariant(
  variants: ProcessedImage[],
  targetWidth: number,
  format: 'webp' | 'jpeg' = 'webp'
): ProcessedImage | null {
  const filteredVariants = variants
    .filter(v => v.format === format)
    .sort((a, b) => a.width - b.width);

  // Find the smallest variant that's larger than target width
  const optimal = filteredVariants.find(v => v.width >= targetWidth);

  // If no variant is large enough, return the largest one
  return optimal || filteredVariants[filteredVariants.length - 1] || null;
}

/**
 * Clean up processed image variants
 */
export async function cleanupProcessedImages(originalFilename: string, categoryName: string): Promise<void> {
  try {
    const outputDir = getProcessedImageDir(categoryName);

    // Remove all variants for this image
    for (const sizeName of Object.keys(IMAGE_SIZES)) {
      if (sizeName === 'original') continue;

      for (const format of ['webp', 'jpeg']) {
        const filename = generateVariantFilename(originalFilename, sizeName, format);
        const filePath = path.join(outputDir, filename);

        try {
          if (existsSync(filePath)) {
            await unlink(filePath);
          }
        } catch (error) {
          console.warn(`Failed to delete processed image: ${filePath}`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up processed images:', error);
  }
}
