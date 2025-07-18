'use client';

/**
 * Ensures a URL is absolute by checking if it's a relative URL starting with "/"
 * If it is, it converts it to an absolute URL using window.location.origin
 * 
 * @param url - The URL to check and potentially convert
 * @returns The absolute URL or the original URL if already absolute
 */
export const ensureAbsoluteUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  try {
    // Check if it's already a valid absolute URL
    new URL(url);
    return url;
  } catch (e) {
    // Not a valid URL, need to convert
    
    // If data URL, return as is
    if (url.startsWith('data:')) {
      return url;
    }
    
    // If relative URL starting with /, convert to absolute
    if (url.startsWith('/')) {      if (typeof window !== 'undefined') {
        const result = `${window.location.origin}${url}`;
        return result;
      } else {
        // Server-side rendering fallback
        return url;
      }
    }
      // If we get here, it's likely a relative URL without / prefix
    // Add the / to make it root-relative
    if (typeof window !== 'undefined') {
      const result = `${window.location.origin}/${url}`;
      return result;
    }
    
    // Default - return as is
    return url;
  }
};
