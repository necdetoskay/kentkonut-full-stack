import React, { useState, useEffect, useRef } from 'react';
import { GalleryMediaItem } from '@/types/prd-gallery';
import { Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useLazyLoading, useImageOptimization, usePerformanceMonitor } from '@/hooks/usePerformance';
import LazyImage from './LazyImage';

interface MediaGridProps {
  media: GalleryMediaItem[];
  loading: boolean;
  onImageClick: (index: number) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  error?: string;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  loading,
  onImageClick,
  onLoadMore,
  hasMore,
  error
}) => {
  const [imageLoadStates, setImageLoadStates] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});
  const [gridColumns, setGridColumns] = useState(4);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  usePerformanceMonitor('MediaGrid');

  // Responsive grid columns
  useEffect(() => {
    const updateGridColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setGridColumns(2); // Mobile: 2 columns
      } else if (width < 1024) {
        setGridColumns(3); // Tablet: 3 columns
      } else {
        setGridColumns(4); // Desktop: 4 columns
      }
    };

    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
    return () => window.removeEventListener('resize', updateGridColumns);
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  // Handle image load
  const handleImageLoad = (id: number) => {
    setImageLoadStates(prev => ({ ...prev, [id]: 'loaded' }));
  };

  // Handle image error
  const handleImageError = (id: number) => {
    setImageLoadStates(prev => ({ ...prev, [id]: 'error' }));
  };

  // Get media URL
  const getMediaUrl = (url: string) => {
    if (!url) return '/images/placeholder.png';
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3021'}${url}`;
  };

  // Grid column classes
  const getGridColsClass = () => {
    switch (gridColumns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-4';
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg aspect-square"></div>
      <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="mt-1 h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="media-grid">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-kentblue text-white rounded-lg hover:bg-kentblue/90 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && media.length === 0) {
    return (
      <div className="media-grid">
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Medya Bulunamadı</h3>
          <p className="text-gray-600">Bu kategoride henüz medya eklenmemiş.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="media-grid">
      {/* Grid Container */}
      <div className={`grid ${getGridColsClass()} gap-4 md:gap-6`}>
        {media.map((item, index) => {
          const isLoading = imageLoadStates[item.id] === 'loading';
          const hasError = imageLoadStates[item.id] === 'error';
          const isLoaded = imageLoadStates[item.id] === 'loaded';

          return (
            <div
              key={item.id}
              className="media-item group cursor-pointer"
              onClick={() => onImageClick(index)}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                <LazyImage
                  src={item.media.url}
                  alt={item.media.alt || item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onClick={() => onImageClick(index)}
                  onLoad={() => handleImageLoad(item.id)}
                  onError={() => handleImageError(item.id)}
                  quality={80}
                  format="webp"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white bg-opacity-90 rounded-full p-2">
                      <ImageIcon className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </div>

                {/* Media Type Badge */}
                {item.media.type && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-medium bg-black bg-opacity-50 text-white rounded">
                      {item.media.type}
                    </span>
                  </div>
                )}
              </div>

              {/* Media Info */}
              <div className="mt-3">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-kentblue transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading skeletons for additional items */}
        {loading && media.length > 0 && (
          <>
            {Array.from({ length: gridColumns }).map((_, index) => (
              <LoadingSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="mt-8 text-center">
          {loading ? (
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Yükleniyor...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="px-6 py-2 bg-kentblue text-white rounded-lg hover:bg-kentblue/90 transition-colors"
            >
              Daha Fazla Yükle
            </button>
          )}
        </div>
      )}

      {/* End of results */}
      {!hasMore && media.length > 0 && (
        <div className="mt-8 text-center text-gray-500 text-sm">
          Tüm medyalar yüklendi
        </div>
      )}
    </div>
  );
};

export default MediaGrid;
