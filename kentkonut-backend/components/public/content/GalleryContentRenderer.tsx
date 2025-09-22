"use client";

import { useState } from 'react';
import { SafeHtmlRenderer } from '@/components/content/SafeHtmlRenderer';
import { ensureAbsoluteUrl } from '@/lib/url-utils';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface GalleryContentProps {
  content: {
    id: string;
    title?: string;
    content?: string;    config?: {
      images?: Array<{
        url: string;
        alt?: string;
        caption?: string;
      }>;
      layout?: 'grid' | 'carousel' | 'masonry';
      columns?: number;
      spacing?: 'compact' | 'normal' | 'relaxed';
    };
    caption?: string;
  };
}

export function GalleryContentRenderer({ content }: GalleryContentProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const images = content.config?.images || [];
  const layout = content.config?.layout || 'grid';
  const columns = content.config?.columns || 3;
  const spacing = content.config?.spacing || 'normal';

  // Get spacing classes
  const getSpacingClass = () => {    switch (spacing) {
      case 'compact':
        return 'gap-3';
      case 'relaxed':
        return 'gap-12';
      case 'normal':
      default:
        return 'gap-6';
    }
  };

  if (images.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 text-gray-500 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-2">📸</div>
          <p>Bu galeride görsel bulunamadı</p>
        </div>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    if (direction === 'prev') {
      setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1);
    } else {
      setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0);
    }
  };  const renderGridLayout = () => {
    // Calculate thumbnail size based on columns (same as server-side)
    const thumbnailSize = columns <= 3 ? '160px' : columns === 4 ? '140px' : '120px';
    const spacingValue = spacing === 'compact' ? '12px' : spacing === 'relaxed' ? '24px' : '18px';
    
    return (
      <div style={{ fontSize: 0, lineHeight: 0, textAlign: 'left', width: '100%' }}>
        {images.map((image, index) => {
          const isNotFirstInRow = index % columns !== 0;
          return (
            <div
              key={index}
              style={{
                display: 'inline-block',
                width: thumbnailSize,
                height: thumbnailSize,
                verticalAlign: 'top',
                marginLeft: isNotFirstInRow ? spacingValue : '0',
                marginBottom: spacingValue
              }}
              className="cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-200 shadow-lg transition-transform duration-300 group-hover:scale-105">
                <img
                  src={ensureAbsoluteUrl(image.url) || ''}
                  alt={image.alt || `Galeri görseli ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-2 text-xs text-center font-medium">
                    {image.caption}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };  const renderCarouselLayout = () => (
    <div className="relative">
      <div className={`flex overflow-x-auto pb-4 scrollbar-hide ${
        spacing === 'compact' ? 'space-x-3' :
        spacing === 'relaxed' ? 'space-x-12' :
        'space-x-6'
      }`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="flex-none w-80 cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-video">
              <img
                src={ensureAbsoluteUrl(image.url) || ''}
                alt={image.alt || `Galeri görseli ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            {image.caption && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{image.caption}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );  const renderMasonryLayout = () => (
    <div className={`${
      columns === 2 ? 'columns-1 sm:columns-2' : 
      columns === 3 ? 'columns-1 sm:columns-2 lg:columns-3' :
      columns === 4 ? 'columns-1 sm:columns-2 lg:columns-4' :
      'columns-1 sm:columns-2 lg:columns-3'
    } ${getSpacingClass()} space-y-4`}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-200 break-inside-avoid"
          onClick={() => openLightbox(index)}
        >
          <img
            src={ensureAbsoluteUrl(image.url) || ''}
            alt={image.alt || `Galeri görseli ${index + 1}`}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-sm">
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mb-6">
      {/* Gallery Title */}
      {content.title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {content.title}
        </h3>
      )}

      {/* Gallery Grid */}
      <div className="mb-4">
        {layout === 'grid' && renderGridLayout()}
        {layout === 'carousel' && renderCarouselLayout()}
        {layout === 'masonry' && renderMasonryLayout()}
      </div>

      {/* Gallery Caption */}
      {content.caption && (
        <p className="text-center text-gray-600 italic">
          {content.caption}
        </p>
      )}

      {/* Additional Content */}
      {content.content && content.content.trim() !== '' && (
        <div className="mt-6 prose prose-lg max-w-none content-display">
          <SafeHtmlRenderer
            content={content.content}
            className="leading-relaxed content-display"
          />
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronLeft className="w-12 h-12" />
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronRight className="w-12 h-12" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={ensureAbsoluteUrl(images[selectedImage].url) || ''}
              alt={images[selectedImage].alt || `Galeri görseli ${selectedImage + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Caption */}
            {images[selectedImage].caption && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white bg-black bg-opacity-70 rounded px-4 py-2 inline-block">
                  {images[selectedImage].caption}
                </p>
              </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 left-4 text-white bg-black bg-opacity-70 rounded px-3 py-1 text-sm">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
