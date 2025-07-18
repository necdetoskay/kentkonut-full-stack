import { BannerGroup } from '@/types/banner-group';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';

export const getBannerGroup = async (id: number): Promise<BannerGroup> => {
  const response = await fetch(`${API_BASE_URL}/banner-groups/${id}`);
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
