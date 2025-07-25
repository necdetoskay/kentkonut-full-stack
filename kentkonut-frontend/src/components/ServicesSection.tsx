'use client';

import React, { useState, useEffect } from 'react';
import { ServiceCard } from '../types/serviceCard';
import { serviceCardService } from '../services/serviceCardService';

// Fallback static data in case API is unavailable
const fallbackServices = [
  {
    id: 1,
    title: 'Konut Hizmetleri',
    imageSrc: '/images/services/1_24022021034916.jpg',
    color: '#4F772D'
  },
  {
    id: 2,
    title: 'Hafriyat Hizmetleri',
    imageSrc: '/images/services/2_24022021040848.jpg',
    color: '#31708E'
  },
  {
    id: 3,
    title: 'Mimari Projelendirme',
    imageSrc: '/images/services/3_24022021034931.jpg',
    color: '#5B4E77'
  },
  {
    id: 4,
    title: 'Kentsel Dönüşüm',
    imageSrc: '/images/services/4_24022021034938.jpg',
    color: '#754043'
  }
];

const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Fetch service cards on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[ServicesSection] Fetching service cards...');

        const data = await serviceCardService.getActiveServiceCards({
          // featured: true, // Get all active services for now
          limit: 4 // Limit to 4 cards for the grid
        });

        if (data && data.length > 0) {
          console.log('[ServicesSection] Successfully loaded', data.length, 'service cards');
          setServices(data);
          setUseFallback(false);
        } else {
          console.warn('[ServicesSection] No service cards received, using fallback');
          setUseFallback(true);
        }

      } catch (err) {
        console.error('[ServicesSection] Error fetching service cards:', err);
        setError('Hizmetler yüklenirken bir hata oluştu');
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Handle service card click
  const handleServiceClick = async (service: ServiceCard | any) => {
    try {
      // Track click if it's a dynamic service card (has id)
      if (service.id && !useFallback) {
        console.log('[ServicesSection] Tracking click for service:', service.title);
        await serviceCardService.trackCardClick(service.id);
      }

      // Navigate to target URL if available
      if (service.targetUrl) {
        if (service.isExternal) {
          window.open(service.targetUrl, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = service.targetUrl;
        }
      } else {
        console.log('[ServicesSection] No target URL defined for service:', service.title);
      }

    } catch (error) {
      console.error('[ServicesSection] Error handling service click:', error);
      // Don't show error to user for click tracking failures
    }
  };

  // Get image URL with proper backend URL
  const getImageUrl = (service: ServiceCard | any): string => {
    if (useFallback) {
      return service.imageSrc; // Use static path for fallback
    }
    return serviceCardService.getImageUrl(service.imageUrl);
  };

  // Get dynamic grid classes based on number of cards
  const getGridClasses = (cardCount: number): string => {
    const baseClasses = "grid gap-8";

    if (cardCount === 1) {
      // Single card - center it
      return `${baseClasses} grid-cols-1 justify-items-center max-w-sm mx-auto`;
    } else if (cardCount === 2) {
      // Two cards - center them with responsive layout
      return `${baseClasses} grid-cols-1 md:grid-cols-2 justify-items-center max-w-2xl mx-auto`;
    } else if (cardCount === 3) {
      // Three cards - responsive layout with centering
      return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center max-w-4xl mx-auto`;
    } else {
      // Four or more cards - full width layout
      return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-4`;
    }
  };

  return (
    <section className="bg-white py-16 px-4">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">HİZMETLERİMİZ</h2>
          <div className="flex items-center justify-center">
            <div className="h-1 w-20 bg-green-700"></div>
            <div className="h-1 w-10 bg-gray-300 mx-3"></div>
            <div className="h-1 w-20 bg-green-700"></div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 bg-white">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-lg font-medium">{error}</p>
              <p className="text-sm text-gray-500 mt-2">Lütfen daha sonra tekrar deneyin.</p>
            </div>
          </div>
        )}

        {/* Service Cards Grid */}
        {!loading && !error && (
          <div className={getGridClasses((useFallback ? fallbackServices : services).length)}>
            {(useFallback ? fallbackServices : services).map((service) => (
              <div
                key={service.id}
                className="services-card group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer w-full max-w-sm mx-auto"
                style={{ borderTopColor: service.color, borderTopWidth: '4px' }}
                onClick={() => handleServiceClick(service)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleServiceClick(service);
                  }
                }}
                aria-label={`${service.title} hizmetini görüntüle`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getImageUrl(service)}
                    alt={service.altText || service.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to a placeholder image if the image fails to load
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0yMDAgMTUwLTUwLTUwLTUwIDUwLTMwLTMwLTcwIDUwdjMwaDE4MHYtMzB6IiBmaWxsPSIjOWNhM2FmIi8+CjxjaXJjbGUgY3g9IjE3MCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM5Y2EzYWYiLz4KPC9zdmc+';
                    }}
                  />
                </div>
                <div className="p-6 bg-white text-center">
                  <h3
                    className="text-xl font-semibold transition-colors duration-300 group-hover:opacity-80"
                    style={{ color: service.color }}
                  >
                    {service.title}
                  </h3>
                  {service.shortDescription && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {service.shortDescription}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fallback Notice */}
        {useFallback && !loading && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              * Hizmet bilgileri yerel verilerden gösterilmektedir.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection; 