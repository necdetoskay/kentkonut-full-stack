// Media API servisi - Backend ile iletişim için
import { apiClient } from './apiClient';

export interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  title?: string;
  description?: string;
  categoryId?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MediaCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  children?: MediaCategory[];
  files?: MediaFile[];
}

class MediaService {
  // Media dosyalarını getir
  async getMediaFiles(categoryId?: number): Promise<MediaFile[]> {
    const endpoint = categoryId ? `/api/media?categoryId=${categoryId}` : '/api/media';
    const response = await apiClient.get<MediaFile[]>(endpoint);
    return response.data || [];
  }

  // Belirli bir media dosyasını getir
  async getMediaFile(id: number): Promise<MediaFile | null> {
    const response = await apiClient.get<MediaFile>(`/api/media/${id}`);
    return response.data || null;
  }

  // Media dosyası yükle
  async uploadMediaFile(file: File, categoryId?: number): Promise<MediaFile | null> {
    const formData = new FormData();
    formData.append('file', file);
    if (categoryId) {
      formData.append('categoryId', categoryId.toString());
    }

    const response = await apiClient.upload<MediaFile>('/api/media', formData);
    return response.data || null;
  }

  // Media dosyası güncelle
  async updateMediaFile(id: number, data: Partial<MediaFile>): Promise<MediaFile | null> {
    const response = await apiClient.put<MediaFile>(`/api/media/${id}`, data);
    return response.data || null;
  }

  // Media dosyası sil
  async deleteMediaFile(id: number): Promise<boolean> {
    const response = await apiClient.delete(`/api/media/${id}`);
    return response.success;
  }

  // Media kategorilerini getir
  async getMediaCategories(): Promise<MediaCategory[]> {
    const response = await apiClient.get<MediaCategory[]>('/api/media-categories');
    return response.data || [];
  }

  // Media kategorisi oluştur
  async createMediaCategory(data: Partial<MediaCategory>): Promise<MediaCategory | null> {
    const response = await apiClient.post<MediaCategory>('/api/media-categories', data);
    return response.data || null;
  }

  // Media kategorisi güncelle
  async updateMediaCategory(id: number, data: Partial<MediaCategory>): Promise<MediaCategory | null> {
    const response = await apiClient.put<MediaCategory>(`/api/media-categories/${id}`, data);
    return response.data || null;
  }

  // Media kategorisi sil
  async deleteMediaCategory(id: number): Promise<boolean> {
    const response = await apiClient.delete(`/api/media-categories/${id}`);
    return response.success;
  }
}

// Singleton instance
export const mediaService = new MediaService();
export default mediaService;
