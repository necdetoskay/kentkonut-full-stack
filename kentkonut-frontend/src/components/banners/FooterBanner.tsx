import React from 'react';
import { BannerDisplay } from '../BannerDisplay';
import { BANNER_POSITION_UUIDS } from '@/services/bannerService';

interface FooterBannerProps {
  className?: string;
  showTitle?: boolean;
  showDescription?: boolean;
}

export function FooterBanner({ 
  className = '',
  showTitle = false,
  showDescription = false 
}: FooterBannerProps) {
  return (
    <BannerDisplay
      position={BANNER_POSITION_UUIDS.FOOTER}
      className={className}
      aspectRatio="16/4"
      size="small"
      showTitle={showTitle}
      showDescription={showDescription}
      autoSlide={true}
      slideDuration={8000}
    />
  );
}
