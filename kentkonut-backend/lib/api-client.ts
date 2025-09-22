"use client"

import { toast } from "sonner"

interface ApiClientOptions {
  baseUrl?: string
  defaultHeaders?: Record<string, string>
  onSessionExpired?: () => void
  onError?: (error: Error) => void
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private onSessionExpired?: () => void
  private onError?: (error: Error) => void

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || ''
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.defaultHeaders
    }
    this.onSessionExpired = options.onSessionExpired
    this.onError = options.onError
  }

  private async handleResponse(response: Response): Promise<Response> {
    // Check for session expiration
    if (response.status === 401) {
      toast.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.')
      this.onSessionExpired?.()
      throw new Error('Session expired')
    }

    // Check for other errors
    if (!response.ok) {
      const errorMessage = await this.extractErrorMessage(response)
      const error = new Error(errorMessage || `HTTP ${response.status}: ${response.statusText}`)
      this.onError?.(error)
      throw error
    }

    return response
  }

  private async extractErrorMessage(response: Response): Promise<string> {
    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const errorData = await response.json()
        return errorData.message || errorData.error || 'An error occurred'
      }
      return await response.text()
    } catch {
      return `HTTP ${response.status}: ${response.statusText}`
    }
  }

  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    })

    const validatedResponse = await this.handleResponse(response)
    return validatedResponse.json()
  }

  async post<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    const validatedResponse = await this.handleResponse(response)
    return validatedResponse.json()
  }

  async put<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    const validatedResponse = await this.handleResponse(response)
    return validatedResponse.json()
  }

  async patch<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    const validatedResponse = await this.handleResponse(response)
    return validatedResponse.json()
  }

  async delete<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    })

    const validatedResponse = await this.handleResponse(response)
    return validatedResponse.json()
  }

  // Upload files with session validation
  async upload<T>(url: string, formData: FormData, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      ...options,
    })

    const validatedResponse = await this.handleResponse(response)
    return validatedResponse.json()
  }
}

// Create a default instance
let defaultApiClient: ApiClient | null = null

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  return new ApiClient(options)
}

export function getDefaultApiClient(): ApiClient {
  if (!defaultApiClient) {
    defaultApiClient = new ApiClient({
      onSessionExpired: () => {
        // This will be set up in the provider
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      }
    })
  }
  return defaultApiClient
}

// Convenience functions using the default client
export const api = {
  get: <T>(url: string, options?: RequestInit) => getDefaultApiClient().get<T>(url, options),
  post: <T>(url: string, data?: any, options?: RequestInit) => getDefaultApiClient().post<T>(url, data, options),
  put: <T>(url: string, data?: any, options?: RequestInit) => getDefaultApiClient().put<T>(url, data, options),
  patch: <T>(url: string, data?: any, options?: RequestInit) => getDefaultApiClient().patch<T>(url, data, options),
  delete: <T>(url: string, options?: RequestInit) => getDefaultApiClient().delete<T>(url, options),
  upload: <T>(url: string, formData: FormData, options?: RequestInit) => getDefaultApiClient().upload<T>(url, formData, options),
}

// Hook for using API client with session validation
export function useApiClient() {
  const client = getDefaultApiClient()
  
  return {
    api: client,
    get: client.get.bind(client),
    post: client.post.bind(client),
    put: client.put.bind(client),
    patch: client.patch.bind(client),
    delete: client.delete.bind(client),
    upload: client.upload.bind(client),
  }
}
