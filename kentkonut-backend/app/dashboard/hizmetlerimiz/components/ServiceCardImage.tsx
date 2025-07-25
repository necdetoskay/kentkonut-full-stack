"use client";

import { useState } from "react";
import { Image as ImageIcon, AlertCircle } from "lucide-react";

interface ServiceCardImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
  fallbackColor?: string;
}

export function ServiceCardImage({ 
  src, 
  alt, 
  title, 
  className = "w-full h-full object-cover rounded-lg",
  fallbackColor = "#f3f4f6"
}: ServiceCardImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // If there's no src, show placeholder immediately
  if (!src || src.trim() === '') {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center text-muted-foreground"
        style={{ backgroundColor: fallbackColor }}
      >
        <ImageIcon className="h-8 w-8 mb-1" />
        <span className="text-xs text-center px-1">{title}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading state */}
      {imageLoading && !imageError && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: fallbackColor }}
        >
          <div className="animate-pulse flex flex-col items-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div 
          className="w-full h-full flex flex-col items-center justify-center text-muted-foreground"
          style={{ backgroundColor: fallbackColor }}
        >
          <AlertCircle className="h-6 w-6 mb-1 text-orange-500" />
          <span className="text-xs text-center px-1">{title}</span>
          <span className="text-xs text-orange-500 mt-1">Görsel bulunamadı</span>
        </div>
      )}

      {/* Actual image */}
      {!imageError && (
        <img
          src={src}
          alt={alt}
          className={className}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ 
            display: imageLoading ? 'none' : 'block'
          }}
        />
      )}
    </div>
  );
}
