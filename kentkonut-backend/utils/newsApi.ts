// News API Configuration and Utilities
// Centralized API management for news module

import { ApiClient, CachedApiClient, handleApiError, invalidateCache } from './apiClient';

// News API functions
export const NewsAPI = {
  // News CRUD operations
  getAll: (filters?: { category?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return ApiClient.get<any[]>(`/api/news${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => {
    if (!id || id.trim() === '') {
      throw new Error('News ID is required');
    }
    return ApiClient.get<any>(`/api/news/${id}`);
  },
  
  create: (data: any) =>
    ApiClient.post<any>('/api/news', data),
    
  update: (id: string, data: any) =>
    ApiClient.put<any>(`/api/news/${id}`, data),
    
  delete: (id: string) =>
    ApiClient.delete<void>(`/api/news/${id}`),

  // News categories
  getCategories: () =>
    ApiClient.get<any[]>('/api/news-categories'),
    
  createCategory: (data: any) =>
    ApiClient.post<any>('/api/news-categories', data),
    
  updateCategory: (id: string, data: any) =>
    ApiClient.put<any>(`/api/news-categories/${id}`, data),
    
  deleteCategory: (id: string) =>
    ApiClient.delete<void>(`/api/news-categories/${id}`),
};

// Cached News API functions
export const CachedNewsAPI = {
  getAll: async (filters?: { category?: string; status?: string }) => {
    const cacheKey = `news-${JSON.stringify(filters || {})}`;
    return CachedApiClient.get<any[]>('/api/news', cacheKey);
  },
  
  getCategories: async () => {
    return CachedApiClient.get<any[]>('/api/news-categories', 'news-categories');
  },
};

// Cache invalidation for news
export const invalidateNewsCache = {
  all: () => {
    invalidateCache.byPattern('news');
  },
  
  byCategory: (categoryId: string) => {
    invalidateCache.byPattern(`news-${categoryId}`);
  },
};
