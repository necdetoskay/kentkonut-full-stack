import { BannerGroup, CreateBannerGroupDto, UpdateBannerGroupDto } from '../types/banner-group.types';
import { getApiBaseUrl } from '../../../config/ports';

const API_BASE_URL = getApiBaseUrl();

class BannerGroupService {
  private readonly baseUrl = `${API_BASE_URL}/banner-groups`;

  async getAll(): Promise<BannerGroup[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch banner groups');
    }
    return response.json();
  }

  async getById(id: number): Promise<BannerGroup> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch banner group with id ${id}`);
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
      throw new Error('Failed to create banner group');
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
      throw new Error(`Failed to update banner group with id ${id}`);
    }

    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete banner group with id ${id}`);
    }
  }
}

export const bannerGroupService = new BannerGroupService();
