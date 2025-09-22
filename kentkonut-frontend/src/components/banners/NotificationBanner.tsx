import React, { useState, useEffect } from 'react';
import { X, Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiBaseUrl } from '@/config/ports';
import bannerService, { Banner, BANNER_POSITION_UUIDS } from '@/services/bannerService';

interface NotificationBannerProps {
  id?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  message?: string;
  dismissible?: boolean;
  autoHide?: boolean;
  duration?: number;
  onDismiss?: () => void;
  className?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  priority?: number;
  showFrom?: string;
  showUntil?: string;
  targetPages?: string[];
  position?: 'top' | 'bottom' | 'center';
  animation?: 'slide' | 'fade' | 'bounce';
  persistent?: boolean;
  autoShow?: boolean;
  showDelay?: number;
}

export function NotificationBanner({ 
  className = '',
  position = 'top',
  autoShow = true,
  showDelay = 1000,
  dismissible = true
}: NotificationBannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Backend URL configuration
  const backendUrl = getApiBaseUrl();

  // Banner verilerini yükle
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setIsLoading(true);
        const bannerData = await bannerService.getBannerByPosition(BANNER_POSITION_UUIDS.NOTIFICATION);
        
        if (bannerData && bannerData.banners) {
          const activeBanners = bannerService.filterActiveBanners(bannerData.banners);
          setBanners(activeBanners);
          
          if (activeBanners.length > 0 && autoShow) {
            setTimeout(() => setIsVisible(true), showDelay);
          }
        }
      } catch (error) {
        console.error('Notification banner loading error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanners();
  }, [autoShow, showDelay]);

  // Banner tıklama işlemi
  const handleBannerClick = async (banner: Banner) => {
    const targetUrl = banner.link || banner.linkUrl || banner.ctaLink;
    
    if (!targetUrl || targetUrl.trim() === '') {
      return;
    }

    // Record click statistics
    if (banner.id && typeof banner.id === 'number') {
      try {
        await bannerService.recordBannerClick(banner.id);
      } catch (error) {
        console.error('Banner click tracking failed:', error);
      }
    }

    // Handle URL navigation
    const url = targetUrl.trim();
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (url.startsWith('/')) {
      window.location.href = url;
    } else {
      window.location.href = '/' + url;
    }
  };

  // Check if banner has a valid clickable URL
  const isBannerClickable = (banner: Banner): boolean => {
    const targetUrl = banner.link || banner.linkUrl || banner.ctaLink;
    return !!(targetUrl && targetUrl.trim() !== '');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Auto-cycle through banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Record view when banner becomes visible
  useEffect(() => {
    if (isVisible && banners.length > 0 && banners[currentIndex]) {
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
  }, [isVisible, currentIndex, banners]);

  if (isLoading || !isVisible || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const isClickable = isBannerClickable(currentBanner);

  return (
    <div 
      className={cn(
        'fixed left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg',
        position === 'top' ? 'top-0' : 'bottom-0',
        className
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div 
            className={cn(
              'flex items-center space-x-3 flex-1',
              isClickable && 'cursor-pointer hover:opacity-80 transition-opacity'
            )}
            onClick={() => isClickable && handleBannerClick(currentBanner)}
          >
            {/* Icon or small image */}
            {currentBanner.imageUrl && (
              <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden">
                <img
                  src={`${backendUrl}${currentBanner.imageUrl}`}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-sm md:text-base truncate">
                  {currentBanner.title}
                </h4>
                {isClickable && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    Tıklayın
                  </span>
                )}
              </div>
              {currentBanner.description && (
                <p className="text-xs md:text-sm text-blue-100 truncate">
                  {currentBanner.description}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Slide indicators */}
            {banners.length > 1 && (
              <div className="flex space-x-1">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-colors',
                      index === currentIndex ? 'bg-white' : 'bg-white/50'
                    )}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}

            {/* Close button */}
            {dismissible && (
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
