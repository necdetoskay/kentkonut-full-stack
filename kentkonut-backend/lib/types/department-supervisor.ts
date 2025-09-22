/**
 * Department Supervisor types and interfaces
 */

export interface DepartmentSupervisorDocument {
  id: string;
  type: 'cv' | 'image' | 'document' | 'certificate';
  url: string;
  name: string;
  originalName: string;
  displayName?: string; // Custom display name for frontend
  mimeType: string;
  size: number;
  uploadedAt: string;
  description?: string;
}

export interface DepartmentSupervisor {
  id: string;
  departmentId: string;
  fullName: string;
  position: string;
  mainImageUrl?: string;
  documents: DepartmentSupervisorDocument[];
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentSupervisorRequest {
  departmentId: string;
  fullName: string;
  position: string;
  mainImageUrl?: string;
  documents?: DepartmentSupervisorDocument[];
  orderIndex?: number;
  isActive?: boolean;
}

export interface UpdateDepartmentSupervisorRequest {
  fullName?: string;
  position?: string;
  mainImageUrl?: string;
  documents?: DepartmentSupervisorDocument[];
  orderIndex?: number;
  isActive?: boolean;
}

export interface DepartmentSupervisorListResponse {
  success: boolean;
  data: DepartmentSupervisor[];
  total: number;
  message?: string;
}

export interface DepartmentSupervisorResponse {
  success: boolean;
  data: DepartmentSupervisor;
  message?: string;
}

export interface DepartmentSupervisorDeleteResponse {
  success: boolean;
  message: string;
}

// Predefined position options
export const SUPERVISOR_POSITIONS = [
  { value: 'mudur', label: 'Müdür' },
  { value: 'sef', label: 'Şef' },
  { value: 'uzman', label: 'Uzman' },
  { value: 'memur', label: 'Memur' },
  { value: 'koordinator', label: 'Koordinatör' },
  { value: 'sorumlu', label: 'Sorumlu' },
  { value: 'other', label: 'Diğer' }
] as const;

export type SupervisorPositionValue = typeof SUPERVISOR_POSITIONS[number]['value'];

// File upload configuration
export const SUPERVISOR_FILE_CONFIG = {
  folder: 'media/kurumsal/birimler',
  allowedTypes: [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  acceptedTypesDisplay: ['JPG', 'PNG', 'WebP', 'PDF', 'DOC', 'DOCX']
};

// Validation schemas
export const supervisorValidation = {
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/,
    message: 'Ad soyad en az 2, en fazla 100 karakter olmalı ve sadece harf içermelidir'
  },
  position: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Görev alanı zorunludur'
  },
  documents: {
    maxCount: 10,
    maxSize: 10 * 1024 * 1024,
    allowedTypes: SUPERVISOR_FILE_CONFIG.allowedTypes,
    message: 'En fazla 10 dosya, her biri maksimum 10MB olabilir'
  }
};

// Helper functions
export function validateSupervisor(data: CreateDepartmentSupervisorRequest): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  // Validate full name
  if (!data.fullName || data.fullName.trim().length < supervisorValidation.fullName.minLength) {
    errors.fullName = supervisorValidation.fullName.message;
  }
  
  // Validate position
  if (!data.position || data.position.trim().length < supervisorValidation.position.minLength) {
    errors.position = supervisorValidation.position.message;
  }
  
  // Validate documents
  if (data.documents && data.documents.length > supervisorValidation.documents.maxCount) {
    errors.documents = supervisorValidation.documents.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function formatSupervisorPosition(position: string): string {
  const found = SUPERVISOR_POSITIONS.find(p => p.value === position);
  return found ? found.label : position;
}

export function getSupervisorDisplayName(supervisor: DepartmentSupervisor): string {
  return `${supervisor.fullName} - ${formatSupervisorPosition(supervisor.position)}`;
}

export function sortSupervisorsByOrder(supervisors: DepartmentSupervisor[]): DepartmentSupervisor[] {
  return [...supervisors].sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getActiveSupervisors(supervisors: DepartmentSupervisor[]): DepartmentSupervisor[] {
  return supervisors.filter(s => s.isActive);
}

export function getSupervisorsByPosition(
  supervisors: DepartmentSupervisor[], 
  position: string
): DepartmentSupervisor[] {
  return supervisors.filter(s => s.position === position);
}
