// Pages API Configuration and Utilities
// Centralized API management for pages module

import { ApiClient, CachedApiClient, handleApiError, invalidateCache } from './apiClient';

// Pages API functions
export const PagesAPI = {
  // Pages CRUD operations
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
    return ApiClient.get<any[]>(`/api/pages${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => {
    if (!id || id.trim() === '') {
      throw new Error('Page ID is required');
    }
    return ApiClient.get<any>(`/api/pages/${id}`);
  },
  
  create: (data: any) =>
    ApiClient.post<any>('/api/pages', data),
    
  update: (id: string, data: any) =>
    ApiClient.put<any>(`/api/pages/${id}`, data),
    
  delete: (id: string) =>
    ApiClient.delete<void>(`/api/pages/${id}`),

  // Page content operations
  getContent: (pageId: string) =>
    ApiClient.get<any[]>(`/api/page-contents?pageId=${pageId}`),
    
  createContent: (data: any) =>
    ApiClient.post<any>('/api/page-contents', data),
    
  updateContent: (contentId: string, data: any) =>
    ApiClient.put<any>(`/api/page-contents/${contentId}`, data),
    
  deleteContent: (contentId: string) =>
    ApiClient.delete<void>(`/api/page-contents/${contentId}`),

  // Bulk content operations
  bulkUpdateContent: (data: any) =>
    ApiClient.post<any>('/api/page-contents/bulk', data),

  // Page statistics
  getStatistics: (pageId: string, days?: string) => {
    const params = new URLSearchParams();
    if (days) params.append('days', days);
    const query = params.toString();
    return ApiClient.get<any>(`/api/pages/${pageId}/statistics${query ? `?${query}` : ''}`);
  },
};

// Cached Pages API functions
export const CachedPagesAPI = {
  getAll: async (filters?: { 
    status?: string; 
    limit?: number; 
    search?: string; 
    category?: string;
  }) => {
    const cacheKey = `pages-${JSON.stringify(filters || {})}`;
    return CachedApiClient.get<any[]>('/api/pages', cacheKey);
  },
  
  getById: async (id: string) => {
    const cacheKey = `page-${id}`;
    return CachedApiClient.get<any>(`/api/pages/${id}`, cacheKey);
  },
  
  getContent: async (pageId: string) => {
    const cacheKey = `page-content-${pageId}`;
    return CachedApiClient.get<any[]>(`/api/page-contents?pageId=${pageId}`, cacheKey);
  },
};

// Cache invalidation for pages
export const invalidatePagesCache = {
  all: () => {
    invalidateCache.byPattern('pages');
    invalidateCache.byPattern('page-');
  },
  
  byId: (pageId: string) => {
    invalidateCache.byKey(`page-${pageId}`);
    invalidateCache.byKey(`page-content-${pageId}`);
  },
  
  content: (pageId: string) => {
    invalidateCache.byKey(`page-content-${pageId}`);
  },
};
