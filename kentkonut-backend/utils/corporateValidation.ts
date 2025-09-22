// Corporate Module Validation Utilities
// Enhanced validation schemas and functions for corporate entities

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Custom validation functions
const validateImageUrl = (url: string | undefined): boolean => {
  if (!url || url === '') return true;
  
  // Allow relative URLs starting with /
  if (url.startsWith('/')) return true;
  
  // Validate absolute URLs
  try {
    const urlObj = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    const pathname = urlObj.pathname.toLowerCase();
    return allowedExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
};

const validateLinkedInUrl = (url: string | undefined): boolean => {
  if (!url || url === '') return true;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'linkedin.com' || urlObj.hostname === 'www.linkedin.com';
  } catch {
    return false;
  }
};

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'div', 'span',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'title', 'width', 'height',
      'class', 'style', 'data-align', 'data-*',
      'draggable'
    ],
    ALLOW_DATA_ATTR: true,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};

// Executive Validation Schema
export const ExecutiveValidationSchema = z.object({
  name: z.string()
    .min(2, "İsim en az 2 karakter olmalıdır")
    .max(100, "İsim 100 karakteri geçemez")
    .regex(/^[a-zA-ZÀ-ÿĞğıİöÖşŞüÜçÇ0-9\s\.\-]+$/, "İsim sadece harfler, rakamlar, boşluk, nokta ve tire içerebilir"),
  
  title: z.string()
    .min(2, "Başlık en az 2 karakter olmalıdır")
    .max(200, "Başlık 200 karakteri geçemez"),
  
  content: z.string()
    .optional()
    .or(z.literal(""))
    .transform(val => (val === "" ? undefined : sanitizeHtml(val)))
    .refine((val) => {
      if (!val) return true;
      return val.length <= 5000;
    }, "İçerik en fazla 5000 karakter olabilir"),
  
  slug: z.string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      return /^[a-z0-9-]+$/.test(val);
    }, "Slug sadece küçük harf, sayı ve tire içerebilir"),
  
  biography: z.string()
    .optional()
    .or(z.literal(""))
    .transform(val => (val === "" ? undefined : sanitizeHtml(val)))
    .refine((val) => {
      if (!val) return true;
      return val.length <= 5000;
    }, "Biyografi en fazla 5000 karakter olabilir"),
  
  imageUrl: z.string()
    .optional()
    .or(z.literal(""))
    .refine(validateImageUrl, "Geçersiz görsel URL'si"),
  
  email: z.string()
    .email("Geçersiz email formatı")
    .optional()
    .or(z.literal("")),
  
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, "Geçersiz telefon formatı")
    .optional()
    .or(z.literal("")),
  
  linkedIn: z.string()
    .optional()
    .or(z.literal(""))
    .refine(validateLinkedInUrl, "Geçersiz LinkedIn URL'si"),

  quickAccessUrl: z.string()
    .optional()
    .transform(val => val === "" ? undefined : val)
    .refine((url) => {
      if (!url) return true;

      // Allow relative URLs starting with /
      if (url.startsWith('/')) return true;

      // Validate absolute URLs
      try {
        new URL(url);
        return true;
      } catch (error) {
        console.log('URL validation error for:', url, error);
        return false;
      }
    }, {
      message: "Lütfen geçerli bir URL girin. Örnek: https://example.com veya /sayfa-yolu"
    }),

  hasQuickAccessLinks: z.boolean()
    .optional()
    .default(false),



  pageId: z.string()
    .optional()
    .or(z.literal(""))
    .or(z.literal("none"))
    .refine((val) => {
      if (!val || val === "" || val === "none") return true;
      // Basic validation for CUID format
      return /^[a-z0-9]{25}$/.test(val);
    }, "Geçersiz sayfa ID'si"),
  
  order: z.number()
    .min(0, "Sıra numarası 0'dan küçük olamaz")
    .max(1000, "Sıra numarası 1000'den büyük olamaz")
    .int("Sıra numarası tam sayı olmalıdır"),
  
  isActive: z.boolean(),
});

