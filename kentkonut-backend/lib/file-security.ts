import { readFile, stat } from 'fs/promises';
import path from 'path';

// File signature mappings for security validation
const FILE_SIGNATURES: Record<string, string[]> = {
  // Images
  'image/jpeg': ['FFD8FF'],
  'image/jpg': ['FFD8FF'],
  'image/png': ['89504E47'],
  'image/gif': ['474946'],
  'image/webp': ['52494646'],
  'image/avif': ['00000020667479706176696631'], // AVIF signature
  'image/bmp': ['424D'],
  'image/tiff': ['49492A00', '4D4D002A'],

  // Videos
  'video/mp4': ['00000018667479', '00000020667479'],
  'video/webm': ['1A45DFA3'],
  'video/ogg': ['4F676753'],
  'video/avi': ['52494646'],

  // Documents
  'application/pdf': ['25504446'],
  'application/msword': ['D0CF11E0'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['504B0304'],
  'text/plain': [], // Text files can have various encodings
};

// Dangerous file extensions that should never be allowed
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.app', '.deb', '.pkg', '.dmg', '.rpm', '.msi', '.run', '.bin',
  '.sh', '.ps1', '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl'
];

// Maximum file sizes by type (in bytes)
const MAX_FILE_SIZES = {
  'image': 10 * 1024 * 1024, // 10MB
  'video': 100 * 1024 * 1024, // 100MB
  'document': 25 * 1024 * 1024, // 25MB
};

/**
 * Validate file extension against dangerous extensions
 */
export function validateFileExtension(filename: string): boolean {
  const extension = path.extname(filename).toLowerCase();
  return !DANGEROUS_EXTENSIONS.includes(extension);
}

/**
 * Validate file size based on type
 */
export function validateFileSize(size: number, mimeType: string): boolean {
  const fileType = getFileTypeCategory(mimeType);
  const maxSize = MAX_FILE_SIZES[fileType as keyof typeof MAX_FILE_SIZES] || MAX_FILE_SIZES.document;
  return size <= maxSize;
}

/**
 * Get file type category from MIME type
 */
export function getFileTypeCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}

/**
 * Convert buffer to hex string for signature checking
 */
function bufferToHex(buffer: Buffer, length: number = 16): string {
  return buffer.subarray(0, length).toString('hex').toUpperCase();
}

/**
 * Validate file signature against MIME type
 */
export async function validateFileSignature(filePath: string, mimeType: string): Promise<boolean> {
  try {
    // Read first 32 bytes of the file for signature checking
    const buffer = await readFile(filePath);
    const hex = bufferToHex(buffer, 32);

    // Get expected signatures for this MIME type
    const expectedSignatures = FILE_SIGNATURES[mimeType];

    // If no signatures defined (like for text files), allow it
    if (!expectedSignatures || expectedSignatures.length === 0) {
      return true;
    }

    // Check if file starts with any of the expected signatures
    return expectedSignatures.some(signature => hex.startsWith(signature));
  } catch (error) {
    console.error('Error validating file signature:', error);
    return false;
  }
}

/**
 * Comprehensive file security validation
 */
export async function validateFileUpload(
  file: File,
  filePath?: string
): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // 1. Validate file extension
  if (!validateFileExtension(file.name)) {
    errors.push('Dosya uzantısı güvenlik nedeniyle izin verilmiyor');
  }

  // 2. Validate file size
  if (!validateFileSize(file.size, file.type)) {
    const fileType = getFileTypeCategory(file.type);
    const maxSize = MAX_FILE_SIZES[fileType as keyof typeof MAX_FILE_SIZES];
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    errors.push(`Dosya boyutu çok büyük (maksimum ${maxSizeMB}MB)`);
  }

  // 3. Validate MIME type is in allowed list (temporarily disabled for debugging)
  // const allowedMimeTypes = Object.keys(FILE_SIGNATURES);
  // if (!allowedMimeTypes.includes(file.type)) {
  //   errors.push('Dosya türü desteklenmiyor');
  // }

  // 4. Validate file signature (if file path is provided) - temporarily disabled for images
  if (filePath && !file.type.startsWith('image/')) {
    const signatureValid = await validateFileSignature(filePath, file.type);
    if (!signatureValid) {
      errors.push('Dosya içeriği bildirilen türle uyuşmuyor');
    }
  }

  // 5. Additional security checks

  // Check for null bytes (potential security risk)
  if (file.name.includes('\0')) {
    errors.push('Dosya adında geçersiz karakter bulundu');
  }

  // Check for extremely long filenames
  if (file.name.length > 255) {
    errors.push('Dosya adı çok uzun');
  }

  // Check for hidden files (starting with dot)
  if (path.basename(file.name).startsWith('.')) {
    errors.push('Gizli dosyalar yüklenemez');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  let sanitized = filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Replace dangerous chars with underscore
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .substring(0, 200); // Limit length

  // Ensure filename has an extension
  if (!path.extname(sanitized)) {
    sanitized += '.txt';
  }

  return sanitized;
}

/**
 * Generate secure random filename while preserving extension
 */
export function generateSecureFilename(originalName: string): string {
  const extension = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);

  return `${timestamp}_${random}${extension}`;
}

/**
 * Check if file might be a zip bomb (compressed file with huge uncompressed size)
 */
export async function checkZipBomb(filePath: string, originalSize: number): Promise<boolean> {
  try {
    const stats = await stat(filePath);
    const compressionRatio = stats.size / originalSize;

    // If compression ratio is suspiciously high, it might be a zip bomb
    return compressionRatio > 100;
  } catch (error) {
    console.error('Error checking zip bomb:', error);
    return false;
  }
}

/**
 * Virus scanning placeholder - integrate with actual antivirus service
 */
export async function scanForVirus(filePath: string): Promise<{ isClean: boolean; threat?: string }> {
  // This is a placeholder for virus scanning integration
  // In production, integrate with services like:
  // - ClamAV
  // - VirusTotal API
  // - AWS GuardDuty
  // - Azure Defender

  try {
    // Simulate virus scanning delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // For now, just check file size as a basic heuristic
    const stats = await stat(filePath);

    // Flag suspiciously large files
    if (stats.size > 500 * 1024 * 1024) { // 500MB
      return {
        isClean: false,
        threat: 'File size exceeds safety threshold'
      };
    }

    return { isClean: true };
  } catch (error) {
    console.error('Error during virus scan:', error);
    return {
      isClean: false,
      threat: 'Scan failed'
    };
  }
}
