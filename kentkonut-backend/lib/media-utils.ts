import { unlink, mkdir, rename, copyFile } from 'fs/promises';
import { existsSync, createWriteStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Readable } from 'stream';

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
  console.log(`📁 [MEDIA_UTILS] Checking directory: ${dirPath}`);
  if (!existsSync(dirPath)) {
    console.log(`📁 [MEDIA_UTILS] Directory doesn't exist, creating: ${dirPath}`);
    await mkdir(dirPath, { recursive: true });
    console.log(`✅ [MEDIA_UTILS] Directory created successfully`);
  } else {
    console.log(`✅ [MEDIA_UTILS] Directory already exists`);
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
  console.log(`📁 [MEDIA_UTILS] saveUploadedFile called:`, {
    filename,
    categoryName,
    customFolder,
    fileSize: file.size,
    fileType: file.type
  });
  
  // Use custom folder if specified, otherwise use category-based path
  const filePath = customFolder 
    ? getCustomFolderFilePath(filename, customFolder)
    : getMediaFilePath(filename, categoryName);
  const directory = path.dirname(filePath);
  
  console.log(`📂 [MEDIA_UTILS] File path determined:`, {
    filePath,
    directory,
    useCustomFolder: !!customFolder
  });

  // Ensure target directory exists
  console.log(`📁 [MEDIA_UTILS] Ensuring directory exists: ${directory}`);
  await ensureDirectoryExists(directory);
  console.log(`✅ [MEDIA_UTILS] Directory ready`);

  // Prepare tmp target for atomic write (in the SAME directory to avoid cross-device issues)
  const tmpPath = path.join(directory, `.${filename}.${Date.now()}.upload`);

  // Stream file -> tmpPath to avoid high memory usage
  console.log(`🔄 [MEDIA_UTILS] Streaming upload to tmp file: ${tmpPath}`);
  const webStream = file.stream();
  const nodeReadable = Readable.fromWeb(webStream as any);
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(tmpPath, { flags: 'w', mode: 0o644 });
    nodeReadable.pipe(ws);
    ws.on('finish', () => resolve());
    ws.on('error', (err) => reject(err));
    nodeReadable.on('error', (err) => reject(err));
  });
  console.log(`✅ [MEDIA_UTILS] Tmp file write finished`);

  // Atomic move tmp -> final
  console.log(`📦 [MEDIA_UTILS] Moving tmp file to final path: ${filePath}`);
  try {
    await rename(tmpPath, filePath);
    console.log(`✅ [MEDIA_UTILS] File written successfully (atomic)`);
  } catch (err: any) {
    if (err && err.code === 'EXDEV') {
      console.warn(`⚠️ [MEDIA_UTILS] Cross-device rename detected, falling back to copy+unlink`);
      await copyFile(tmpPath, filePath);
      await unlink(tmpPath);
      console.log(`✅ [MEDIA_UTILS] File written successfully (copy+unlink fallback)`);
    } else {
      // Clean up tmp file on unexpected error
      try { await unlink(tmpPath); } catch {}
      throw err;
    }
  }

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

/**
 * Get normalized media URL for display in NextImage components
 * Handles different folder structures and ensures proper URL formatting
 */
export function getMediaUrl(url?: string, customFolder?: string): string {
  if (!url) return '';
  
  let normalizedUrl = url;
  
  // If URL is already absolute (http/https), return as is
  if (normalizedUrl.startsWith('http')) return normalizedUrl;
  
  // Remove /public/ prefix if exists
  normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
  
  // Normalize legacy paths like /uploads/media/<tr-folder>/filename -> new top-level folders
  // Handle Turkish folder names persisted in older records
  normalizedUrl = normalizedUrl
    // Bannerlar -> /banners
    .replace(/^\/uploads\/media\/bannerlar\//, '/banners/')
    .replace(/^\/public\/uploads\/media\/bannerlar\//, '/banners/')
    // Haberler -> /haberler
    .replace(/^\/uploads\/media\/haberler\//, '/haberler/')
    .replace(/^\/public\/uploads\/media\/haberler\//, '/haberler/')
    // Projeler -> /projeler
    .replace(/^\/uploads\/media\/projeler\//, '/projeler/')
    .replace(/^\/public\/uploads\/media\/projeler\//, '/projeler/');
  
  // Handle different folder structures based on customFolder or URL path
  if (customFolder === 'banners' || normalizedUrl.includes('/banners/')) {
    // Banner images
    normalizedUrl = normalizedUrl.replace(/^\/public\/banners\//, '/banners/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\/banners\//, '/banners/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/banners/');
    if (!normalizedUrl.startsWith('/banners/')) {
      normalizedUrl = '/banners/' + normalizedUrl.replace(/^\//, '');
    }
  } else if (customFolder === 'haberler' || normalizedUrl.includes('/haberler/')) {
    // News images
    normalizedUrl = normalizedUrl.replace(/^\/public\/haberler\//, '/haberler/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\/haberler\//, '/haberler/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/haberler/');
    if (!normalizedUrl.startsWith('/haberler/')) {
      normalizedUrl = '/haberler/' + normalizedUrl.replace(/^\//, '');
    }
  } else if (customFolder === 'projeler' || normalizedUrl.includes('/projeler/')) {
    // Project images
    normalizedUrl = normalizedUrl.replace(/^\/public\/projeler\//, '/projeler/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\/projeler\//, '/projeler/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/projeler/');
    if (!normalizedUrl.startsWith('/projeler/')) {
      normalizedUrl = '/projeler/' + normalizedUrl.replace(/^\//, '');
    }
  } else if (customFolder) {
    // Custom folder
    normalizedUrl = normalizedUrl.replace(new RegExp(`^\/public\/${customFolder}\/`), `/${customFolder}/`);
    normalizedUrl = normalizedUrl.replace(new RegExp(`^\/uploads\/${customFolder}\/`), `/${customFolder}/`);
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, `/${customFolder}/`);
    if (!normalizedUrl.startsWith(`/${customFolder}/`)) {
      normalizedUrl = `/${customFolder}/` + normalizedUrl.replace(/^\//, '');
    }
  } else {
    // Default to haberler for other content
    normalizedUrl = normalizedUrl.replace(/^\/public\/haberler\//, '/haberler/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\/haberler\//, '/haberler/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/haberler/');
    if (!normalizedUrl.startsWith('/haberler/')) {
      normalizedUrl = '/haberler/' + normalizedUrl.replace(/^\//, '');
    }
  }
  
  return normalizedUrl;
}