// Executive Quick Link Validation Schema
export const ExecutiveQuickLinkValidationSchema = z.object({
  title: z.string()
    .min(1, "Başlık zorunludur")
    .max(100, "Başlık en fazla 100 karakter olabilir"),

  url: z.string()
    .min(1, "URL zorunludur")
    .refine((url) => {
      // Allow relative URLs starting with /
      if (url.startsWith('/')) return true;

      // Validate absolute URLs
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, "Geçersiz URL formatı"),

  description: z.string()
    .optional()
    .or(z.literal(""))
    .refine((desc) => {
      if (!desc || desc === "") return true;
      return desc.length <= 500;
    }, "Açıklama en fazla 500 karakter olabilir"),

  icon: z.string()
    .optional()
    .default("link"),

  order: z.number()
    .int()
    .min(0)
    .optional()
    .default(0),

  isActive: z.boolean()
    .optional()
    .default(true),
});

// Quick Link Validation Schema
export const QuickLinkValidationSchema = z.object({
  title: z.string()
    .min(1, "Başlık gereklidir")
    .max(100, "Başlık 100 karakteri geçemez"),
  
  url: z.string()
    .min(1, "URL gereklidir")
    .max(500, "URL 500 karakteri geçemez")
    .refine((url) => {
      // Allow relative URLs or valid absolute URLs
      if (url.startsWith('/')) return true;
      
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, "Geçersiz URL formatı"),
  
  description: z.string()
    .max(500, "Açıklama 500 karakteri geçemez")
    .optional()
    .or(z.literal("")),
  
  icon: z.string()
    .max(50, "İkon adı 50 karakteri geçemez")
    .regex(/^[a-zA-Z0-9\-]+$/, "İkon adı sadece harf, sayı ve tire içerebilir")
    .optional()
    .or(z.literal("")),
  
  order: z.number()
    .min(0, "Sıra numarası 0'dan küçük olamaz")
    .max(1000, "Sıra numarası 1000'den büyük olamaz")
    .int("Sıra numarası tam sayı olmalıdır"),
  
  isActive: z.boolean(),
});

// Department Validation Schema
export const DepartmentValidationSchema = z.object({
  name: z.string()
    .min(2, "Departman adı en az 2 karakter olmalıdır")
    .max(100, "Departman adı 100 karakteri geçemez"),

  content: z.string()
    .max(10000, "İçerik 10000 karakteri geçemez")
    .transform(sanitizeHtml)
    .optional()
    .or(z.literal("")),

  slug: z.string()
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, sayı ve tire içerebilir")
    .optional()
    .or(z.literal("")),

  directorId: z.string()
    .optional()
    .or(z.literal("")),

  managerId: z.string()
    .optional()
    .or(z.literal("")),

  imageUrl: z.string()
    .optional()
    .or(z.literal(""))
    .refine(validateImageUrl, "Geçersiz görsel URL'si"),

  services: z.array(z.string().max(100, "Hizmet adı 100 karakteri geçemez"))
    .max(20, "En fazla 20 hizmet eklenebilir"),
  
  order: z.number()
    .min(0, "Sıra numarası 0'dan küçük olamaz")
    .max(1000, "Sıra numarası 1000'den büyük olamaz")
    .int("Sıra numarası tam sayı olmalıdır"),

  isActive: z.boolean(),

  hasQuickAccess: z.boolean().default(false), // Hızlı erişim aktif mi?
});

// Personnel Validation Schema
export const PersonnelValidationSchema = z.object({
  name: z.string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(100, "Ad 100 karakteri geçemez"),
  
  title: z.string()
    .min(2, "Ünvan en az 2 karakter olmalıdır")
    .max(100, "Ünvan 100 karakteri geçemez"),
  
  content: z.string()
    .max(10000, "İçerik 10000 karakteri geçemez")
    .transform(sanitizeHtml)
    .optional()
    .or(z.literal("")),
  
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, "Geçersiz telefon formatı")
    .optional()
    .or(z.literal("")),
  
  email: z.string()
    .email("Geçersiz email formatı")
    .optional()
    .or(z.literal("")),
  
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, sayı ve tire içerebilir")
    .optional()
    .or(z.literal("")),
    
  imageUrl: z.string()
    .optional()
    .or(z.literal(""))
    .refine(validateImageUrl, "Geçersiz görsel URL'si"),
    type: z.enum(["DIRECTOR", "CHIEF"], {
    required_error: "Personel tipi seçilmelidir",
  }),
  
  order: z.number()
    .min(0, "Sıra numarası 0'dan küçük olamaz")
    .max(1000, "Sıra numarası 1000'den büyük olamaz")
    .int("Sıra numarası tam sayı olmalıdır"),
    isActive: z.boolean(),
  
  // Department relations (optional for updates)
  directorDeptId: z.string().optional().or(z.literal("")),
  chiefDeptIds: z.array(z.string()).optional(),
  
  // Gallery items (optional for updates)
  galleryItems: z.array(z.object({
    id: z.string().optional(),
    mediaId: z.string().min(1, "Media ID'si gereklidir"),
    type: z.enum(["IMAGE", "DOCUMENT", "PDF", "WORD"]),
    title: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    order: z.number().min(0).optional().default(0),
  })).optional(),
});

// Personnel Gallery Item Validation Schema
export const PersonnelGalleryItemValidationSchema = z.object({
  personnelId: z.string()
    .min(1, "Personel ID'si gereklidir"),
  
  mediaId: z.string()
    .min(1, "Media ID'si gereklidir"),
  
  type: z.enum(["IMAGE", "DOCUMENT", "PDF", "WORD"], {
    required_error: "Dosya tipi seçilmelidir",
  }),
  
  title: z.string()
    .max(100, "Başlık 100 karakteri geçemez")
    .optional()
    .or(z.literal("")),
  
  description: z.string()
    .max(500, "Açıklama 500 karakteri geçemez")
    .optional()
    .or(z.literal("")),
  
  order: z.number()
    .min(0, "Sıra numarası 0'dan küçük olamaz")
    .max(1000, "Sıra numarası 1000'den büyük olamaz")
    .int("Sıra numarası tam sayı olmalıdır"),
});

// Department Quick Link Validation Schema
export const DepartmentQuickLinkValidationSchema = z.object({
  title: z.string()
    .min(1, "Başlık gereklidir")
    .max(100, "Başlık 100 karakteri geçemez"),
  
  url: z.string()
    .min(1, "URL gereklidir")
    .max(500, "URL 500 karakteri geçemez")
    .refine((url) => {
      // Allow relative URLs or valid absolute URLs
      if (url.startsWith('/')) return true;
      
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, "Geçersiz URL formatı"),
  
  icon: z.string()
    .max(50, "İkon adı 50 karakteri geçemez")
    .regex(/^[a-zA-Z0-9\-]+$/, "İkon adı sadece harf, sayı ve tire içerebilir")
    .optional()
    .or(z.literal("")),
  
  departmentId: z.string()
    .min(1, "Departman ID'si gereklidir"),
  
  order: z.number()
    .min(0, "Sıra numarası 0'dan küçük olamaz")
    .max(1000, "Sıra numarası 1000'den büyük olamaz")
    .int("Sıra numarası tam sayı olmalıdır"),
});

// Validation helper functions
export const validateExecutive = (data: any) => {
  try {
    return {
      success: true,
      data: ExecutiveValidationSchema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'general', message: 'Validation failed' }],
    };
  }
};

