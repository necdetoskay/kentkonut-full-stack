import { z } from 'zod';

// Corporate Card Types
export interface CorporateCard {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  displayOrder: number;
  isActive: boolean;
  targetUrl?: string | null;
  openInNewTab: boolean;
  content?: any;
  customData?: any;
  imagePosition: string;
  cardSize: string;
  borderRadius: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
}

// Corporate Page Types
export interface CorporatePage {
  id: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  headerImage?: string | null;
  introText?: string | null;
  showBreadcrumb: boolean;
  customCss?: string | null;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Validation Schemas
export const corporateCardSchema = z.object({
  title: z.string()
    .min(1, 'Başlık gerekli')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  subtitle: z.string()
    .max(100, 'Alt başlık en fazla 100 karakter olabilir')
    .optional()
    .or(z.literal('')),
  description: z.string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional()
    .or(z.literal('')),
  imageUrl: z.string()
    .optional()
    .or(z.literal(''))
    .refine((url) => {
      if (!url || url === '') return true;

      // Allow relative URLs starting with /
      if (url.startsWith('/')) return true;

      // Validate absolute URLs
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, 'Geçersiz URL formatı'),
  backgroundColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Geçersiz renk kodu formatı')
    .default('#ffffff'),
  textColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Geçersiz renk kodu formatı')
    .default('#000000'),
  accentColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Geçersiz renk kodu formatı')
    .default('#007bff'),
  targetUrl: z.string()
    .optional()
    .or(z.literal(''))
    .refine((url) => {
      if (!url || url === '') return true;

      // Allow relative URLs starting with /
      if (url.startsWith('/')) return true;

      // Validate absolute URLs
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, 'Geçersiz URL formatı'),
  openInNewTab: z.boolean().default(false),
  content: z.any().optional(),
  customData: z.any().optional(),
  imagePosition: z.enum(['center', 'top', 'bottom']).default('center'),
  cardSize: z.enum(['small', 'medium', 'large']).default('medium'),
  borderRadius: z.enum(['none', 'small', 'medium', 'large', 'full']).default('medium'),
  isActive: z.boolean().default(true)
});

export const corporatePageSchema = z.object({
  title: z.string()
    .min(1, 'Sayfa başlığı gerekli')
    .max(200, 'Sayfa başlığı en fazla 200 karakter olabilir')
    .default('Kurumsal'),
  metaTitle: z.string()
    .max(200, 'Meta başlık en fazla 200 karakter olabilir')
    .optional()
    .or(z.literal('')),
  metaDescription: z.string()
    .max(500, 'Meta açıklama en fazla 500 karakter olabilir')
    .optional()
    .or(z.literal('')),
  headerImage: z.string()
    .url('Geçersiz URL formatı')
    .optional()
    .or(z.literal('')),
  introText: z.string()
    .max(1000, 'Giriş metni en fazla 1000 karakter olabilir')
    .optional()
    .or(z.literal('')),
  showBreadcrumb: z.boolean().default(true),
  customCss: z.string().optional().or(z.literal('')),
  slug: z.string()
    .min(1, 'URL slug gerekli')
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, sayı ve tire içerebilir')
    .default('kurumsal'),
  isActive: z.boolean().default(true)
});

// Reorder Schema
export const reorderCardsSchema = z.object({
  cardIds: z.array(z.string().cuid('Geçersiz kart ID formatı'))
    .min(1, 'En az bir kart ID gerekli')
});

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
  meta?: {
    total?: number;
    active?: number;
    page?: number;
    limit?: number;
  };
}

export interface CorporateCardsResponse extends ApiResponse<CorporateCard[]> {
  meta: {
    total: number;
    active: number;
  };
}

export interface CorporateCardResponse extends ApiResponse<CorporateCard> {}

export interface CorporatePageResponse extends ApiResponse<{
  page: CorporatePage;
  cards: CorporateCard[];
}> {}

// Query Parameters
export interface CorporateCardsQuery {
  active?: boolean;
  limit?: number;
  orderBy?: 'displayOrder' | 'title' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

// Create/Update Types
export type CreateCorporateCardData = z.infer<typeof corporateCardSchema>;
export type UpdateCorporateCardData = Partial<CreateCorporateCardData>;
export type CreateCorporatePageData = z.infer<typeof corporatePageSchema>;
export type UpdateCorporatePageData = Partial<CreateCorporatePageData>;

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: ValidationError[] | any;
  timestamp?: string;
  requestId?: string;
}

// Admin Check Helper Type
export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  image?: string | null;
}

// Utility Types
export type SortableCard = Pick<CorporateCard, 'id' | 'title' | 'displayOrder' | 'isActive'>;

export type CardPreview = Pick<CorporateCard, 
  'id' | 'title' | 'subtitle' | 'imageUrl' | 'backgroundColor' | 
  'textColor' | 'accentColor' | 'imagePosition' | 'cardSize' | 'borderRadius'
>;

// Constants
export const CARD_SIZE_OPTIONS = ['small', 'medium', 'large'] as const;
export const IMAGE_POSITION_OPTIONS = ['center', 'top', 'bottom'] as const;
export const BORDER_RADIUS_OPTIONS = ['none', 'small', 'medium', 'large', 'full'] as const;

export const DEFAULT_CARD_COLORS = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  accentColor: '#007bff'
} as const;

export const PRESET_COLOR_THEMES = [
  {
    name: 'Mavi Tema',
    backgroundColor: '#f8f9fa',
    textColor: '#2c3e50',
    accentColor: '#3498db'
  },
  {
    name: 'Yeşil Tema',
    backgroundColor: '#f8f9fa',
    textColor: '#2c3e50',
    accentColor: '#27ae60'
  },
  {
    name: 'Mor Tema',
    backgroundColor: '#f8f9fa',
    textColor: '#2c3e50',
    accentColor: '#8e44ad'
  },
  {
    name: 'Sarı Tema',
    backgroundColor: '#fff3cd',
    textColor: '#856404',
    accentColor: '#ffc107'
  },
  {
    name: 'Cyan Tema',
    backgroundColor: '#d1ecf1',
    textColor: '#0c5460',
    accentColor: '#17a2b8'
  }
] as const;
