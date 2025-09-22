// Corporate Module Type Definitions
// Centralized type definitions for all corporate-related entities

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  order: number;
}

export interface Executive extends BaseEntity {
  name: string;
  title: string;
  content?: string;
  slug?: string;
  biography?: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  pageId?: string;
  page?: {
    id: string;
    title: string;
    slug: string;
    isActive: boolean;
  };
}

export interface QuickLink extends BaseEntity {
  title: string;
  url: string;
  description?: string;
  icon?: string;
}

export interface Department extends BaseEntity {
  name: string;
  description?: string;
  manager?: string;
  imageUrl?: string;
  services: string[];
  phone?: string;
  email?: string;
  location?: string;
}

export type CorporateContentType = 'VISION' | 'MISSION' | 'STRATEGY' | 'GOALS' | 'ABOUT';

export interface CorporateContent extends BaseEntity {
  type: CorporateContentType;
  title: string;
  content: string;
  slug?: string;
  imageUrl?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  error: string;
  details?: any;
  message?: string;
  statusCode?: number;
}

// Form Data Types
export interface ExecutiveFormData {
  name: string;
  title: string;
  content?: string;
  slug?: string;
  biography?: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  pageId?: string;
  order: number;
  isActive: boolean;
}

export interface QuickLinkFormData {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  manager?: string;
  imageUrl?: string;
  services: string[];
  phone?: string;
  email?: string;
  location?: string;
  order: number;
  isActive: boolean;
}

// Statistics Types
export interface ExecutiveStats {
  total: number;
  active: number;
}

export interface QuickLinkStats {
  total: number;
  active: number;
  inactive: number;
}

export interface CorporateModuleStats {
  executives: ExecutiveStats;
  quickLinks: QuickLinkStats;
  departments: DepartmentStats;
}

// Department Statistics
export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  totalEmployees: number;
}

// Filter Types
export interface ExecutiveFilters {
  isActive?: boolean;
  search?: string;
}

export interface QuickLinkFilters {
  isActive?: boolean;
  search?: string;
}

export interface DepartmentFilters {
  isActive?: boolean;
  search?: string;
  hasManager?: boolean;
}

// Component Props Types
export interface CorporateTableProps<T> {
  data: T[];
  columns: any[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

export interface CorporateFormProps<T> {
  initialData?: T | null;
  onSubmit: (data: T) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface CorporateStatsProps {
  stats: CorporateModuleStats;
  loading?: boolean;
}

// Utility Types
export type CorporateEntityType = 'executive' | 'quickLink' | 'department';

export interface CorporateAction {
  type: string;
  payload?: any;
}

// Validation Schemas (for runtime type checking)
export interface ValidationRules {
  executive: {
    name: { min: number; max: number; pattern?: RegExp };
    title: { min: number; max: number };
    position: { min: number; max: number };
    email: { pattern: RegExp };
    phone: { pattern?: RegExp };
    linkedIn: { pattern?: RegExp };
  };
  quickLink: {
    title: { min: number; max: number };
    url: { pattern: RegExp };
    description: { max: number };
  };
  department: {
    name: { min: number; max: number };
    description: { max: number };
    email: { pattern: RegExp };
    phone: { pattern?: RegExp };
  };
}

// Constants - Executive types removed as they are no longer needed

export const QUICK_LINK_ICONS = [
  { value: 'link', label: 'Link' },
  { value: 'external-link', label: 'Dış Link' },
  { value: 'user-check', label: 'Kullanıcı' },
  { value: 'building-2', label: 'Bina' },
  { value: 'target', label: 'Hedef' },
  { value: 'trending-up', label: 'Grafik' },
  { value: 'shield', label: 'Kalkan' },
  { value: 'book-open', label: 'Kitap' },
  { value: 'home', label: 'Ev' },
  { value: 'phone', label: 'Telefon' },
  { value: 'mail', label: 'Email' },
  { value: 'map-pin', label: 'Konum' },
];

export const CORPORATE_CONTENT_TYPES: { value: CorporateContentType; label: string }[] = [
  { value: 'ABOUT', label: 'Hakkımızda' },
  { value: 'VISION', label: 'Vizyon' },
  { value: 'MISSION', label: 'Misyon' },
  { value: 'STRATEGY', label: 'Strateji' },
  { value: 'GOALS', label: 'Hedefler' },
];
