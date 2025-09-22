import { apiClient, ApiResponse } from './apiClient';

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class PageService {
  private readonly baseEndpoint = '/api/public/pages';

  async getPageBySlug(slug: string): Promise<ApiResponse<Page>> {
    try {
      console.log(`🔍 Fetching page with slug: ${slug}`);
      const response = await apiClient.get<any>(`${this.baseEndpoint}/${slug}`);
      
      if (response.success && response.data) {
        const backendData = response.data;

        if (backendData.success) {
          console.log(`✅ Page fetched successfully:`, backendData.data);
          return {
            success: true,
            data: backendData.data,
          };
        } else {
          console.warn('⚠️ Backend indicated no success. Treating as empty result. Details:', backendData);
          return {
            success: false,
            data: null,
            error: backendData.message || 'Sayfa bulunamadı.',
          };
        }
      } else {
        console.error('❌ Failed to fetch page:', response.error);
        return {
          success: false,
          data: null,
          error: response.error || 'Sayfa getirilemedi',
        };
      }
    } catch (error) {
      console.error('❌ Page fetch error:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Sayfa getirilemedi',
      };
    }
  }
}

export const pageService = new PageService();
export default pageService;
