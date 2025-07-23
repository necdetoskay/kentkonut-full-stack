/**
 * Slug generation utilities for URL-friendly identifiers
 */

/**
 * Generates a URL-friendly slug from text
 * @param text - Input text to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
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
    // Remove special characters except spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces/underscores with single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates if a slug is properly formatted
 * @param slug - Slug to validate
 * @returns True if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;
  
  // Check if slug contains only lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Ensures slug uniqueness by checking against existing slugs
 * @param baseSlug - Base slug to check
 * @param existingSlugs - Array of existing slugs to check against
 * @param currentId - Current item ID (for edit mode, to exclude self)
 * @returns Unique slug
 */
export function ensureUniqueSlug(
  baseSlug: string, 
  existingSlugs: string[], 
  currentId?: string
): string {
  if (!baseSlug) return '';
  
  // Filter out current item's slug if in edit mode
  const filteredSlugs = existingSlugs.filter(slug => slug !== baseSlug || !currentId);
  
  if (!filteredSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Find unique slug by appending number
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (filteredSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
  
  return uniqueSlug;
}

/**
 * Debounced slug generation for real-time updates
 * @param text - Input text
 * @param delay - Debounce delay in milliseconds
 * @param callback - Callback function to call with generated slug
 * @returns Cleanup function
 */
export function debouncedSlugGeneration(
  text: string,
  delay: number = 300,
  callback: (slug: string) => void
): () => void {
  const timeoutId = setTimeout(() => {
    const slug = generateSlug(text);
    callback(slug);
  }, delay);
  
  return () => clearTimeout(timeoutId);
}

/**
 * Hook for real-time slug generation in React components
 */
export function useSlugGeneration(
  text: string,
  existingSlugs: string[] = [],
  currentId?: string,
  delay: number = 300
) {
  const [slug, setSlug] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  
  React.useEffect(() => {
    if (!text) {
      setSlug('');
      return;
    }
    
    setIsGenerating(true);
    
    const cleanup = debouncedSlugGeneration(text, delay, (generatedSlug) => {
      const uniqueSlug = ensureUniqueSlug(generatedSlug, existingSlugs, currentId);
      setSlug(uniqueSlug);
      setIsGenerating(false);
    });
    
    return cleanup;
  }, [text, existingSlugs, currentId, delay]);
  
  return { slug, isGenerating };
}

// Import React for the hook
import React from 'react';
