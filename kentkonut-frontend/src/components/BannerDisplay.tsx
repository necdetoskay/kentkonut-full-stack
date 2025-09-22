import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import bannerService, { Banner, BannerPositionUUID } from '@/services/bannerService';
import { imageService } from '@/services/imageService';
import { getApiBaseUrl } from '@/config/ports';

interface BannerDisplayProps {
  position: BannerPositionUUID;
  className?: string;
  style?: React.CSSProperties;
  showTitle?: boolean;
  showDescription?: boolean;
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1"
  size?: 'small' | 'medium' | 'large';
  autoSlide?: boolean;
  slideDuration?: number;
}

export function BannerDisplay({
  position,
  className,
  style,
  showTitle = false,
  showDescription = false,
  aspectRatio = "16/9",
  size = 'medium',
  autoSlide = true,
  slideDuration = 5000
}: BannerDisplayProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Backend URL'ini al
  const backendUrl = getApiBaseUrl();

  // Resim URL'ini düzenle
  const getImageUrl = (imageUrl: string) => {
    return imageService.getImageUrl(imageUrl);
  };

  // Banner verilerini yükle
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const bannerData = await bannerService.getBannerByPosition(position);
        
        if (bannerData && bannerData.banners) {
          // Aktif bannerları filtrele ve sırala
          const activeBanners = bannerService.filterActiveBanners(bannerData.banners);
          setBanners(activeBanners);
        } else {
          setBanners([]);
        }
      } catch (err) {
        console.error(`Banner loading error for position ${position}:`, err);
        setError('Banner yüklenemedi');
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanners();
  }, [position]);

  // Otomatik slide geçişi
  useEffect(() => {
    if (!autoSlide || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, slideDuration);

    return () => clearInterval(interval);
  }, [autoSlide, banners.length, slideDuration]);

  // Banner tıklama işlemi
  const handleBannerClick = async (banner: Banner) => {
    // Get the target URL from various possible fields
    const targetUrl = banner.link || banner.linkUrl || banner.ctaLink;
    
    // Only proceed if there's a valid URL
    if (!targetUrl || targetUrl.trim() === '') {
      return;
    }

    // Record click statistics
    if (banner.id && typeof banner.id === 'number') {
      try {
        await bannerService.recordBannerClick(banner.id);
      } catch (error) {
        console.error('Banner click tracking failed:', error);
        // Continue with navigation even if tracking fails
      }
    }

    // Handle URL navigation with proper security
    const url = targetUrl.trim();
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // External URL - open in new tab with security attributes
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (url.startsWith('/')) {
      // Internal relative URL - navigate in same window
      window.location.href = url;
    } else {
      // Assume it's an internal URL without leading slash
      window.location.href = '/' + url;
    }
  };

  // Check if banner has a valid clickable URL
  const isBannerClickable = (banner: Banner): boolean => {
    const targetUrl = banner.link || banner.linkUrl || banner.ctaLink;
    return !!(targetUrl && targetUrl.trim() !== '');
  };

  // Banner impression istatistiği kaydet (banner yüklendiğinde)
  useEffect(() => {
    if (banners.length > 0) {
      banners.forEach(async (banner) => {
        if (banner.id && typeof banner.id === 'number') {
          try {
            await bannerService.recordBannerImpression(banner.id);
          } catch (error) {
            console.error('Banner impression tracking failed:', error);
          }
        }
      });
    }
  }, [banners]);

  // Banner görüntülenme istatistiği kaydet (banner görüntülendiğinde)
  useEffect(() => {
    if (banners.length > 0 && banners[currentIndex]) {
      const recordView = async () => {
        const banner = banners[currentIndex];
        if (banner.id && typeof banner.id === 'number') {
          try {
            await bannerService.recordBannerView(banner.id);
          } catch (error) {
            console.error('Banner view tracking failed:', error);
          }
        }
      };
      recordView();
    }
  }, [currentIndex, banners]);

  // Size classes
  const sizeClasses = {
    small: 'h-24 md:h-32',
    medium: 'h-32 md:h-48',
    large: 'h-48 md:h-64'
  };

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={cn(
          'bg-muted animate-pulse rounded-lg',
          sizeClasses[size],
          className
        )}
        style={{ aspectRatio, ...style }}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className={cn(
          'bg-muted rounded-lg flex items-center justify-center',
          sizeClasses[size],
          className
        )}
        style={{ aspectRatio, ...style }}
      >
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  // No banners
  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const isClickable = isBannerClickable(currentBanner);

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-lg group',
        isClickable && 'cursor-pointer',
        className
      )}
      style={{ aspectRatio, ...style }}
      onClick={() => isClickable && handleBannerClick(currentBanner)}
      title={isClickable ? `${currentBanner.title} - Tıklayın` : currentBanner.title}
    >
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <img
          src={getImageUrl(currentBanner.imageUrl)}
          alt={currentBanner.title}
          className={cn(
            'w-full h-full object-cover transition-transform duration-300',
            isClickable && 'group-hover:scale-105'
          )}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-banner.jpg';
          }}
        />
        
        {/* Hover overlay for clickable banners */}
        {isClickable && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
              Tıklayın
            </div>
          </div>
        )}
      </div>

      {/* Content Overlay */}
      {(showTitle || showDescription) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          {showTitle && (
            <h3 className="text-white font-semibold text-lg mb-1">
              {currentBanner.title}
            </h3>
          )}
          {showDescription && currentBanner.description && (
            <p className="text-white/90 text-sm line-clamp-2">
              {currentBanner.description}
            </p>
          )}
        </div>
      )}

      {/* Slide indicators for multiple banners */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {banners.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-colors duration-200',
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              )}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}

      {/* External link indicator */}
      {isClickable && (currentBanner.link || currentBanner.linkUrl || currentBanner.ctaLink)?.startsWith('http') && (
        <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}
    </div>
  );
}
