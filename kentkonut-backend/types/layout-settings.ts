import { z } from 'zod';

// Layout Settings Types
export interface CorporateLayoutSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'select';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

// Parsed layout settings for easier use
export interface ParsedLayoutSettings {
  cardsPerRow: number;
  maxCardsPerPage: number;
  cardSpacing: 'small' | 'medium' | 'large';
  responsiveBreakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  showPagination: boolean;
  cardsAnimation: 'none' | 'fade' | 'slide';
}

// Default layout settings
export const DEFAULT_LAYOUT_SETTINGS: ParsedLayoutSettings = {
  cardsPerRow: 3,
  maxCardsPerPage: 12,
  cardSpacing: 'medium',
  responsiveBreakpoints: {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  showPagination: true,
  cardsAnimation: 'fade'
};

// Validation schemas
export const layoutSettingSchema = z.object({
  key: z.string().min(1, 'Key gerekli'),
  value: z.string().min(1, 'Value gerekli'),
  description: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'json', 'select']),
  category: z.string().default('layout')
});

export const updateLayoutSettingSchema = z.object({
  value: z.string().min(1, 'Value gerekli'),
  description: z.string().optional()
});

// Specific setting schemas
export const cardsPerRowSchema = z.object({
  value: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 6;
  }, 'Sütun sayısı 1-6 arasında olmalı')
});

export const cardSpacingSchema = z.object({
  value: z.enum(['small', 'medium', 'large'], {
    errorMap: () => ({ message: 'Geçersiz spacing değeri' })
  })
});

export const responsiveBreakpointsSchema = z.object({
  value: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return (
        typeof parsed === 'object' &&
        typeof parsed.mobile === 'number' &&
        typeof parsed.tablet === 'number' &&
        typeof parsed.desktop === 'number' &&
        parsed.mobile >= 1 && parsed.mobile <= 6 &&
        parsed.tablet >= 1 && parsed.tablet <= 6 &&
        parsed.desktop >= 1 && parsed.desktop <= 6
      );
    } catch {
      return false;
    }
  }, 'Geçersiz responsive breakpoints JSON')
});

// Helper functions
export function parseLayoutSettings(settings: CorporateLayoutSettings[]): ParsedLayoutSettings {
  const result = { ...DEFAULT_LAYOUT_SETTINGS };

  settings.forEach(setting => {
    switch (setting.key) {
      case 'cards_per_row':
        result.cardsPerRow = parseInt(setting.value) || DEFAULT_LAYOUT_SETTINGS.cardsPerRow;
        break;
      case 'max_cards_per_page':
        result.maxCardsPerPage = parseInt(setting.value) || DEFAULT_LAYOUT_SETTINGS.maxCardsPerPage;
        break;
      case 'card_spacing':
        if (['small', 'medium', 'large'].includes(setting.value)) {
          result.cardSpacing = setting.value as 'small' | 'medium' | 'large';
        }
        break;
      case 'responsive_breakpoints':
        try {
          const parsed = JSON.parse(setting.value);
          if (parsed && typeof parsed === 'object') {
            result.responsiveBreakpoints = {
              mobile: parsed.mobile || DEFAULT_LAYOUT_SETTINGS.responsiveBreakpoints.mobile,
              tablet: parsed.tablet || DEFAULT_LAYOUT_SETTINGS.responsiveBreakpoints.tablet,
              desktop: parsed.desktop || DEFAULT_LAYOUT_SETTINGS.responsiveBreakpoints.desktop
            };
          }
        } catch {
          // Keep default values
        }
        break;
      case 'show_pagination':
        result.showPagination = setting.value === 'true';
        break;
      case 'cards_animation':
        if (['none', 'fade', 'slide'].includes(setting.value)) {
          result.cardsAnimation = setting.value as 'none' | 'fade' | 'slide';
        }
        break;
    }
  });

  return result;
}

export function validateSettingValue(key: string, value: string): { isValid: boolean; error?: string } {
  try {
    switch (key) {
      case 'cards_per_row':
        cardsPerRowSchema.parse({ value });
        break;
      case 'max_cards_per_page':
        const maxCards = parseInt(value);
        if (isNaN(maxCards) || maxCards < 1 || maxCards > 100) {
          return { isValid: false, error: 'Maksimum kart sayısı 1-100 arasında olmalı' };
        }
        break;
      case 'card_spacing':
        cardSpacingSchema.parse({ value });
        break;
      case 'responsive_breakpoints':
        responsiveBreakpointsSchema.parse({ value });
        break;
      case 'show_pagination':
        if (!['true', 'false'].includes(value)) {
          return { isValid: false, error: 'Boolean değer true veya false olmalı' };
        }
        break;
      case 'cards_animation':
        if (!['none', 'fade', 'slide'].includes(value)) {
          return { isValid: false, error: 'Animasyon tipi none, fade veya slide olmalı' };
        }
        break;
      default:
        return { isValid: false, error: 'Bilinmeyen ayar anahtarı' };
    }
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Geçersiz değer' };
  }
}

// CSS class generators
export function getGridClasses(settings: ParsedLayoutSettings): string {
  const { cardsPerRow, cardSpacing } = settings;
  
  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const spacing: Record<string, string> = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  };

  return `grid ${gridCols[cardsPerRow] || gridCols[3]} ${spacing[cardSpacing]}`;
}

export function getAnimationClasses(animation: 'none' | 'fade' | 'slide'): string {
  switch (animation) {
    case 'fade':
      return 'animate-in fade-in duration-300';
    case 'slide':
      return 'animate-in slide-in-from-bottom-4 duration-300';
    default:
      return '';
  }
}
