import React from 'react';
import { BannerDisplay } from '../BannerDisplay';
import { BANNER_POSITION_UUIDS } from '@/services/bannerService';

interface SidebarBannerProps {
  className?: string;
  showTitle?: boolean;
  showDescription?: boolean;
}

export function SidebarBanner({ 
  className = '',
  showTitle = false,
  showDescription = false 
}: SidebarBannerProps) {
  return (
    <BannerDisplay
      position={BANNER_POSITION_UUIDS.SIDEBAR}
      className={className}
      aspectRatio="4/3"
      size="medium"
      showTitle={showTitle}
      showDescription={showDescription}
      autoSlide={true}
      slideDuration={6000}
    />
  );
}
