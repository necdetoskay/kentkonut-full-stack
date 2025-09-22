// Highlights API - Admin module service layer
// Mirrors patterns from SimplePagesAPI with admin endpoints and response normalization

import { ApiClient, CachedApiClient, invalidateCache } from './apiClient'
export { handleApiError } from './apiClient'

export type HighlightSourceType =
  | 'PRESIDENT'
  | 'GENERAL_MANAGER'
  | 'DEPARTMENTS'
  | 'MISSION'
  | 'VISION'
  | 'CUSTOM'

export type HighlightImageMode = 'AUTO' | 'CUSTOM'

export interface Highlight {
  id: string
  order: number
  isActive: boolean
  sourceType: HighlightSourceType
  sourceRefId?: string | null
  titleOverride?: string | null
  subtitleOverride?: string | null
  imageMode: HighlightImageMode
  imageUrl?: string | null
  routeOverride?: string | null
  createdAt: string
  updatedAt: string
}

export interface HighlightListResponse {
  success: boolean
  data: { items: Highlight[]; count: number }
  message?: string
}

export interface HighlightItemResponse {
  success: boolean
  data: Highlight
  message?: string
}

export type HighlightsListFilters = {
  includeInactive?: boolean
  search?: string
  orderBy?: 'order' | 'createdAt' | 'updatedAt' | 'sourceType' | 'isActive'
  orderDirection?: 'asc' | 'desc'
}

export const HighlightsAPI = {
  getAll: async (filters?: HighlightsListFilters): Promise<{ items: Highlight[]; count: number }> => {
    const params = new URLSearchParams()
    if (filters?.includeInactive) params.append('includeInactive', 'true')
    if (filters?.search) params.append('search', filters.search)
    if (filters?.orderBy) params.append('orderBy', filters.orderBy)
    if (filters?.orderDirection) params.append('orderDirection', filters.orderDirection)
    const query = params.toString()

    const res = await ApiClient.get<HighlightListResponse>(`/api/admin/highlights${query ? `?${query}` : ''}`)
    return res.data
  },

  getById: async (id: string): Promise<Highlight> => {
    if (!id || id.trim() === '') throw new Error('Highlight ID is required')
    const res = await ApiClient.get<HighlightItemResponse>(`/api/admin/highlights/${id}`)
    return res.data
  },

  create: async (data: Partial<Highlight>): Promise<Highlight> => {
    const res = await ApiClient.post<HighlightItemResponse>('/api/admin/highlights', data)
    // Invalidate list caches
    invalidateHighlightsCache.all()
    return res.data
  },

  update: async (id: string, data: Partial<Highlight>): Promise<Highlight> => {
    const res = await ApiClient.patch<HighlightItemResponse>(`/api/admin/highlights/${id}`, data)
    invalidateHighlightsCache.byId(id)
    invalidateHighlightsCache.all()
    return res.data
  },

  delete: async (id: string): Promise<{ deletedId: string }> => {
    const res = await ApiClient.delete<{ success: boolean; data: { deletedId: string } }>(`/api/admin/highlights/${id}`)
    invalidateHighlightsCache.byId(id)
    invalidateHighlightsCache.all()
    return res.data
  },

  reorder: async (payload: { items: Array<{ id: string; order: number }> }): Promise<{ updated: number } | void> => {
    // Post reorder payload and invalidate caches
    const res = await ApiClient.post<{ success: boolean; data?: { updated: number } }>(
      '/api/admin/highlights/reorder',
      payload
    )
    invalidateHighlightsCache.all()
    return res.data?.data
  },
}

export const CachedHighlightsAPI = {
  getAll: async (filters?: HighlightsListFilters): Promise<{ items: Highlight[]; count: number }> => {
    const cacheKey = `highlights-${JSON.stringify(filters || {})}`
    const res = await CachedApiClient.get<HighlightListResponse>(`/api/admin/highlights${(() => {
      const p = new URLSearchParams()
      if (filters?.includeInactive) p.append('includeInactive', 'true')
      if (filters?.search) p.append('search', filters.search)
      if (filters?.orderBy) p.append('orderBy', filters.orderBy)
      if (filters?.orderDirection) p.append('orderDirection', filters.orderDirection)
      const q = p.toString()
      return q ? `?${q}` : ''
    })()}`, cacheKey)
    return res.data
  },

  getById: async (id: string): Promise<Highlight> => {
    const cacheKey = `highlight-${id}`
    const res = await CachedApiClient.get<HighlightItemResponse>(`/api/admin/highlights/${id}`, cacheKey)
    return res.data
  },
}

export const invalidateHighlightsCache = {
  all: () => {
    invalidateCache.byPattern('highlights-')
    invalidateCache.byPattern('highlight-')
  },
  byId: (id: string) => invalidateCache.byKey(`highlight-${id}`),
}