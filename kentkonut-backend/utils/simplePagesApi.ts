// Simple Pages API Configuration and Utilities
// Centralized API management for simple pages module

import { ApiClient, CachedApiClient, handleApiError, invalidateCache } from './apiClient';

// Simple Pages API functions
export const SimplePagesAPI = {
  // Simple Pages CRUD operations
  getAll: (filters?: { 
    status?: string; 
    limit?: number; 
    search?: string; 
    category?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    const query = params.toString();
    return ApiClient.get<any[]>(`/api/simple-pages${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => {
    if (!id || id.trim() === '') {
      throw new Error('Simple Page ID is required');
    }
    return ApiClient.get<any>(`/api/simple-pages/${id}`);
  },
  
  create: (data: any) =>
    ApiClient.post<any>('/api/simple-pages', data),
    
  update: (id: string, data: any) =>
    ApiClient.put<any>(`/api/simple-pages/${id}`, data),
    
  delete: (id: string) =>
    ApiClient.delete<void>(`/api/simple-pages/${id}`),
};

// Cached Simple Pages API functions
export const CachedSimplePagesAPI = {
  getAll: async (filters?: { 
    status?: string; 
    limit?: number; 
    search?: string; 
    category?: string;
  }) => {
    const cacheKey = `simple-pages-${JSON.stringify(filters || {})}`;
    return CachedApiClient.get<any[]>('/api/simple-pages', cacheKey);
  },
  
  getById: async (id: string) => {
    const cacheKey = `simple-page-${id}`;
    return CachedApiClient.get<any>(`/api/simple-pages/${id}`, cacheKey);
  },
};

// Cache invalidation for simple pages
export const invalidateSimplePagesCache = {
  all: () => {
    invalidateCache.byPattern('simple-pages');
    invalidateCache.byPattern('simple-page-');
  },
  
  byId: (pageId: string) => {
    invalidateCache.byKey(`simple-page-${pageId}`);
  },
};
