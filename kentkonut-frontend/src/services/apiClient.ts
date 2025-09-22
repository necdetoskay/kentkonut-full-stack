// Genel API client servisi
// Tüm backend API çağrıları için kullanılacak

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

import { API_BASE_URL } from '../config/environment';

class ApiClient {
  private baseUrl: string;
  
  constructor() {
    // Environment-based API URL
    this.baseUrl = API_BASE_URL;
    console.log('API Client using URL:', this.baseUrl);
  }

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    
    const url = `${this.baseUrl}${endpoint}`;
    console.log('API Request URL:', url);
    
    const currentUrl = window.location.origin;
    console.log('Current origin:', currentUrl);
    
    // Dinamik header oluşturma (FormData için Content-Type set etme!)
    const baseHeaders: HeadersInit = {
      Accept: 'application/json; charset=utf-8',
      Referer: currentUrl,
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData) && !('Content-Type' in (baseHeaders as any))) {
      (baseHeaders as any)['Content-Type'] = 'application/json; charset=utf-8';
    }

    const config: RequestInit = {
      credentials: 'include', // Cookie tabanlı auth için
      mode: 'cors',
      ...options,
      headers: baseHeaders,
    };

    try {
      if (import.meta.env.MODE === 'development') {
        console.log('🚀 API REQUEST BAŞLADI');
        console.log(`📍 Method: ${config.method || 'GET'}`);
        console.log(`🌐 URL: ${url}`);
        console.log('📋 Config:', config);
        console.log('🔧 Headers:', config.headers);
      }

      console.log('📡 fetch() çağrılıyor...');
      const response = await fetch(url, config);
      
      console.log('📥 FETCH YANITI ALINDI:');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!response.ok) {
        // Handle different error types
        let errorMessage = `HTTP ${response.status}`;

        try {
          if (isJson) {
            const errorData = await response.json();
            errorMessage = (errorData && (errorData.message || errorData.error)) || errorMessage;
          } else {
            const text = await response.text();
            if (text) errorMessage = text;
          }
        } catch {
          // If response is not JSON or body empty, use status text
          errorMessage = response.statusText || errorMessage;
        }

        // Log only in development to avoid console spam
        if (import.meta.env.MODE === 'development') {
          console.warn(`API Error [${response.status}] ${endpoint}:`, errorMessage);
        }

        throw new Error(errorMessage);
      }

      // Başarılı yanıtlar için: 204/205 veya boş gövdeyi JSON parse etme
      const status = response.status;
      const contentLength = response.headers.get('content-length');
      const hasBody = status !== 204 && status !== 205 && contentLength !== '0';

      let data: any = null;
      if (hasBody && isJson) {
        console.log('📄 JSON parsing başlıyor...');
        data = await response.json();
        console.log('✅ JSON BAŞARIYLA PARSE EDİLDİ:');
        console.log('Parsed data:', data);
      } else {
        console.log('ℹ️ Boş veya JSON olmayan yanıt gövdesi. data=null olarak ayarlanıyor.');
      }
      
      const result = {
        data,
        success: true,
      };
      
      console.log('🎯 FINAL RETURN OBJECT:');
      console.log('Result:', result);
      
      return result;
    } catch (error) {
      // Only log in development mode for non-analytics endpoints
      if (import.meta.env.MODE === 'development' && !endpoint.includes('/analytics/')) {
        console.error(`API Request failed for ${endpoint}:`, error);
      }

      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // GET request
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // UPLOAD (FormData) request
  async upload<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData, // Content-Type fetch tarafından otomatik ayarlanır (boundary ile)
      // headers: Content-Type burada BİLİNÇLİ OLARAK set edilmiyor!
    });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
