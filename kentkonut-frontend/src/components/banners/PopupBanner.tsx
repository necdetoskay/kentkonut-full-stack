import React, { useState, useEffect } from 'react';
import { BannerDisplay } from '../BannerDisplay';
import { BANNER_POSITION_UUIDS } from '@/services/bannerService';
import { X } from 'lucide-react';

interface PopupBannerProps {
  className?: string;
  showTitle?: boolean;
  showDescription?: boolean;
  autoShow?: boolean;
  showDelay?: number; // milliseconds
}

export function PopupBanner({ 
  className = '',
  showTitle = true,
  showDescription = true,
  autoShow = true,
  showDelay = 3000
}: PopupBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!autoShow || hasShown) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasShown(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [autoShow, showDelay, hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-w-lg w-full bg-white rounded-lg overflow-hidden shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Banner content */}
        <BannerDisplay
          position={BANNER_POSITION_UUIDS.POPUP}
          className={className}
          aspectRatio="16/9"
          size="large"
          showTitle={showTitle}
          showDescription={showDescription}
          autoSlide={false}
        />
      </div>
    </div>
  );
}
