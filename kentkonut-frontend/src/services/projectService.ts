// Projects API servisi - Backend ile iletişim için
import { apiClient } from './apiClient';

export interface Project {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content: string;
  featuredImage?: string;
  gallery?: string[];
  categoryId?: number;
  status: 'draft' | 'published' | 'archived';
  startDate?: string;
  endDate?: string;
  location?: string;
  client?: string;
  budget?: number;
  area?: number; // m2
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  category?: ProjectCategory;
}

export interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  children?: ProjectCategory[];
  projects?: Project[];
}

class ProjectService {
  // Projeleri getir
  async getProjects(params?: {
    categoryId?: number;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Project[]> {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `/api/projects?${queryParams.toString()}`;
    const response = await apiClient.get<Project[]>(endpoint);
    return response.data || [];
  }

  // Belirli bir projeyi getir
  async getProject(id: number): Promise<Project | null> {
    const response = await apiClient.get<Project>(`/api/projects/${id}`);
    return response.data || null;
  }

  // Slug ile projeyi getir
  async getProjectBySlug(slug: string): Promise<Project | null> {
    const response = await apiClient.get<Project>(`/api/projects/slug/${slug}`);
    return response.data || null;
  }

  // Proje oluştur
  async createProject(data: Partial<Project>): Promise<Project | null> {
    const response = await apiClient.post<Project>('/api/projects', data);
    return response.data || null;
  }

  // Proje güncelle
  async updateProject(id: number, data: Partial<Project>): Promise<Project | null> {
    const response = await apiClient.put<Project>(`/api/projects/${id}`, data);
    return response.data || null;
  }

  // Proje sil
  async deleteProject(id: number): Promise<boolean> {
    const response = await apiClient.delete(`/api/projects/${id}`);
    return response.success;
  }

  // Proje kategorilerini getir
  async getProjectCategories(): Promise<ProjectCategory[]> {
    const response = await apiClient.get<ProjectCategory[]>('/api/project-categories');
    return response.data || [];
  }

  // Proje kategorisi oluştur
  async createProjectCategory(data: Partial<ProjectCategory>): Promise<ProjectCategory | null> {
    const response = await apiClient.post<ProjectCategory>('/api/project-categories', data);
    return response.data || null;
  }

  // Proje kategorisi güncelle
  async updateProjectCategory(id: number, data: Partial<ProjectCategory>): Promise<ProjectCategory | null> {
    const response = await apiClient.put<ProjectCategory>(`/api/project-categories/${id}`, data);
    return response.data || null;
  }

  // Proje kategorisi sil
  async deleteProjectCategory(id: number): Promise<boolean> {
    const response = await apiClient.delete(`/api/project-categories/${id}`);
    return response.success;
  }

  // Öne çıkan projeleri getir
  async getFeaturedProjects(limit: number = 6): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(`/api/projects/featured?limit=${limit}`);
    return response.data || [];
  }

  // Son projeleri getir
  async getLatestProjects(limit: number = 8): Promise<Project[]> {
    const response = await apiClient.get<Project[]>(`/api/projects/latest?limit=${limit}`);
    return response.data || [];
  }
}

// Singleton instance
export const projectService = new ProjectService();
export default projectService;
