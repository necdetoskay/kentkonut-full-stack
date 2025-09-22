import { ApiClient, handleApiError } from './apiClient';

export { handleApiError };

// Legacy footer API (columns/links)
export const FooterAPI = {
  getAll: () => ApiClient.get<any[]>('/api/footer'),
  createColumn: (data: { title: string; order: number }) => ApiClient.post<any>('/api/footer', data),
  deleteColumn: (id: number) => ApiClient.delete<void>(`/api/footer?id=${id}`),
};

// New generic footer sections/items API
export const FooterSectionsAPI = {
  // Sections
  list: () => ApiClient.get<any[]>('/api/footer/sections'),
  get: (id: string) => ApiClient.get<any>(`/api/footer/sections/${id}`),
  create: (data: {
    key: string;
    title?: string | null;
    type: 'LINKS' | 'IMAGE' | 'CONTACT' | 'TEXT' | 'LEGAL';
    orientation?: 'VERTICAL' | 'HORIZONTAL';
    order?: number;
    isActive?: boolean;
    layoutConfig?: any;
  }) => ApiClient.post<any>('/api/footer/sections', data),
  update: (data: {
    id: string;
    key: string;
    title?: string | null;
    type: 'LINKS' | 'IMAGE' | 'CONTACT' | 'TEXT' | 'LEGAL';
    orientation?: 'VERTICAL' | 'HORIZONTAL';
    order?: number;
    isActive?: boolean;
    layoutConfig?: any;
  }) => ApiClient.patch<any>('/api/footer/sections', data),
  remove: (id: string) => ApiClient.delete<void>(`/api/footer/sections?id=${id}`),
  reorder: (items: Array<{ id: string; order: number }>) => ApiClient.post<void>('/api/footer/sections/reorder', { items }),

  // Items
  listItems: (sectionId: string) => ApiClient.get<any[]>(`/api/footer/items?sectionId=${sectionId}`),
  createItem: (data: {
    sectionId: string;
    type: 'LINK' | 'EMAIL' | 'PHONE' | 'ADDRESS' | 'IMAGE' | 'TEXT';
    order?: number;
    label?: string | null;
    url?: string | null;
    target?: '_self' | '_blank';
    isExternal?: boolean;
    icon?: string | null;
    imageUrl?: string | null;
    text?: string | null;
    metadata?: any;
  }) => ApiClient.post<any>('/api/footer/items', data),
  updateItem: (data: {
    id: string;
    sectionId: string;
    type: 'LINK' | 'EMAIL' | 'PHONE' | 'ADDRESS' | 'IMAGE' | 'TEXT';
    order?: number;
    label?: string | null;
    url?: string | null;
    target?: '_self' | '_blank';
    isExternal?: boolean;
    icon?: string | null;
    imageUrl?: string | null;
    text?: string | null;
    metadata?: any;
  }) => ApiClient.patch<any>('/api/footer/items', data),
  removeItem: (id: string) => ApiClient.delete<void>(`/api/footer/items?id=${id}`),
  reorderItems: (sectionId: string, items: Array<{ id: string; order: number }>) => ApiClient.post<void>('/api/footer/items/reorder', { sectionId, items }),
};
