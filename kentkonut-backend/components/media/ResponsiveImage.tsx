"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Client-side types for processed images
interface ProcessedImage {
  size: string;
  width: number;
  height: number;
  format: string;
  path: string;
  url: string;
  fileSize: number;
}

// Client-side utility functions
function generateSrcSet(variants: ProcessedImage[], format: 'webp' | 'jpeg' = 'webp'): string {
  const filteredVariants = variants
    .filter(v => v.format === format)
    .sort((a, b) => a.width - b.width);

  return filteredVariants
    .map(variant => `${variant.url} ${variant.width}w`)
    .join(', ');
}

function generateSizes(): string {
  return [
    '(max-width: 640px) 100vw',
    '(max-width: 768px) 50vw',
    '(max-width: 1024px) 33vw',
    '25vw'
  ].join(', ');
}

function getOptimalVariant(
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

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  variants?: ProcessedImage[];
  fallbackFormat?: 'jpeg' | 'webp';
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  fill = false,
  sizes,
  variants = [],
  fallbackFormat = 'jpeg',
  loading = 'lazy',
  onLoad,
  onError
}: ResponsiveImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFormat, setCurrentFormat] = useState<'webp' | 'jpeg'>('webp');

  // Check WebP support
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const dataURL = canvas.toDataURL('image/webp');
      return dataURL.indexOf('data:image/webp') === 0;
    };

    if (!checkWebPSupport()) {
      setCurrentFormat('jpeg');
    }
  }, []);

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setImageError(true);
    setIsLoading(false);

    // Try fallback format if WebP failed
    if (currentFormat === 'webp') {
      setCurrentFormat('jpeg');
      setImageError(false);
      return;
    }

    onError?.();
  };

  // Get the best image source
  const getImageSrc = () => {
    if (imageError || variants.length === 0) {
      return src; // Fallback to original
    }

    // If we have variants, use the optimal one
    if (width && variants.length > 0) {
      const optimal = getOptimalVariant(variants, width, currentFormat);
      return optimal?.url || src;
    }

    return src;
  };

  // Generate srcSet for responsive images
  const getSrcSet = () => {
    if (variants.length === 0) return undefined;
    return generateSrcSet(variants, currentFormat);
  };

  // Generate sizes attribute
  const getSizes = () => {
    if (sizes) return sizes;
    if (variants.length === 0) return undefined;
    return generateSizes();
  };

  // Render loading placeholder
  const renderLoadingPlaceholder = () => (
    <div
      className={cn(
        "bg-gray-200 animate-pulse flex items-center justify-center",
        fill ? "absolute inset-0" : "",
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      <svg
        className="w-8 h-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  // Render error placeholder
  const renderErrorPlaceholder = () => (
    <div
      className={cn(
        "bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center",
        fill ? "absolute inset-0" : "",
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      <div className="text-center">
        <svg
          className="w-8 h-8 text-gray-400 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p className="text-xs text-gray-500">Resim yüklenemedi</p>
      </div>
    </div>
  );

  // Show loading state
  if (isLoading && !imageError) {
    return renderLoadingPlaceholder();
  }

  // Show error state
  if (imageError) {
    return renderErrorPlaceholder();
  }

  // Render the image
  return (
    <Image
      src={getImageSrc()}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={priority}
      quality={quality}
      sizes={getSizes()}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        objectFit: 'cover',
        objectPosition: 'center',
      }}
    />
  );
}

// Utility component for image with aspect ratio container
interface AspectRatioImageProps extends ResponsiveImageProps {
  aspectRatio?: number; // width/height ratio, e.g., 16/9 = 1.777
  containerClassName?: string;
}

export function AspectRatioImage({
  aspectRatio = 1,
  containerClassName,
  className,
  ...props
}: AspectRatioImageProps) {
  return (
    <div
      className={cn("relative overflow-hidden", containerClassName)}
      style={{ aspectRatio }}
    >
      <ResponsiveImage
        {...props}
        fill={true}
        className={cn("object-cover", className)}
      />
    </div>
  );
}

// Utility component for circular/avatar images
interface AvatarImageProps extends Omit<ResponsiveImageProps, 'fill' | 'width' | 'height'> {
  size: number;
}

export function AvatarImage({
  size,
  className,
  ...props
}: AvatarImageProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <ResponsiveImage
        {...props}
        fill={true}
        className="object-cover"
      />
    </div>
  );
}

// Gallery image component with hover effects
interface GalleryImageProps extends ResponsiveImageProps {
  showOverlay?: boolean;
  overlayContent?: React.ReactNode;
}

export function GalleryImage({
  showOverlay = false,
  overlayContent,
  className,
  ...props
}: GalleryImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn("relative group cursor-pointer", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ResponsiveImage
        {...props}
        className="transition-transform duration-300 group-hover:scale-105"
      />

      {showOverlay && (
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          {overlayContent}
        </div>
      )}
    </div>
  );
}
