import { apiClient, ApiResponse } from './apiClient';
import { API_BASE_URL } from '../config/environment';

// Highlight interface - mapped from backend public highlights
export interface Highlight {
  id: string;
  title: string; // mapped from titleOverride
  subtitle: string | null; // mapped from subtitleOverride
  imageUrl: string | null;
  imageMode: 'COVER' | 'CONTAIN' | 'FILL' | 'NONE';
  routeOverride: string | null; // optional internal route
  redirectUrl: string | null; // optional external redirect
  isActive: boolean;
  order: number; // mapped from backend "order"
  createdAt: string;
  updatedAt: string;
}

// Public Highlights Service
class HighlightsService {
  private readonly baseEndpoint = '/api/public/highlights';

  /**
   * Fetch all active highlights from public API
   * Returns highlights ordered by order
   */
  async getActiveHighlights(): Promise<ApiResponse<Highlight[]>> {
    try {
      console.log('🔍 Fetching active highlights from public API...');
      const response = await apiClient.get<any>(this.baseEndpoint);
      
      console.log('🔍 Raw API response:', response);
      console.log('🔍 Response.data:', response.data);

      if (response.success && response.data) {
        // Backend response structure could be:
        // 1) { success: true, data: RawHighlight[] }
        // 2) { success: true, data: { items: RawHighlight[], count: number } }
        const backendData = response.data;

        if (backendData.success) {
          // Determine raw items array from either array or object with items
          const rawItems = Array.isArray(backendData.data)
            ? backendData.data
            : (backendData.data && Array.isArray(backendData.data.items))
              ? backendData.data.items
              : [];

          const mapped: Highlight[] = (rawItems as any[]).map((h) => ({
            id: h.id,
            title: h.titleOverride ?? '',
            subtitle: h.subtitleOverride ?? null,
            imageUrl: h.imageUrl ?? null,
            imageMode: h.imageMode ?? 'COVER',
            routeOverride: h.routeOverride ?? null,
            redirectUrl: h.redirectUrl ?? null,
            isActive: h.isActive ?? true,
            order: h.order ?? 0,
            createdAt: h.createdAt,
            updatedAt: h.updatedAt,
          }));

          // Normalize: filter only active items (defensive) and sort by order ascending
          const normalized = mapped
            .filter((h) => h.isActive !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          console.log(`✅ Active highlights fetched successfully: ${normalized.length} highlights`);
          return {
            success: true,
            data: normalized
          };
        } else {
          console.warn('⚠️ Backend indicated no success. Treating as empty result. Details:', backendData);
          return {
            success: true,
            data: [],
            error: backendData.message || undefined,
          };
        }
      } else {
        console.error('❌ Failed to fetch active highlights:', response.error);
        return {
          success: false,
          data: [],
          error: response.error || 'Öne çıkanlar getirilemedi'
        };
      }
    } catch (error) {
      console.error('❌ Active highlights fetch error:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Öne çıkanlar getirilemedi'
      };
    }
  }

  /**
   * Helper method to get image URL with fallback
   */
  getHighlightImageUrl(highlight: Highlight, fallbackUrl = '/images/placeholder-highlight.jpg'): string {
    const url = highlight.imageUrl;
    if (!url) {
      return fallbackUrl;
    }

    // Absolute URLs are already usable
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    // Start normalization from the given value
    let normalized = url.trim();

    // Strip any accidental origin (if saved as absolute URL but different host)
    try {
      if (/^https?:\/\//i.test(normalized)) {
        const parsed = new URL(normalized);
        normalized = parsed.pathname + (parsed.search || '');
      }
    } catch {
      // ignore URL parsing errors and continue with raw string
    }

    // Remove leading /public/ if present
    normalized = normalized.replace(/^\/public\//, '/');

    // Normalize legacy folder structures under /uploads/media/<tr-folder>/ to new top-level folders
    normalized = normalized
      .replace(/^\/uploads\/media\/bannerlar\//, '/banners/')
      .replace(/^\/public\/uploads\/media\/bannerlar\//, '/banners/')
      .replace(/^\/uploads\/media\/haberler\//, '/haberler/')
      .replace(/^\/public\/uploads\/media\/haberler\//, '/haberler/')
      .replace(/^\/uploads\/media\/projeler\//, '/projeler/')
      .replace(/^\/public\/uploads\/media\/projeler\//, '/projeler/');

    // Ensure leading slash
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }

    // Final full URL built on backend origin
    console.log(`🔗 [HIGHLIGHTS_SERVICE] API_BASE_URL: ${API_BASE_URL}, Normalized URL: ${normalized}`);
    return `${API_BASE_URL}${normalized}`;
  }

  /**
   * Helper method to get CSS classes for image mode styling
   */
  getImageModeClasses(imageMode: Highlight['imageMode']): string {
    const baseClasses = 'w-full h-full';
    
    switch (imageMode) {
      case 'COVER':
        return `${baseClasses} object-cover`;
      case 'CONTAIN':
        return `${baseClasses} object-contain`;
      case 'FILL':
        return `${baseClasses} object-fill`;
      case 'NONE':
        return `${baseClasses} object-none`;
      default:
        return `${baseClasses} object-cover`; // Default fallback
    }
  }
}

// Singleton instance
export const highlightsService = new HighlightsService();
export default highlightsService;