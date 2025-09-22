import { ServiceCard, ServiceCardsApiResponse, ClickTrackingResponse } from '../types/serviceCard';
import { API_BASE_URL } from '../config/environment';

class ServiceCardService {
  /**
   * Fetch active service cards from the backend
   */
  async getActiveServiceCards(options?: {
    featured?: boolean;
    limit?: number;
  }): Promise<ServiceCard[]> {
    try {
      const params = new URLSearchParams();
      
      if (options?.featured !== undefined) {
        params.set('featured', options.featured.toString());
      }
      
      if (options?.limit) {
        params.set('limit', options.limit.toString());
      }

      const url = `${API_BASE_URL}/api/public/hizmetlerimiz${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log('[ServiceCardService] Fetching service cards from:', url);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ServiceCardsApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch service cards');
      }

      console.log('[ServiceCardService] Successfully fetched', data.count, 'service cards');
      
      return data.data || [];
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('[ServiceCardService] Request timeout - API took too long to respond:', error);
        console.log('[ServiceCardService] Consider checking backend server status or network connectivity');
      } else {
        console.error('[ServiceCardService] Error fetching service cards:', error);
      }
      
      // Return empty array on error to prevent UI crashes
      return [];
    }
  }

  /**
   * Track a click on a service card
   */
  async trackCardClick(cardId: number): Promise<boolean> {
    try {
      const url = `${API_BASE_URL}/api/public/hizmetlerimiz/${cardId}/track-click`;
      
      console.log('[ServiceCardService] Tracking click for card:', cardId);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('[ServiceCardService] Click tracking failed with status:', response.status);
        return false;
      }

      const data: ClickTrackingResponse = await response.json();
      
      if (data.success) {
        console.log('[ServiceCardService] Click tracked successfully');
        return true;
      } else {
        console.warn('[ServiceCardService] Click tracking failed:', data.error);
        return false;
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('[ServiceCardService] Request timeout while tracking card click:', error);
        console.log('[ServiceCardService] Click tracking failed due to timeout');
      } else {
        console.error('[ServiceCardService] Error tracking card click:', error);
      }
      return false;
    }
  }

  /**
   * Get the full image URL for a service card
   */
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it starts with /, it's a relative path from the backend
    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    // Otherwise, assume it's a relative path and prepend the backend URL
    return `${API_BASE_URL}/${imageUrl}`;
  }
}

// Export a singleton instance
export const serviceCardService = new ServiceCardService();
export default serviceCardService;
