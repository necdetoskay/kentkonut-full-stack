import { Banner, CreateBannerDto, UpdateBannerDto } from '../types/banner.types';
import { getApiBaseUrl } from '../../../config/ports';

// API Base URL tanımı
const API_BASE_URL = getApiBaseUrl();

export class BannerService {
  private readonly baseUrl = `${API_BASE_URL}/api/banners`;

  async findAllByGroupId(groupId: number): Promise<Banner[]> {
    const response = await fetch(`${this.baseUrl}?bannerGroupId=${groupId}`);
    if (!response.ok) {
      throw new Error('Bannerlar yüklenirken bir hata oluştu');
    }
    const result = await response.json();

    // Handle backend response format and map field names
    if (result.success && result.data) {
      return result.data.map((banner: any) => ({
        ...banner,
        targetUrl: banner.link || '', // Map link to targetUrl
        displayOrder: banner.order || 0, // Map order to displayOrder
      }));
    }

    return [];
  }

  async findOne(id: number): Promise<Banner> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Banner yüklenirken bir hata oluştu');
    }
    const result = await response.json();

    // Handle backend response format and map field names
    if (result.success && result.banner) {
      const banner = result.banner;
      return {
        ...banner,
        targetUrl: banner.link || '', // Map link to targetUrl
        displayOrder: banner.order || 0, // Map order to displayOrder
      };
    }

    throw new Error('Banner bulunamadı');
  }

  async create(data: CreateBannerDto): Promise<Banner> {
    // Map frontend field names to backend field names
    const backendData = {
      ...data,
      link: data.targetUrl || '', // Map targetUrl to link
      order: data.displayOrder || 0, // Map displayOrder to order
    };

    // Remove frontend-specific fields
    delete (backendData as any).targetUrl;
    delete (backendData as any).displayOrder;

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Banner oluşturulurken bir hata oluştu');
    }

    const result = await response.json();

    // Handle backend response format and map field names back
    if (result.success && result.data) {
      const banner = result.data;
      return {
        ...banner,
        targetUrl: banner.link || '', // Map link back to targetUrl
        displayOrder: banner.order || 0, // Map order back to displayOrder
      };
    }

    throw new Error('Banner oluşturulamadı');
  }

  async update(id: number, data: UpdateBannerDto): Promise<Banner> {
    // Map frontend field names to backend field names
    const backendData = {
      ...data,
      link: data.targetUrl || '', // Map targetUrl to link
      order: data.displayOrder || 0, // Map displayOrder to order
    };

    // Remove frontend-specific fields
    delete (backendData as any).targetUrl;
    delete (backendData as any).displayOrder;

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Banner güncellenirken bir hata oluştu');
    }

    const result = await response.json();

    // Handle backend response format and map field names back
    if (result.success && result.data) {
      const banner = result.data;
      return {
        ...banner,
        targetUrl: banner.link || '', // Map link back to targetUrl
        displayOrder: banner.order || 0, // Map order back to displayOrder
      };
    }

    throw new Error('Banner güncellenemedi');
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Banner silinirken bir hata oluştu');
    }
  }

  async toggleStatus(id: number, isActive: boolean): Promise<Banner> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Durum güncellenirken bir hata oluştu');
    }

    return response.json();
  }
}

export const bannerService = new BannerService();
