// Projects API Configuration and Utilities
// Centralized API management for projects module

import { ApiClient, CachedApiClient, handleApiError, invalidateCache } from './apiClient';

// Re-export handleApiError from apiClient
export { handleApiError };

// Projects API functions
export const ProjectsAPI = {
  // Projects CRUD operations
  getAll: (filters?: { 
    status?: string; 
    limit?: number; 
    search?: string; 
    exclude?: string;
    category?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.exclude) params.append('exclude', filters.exclude);
    if (filters?.category) params.append('category', filters.category);
    const query = params.toString();
    return ApiClient.get<any[]>(`/api/projects${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => {
    if (!id || id.trim() === '') {
      throw new Error('Project ID is required');
    }
    return ApiClient.get<any>(`/api/projects/${id}`);
  },
  
  getBySlug: (slug: string) => {
    if (!slug || slug.trim() === '') {
      throw new Error('Project slug is required');
    }
    return ApiClient.get<any>(`/api/projects/slug/${slug}`);
  },
  
  create: (data: any) =>
    ApiClient.post<any>('/api/projects', data),
    
  update: (id: string, data: any) =>
    ApiClient.put<any>(`/api/projects/${id}`, data),
    
  delete: (id: string) =>
    ApiClient.delete<void>(`/api/projects/${id}`),

  // Project statistics
  getStatistics: (projectId: string, period?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    const query = params.toString();
    return ApiClient.get<any>(`/api/projects/${projectId}/statistics${query ? `?${query}` : ''}`);
  },

  // Related projects
  getRelated: (projectId: string, limit: number = 3) => {
    const params = new URLSearchParams();
    params.append('exclude', projectId);
    params.append('limit', limit.toString());
    return ApiClient.get<any[]>(`/api/projects?${params.toString()}`);
  },
};

// Cached Projects API functions
export const CachedProjectsAPI = {
  getAll: async (filters?: { 
    status?: string; 
    limit?: number; 
    search?: string; 
    exclude?: string;
    category?: string;
  }) => {
    const cacheKey = `projects-${JSON.stringify(filters || {})}`;
    return CachedApiClient.get<any[]>('/api/projects', cacheKey);
  },
  
  getBySlug: async (slug: string) => {
    const cacheKey = `project-slug-${slug}`;
    return CachedApiClient.get<any>(`/api/projects/slug/${slug}`, cacheKey);
  },
  
  getRelated: async (projectId: string, limit: number = 3) => {
    const cacheKey = `project-related-${projectId}-${limit}`;
    const params = new URLSearchParams();
    params.append('exclude', projectId);
    params.append('limit', limit.toString());
    return CachedApiClient.get<any[]>(`/api/projects?${params.toString()}`, cacheKey);
  },
};

// Cache invalidation for projects
export const invalidateProjectsCache = {
  all: () => {
    invalidateCache.byPattern('projects');
    invalidateCache.byPattern('project-');
  },
  
  byId: (projectId: string) => {
    invalidateCache.byPattern(`project-${projectId}`);
  },
  
  bySlug: (slug: string) => {
    invalidateCache.byKey(`project-slug-${slug}`);
  },
};
