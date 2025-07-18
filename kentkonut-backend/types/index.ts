// Core type definitions aligned with Prisma schema

export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  role: string;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BannerGroup {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  deletable: boolean;
  width: number;
  height: number;
  mobileWidth: number;
  mobileHeight: number;
  tabletWidth: number;
  tabletHeight: number;
  displayDuration: number;
  transitionDuration: number;
  animationType: 'SOLUKLESTIR' | 'KAYDIR' | 'YAKINLESTIR' | 'CEVIR' | 'ZIPLA';
  createdAt: Date;
  updatedAt: Date;
  banners?: Banner[];
}

export interface Banner {
  id: number;
  title: string;
  description?: string;
  link?: string;
  isActive: boolean;
  deletable: boolean;
  order: number;
  viewCount: number;
  clickCount: number;
  imageUrl: string;
  altText?: string;
  bannerGroupId: number;
  bannerGroup?: BannerGroup;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaCategory {
  id: number;
  name: string;
  icon: string;
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Use GlobalMediaFile from @/components/media/GlobalMediaSelector instead of this interface
import { GlobalMediaFile } from '@/components/media/GlobalMediaSelector';
export type MediaFile = GlobalMediaFile;

// Project Status Enum
export enum ProjectStatus {
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED"
}

// Project Status Labels (Turkish)
export const PROJECT_STATUS_LABELS = {
  [ProjectStatus.ONGOING]: "Devam Ediyor",
  [ProjectStatus.COMPLETED]: "Tamamlandı"
} as const;

export interface Project {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  status: ProjectStatus;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  province?: string;
  district?: string;
  address?: string;
  mediaId?: number;
  media?: MediaFile;
  viewCount: number;
  readingTime: number;
  published: boolean;
  publishedAt?: Date;
  authorId: string;
  author: SafeUser;
  tags: ProjectTag[];
  relatedProjects: ProjectRelation[];
  relatedToProjects: ProjectRelation[];
  comments: ProjectComment[];
  galleryItems: ProjectGalleryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectGalleryItem {
  id: number;
  projectId: number;
  project: Project;
  mediaId: number;
  media: MediaFile;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTag {
  projectId: number;
  tagId: number;
  project: Project;
  tag: Tag;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectRelation {
  id: number;
  projectId: number;
  relatedProjectId: number;
  project: Project;
  relatedProject: Project;
}

export interface ProjectComment {
  id: number;
  content: string;
  approved: boolean;
  projectId: number;
  project: Project;
  userId: string;
  user: SafeUser;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
}

export interface MediaCategoryFormData {
  name: string;
  icon: string;
}

export interface ProjectFormData {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  status: ProjectStatus;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  province?: string;
  district?: string;
  address?: string;
  mediaId?: number;
  published: boolean;
  publishedAt?: string;
  readingTime: number;
  tags: string[];
  galleryItems: number[];
}

export interface BannerGroupFormData {
  name: string;
  description?: string;
  isActive: boolean;
  deletable: boolean;
  width: number;
  height: number;
  mobileWidth: number;
  mobileHeight: number;
  tabletWidth: number;
  tabletHeight: number;
  displayDuration: number;
  transitionDuration: number;
  animationType: 'SOLUKLESTIR' | 'KAYDIR' | 'YAKINLESTIR' | 'CEVIR' | 'ZIPLA';
  // UUID tabanlı pozisyon sistemi
  positionUUID?: string;
  fallbackGroupId?: number;
}

export interface BannerFormData {
  title: string;
  description?: string;
  link?: string;
  isActive: boolean;
  deletable: boolean;
  order: number;
  imageUrl: string;
  altText?: string;
  bannerGroupId: number;
}

// Constants
export const PLAY_MODES = {
  MANUAL: "sequential",
  AUTO: "random"
} as const;

export const ANIMATION_TYPES = {
  FADE: "fade",
  SLIDE: "slide"
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user"
} as const;

export type PlayMode = typeof PLAY_MODES[keyof typeof PLAY_MODES];
export type AnimationType = typeof ANIMATION_TYPES[keyof typeof ANIMATION_TYPES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Banner pozisyon UUID'leri
export const BANNER_POSITION_UUIDS = {
  HERO: '550e8400-e29b-41d4-a716-446655440001',
  SIDEBAR: '550e8400-e29b-41d4-a716-446655440002',
  FOOTER: '550e8400-e29b-41d4-a716-446655440003',
  POPUP: '550e8400-e29b-41d4-a716-446655440004',
  NOTIFICATION: '550e8400-e29b-41d4-a716-446655440005'
} as const;

export type BannerPositionUUID = typeof BANNER_POSITION_UUIDS[keyof typeof BANNER_POSITION_UUIDS];

// Banner pozisyon seçenekleri
export const BANNER_POSITION_OPTIONS = [
  { value: 'none', label: 'Pozisyon Seçilmedi' },
  { value: BANNER_POSITION_UUIDS.HERO, label: 'Ana Sayfa Üst Banner' },
  { value: BANNER_POSITION_UUIDS.SIDEBAR, label: 'Yan Menü Banner' },
  { value: BANNER_POSITION_UUIDS.FOOTER, label: 'Alt Banner' },
  { value: BANNER_POSITION_UUIDS.POPUP, label: 'Popup Banner' },
  { value: BANNER_POSITION_UUIDS.NOTIFICATION, label: 'Bildirim Banner' }
];
