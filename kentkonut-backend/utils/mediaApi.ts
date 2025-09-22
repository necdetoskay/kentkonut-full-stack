// Media API Configuration and Utilities
// Centralized API management for media module

import { ApiClient, CachedApiClient, handleApiError, invalidateCache } from './apiClient';

// Media API functions
export const MediaAPI = {
  // Media CRUD operations
  getAll: (filters?: { category?: string; type?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    const query = params.toString();
    return ApiClient.get<any[]>(`/api/media${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => {
    if (!id || id.trim() === '') {
      throw new Error('Media ID is required');
    }
    return ApiClient.get<any>(`/api/media/${id}`);
  },
  
  create: (data: any) =>
    ApiClient.post<any>('/api/media', data),
    
  update: (id: string, data: any) =>
    ApiClient.put<any>(`/api/media/${id}`, data),
    
  delete: (id: string) =>
    ApiClient.delete<void>(`/api/media/${id}`),

  // Media categories
  getCategories: () =>
    ApiClient.get<any[]>('/api/media-categories'),
    
  createCategory: (data: any) =>
    ApiClient.post<any>('/api/media-categories', data),
    
  updateCategory: (id: string, data: any) =>
    ApiClient.put<any>(`/api/media-categories/${id}`, data),
    
  deleteCategory: (id: string) =>
    ApiClient.delete<void>(`/api/media-categories/${id}`),

  // File upload
  upload: (formData: FormData) =>
    ApiClient.upload<any>('/api/upload', formData),
    
  uploadSimple: (formData: FormData) =>
    ApiClient.upload<any>('/api/upload-simple', formData),
    
  uploadAdvanced: (formData: FormData) =>
    ApiClient.upload<any>('/api/advanced-media', formData),
};

// Cached Media API functions
export const CachedMediaAPI = {
  getAll: async (filters?: { category?: string; type?: string }) => {
    const cacheKey = `media-${JSON.stringify(filters || {})}`;
    return CachedApiClient.get<any[]>('/api/media', cacheKey);
  },
  
  getCategories: async () => {
    return CachedApiClient.get<any[]>('/api/media-categories', 'media-categories');
  },
};

// Cache invalidation for media
export const invalidateMediaCache = {
  all: () => {
    invalidateCache.byPattern('media');
  },
  
  byCategory: (categoryId: string) => {
    invalidateCache.byPattern(`media-${categoryId}`);
  },
};
