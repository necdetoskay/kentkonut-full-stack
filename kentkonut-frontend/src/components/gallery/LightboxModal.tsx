import React, { useEffect } from 'react';
import { ProjectGalleryItem } from '@/types/gallery';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxModalProps {
  images: ProjectGalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const LightboxModal: React.FC<LightboxModalProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigate
}) => {
  const currentImage = images[currentIndex];

  // Media URL helper function
  const getMediaUrl = (url?: string) => {
    if (!url) return '/images/placeholder.png';
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3021'}${url}`;
  };

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
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);

  const nextImage = () => {
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(prevIndex);
  };

  if (!currentImage || !currentImage.media) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl max-w-6xl max-h-[90vh] w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 z-10 bg-white rounded-full p-2 shadow-md"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 z-10 bg-white rounded-full p-2 shadow-md"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 z-10 bg-white rounded-full p-2 shadow-md"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Main Image */}
        <div className="relative">
          <img
            src={getMediaUrl(currentImage.media.url)}
            alt={currentImage.media.alt || currentImage.title}
            className="block max-w-full max-h-[80vh] object-contain mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder.png';
            }}
          />
        </div>

        {/* Image Info */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {currentIndex + 1} / {images.length}
            </div>
            <div className="text-sm text-gray-800 font-medium max-w-md text-right">
              {currentImage.title}
            </div>
          </div>
          {currentImage.description && (
            <div className="text-sm text-gray-600 mt-2">
              {currentImage.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LightboxModal;
