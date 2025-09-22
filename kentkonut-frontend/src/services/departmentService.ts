import { apiClient, type ApiResponse } from './apiClient';

// Types for Department and related entities based on backend include selections
export interface PersonnelRef {
  id: string;
  name?: string | null;
  title?: string | null;
  imageUrl?: string | null;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  order?: number | null;
  isActive?: boolean | null;
}

export interface QuickAccessLink {
  id: string;
  label: string;
  url: string;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

export interface Department {
  id: string;
  name: string;
  content?: string | null;
  slug?: string | null;
  imageUrl?: string | null;
  services?: string[] | null;
  isActive?: boolean | null;
  order?: number | null;
  directorId?: string | null;
  managerId?: string | null;
  director?: PersonnelRef | null;
  manager?: PersonnelRef | null;
  chiefs?: PersonnelRef[] | null;
  quickLinks?: QuickLink[] | null;
  quickAccessLinks?: QuickAccessLink[] | null;
}

export interface GetDepartmentsParams {
  isActive?: boolean;
  search?: string;
  hasDirector?: boolean;
}

class DepartmentService {
  private readonly baseEndpoint = '/api/departments';

  async getDepartments(params: GetDepartmentsParams = {}): Promise<ApiResponse<Department[]>> {
    const qs = new URLSearchParams();
    if (typeof params.isActive === 'boolean') qs.set('isActive', String(params.isActive));
    if (typeof params.hasDirector === 'boolean') qs.set('hasDirector', String(params.hasDirector));
    if (params.search) qs.set('search', params.search);

    const endpoint = qs.toString() ? `${this.baseEndpoint}?${qs.toString()}` : this.baseEndpoint;
    return apiClient.get<Department[]>(endpoint);
  }

  async getDepartment(id: string): Promise<ApiResponse<Department>> {
    return apiClient.get<Department>(`${this.baseEndpoint}/${id}`);
  }

  async getDepartmentBySlug(slug: string): Promise<ApiResponse<Department>> {
    return apiClient.get<Department>(`${this.baseEndpoint}/slug/${slug}`);
  }
}

export const departmentService = new DepartmentService();