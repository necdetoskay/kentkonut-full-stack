import { Banner, CreateBannerDto, UpdateBannerDto } from '../types/banner.types';

// API Base URL tanımı
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';

export class BannerService {
  private readonly baseUrl = `${API_BASE_URL}/api/banners`;

  async findAllByGroupId(groupId: number): Promise<Banner[]> {
    const response = await fetch(`${this.baseUrl}?bannerGroupId=${groupId}`);
    if (!response.ok) {
      throw new Error('Bannerlar yüklenirken bir hata oluştu');
    }
    return response.json();
  }

  async findOne(id: number): Promise<Banner> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Banner yüklenirken bir hata oluştu');
    }
    return response.json();
  }

  async create(data: CreateBannerDto): Promise<Banner> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Banner oluşturulurken bir hata oluştu');
    }

    return response.json();
  }

  async update(id: number, data: UpdateBannerDto): Promise<Banner> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Banner güncellenirken bir hata oluştu');
    }

    return response.json();
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
