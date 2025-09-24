import React, { useEffect, useState } from 'react';
import { LightboxImage, LightboxModalProps } from '@/types/prd-gallery';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useSwipeNavigation, usePinchZoom, useMobileViewport } from '@/hooks/useTouchGestures';

const LightboxModal: React.FC<LightboxModalProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigate
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentImage = images[currentIndex];
  const { isMobile } = useMobileViewport();

  // Touch gesture handlers
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeNavigation(
    nextImage,
    prevImage,
    { threshold: 50, velocityThreshold: 0.3 }
  );

  const { handleTouchStart: handlePinchStart, handleTouchMove: handlePinchMove, handleTouchEnd: handlePinchEnd } = usePinchZoom(
    (scale, center) => {
      setZoom(scale);
    },
    { minScale: 0.5, maxScale: 3, threshold: 0.1 }
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case 'r':
        case 'R':
          rotateImage();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, zoom, rotation]);

  // Touch gestures
  useEffect(() => {
    const lightboxElement = document.querySelector('.lightbox-modal');
    if (lightboxElement) {
      lightboxElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      lightboxElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      lightboxElement.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      // Pinch gestures
      lightboxElement.addEventListener('touchstart', handlePinchStart, { passive: false });
      lightboxElement.addEventListener('touchmove', handlePinchMove, { passive: false });
      lightboxElement.addEventListener('touchend', handlePinchEnd, { passive: false });
    }

    return () => {
      if (lightboxElement) {
        lightboxElement.removeEventListener('touchstart', handleTouchStart);
        lightboxElement.removeEventListener('touchmove', handleTouchMove);
        lightboxElement.removeEventListener('touchend', handleTouchEnd);
        lightboxElement.removeEventListener('touchstart', handlePinchStart);
        lightboxElement.removeEventListener('touchmove', handlePinchMove);
        lightboxElement.removeEventListener('touchend', handlePinchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handlePinchStart, handlePinchMove, handlePinchEnd]);

  // Reset zoom and rotation when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setImageLoaded(false);
  }, [currentIndex]);

  // Navigation functions
  const nextImage = () => {
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(prevIndex);
  };

  // Zoom functions
  const zoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.25));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(0.5, prev - 0.25));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  // Rotation function
  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Fullscreen function
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Download function
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = currentImage.title || `image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share function
  const shareImage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage.title,
          text: currentImage.alt,
          url: currentImage.url
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(currentImage.url);
      alert('URL kopyalandı!');
    }
  };

  if (!currentImage) {
    return null;
  }

  return (
    <div className="lightbox-modal fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div className="relative max-w-full max-h-full p-16">
        <img
          src={currentImage.url}
          alt={currentImage.alt || currentImage.title}
          className={`max-w-full max-h-full object-contain transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
        
        {/* Loading Indicator */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
        {/* Zoom Controls */}
        <button
          onClick={zoomOut}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        
        <button
          onClick={resetZoom}
          className="px-3 py-1 text-white text-sm hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>
        
        <button
          onClick={zoomIn}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {/* Rotate */}
        <button
          onClick={rotateImage}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          title="Rotate"
        >
          <RotateCw className="w-5 h-5" />
        </button>

        {/* Download */}
        <button
          onClick={downloadImage}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Share */}
        <button
          onClick={shareImage}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Image Info */}
      <div className="absolute top-4 left-4 max-w-md">
        <h3 className="text-white text-lg font-semibold mb-2">
          {currentImage.title}
        </h3>
        {currentImage.alt && (
          <p className="text-gray-300 text-sm">
            {currentImage.alt}
          </p>
        )}
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Keyboard Shortcuts Info */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs">
        ← → Navigate • + - Zoom • R Rotate • F Fullscreen • Esc Close
      </div>
    </div>
  );
};

export default LightboxModal;
