interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
  retryCount: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2
};

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error.name === 'NetworkError' || error.name === 'TypeError') {
    return true;
  }

  // HTTP status codes that are retryable
  if (error.status) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  // Connection errors
  if (error.message) {
    const retryableMessages = [
      'network error',
      'connection error',
      'timeout',
      'fetch failed',
      'load failed'
    ];
    
    const message = error.message.toLowerCase();
    return retryableMessages.some(msg => message.includes(msg));
  }

  return false;
}

/**
 * Upload file with retry mechanism
 */
export async function uploadWithRetry(
  file: File,
  formData: FormData,
  onProgress?: (progress: UploadProgress) => void,
  onRetry?: (attempt: number, error: string) => void,
  config: Partial<RetryConfig> = {}
): Promise<UploadResult> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any = null;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<any>((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (parseError) {
              reject(new Error('Invalid response format'));
            }
          } else {
            const error = new Error(`HTTP ${xhr.status}: ${xhr.statusText}`);
            (error as any).status = xhr.status;
            reject(error);
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        // Configure request
        xhr.open('POST', '/api/media');
        xhr.timeout = 60000; // 60 seconds timeout
        
        // Send request
        xhr.send(formData);
      });

      // Wait for upload to complete
      const result = await uploadPromise;
      
      return {
        success: true,
        data: result,
        retryCount: attempt
      };

    } catch (error) {
      lastError = error;
      
      // Don't retry if it's not a retryable error
      if (!isRetryableError(error)) {
        break;
      }

      // Don't retry on the last attempt
      if (attempt === retryConfig.maxRetries) {
        break;
      }

      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1, error instanceof Error ? error.message : 'Unknown error');
      }

      // Wait before retrying
      const delay = calculateDelay(attempt, retryConfig);
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError instanceof Error ? lastError.message : 'Upload failed',
    retryCount: retryConfig.maxRetries
  };
}

/**
 * Batch upload with retry for multiple files
 */
export async function batchUploadWithRetry(
  files: File[],
  categoryId: number,
  onFileProgress?: (fileIndex: number, progress: UploadProgress) => void,
  onFileComplete?: (fileIndex: number, result: UploadResult) => void,
  onFileRetry?: (fileIndex: number, attempt: number, error: string) => void,
  config: Partial<RetryConfig> = {}
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Create form data for this file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryId', categoryId.toString());

    // Upload with retry
    const result = await uploadWithRetry(
      file,
      formData,
      (progress) => onFileProgress?.(i, progress),
      (attempt, error) => onFileRetry?.(i, attempt, error),
      config
    );

    results.push(result);
    onFileComplete?.(i, result);

    // Add small delay between uploads to avoid overwhelming the server
    if (i < files.length - 1) {
      await sleep(100);
    }
  }

  return results;
}

/**
 * Create abort controller for cancelling uploads
 */
export class UploadController {
  private abortController: AbortController;
  private isAborted: boolean = false;

  constructor() {
    this.abortController = new AbortController();
  }

  abort(): void {
    this.isAborted = true;
    this.abortController.abort();
  }

  get signal(): AbortSignal {
    return this.abortController.signal;
  }

  get aborted(): boolean {
    return this.isAborted;
  }
}

/**
 * Enhanced error messages for user display
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.';
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return 'Yükleme zaman aşımına uğradı. Dosya boyutunu kontrol edin.';
    }

    // Server errors
    if (error.status >= 500) {
      return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    }

    // Client errors
    if (error.status >= 400 && error.status < 500) {
      return error.message || 'Dosya yükleme hatası.';
    }

    return error.message;
  }

  return 'Bilinmeyen bir hata oluştu.';
}

/**
 * Validate file before upload
 */
export function validateFileForUpload(file: File): { valid: boolean; error?: string } {
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Dosya boyutu çok büyük. Maksimum ${Math.round(maxSize / (1024 * 1024))}MB olmalıdır.`
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Boş dosya yüklenemez.'
    };
  }

  // Check file name
  if (!file.name || file.name.trim() === '') {
    return {
      valid: false,
      error: 'Geçersiz dosya adı.'
    };
  }

  return { valid: true };
}
