import React, { useState, useRef } from 'react';
import { useLazyLoading, useImageOptimization } from '@/hooks/usePerformance';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  onClick,
  onLoad,
  onError,
  width,
  height,
  quality = 80,
  format = 'webp'
}) => {
  const [imageRef, isVisible] = useLazyLoading(0.1);
  const { optimizedSrc, isLoading: isOptimizing } = useImageOptimization(src, {
    quality,
    format,
    width,
    height
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={imageRef as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Loading state */}
      {(!isVisible || isOptimizing || !isLoaded) && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Image */}
      {isVisible && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;
