// Corporate API Configuration and Utilities
// Centralized API management for corporate module

import { ApiResponse, ApiError } from '@/types/corporate';

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// API Error Class
export class CorporateApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public context?: any
  ) {
    super(message);
    this.name = 'CorporateApiError';
  }
}

// Enhanced fetch wrapper with error handling and retries
export async function corporateApiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📡 API Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new CorporateApiError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }
    
    const data = await response.json();
    console.log(`✅ API Success: ${endpoint}`, data);
    return data;
      } catch (error) {
    console.error(`❌ API Error: ${endpoint}`, error);
    
    // Retry logic for network errors
    if (
      retryCount < API_CONFIG.retryAttempts &&
      (error instanceof TypeError || (error as Error)?.name === 'AbortError')
    ) {
      console.log(`🔄 Retrying API call (${retryCount + 1}/${API_CONFIG.retryAttempts})`);
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return corporateApiFetch<T>(endpoint, options, retryCount + 1);
    }
    
    // Rethrow as CorporateApiError
    if (error instanceof CorporateApiError) {
      throw error;
    }
    
    throw new CorporateApiError(
      error instanceof Error ? error.message : 'Unknown API error',
      500,
      error
    );
  }
}

// Specific API functions for corporate entities
export const CorporateAPI = {
  // Executives API
  executives: {
    getAll: (filters?: { type?: string }) => {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      const query = params.toString();
      return corporateApiFetch<any[]>(`/api/executives${query ? `?${query}` : ''}`);
    },
    
    getById: (id: string) =>
      corporateApiFetch<any>(`/api/executives/${id}`),
    
    create: (data: any) =>
      corporateApiFetch<any>('/api/executives', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) =>
      corporateApiFetch<any>(`/api/executives/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      corporateApiFetch<void>(`/api/executives/${id}`, {
        method: 'DELETE',
      }),
  },

  // Quick Links API
  quickLinks: {
    getAll: () =>
      corporateApiFetch<any[]>('/api/quick-links'),
    
    getById: (id: string) =>
      corporateApiFetch<any>(`/api/quick-links/${id}`),
    
    create: (data: any) =>
      corporateApiFetch<any>('/api/quick-links', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) =>
      corporateApiFetch<any>(`/api/quick-links/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      corporateApiFetch<void>(`/api/quick-links/${id}`, {
        method: 'DELETE',
      }),
  },

  // Departments API (placeholder for future implementation)
  departments: {
    getAll: () =>
      corporateApiFetch<any[]>('/api/departments'),
    
    getById: (id: string) =>
      corporateApiFetch<any>(`/api/departments/${id}`),
    
    create: (data: any) =>
      corporateApiFetch<any>('/api/departments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) =>
      corporateApiFetch<any>(`/api/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      corporateApiFetch<void>(`/api/departments/${id}`, {
        method: 'DELETE',
      }),
  },
};

// Error handling utility
export const handleApiError = (error: unknown): { message: string; details?: any } => {
  if (error instanceof CorporateApiError) {
    return {
      message: error.message,
      details: error.context,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'Bilinmeyen bir hata oluştu',
    details: error,
  };
};

// Cache utilities
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes default TTL

  set(key: string, data: any, customTtl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string, customTtl?: number): T | null {
    const cached = this.cache.get(key);
    const ttl = customTtl || this.ttl;
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    
    this.cache.delete(key);
    return null;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const apiCache = new ApiCache();

// Cached API functions
export const CachedCorporateAPI = {
  executives: {
    getAll: async (filters?: { type?: string }) => {
      const cacheKey = `executives-${JSON.stringify(filters || {})}`;
      
      let data = apiCache.get<any[]>(cacheKey);
      if (data) {
        console.log('📦 Using cached executives data');
        return data;
      }
      
      data = await CorporateAPI.executives.getAll(filters);
      apiCache.set(cacheKey, data);
      return data;
    },
  },
  
  quickLinks: {
    getAll: async () => {
      const cacheKey = 'quickLinks';
      
      let data = apiCache.get<any[]>(cacheKey);
      if (data) {
        console.log('📦 Using cached quick links data');
        return data;
      }
      
      data = await CorporateAPI.quickLinks.getAll();
      apiCache.set(cacheKey, data);
      return data;
    },
  },
};

// Cache invalidation helpers
export const invalidateCache = {
  executives: () => {
    Object.keys(apiCache['cache']).forEach(key => {
      if (key.startsWith('executives')) {
        apiCache.delete(key);
      }
    });
  },
  
  quickLinks: () => {
    apiCache.delete('quickLinks');
  },
  
  departments: () => {
    apiCache.delete('departments');
  },
  
  all: () => {
    apiCache.clear();
  },
};
