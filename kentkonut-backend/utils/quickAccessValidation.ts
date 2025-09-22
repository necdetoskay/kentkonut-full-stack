import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// URL validation helper
const urlSchema = z.string()
  .min(1, "URL is required")
  .max(500, "URL must be less than 500 characters")
  .refine((url) => {
    // Allow relative URLs (starting with /) or absolute URLs
    if (url.startsWith('/')) {
      return true;
    }

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Invalid URL format"
  });

// Sanitization helper
function sanitizeString(value: string): string {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
}

// Base QuickAccessLink validation schema
export const QuickAccessLinkValidationSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .transform(sanitizeString),
  
  url: urlSchema
    .transform(sanitizeString),
  
  icon: z.string()
    .max(50, "Icon name must be less than 50 characters")
    .optional()
    .default("link")
    .transform((val) => val ? sanitizeString(val) : "link"),
  
  sortOrder: z.number()
    .int("Sort order must be an integer")
    .min(0, "Sort order must be non-negative")
    .max(9999, "Sort order must be less than 10000")
    .default(0),
  
  isActive: z.boolean().default(true),
  
  moduleType: z.enum(['page', 'news', 'project', 'department'], {
    errorMap: () => ({ message: "Module type must be one of: page, news, project, department" })
  }),
  
  // Module IDs - only one should be provided based on moduleType
  pageId: z.string().cuid("Invalid page ID format").optional(),
  newsId: z.number().int().positive("News ID must be a positive integer").optional(),
  projectId: z.number().int().positive("Project ID must be a positive integer").optional(),
  departmentId: z.string().cuid("Invalid department ID format").optional()
}).refine((data) => {
  // Ensure exactly one module ID is provided based on moduleType
  const { moduleType, pageId, newsId, projectId, departmentId } = data;
  
  switch (moduleType) {
    case 'page':
      return pageId && !newsId && !projectId && !departmentId;
    case 'news':
      return !pageId && newsId && !projectId && !departmentId;
    case 'project':
      return !pageId && !newsId && projectId && !departmentId;
    case 'department':
      return !pageId && !newsId && !projectId && departmentId;
    default:
      return false;
  }
}, {
  message: "Exactly one module ID must be provided based on module type",
  path: ["moduleId"]
});

// Update schema (partial validation)
export const QuickAccessLinkUpdateSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .transform(sanitizeString)
    .optional(),
  
  url: urlSchema
    .transform(sanitizeString)
    .optional(),
  
  icon: z.string()
    .max(50, "Icon name must be less than 50 characters")
    .transform(sanitizeString)
    .optional(),
  
  sortOrder: z.number()
    .int("Sort order must be an integer")
    .min(0, "Sort order must be non-negative")
    .max(9999, "Sort order must be less than 10000")
    .optional(),
  
  isActive: z.boolean().optional()
});

// Bulk operations schema
export const QuickAccessLinkBulkUpdateSchema = z.object({
  ids: z.array(z.string().cuid("Invalid ID format"))
    .min(1, "At least one ID is required")
    .max(100, "Cannot update more than 100 items at once"),
  
  data: QuickAccessLinkUpdateSchema
});

// Reorder schema
export const QuickAccessLinkReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().cuid("Invalid ID format"),
    sortOrder: z.number().int().min(0).max(9999)
  })).min(1, "At least one item is required")
});

// Query parameters schema
export const QuickAccessLinkQuerySchema = z.object({
  moduleType: z.enum(['page', 'news', 'project', 'department']).optional(),
  moduleId: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['title', 'sortOrder', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Module existence validation helpers
export const ModuleValidationSchemas = {
  page: z.string().cuid("Invalid page ID format"),
  news: z.number().int().positive("Invalid news ID"),
  project: z.number().int().positive("Invalid project ID"),
  department: z.string().cuid("Invalid department ID format")
};

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.object({
    code: z.string(),
    message: z.string(),
    path: z.array(z.union([z.string(), z.number()]))
  })).optional(),
  timestamp: z.string().datetime().optional(),
  requestId: z.string().optional()
});

// Success response schema
export const SuccessResponseSchema = z.object({
  data: z.any(),
  message: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  requestId: z.string().optional()
});

// Type exports
export type QuickAccessLinkInput = z.infer<typeof QuickAccessLinkValidationSchema>;
export type QuickAccessLinkUpdate = z.infer<typeof QuickAccessLinkUpdateSchema>;
export type QuickAccessLinkBulkUpdate = z.infer<typeof QuickAccessLinkBulkUpdateSchema>;
export type QuickAccessLinkReorder = z.infer<typeof QuickAccessLinkReorderSchema>;
export type QuickAccessLinkQuery = z.infer<typeof QuickAccessLinkQuerySchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
