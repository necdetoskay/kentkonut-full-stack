/**
 * Utility functions for handling page slugs consistently
 * Prevents double slash issues and ensures proper formatting
 */

/**
 * Normalizes a slug to ensure it has exactly one leading slash
 * @param slug - The input slug (may or may not have leading slash)
 * @returns Normalized slug with single leading slash
 */
export function normalizeSlug(slug: string | undefined | null): string {
  if (!slug || typeof slug !== 'string') {
    return '/';
  }

  // Remove any leading/trailing whitespace
  const trimmed = slug.trim();
  
  if (!trimmed) {
    return '/';
  }

  // Remove multiple leading slashes and ensure exactly one
  const withoutLeadingSlashes = trimmed.replace(/^\/+/, '');
  
  // Add single leading slash
  return `/${withoutLeadingSlashes}`;
}

/**
 * Removes the leading slash from a slug for display purposes
 * @param slug - The slug with leading slash
 * @returns Slug without leading slash
 */
export function removeLeadingSlash(slug: string | undefined | null): string {
  if (!slug || typeof slug !== 'string') {
    return '';
  }

  return slug.replace(/^\/+/, '');
}

/**
 * Validates if a slug is properly formatted
 * @param slug - The slug to validate
 * @returns Object with validation result and error message
 */
export function validateSlug(slug: string): { isValid: boolean; error?: string } {
  if (!slug || typeof slug !== 'string') {
    return { isValid: false, error: 'Slug gerekli' };
  }

  const trimmed = slug.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Slug boş olamaz' };
  }

  // Check for invalid characters (basic validation)
  const invalidChars = /[^a-zA-Z0-9\-_\/]/;
  if (invalidChars.test(trimmed)) {
    return { isValid: false, error: 'Slug sadece harf, rakam, tire ve alt çizgi içerebilir' };
  }

  // Check for multiple consecutive slashes
  if (/\/\/+/.test(trimmed)) {
    return { isValid: false, error: 'Slug çoklu slash içeremez' };
  }

  return { isValid: true };
}

/**
 * Generates a slug from a title
 * @param title - The page title
 * @returns Generated slug with leading slash
 */
export function generateSlugFromTitle(title: string): string {
  if (!title || typeof title !== 'string') {
    return '/';
  }

  const slug = title
    .toLowerCase()
    .trim()
    // Replace Turkish characters
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/İ/g, 'i')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-zA-Z0-9]/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  return normalizeSlug(slug);
}

/**
 * Checks if two slugs are equivalent (ignoring leading slash differences)
 * @param slug1 - First slug
 * @param slug2 - Second slug
 * @returns True if slugs are equivalent
 */
export function slugsAreEquivalent(slug1: string, slug2: string): boolean {
  const normalized1 = normalizeSlug(slug1);
  const normalized2 = normalizeSlug(slug2);
  return normalized1 === normalized2;
}

/**
 * Formats slug for display in admin interface
 * Shows the full URL path with leading slash
 * @param slug - The slug to format
 * @returns Formatted slug for display
 */
export function formatSlugForDisplay(slug: string | undefined | null): string {
  return normalizeSlug(slug);
}

/**
 * Formats slug for input field (without leading slash)
 * @param slug - The slug to format for input
 * @returns Slug without leading slash for input field
 */
export function formatSlugForInput(slug: string | undefined | null): string {
  return removeLeadingSlash(slug);
}

/**
 * Processes slug from form input (adds leading slash if needed)
 * @param inputSlug - Slug from form input
 * @returns Processed slug with leading slash
 */
export function processSlugFromInput(inputSlug: string): string {
  return normalizeSlug(inputSlug);
}
