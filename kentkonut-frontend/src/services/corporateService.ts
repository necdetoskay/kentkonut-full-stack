import { apiClient, ApiResponse } from './apiClient';

// Corporate Card Types (matching backend Prisma model)
export interface CorporateCard {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  displayOrder: number;
  isActive: boolean;
  targetUrl?: string;
  openInNewTab: boolean;
  content?: any;
  customData?: any;
  imagePosition: string;
  cardSize: string;
  borderRadius: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Layout Settings Types
export interface LayoutSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'select';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedLayoutSettings {
  cardsPerRow: number;
  maxCardsPerPage: number;
  cardSpacing: 'small' | 'medium' | 'large';
  responsiveBreakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  showPagination: boolean;
  cardsAnimation: 'none' | 'fade' | 'slide';
}

export interface LayoutSettingsResponse {
  raw: LayoutSetting[];
  parsed: ParsedLayoutSettings;
}

// Corporate Service Class
class CorporateService {
  private readonly baseEndpoint = '/api/admin/kurumsal';

  /**
   * Fetch all corporate cards
   */
  async getCorporateCards(): Promise<ApiResponse<CorporateCard[]>> {
    try {
      console.log('🔍 Fetching corporate cards...');
      const response = await apiClient.get(`${this.baseEndpoint}/kartlar`);

      if (response.success && response.data) {
        // Handle nested response structure
        const cards = response.data.data || response.data;
        console.log('✅ Corporate cards fetched successfully:', cards.length, 'cards');
        return {
          success: true,
          data: cards
        };
      } else {
        console.error('❌ Failed to fetch corporate cards:', response.error);
        return {
          success: false,
          error: response.error || 'Failed to fetch corporate cards'
        };
      }
    } catch (error) {
      console.error('❌ Corporate cards fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch corporate cards'
      };
    }
  }

  /**
   * Fetch layout settings
   */
  async getLayoutSettings(): Promise<ApiResponse<LayoutSettingsResponse>> {
    try {
      console.log('🔍 Fetching layout settings...');
      
      // Try main endpoint first, fallback to simple endpoint
      let response = await apiClient.get(`${this.baseEndpoint}/layout-settings`);

      if (!response.success) {
        console.log('⚠️ Main layout settings endpoint failed, trying simple endpoint...');
        response = await apiClient.get(`${this.baseEndpoint}/layout-settings-simple`);
      }

      if (response.success && response.data) {
        console.log('✅ Layout settings fetched successfully');
        // Handle nested response structure
        const layoutData = response.data.data || response.data;
        return {
          success: true,
          data: layoutData
        };
      } else {
        console.error('❌ Failed to fetch layout settings:', response.error);
        
        // Return default settings as fallback
        const defaultSettings: LayoutSettingsResponse = {
          raw: [],
          parsed: {
            cardsPerRow: 3,
            maxCardsPerPage: 12,
            cardSpacing: 'medium',
            responsiveBreakpoints: {
              mobile: 1,
              tablet: 2,
              desktop: 3
            },
            showPagination: true,
            cardsAnimation: 'fade'
          }
        };
        
        return {
          success: true,
          data: defaultSettings,
          message: 'Using default layout settings'
        };
      }
    } catch (error) {
      console.error('❌ Layout settings fetch error:', error);
      
      // Return default settings on error
      const defaultSettings: LayoutSettingsResponse = {
        raw: [],
        parsed: {
          cardsPerRow: 3,
          maxCardsPerPage: 12,
          cardSpacing: 'medium',
          responsiveBreakpoints: {
            mobile: 1,
            tablet: 2,
            desktop: 3
          },
          showPagination: true,
          cardsAnimation: 'fade'
        }
      };
      
      return {
        success: true,
        data: defaultSettings,
        message: 'Using default layout settings due to error'
      };
    }
  }

  /**
   * Get corporate card by ID
   */
  async getCorporateCard(id: string): Promise<ApiResponse<CorporateCard>> {
    try {
      console.log('🔍 Fetching corporate card:', id);
      const response = await apiClient.get<CorporateCard>(`${this.baseEndpoint}/kartlar/${id}`);
      
      if (response.success && response.data) {
        console.log('✅ Corporate card fetched successfully');
        return response;
      } else {
        console.error('❌ Failed to fetch corporate card:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Corporate card fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch corporate card'
      };
    }
  }
}

// Export singleton instance
export const corporateService = new CorporateService();
export default corporateService;
