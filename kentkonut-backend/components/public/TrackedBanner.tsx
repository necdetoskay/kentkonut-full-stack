'use client'

import React, { useEffect, useRef, useState } from 'react';
import { getBannerTracker, initializeBannerTracking } from '@/lib/analytics/BannerTracker';

interface TrackedBannerProps {
  banner: {
    id: number;
    title: string;
    imageUrl: string;
    altText?: string;
    link?: string;
    startDate?: string;
    endDate?: string;
  };
  campaignId?: string;
  className?: string;
  trackingEnabled?: boolean;
  onConversionTrack?: (bannerId: number, conversionData: any) => void;
}

export function TrackedBanner({ 
  banner, 
  campaignId, 
  className, 
  trackingEnabled = true,
  onConversionTrack 
}: TrackedBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [tracker, setTracker] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!trackingEnabled || typeof window === 'undefined') return;

    // Initialize tracker if not already done
    let bannerTracker = getBannerTracker();
    if (!bannerTracker) {
      bannerTracker = initializeBannerTracking({
        debug: process.env.NODE_ENV === 'development',
        consentRequired: true
      });
    }

    setTracker(bannerTracker);

    // Track impression when component mounts and banner is valid
    if (bannerTracker && bannerRef.current && isBannerActive()) {
      bannerTracker.trackImpression(banner.id, bannerRef.current);
    }

    // Cleanup function
    return () => {
      // Cleanup is handled by the tracker itself
    };
  }, [banner.id, trackingEnabled]);

  // Check if banner should be displayed based on date range
  const isBannerActive = (): boolean => {
    const now = new Date();
    
    if (banner.startDate) {
      const startDate = new Date(banner.startDate);
      if (now < startDate) return false;
    }
    
    if (banner.endDate) {
      const endDate = new Date(banner.endDate);
      if (now > endDate) return false;
    }
    
    return true;
  };

  const handleClick = (event: React.MouseEvent) => {
    if (!trackingEnabled || !tracker) return;

    // Track click
    tracker.trackClick(banner.id, event.nativeEvent);

    // Handle navigation
    if (banner.link) {
      // Allow default navigation or handle programmatically
      if (event.ctrlKey || event.metaKey) {
        // Let browser handle new tab
        return;
      }
      
      // Optional: Add delay for tracking
      event.preventDefault();
      setTimeout(() => {
        window.location.href = banner.link!;
      }, 100);
    }
  };

  const handleConversion = (conversionData: any) => {
    if (!trackingEnabled || !tracker) return;

    tracker.trackConversion(banner.id, conversionData);
    
    if (onConversionTrack) {
      onConversionTrack(banner.id, conversionData);
    }
  };

  // Don't render if banner is not active
  if (!isBannerActive()) {
    return null;
  }

  return (
    <div
      ref={bannerRef}
      data-banner-id={banner.id}
      data-campaign-id={campaignId}
      className={`banner-container ${className || ''} ${!trackingEnabled ? 'tracking-disabled' : ''}`}
      onClick={handleClick}
      style={{ 
        cursor: banner.link ? 'pointer' : 'default',
        position: 'relative'
      }}
    >
      <img
        src={banner.imageUrl}
        alt={banner.altText || banner.title}
        className="banner-image w-full h-auto"
        loading="lazy"
        onLoad={() => setIsVisible(true)}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {/* Debug overlay for development */}
      {process.env.NODE_ENV === 'development' && trackingEnabled && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-bl">
          ID: {banner.id}
          {campaignId && <div>Campaign: {campaignId}</div>}
        </div>
      )}
    </div>
  );
}

// Higher-order component for adding tracking to existing banner components
export function withBannerTracking<T extends { banner: any }>(
  WrappedComponent: React.ComponentType<T>
) {
  return function TrackedComponent(props: T) {
    const bannerRef = useRef<HTMLDivElement>(null);
    const [tracker, setTracker] = useState<any>(null);

    useEffect(() => {
      if (typeof window === 'undefined') return;

      // Initialize tracker
      let bannerTracker = getBannerTracker();
      if (!bannerTracker) {
        bannerTracker = initializeBannerTracking({
          debug: process.env.NODE_ENV === 'development'
        });
      }

      setTracker(bannerTracker);

      // Track impression
      if (bannerTracker && bannerRef.current && props.banner?.id) {
        bannerTracker.trackImpression(props.banner.id, bannerRef.current);
      }
    }, [props.banner?.id]);

    return (
      <div ref={bannerRef} data-banner-id={props.banner?.id}>
        <WrappedComponent {...props} />
      </div>
    );
  };
}

// Hook for manual tracking control
export function useBannerTracking(bannerId: number) {
  const [tracker, setTracker] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bannerTracker = getBannerTracker();
    if (!bannerTracker) {
      bannerTracker = initializeBannerTracking();
    }

    setTracker(bannerTracker);
  }, []);

  const trackImpression = (element: HTMLElement) => {
    if (tracker) {
      tracker.trackImpression(bannerId, element);
    }
  };

  const trackClick = (event: MouseEvent) => {
    if (tracker) {
      tracker.trackClick(bannerId, event);
    }
  };

  const trackConversion = (conversionData: any) => {
    if (tracker) {
      tracker.trackConversion(bannerId, conversionData);
    }
  };

  return {
    tracker,
    trackImpression,
    trackClick,
    trackConversion
  };
}

// Consent management component
export function BannerTrackingConsent() {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const consent = localStorage.getItem('analytics_consent');
    if (consent === null) {
      setShowBanner(true);
    } else {
      setConsentGiven(consent === 'granted');
    }
  }, []);

  const handleConsent = (granted: boolean) => {
    setConsentGiven(granted);
    setShowBanner(false);
    
    localStorage.setItem('analytics_consent', granted ? 'granted' : 'denied');
    
    // Update tracker consent
    const tracker = getBannerTracker();
    if (tracker) {
      tracker.setConsent(granted);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Analytics Cookies</h3>
          <p className="text-sm text-gray-300">
            We use analytics cookies to improve your experience and understand how our banners perform. 
            Your data is anonymized and used only for analytics purposes.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleConsent(false)}
            className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleConsent(true)}
            className="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
