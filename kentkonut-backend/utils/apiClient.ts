// General API Client for all modules
// Centralized API management for the entire application

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
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public context?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Enhanced fetch wrapper with error handling and retries
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  // Build URL robustly (support absolute endpoints and safe relative fallback)
  const isAbsolute = /^https?:\/\//i.test(endpoint);
  const url = isAbsolute
    ? endpoint
    : `${API_CONFIG.baseUrl || ''}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
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
      const context = typeof errorData === 'string' ? { message: errorData } : errorData;
      throw new ApiError(
        (context as any)?.error || (context as any)?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        context
      );
    }

    // Graceful body handling for 204/205 and empty responses
    const status = response.status;
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length');
    const isJson = contentType.includes('application/json');
    const hasBody = status !== 204 && status !== 205 && contentLength !== '0';

    let data: any = undefined as unknown as T;
    if (hasBody) {
      if (isJson) {
        data = await response.json();
      } else {
        const text = await response.text().catch(() => '');
        try {
          data = text ? JSON.parse(text) : (undefined as unknown as T);
        } catch {
          data = text as unknown as T;
        }
      }
    }

    console.log(`✅ API Success: ${endpoint}`, data);
    return data as T;
  } catch (error) {
    console.error(`❌ API Error: ${endpoint}`, error);
    
    // Retry logic for network errors
    if (
      retryCount < API_CONFIG.retryAttempts &&
      (error instanceof TypeError || (error as Error)?.name === 'AbortError')
    ) {
      console.log(`🔄 Retrying API call (${retryCount + 1}/${API_CONFIG.retryAttempts})`);
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return apiFetch<T>(endpoint, options, retryCount + 1);
    }
    
    // Rethrow as ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown API error',
      500,
      error
    );
  }
}

// Generic API functions for all modules
export const ApiClient = {
  // Generic CRUD operations
  get: <T>(endpoint: string) => apiFetch<T>(endpoint),
  
  post: <T>(endpoint: string, data: any) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  put: <T>(endpoint: string, data: any) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  patch: <T>(endpoint: string, data: any) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, {
      method: 'DELETE',
    }),

  // File upload
  upload: <T>(endpoint: string, formData: FormData) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
      },
    }),
};

// Error handling utility
export const handleApiError = (error: unknown): { message: string; details?: any } => {
  if (error instanceof ApiError) {
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
export const CachedApiClient = {
  get: async <T>(endpoint: string, cacheKey?: string) => {
    const key = cacheKey || endpoint;
    
    let data = apiCache.get<T>(key);
    if (data) {
      console.log('📦 Using cached data for:', endpoint);
      return data;
    }
    
    data = await ApiClient.get<T>(endpoint);
    apiCache.set(key, data);
    return data;
  },
};

// Cache invalidation helpers
export const invalidateCache = {
  byKey: (key: string) => apiCache.delete(key),
  byPattern: (pattern: string) => {
    Object.keys(apiCache['cache']).forEach(key => {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    });
  },
  all: () => apiCache.clear(),
};
