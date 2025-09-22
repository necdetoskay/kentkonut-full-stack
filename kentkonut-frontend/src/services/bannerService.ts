// Banner API servisi - Backend ile iletişim için
import { apiClient } from './apiClient';
import { ConsentManager } from '../utils/consent';

// Banner pozisyon UUID'leri
export const BANNER_POSITION_UUIDS = {
  HERO: '550e8400-e29b-41d4-a716-446655440001',
  SIDEBAR: '550e8400-e29b-41d4-a716-446655440002',
  FOOTER: '550e8400-e29b-41d4-a716-446655440003',
  POPUP: '550e8400-e29b-41d4-a716-446655440004',
  NOTIFICATION: '550e8400-e29b-41d4-a716-446655440005'
} as const

export type BannerPositionUUID = typeof BANNER_POSITION_UUIDS[keyof typeof BANNER_POSITION_UUIDS]

export interface Banner {
  id: number;
  title: string;
  description?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  ctaLink?: string;
  link?: string; // Backend'den gelen field
  isActive: boolean; // Backend'den gelen field
  active?: boolean; // Eski field (geriye uyumluluk için)
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerGroup {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  playMode: string; // 'MANUAL' | 'AUTO'
  duration: number; // milliseconds
  transitionDuration: number; // seconds
  animation: string; // 'FADE' | 'SLIDE' | 'ZOOM'
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  banners: Banner[];
}

export interface BannerStatistics {
  id: number;
  bannerId: number;
  type: 'view' | 'click';
  createdAt: string;
}

class BannerService {
  // Aktif banner gruplarını getir (public endpoint)
  async getActiveBannerGroups(): Promise<BannerGroup[]> {
    try {
      const response = await apiClient.get<BannerGroup[]>('/api/public/banners');
      return response.data || [];
    } catch (error) {
      console.error('Aktif banner grupları alınırken hata:', error);
      throw error;
    }
  }

  // Hero banner grubunu getir (özel endpoint - Hero bileşeni için)
  async getHeroBannerGroup(): Promise<BannerGroup | null> {
    try {
      console.log('🏠 Hero banner grubu getiriliyor...');
      const response = await apiClient.get<BannerGroup>('/api/public/banners/hero');
      console.log('✅ Hero banner grubu alındı:', response.data);
      return response.data || null;
    } catch (error) {
      console.error('❌ Hero banner grubu alınırken hata:', error);
      throw error;
    }
  }

  // Banner gruplarını getir
  async getBannerGroups(): Promise<BannerGroup[]> {
    const response = await apiClient.get<BannerGroup[]>('/api/banner-groups');
    return response.data || [];
  }

  // Belirli bir banner grubunu getir
  async getBannerGroup(id: number): Promise<BannerGroup | null> {
    const response = await apiClient.get<BannerGroup>(`/api/banner-groups/${id}`);
    return response.data || null;
  }

  // Banner grup oluştur
  async createBannerGroup(data: Partial<BannerGroup>): Promise<BannerGroup | null> {
    const response = await apiClient.post<BannerGroup>('/api/banner-groups', data);
    return response.data || null;
  }

  // Banner grup güncelle
  async updateBannerGroup(id: number, data: Partial<BannerGroup>): Promise<BannerGroup | null> {
    const response = await apiClient.put<BannerGroup>(`/api/banner-groups/${id}`, data);
    return response.data || null;
  }

  // Banner grup sil
  async deleteBannerGroup(id: number): Promise<boolean> {
    const response = await apiClient.delete(`/api/banner-groups/${id}`);
    return response.success;
  }

  // Bannerları getir
  async getBanners(groupId?: number): Promise<Banner[]> {
    const endpoint = groupId ? `/api/banners?groupId=${groupId}` : '/api/banners';
    const response = await apiClient.get<Banner[]>(endpoint);
    return response.data || [];
  }

  // Belirli bir banner getir
  async getBanner(id: number): Promise<Banner | null> {
    const response = await apiClient.get<Banner>(`/api/banners/${id}`);
    return response.data || null;
  }

