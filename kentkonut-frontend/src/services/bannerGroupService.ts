import axios from 'axios';
import { BannerGroup } from '@/types/banner-group';
import { getApiBaseUrl } from '../config/ports';

const API_BASE_URL = getApiBaseUrl();
// API isteklerinin /api önekini kullanmasını sağla
const API_PATH = `${API_BASE_URL}/api`;

export const getBannerGroup = async (id: number): Promise<BannerGroup> => {
  const response = await fetch(`${API_PATH}/banner-groups/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch banner group');
  }
  return response.json();
};

export const getBannerGroups = async (): Promise<BannerGroup[]> => {
  const response = await fetch(`${API_BASE_URL}/banner-groups`);
  if (!response.ok) {
    throw new Error('Failed to fetch banner groups');
  }
  return response.json();
};

export const createBannerGroup = async (data: Omit<BannerGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<BannerGroup> => {
  const response = await fetch(`${API_BASE_URL}/banner-groups`, {
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
};

export const updateBannerGroup = async (id: number, data: Partial<BannerGroup>): Promise<BannerGroup> => {
  const response = await fetch(`${API_BASE_URL}/banner-groups/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update banner group');
  }
  return response.json();
};

export const deleteBannerGroup = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/banner-groups/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete banner group');
  }
};
