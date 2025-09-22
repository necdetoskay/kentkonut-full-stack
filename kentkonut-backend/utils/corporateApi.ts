// Corporate API Configuration and Utilities
// Centralized API management for corporate module

import { ApiResponse, ApiError } from '@/types/corporate';
import { ENV_CONFIG } from '@/config/environment';

// API Configuration
// baseUrl falls back to window.location.origin on client if env is missing
const clientOrigin = typeof window !== 'undefined' ? window.location.origin : '';
export const API_CONFIG = {
  baseUrl: ENV_CONFIG.API.BASE_URL || clientOrigin,
  timeout: ENV_CONFIG.API.TIMEOUT || 10000, // Fallback to 10 seconds
  retryAttempts: ENV_CONFIG.API.RETRY_ATTEMPTS || 3,
  retryDelay: ENV_CONFIG.API.RETRY_DELAY || 1000,
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
  // Build URL robustly (support absolute endpoints and safe relative fallback)
  const isAbsolute = /^https?:\/\//i.test(endpoint);
  const url = isAbsolute
    ? endpoint
    : `${API_CONFIG.baseUrl || ''}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  // Origin header should not be manually set; browsers manage it
    
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      ...options.headers,
    },
    credentials: 'include',
    mode: 'cors',
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
      const isJson = (response.headers.get('content-type') || '').includes('application/json');
      const errorData = isJson ? await response.json().catch(() => ({})) : await response.text().catch(() => '');
      const errorContext = typeof errorData === 'string' ? { message: errorData } : errorData;
      throw new CorporateApiError(
        (errorContext as any)?.error || (errorContext as any)?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorContext
      );
    }
    
    // Güvenli gövde işleme: 204/205 veya boş gövde durumlarında JSON parse etme
    const status = response.status;
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length');
    const isJson = contentType.includes('application/json');
    const hasBody = status !== 204 && status !== 205 && contentLength !== '0';

    let data: any = undefined as unknown as T; // void durumlar için undefined dönebilir

    if (hasBody) {
      if (isJson) {
        data = await response.json();
      } else {
        // JSON olmayan gövde - metin ya da boş dönebilir
        const text = await response.text().catch(() => '');
        try {
          // Bazı durumlarda JSON olarak gönderilmiş ama header yanlış olabilir
          data = text ? JSON.parse(text) : (undefined as unknown as T);
        } catch {
          // Metin olarak bırakalım
          data = text as unknown as T;
        }
      }
    }

    console.log(`✅ API Success: ${endpoint}`, data);
    return data as T;
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      console.error(`⏰ API Timeout: ${endpoint} - Request aborted after ${API_CONFIG.timeout}ms`);
    } else {
      console.error(`❌ API Error: ${endpoint}`, error);
    }
    
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
    
    // Special handling for AbortError
    if ((error as Error)?.name === 'AbortError') {
      throw new CorporateApiError(
        `Request timeout: API call to ${endpoint} exceeded ${API_CONFIG.timeout}ms`,
        408, // Request Timeout
        error
      );
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
      return corporateApiFetch<any[]>(`/api/yoneticiler${query ? `?${query}` : ''}`);
    },
    
    getById: (id: string) => {
      if (!id || id.trim() === '') {
        throw new CorporateApiError('Executive ID is required', 400);
      }
      return corporateApiFetch<any>(`/api/yoneticiler/${id}`);
    },
    
    create: (data: any) =>
      corporateApiFetch<any>('/api/yoneticiler', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) =>
      corporateApiFetch<any>(`/api/yoneticiler/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      corporateApiFetch<void>(`/api/yoneticiler/${id}`, {
        method: 'DELETE',
      }),

    // Executive Quick Links methods
    getQuickLinks: (executiveId: string) =>
      corporateApiFetch<any[]>(`/api/yoneticiler/${executiveId}/quick-links`),

    createQuickLink: (executiveId: string, data: any) =>
      corporateApiFetch<any>(`/api/yoneticiler/${executiveId}/quick-links`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateQuickLink: (linkId: string, data: any) =>
      corporateApiFetch<any>(`/api/yoneticiler/quick-links/${linkId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteQuickLink: (linkId: string) =>
      corporateApiFetch<void>(`/api/yoneticiler/quick-links/${linkId}`, {
        method: 'DELETE',
      }),

    reorderQuickLinks: (items: { id: string; order: number }[]) =>
      corporateApiFetch<void>('/api/yoneticiler/quick-links/reorder', {
        method: 'POST',
        body: JSON.stringify({ items }),
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

  // Corporate Content API
  content: {
    getAll: () =>
      corporateApiFetch<any[]>('/api/corporate-content'),

    getByType: (type: string) =>
      corporateApiFetch<any[]>(`/api/corporate-content/type/${type}`),

    getById: (id: string) =>
      corporateApiFetch<any>(`/api/corporate-content/${id}`),

    create: (data: any) =>
      corporateApiFetch<any>('/api/corporate-content', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      corporateApiFetch<any>(`/api/corporate-content/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      corporateApiFetch<void>(`/api/corporate-content/${id}`, {
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