  // Banner oluştur
  async createBanner(data: Partial<Banner>): Promise<Banner | null> {
    const response = await apiClient.post<Banner>('/api/banners', data);
    return response.data || null;
  }

  // Banner güncelle
  async updateBanner(id: number, data: Partial<Banner>): Promise<Banner | null> {
    const response = await apiClient.put<Banner>(`/api/banners/${id}`, data);
    return response.data || null;
  }

  // Banner sil
  async deleteBanner(id: number): Promise<boolean> {
    const response = await apiClient.delete(`/api/banners/${id}`);
    return response.success;
  }

  // Banner sırasını güncelle
  async updateBannerOrder(bannerId: number, newOrder: number): Promise<boolean> {
    const response = await apiClient.put(`/api/banners/${bannerId}/order`, { order: newOrder });
    return response.success;
  }

  // Generate unique visitor and session IDs
  private getVisitorId(): string {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  // Check if analytics is enabled
  private isAnalyticsEnabled(): boolean {
    // Check environment variable or configuration
    return process.env.NODE_ENV === 'development' ||
           localStorage.getItem('analytics_enabled') !== 'false';
  }

  // Get user consent status using the ConsentManager
  private getUserConsent(): { consentGiven: boolean; dataProcessingConsent: boolean } {
    try {
      const consent = ConsentManager.getConsent();

      // Ensure both consent flags are properly set
      const consentGiven = consent.consentGiven === true;
      const dataProcessingConsent = consent.dataProcessingConsent === true;

      // If either consent is missing, disable analytics
      if (!consentGiven || !dataProcessingConsent) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Analytics disabled: User consent not granted');
        }
        return {
          consentGiven: false,
          dataProcessingConsent: false
        };
      }

      return {
        consentGiven,
        dataProcessingConsent
      };
    } catch (error) {
      // If consent manager fails, disable analytics
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics disabled: Consent manager error:', error);
      }
      return {
        consentGiven: false,
        dataProcessingConsent: false
      };
    }
  }

  // Banner görüntülenme istatistiği kaydet
  async recordBannerView(bannerId: number, engagementDuration?: number, scrollDepth?: number): Promise<void> {
    return; // ANALYTICS DISABLED
    try {
      // Check if analytics is enabled
      if (!this.isAnalyticsEnabled()) {
        return;
      }

      const consent = this.getUserConsent();

      // Don't make API call if consent is not given
      if (!consent.consentGiven || !consent.dataProcessingConsent) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Banner view tracking skipped: No user consent');
        }
        return;
      }

      const trackingData = {
        bannerId,
        eventType: 'view' as const,
        sessionId: this.getSessionId(),
        visitorId: this.getVisitorId(),
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        engagementDuration,
        scrollDepth,
        consentGiven: consent.consentGiven,
        dataProcessingConsent: consent.dataProcessingConsent
      };

      const response = await apiClient.post('/api/analytics/track', trackingData);

      if (!response.success) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Analytics tracking failed:', response.error);
        }
      }
    } catch (error) {
      // Silently handle analytics errors to not break user experience
      if (process.env.NODE_ENV === 'development') {
        console.warn('Banner view tracking failed:', error);
      }
    }
  }

  // Banner tıklama istatistiği kaydet
  async recordBannerClick(bannerId: number, clickPosition?: { x: number; y: number }): Promise<void> {
    return; // ANALYTICS DISABLED
    try {
      const consent = this.getUserConsent();

      const trackingData = {
        bannerId,
        eventType: 'click' as const,
        sessionId: this.getSessionId(),
        visitorId: this.getVisitorId(),
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        clickPosition,
        consentGiven: consent.consentGiven,
        dataProcessingConsent: consent.dataProcessingConsent
      };

      await apiClient.post('/api/analytics/track', trackingData);
    } catch (error) {
      console.error('Banner click kaydedilirken hata:', error);
      // Sessizce devam et
    }
  }

  // Banner impression istatistiği kaydet (banner yüklendiğinde)
  async recordBannerImpression(bannerId: number): Promise<void> {
    return; // ANALYTICS DISABLED
    try {
      // Check if analytics is enabled
      if (!this.isAnalyticsEnabled()) {
        return;
      }

      const consent = this.getUserConsent();

      // Don't make API call if consent is not given
      if (!consent.consentGiven || !consent.dataProcessingConsent) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Banner impression tracking skipped: No user consent');
        }
        return;
      }

      const trackingData = {
        bannerId,
        eventType: 'impression' as const,
        sessionId: this.getSessionId(),
        visitorId: this.getVisitorId(),
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        consentGiven: consent.consentGiven,
        dataProcessingConsent: consent.dataProcessingConsent
      };

      const response = await apiClient.post('/api/analytics/track', trackingData);

      if (!response.success) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Analytics tracking failed:', response.error);
        }
      }
    } catch (error) {
      // Silently handle analytics errors to not break user experience
      if (process.env.NODE_ENV === 'development') {
        console.warn('Banner impression tracking failed:', error);
      }
    }
  }

  // Aktif bannerları tarih aralığına göre filtrele
  filterActiveBanners(banners: Banner[]): Banner[] {
    const now = new Date();

    return banners.filter(banner => {
      // Aktif olmayan bannerları filtrele (hem isActive hem active field'larını kontrol et)
      if (!banner.isActive && !banner.active) return false;

      // Başlangıç tarihi kontrolü
      if (banner.startDate) {
        const startDate = new Date(banner.startDate);
        if (now < startDate) return false;
      }

      // Bitiş tarihi kontrolü
      if (banner.endDate) {
        const endDate = new Date(banner.endDate);
        if (now > endDate) return false;
      }

      return true;
    }).sort((a, b) => a.order - b.order); // Sıraya göre sırala
  }

  // UUID tabanlı banner pozisyonunu getir
  async getBannerByPosition(positionUUID: BannerPositionUUID) {
    try {
      const response = await apiClient.get(`/api/public/banners/position/${positionUUID}`)
      return response.data
    } catch (error) {
      console.error('Error fetching banner by position:', error)
      throw error
    }
  }

  // Hero banner'ı UUID ile getir
  async getHeroBannerByUUID() {
    return this.getBannerByPosition(BANNER_POSITION_UUIDS.HERO)
  }

  // Sidebar banner'ı UUID ile getir
  async getSidebarBannerByUUID() {
    return this.getBannerByPosition(BANNER_POSITION_UUIDS.SIDEBAR)
  }

  // Footer banner'ı UUID ile getir
  async getFooterBannerByUUID() {
    return this.getBannerByPosition(BANNER_POSITION_UUIDS.FOOTER)
  }

  // Popup banner'ı UUID ile getir
  async getPopupBannerByUUID() {
    return this.getBannerByPosition(BANNER_POSITION_UUIDS.POPUP)
  }

  // Notification banner'ı UUID ile getir
  async getNotificationBannerByUUID() {
    return this.getBannerByPosition(BANNER_POSITION_UUIDS.NOTIFICATION)
  }
}

// Yeni UUID tabanlı fonksiyonlar
export const getBannerByPosition = async (positionUUID: BannerPositionUUID) => {
  try {
    const response = await apiClient.get(`/api/public/banners/position/${positionUUID}`)
    return response.data
  } catch (error) {
    console.error('Error fetching banner by position:', error)
    throw error
  }
}

export const getHeroBannerByUUID = async () => {
  return getBannerByPosition(BANNER_POSITION_UUIDS.HERO)
}

export const getSidebarBannerByUUID = async () => {
  return getBannerByPosition(BANNER_POSITION_UUIDS.SIDEBAR)
}

export const getFooterBannerByUUID = async () => {
  return getBannerByPosition(BANNER_POSITION_UUIDS.FOOTER)
}

export const getPopupBannerByUUID = async () => {
  return getBannerByPosition(BANNER_POSITION_UUIDS.POPUP)
}

export const getNotificationBannerByUUID = async () => {
  return getBannerByPosition(BANNER_POSITION_UUIDS.NOTIFICATION)
}

// Singleton instance
export const bannerService = new BannerService();
export default bannerService;
