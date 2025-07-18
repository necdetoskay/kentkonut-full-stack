// Banner API servisi - Backend ile iletişim için
import { apiClient } from './apiClient';

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

  // Banner görüntülenme istatistiği kaydet
  async recordBannerView(bannerId: number): Promise<void> {
    try {
      await apiClient.post('/api/public/statistics', { bannerId, type: 'view' });
    } catch (error) {
      console.error('Banner view kaydedilirken hata:', error);
      // Sessizce devam et, kullanıcı deneyimini bozma
    }
  }

  // Banner tıklama istatistiği kaydet
  async recordBannerClick(bannerId: number): Promise<void> {
    try {
      await apiClient.post('/api/public/statistics', { bannerId, type: 'click' });
    } catch (error) {
      console.error('Banner click kaydedilirken hata:', error);
      // Sessizce devam et
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