export const validateQuickLink = (data: any) => {
  try {
    return {
      success: true,
      data: QuickLinkValidationSchema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'general', message: 'Validation failed' }],
    };
  }
};

export const validateDepartment = (data: any) => {
  try {
    return {
      success: true,
      data: DepartmentValidationSchema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'general', message: 'Validation failed' }],
    };
  }
};

// Client-side validation helpers
export const isValidEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const isValidUrl = (url: string): boolean => {
  if (url.startsWith('/')) return true;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPhoneNumber = (phone: string): boolean => {
  return /^[\+]?[0-9\s\-\(\)]+$/.test(phone);
};

// Form validation hooks for real-time validation
export const useFieldValidation = () => {
  const validateField = (fieldName: string, value: any, schema: z.ZodObject<any>) => {
    try {
      const fieldSchema = (schema as any).shape[fieldName];
      if (fieldSchema) {
        fieldSchema.parse(value);
        return { isValid: true, error: null };
      }
      return { isValid: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.errors[0]?.message || 'Validation error',
        };
      }
      return { isValid: false, error: 'Validation error' };
    }
  };

  return { validateField };
};

// Sanitization utilities
export const sanitizeInput = {
  text: (input: string): string => {
    return input.trim().replace(/\s+/g, ' ');
  },
  
  html: sanitizeHtml,
  
  url: (url: string): string => {
    return url.trim().toLowerCase();
  },
  
  slug: (input: string): string => {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },
};

// Type guards
export const isExecutive = (obj: any): obj is any => {
  return obj && typeof obj.name === 'string' && typeof obj.type === 'string';
};

export const isQuickLink = (obj: any): obj is any => {
  return obj && typeof obj.title === 'string' && typeof obj.url === 'string';
};

export const isDepartment = (obj: any): obj is any => {
  return obj && typeof obj.name === 'string' && Array.isArray(obj.services);
};

export const isPersonnel = (obj: any): obj is any => {
  return obj && typeof obj.name === 'string' && typeof obj.title === 'string' && typeof obj.type === 'string';
};

export const isDepartmentQuickLink = (obj: any): obj is any => {
  return obj && typeof obj.title === 'string' && typeof obj.url === 'string' && typeof obj.departmentId === 'string';
};

// Additional validation helper functions
export const validatePersonnel = (data: any) => {
  try {
    return {
      success: true,
      data: PersonnelValidationSchema.parse(data),
      errors: null,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: err.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'general', message: 'Validation failed' }],
    };
  }
};

export const validateDepartmentQuickLink = (data: any) => {
  try {
    return {
      success: true,
      data: DepartmentQuickLinkValidationSchema.parse(data),
      errors: null,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: err.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ field: 'general', message: 'Validation failed' }],
    };
  }
};
