/**
 * Path utilities for handling file paths and URLs
 */

/**
 * Normalizes a file path by removing duplicate slashes and ensuring proper format
 * @param path - The path to normalize
 * @returns Normalized path
 */
export function normalizePath(path: string): string {
  if (!path) return '';
  
  return path
    .replace(/\/+/g, '/') // Replace multiple slashes with single slash
    .replace(/\/$/, '')   // Remove trailing slash
    .replace(/^\//, '');  // Remove leading slash for relative paths
}

/**
 * Normalizes a URL path by ensuring it starts with / and has no duplicate slashes
 * @param path - The path to normalize
 * @returns Normalized URL path
 */
export function normalizeUrlPath(path: string): string {
  if (!path) return '/';
  
  const normalized = path
    .replace(/\/+/g, '/') // Replace multiple slashes with single slash
    .replace(/\/$/, '');  // Remove trailing slash
  
  // Ensure it starts with /
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

/**
 * Joins multiple path segments into a single normalized path
 * @param segments - Path segments to join
 * @returns Joined and normalized path
 */
export function joinPaths(...segments: string[]): string {
  if (segments.length === 0) return '';
  
  const joined = segments
    .filter(segment => segment && segment.trim() !== '')
    .join('/')
    .replace(/\/+/g, '/'); // Replace multiple slashes with single slash
  
  return joined;
}

/**
 * Joins multiple path segments into a normalized URL path
 * @param segments - Path segments to join
 * @returns Joined and normalized URL path starting with /
 */
export function joinUrlPaths(...segments: string[]): string {
  const joined = joinPaths(...segments);
  return normalizeUrlPath(joined);
}

/**
 * Creates a file URL from folder and filename
 * @param folder - Base folder path
 * @param filename - File name
 * @returns Normalized file URL
 */
export function createFileUrl(folder: string, filename: string): string {
  if (!folder || !filename) return '';
  
  return joinUrlPaths(folder, filename);
}

/**
 * Creates a media URL for uploaded files
 * @param folder - Media folder (e.g., 'media/kurumsal/birimler')
 * @param filename - File name
 * @returns Complete media URL starting with /
 */
export function createMediaUrl(folder: string, filename: string): string {
  return createFileUrl(folder, filename);
}

/**
 * Validates if a path is safe (no directory traversal)
 * @param path - Path to validate
 * @returns True if path is safe
 */
export function isSafePath(path: string): boolean {
  if (!path) return false;
  
  // Check for directory traversal attempts
  const dangerous = ['../', '..\\', '..', './', '.\\'];
  const normalizedPath = path.toLowerCase();
  
  return !dangerous.some(pattern => normalizedPath.includes(pattern));
}

/**
 * Extracts file extension from filename
 * @param filename - File name
 * @returns File extension without dot
 */
export function getFileExtension(filename: string): string {
  if (!filename) return '';
  
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
}

/**
 * Generates a unique filename with timestamp
 * @param originalName - Original file name
 * @param prefix - Optional prefix
 * @returns Unique filename
 */
export function generateUniqueFilename(originalName: string, prefix?: string): string {
  if (!originalName) return '';
  
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  const baseName = prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
  
  return extension ? `${baseName}.${extension}` : baseName;
}

/**
 * Validates file path format
 * @param path - File path to validate
 * @returns Validation result
 */
export function validateFilePath(path: string): {
  isValid: boolean;
  error?: string;
} {
  if (!path) {
    return { isValid: false, error: 'Path is required' };
  }
  
  if (!isSafePath(path)) {
    return { isValid: false, error: 'Path contains unsafe characters' };
  }
  
  if (path.length > 255) {
    return { isValid: false, error: 'Path is too long' };
  }
  
  return { isValid: true };
}

/**
 * Converts Windows path separators to Unix style
 * @param path - Path with potential Windows separators
 * @returns Path with Unix separators
 */
export function toUnixPath(path: string): string {
  if (!path) return '';
  
  return path.replace(/\\/g, '/');
}

/**
 * Gets the directory path from a file path
 * @param filePath - Full file path
 * @returns Directory path
 */
export function getDirectoryPath(filePath: string): string {
  if (!filePath) return '';
  
  const normalized = toUnixPath(filePath);
  const lastSlash = normalized.lastIndexOf('/');
  
  return lastSlash > 0 ? normalized.substring(0, lastSlash) : '';
}

/**
 * Gets the filename from a file path
 * @param filePath - Full file path
 * @returns Filename only
 */
export function getFilename(filePath: string): string {
  if (!filePath) return '';
  
  const normalized = toUnixPath(filePath);
  const lastSlash = normalized.lastIndexOf('/');
  
  return lastSlash >= 0 ? normalized.substring(lastSlash + 1) : normalized;
}
