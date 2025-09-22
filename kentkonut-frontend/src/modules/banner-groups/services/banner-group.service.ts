import { BannerGroup, CreateBannerGroupDto, UpdateBannerGroupDto } from '../types/banner-group.types';
import { getApiBaseUrl } from '../../../config/ports';

const API_BASE_URL = getApiBaseUrl();

export class BannerGroupService {
  private readonly baseUrl = `${API_BASE_URL}/api/banner-groups`;

  async findAll(): Promise<BannerGroup[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Banner grupları yüklenirken bir hata oluştu');
    }
    return response.json();
  }

  async findOne(id: number): Promise<BannerGroup> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Banner grubu yüklenirken bir hata oluştu');
    }
    return response.json();
  }

  async create(data: CreateBannerGroupDto): Promise<BannerGroup> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Banner grubu oluşturulurken bir hata oluştu');
    }

    return response.json();
  }

  async update(id: number, data: UpdateBannerGroupDto): Promise<BannerGroup> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Banner grubu güncellenirken bir hata oluştu');
    }

    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Banner grubu silinirken bir hata oluştu');
    }
  }

  async toggleStatus(id: number, isActive: boolean): Promise<BannerGroup> {
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

  // async findById(id) {
  //   const response = await fetch(`${API_BASE_URL}/banner-groups/${id}`);
  //   return response.json();
  // }
}

export const bannerGroupService = new BannerGroupService();
