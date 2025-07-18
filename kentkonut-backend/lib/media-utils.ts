import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Allowed file types for media uploads
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml'
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', // .mov files
  'video/x-msvideo', // .avi files
  'video/avi'
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES
];

// File size limits (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Generate a unique filename with timestamp and random string
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);

  // Sanitize the base name
  const sanitizedBaseName = baseName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  return `${sanitizedBaseName}-${timestamp}-${randomString}${extension}`;
}

/**
 * Get the appropriate subdirectory based on category name
 */
export function getCategorySubdirectory(categoryName: string): string {
  const normalizedName = categoryName.toLowerCase();

  switch (normalizedName) {
    case 'bannerlar':
      return 'bannerlar';
    case 'haberler':
      return 'haberler';
    case 'projeler':
      return 'projeler';
    default:
      return 'custom';
  }
}

/**
 * Get the full file path for a media file
 */
export function getMediaFilePath(filename: string, categoryName: string): string {
  const subdirectory = getCategorySubdirectory(categoryName);
  return path.join(process.cwd(), 'public', 'uploads', 'media', subdirectory, filename);
}

/**
 * Get the public URL for a media file
 */
export function getMediaFileUrl(filename: string, categoryName: string): string {
  const subdirectory = getCategorySubdirectory(categoryName);
  return `/uploads/media/${subdirectory}/${filename}`;
}

/**
 * Get the full file path for a custom folder
 */
export function getCustomFolderFilePath(filename: string, customFolder: string): string {
  return path.join(process.cwd(), 'public', customFolder, filename);
}

/**
 * Get the public URL for a custom folder file
 */
export function getCustomFolderFileUrl(filename: string, customFolder: string): string {
  return `/${customFolder}/${filename}`;
}

/**
 * Validate file type
 */
export function validateFileType(mimeType: string): boolean {
  return ALL_ALLOWED_TYPES.includes(mimeType);
}

/**
 * Validate file size based on type
 */
export function validateFileSize(size: number, mimeType: string): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return size <= MAX_IMAGE_SIZE;
  }

  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return size <= MAX_VIDEO_SIZE;
  }

  return size <= MAX_FILE_SIZE;
}

/**
 * Ensure directory exists
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * Save uploaded file to disk
 */
export async function saveUploadedFile(
  file: File,
  filename: string,
  categoryName: string,
  customFolder?: string
): Promise<string> {
  // Use custom folder if specified, otherwise use category-based path
  const filePath = customFolder 
    ? getCustomFolderFilePath(filename, customFolder)
    : getMediaFilePath(filename, categoryName);
  const directory = path.dirname(filePath);

  // Ensure directory exists
  await ensureDirectoryExists(directory);

  // Convert File to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Write file to disk
  await writeFile(filePath, buffer);

  return filePath;
}

/**
 * Delete file from disk
 */
export async function deleteMediaFile(filename: string, categoryName?: string): Promise<void> {
  // Try the new structure first (media/{category}/)
  if (categoryName) {
    const newStructurePath = getMediaFilePath(filename, categoryName);
    if (existsSync(newStructurePath)) {
      await unlink(newStructurePath);
      return;
    }
  }

  // Fall back to the current structure (uploads/)
  const currentStructurePath = path.join(process.cwd(), 'public', 'uploads', filename);
  if (existsSync(currentStructurePath)) {
    await unlink(currentStructurePath);
    return;
  }

  // If file doesn't exist in either location, log but don't throw error
  console.warn(`File not found for deletion: ${filename}`);
}

/**
 * Get file type category (image, video, document)
 */
export function getFileTypeCategory(mimeType: string): string {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return 'image';
  }

  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return 'video';
  }

  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
    return 'document';
  }

  return 'unknown';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
