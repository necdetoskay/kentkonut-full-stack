// Image Service for handling missing images and placeholders
import { API_BASE_URL } from '../config/environment';

export class ImageService {
  private static instance: ImageService;
  private loadedImages = new Set<string>();
  private failedImages = new Set<string>();

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  /**
   * Get the full URL for an image, handling relative paths
   */
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return this.getPlaceholderUrl();

    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;

    // If it starts with /, it's relative to the backend
    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }

    // Otherwise, assume it's relative to the backend
    return `${API_BASE_URL}/${imageUrl}`;
  }

  /**
   * Get a placeholder URL for missing images
   */
  getPlaceholderUrl(width = 800, height = 400): string {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
              fill="#9ca3af" text-anchor="middle" dy=".3em">
          Resim Yükleniyor...
        </text>
      </svg>
    `)}`;
  }

  /**
   * Check if an image exists and load it
   */
  async checkImageExists(imageUrl: string): Promise<boolean> {
    if (this.loadedImages.has(imageUrl)) return true;
    if (this.failedImages.has(imageUrl)) return false;

    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        this.loadedImages.add(imageUrl);
        return true;
      } else {
        this.failedImages.add(imageUrl);
        return false;
      }
    } catch (error) {
      this.failedImages.add(imageUrl);
      return false;
    }
  }

  /**
   * Preload an image and return the URL or placeholder
   */
  async getValidImageUrl(imageUrl: string): Promise<string> {
    const fullUrl = this.getImageUrl(imageUrl);
    
    if (await this.checkImageExists(fullUrl)) {
      return fullUrl;
    }
    
    return this.getPlaceholderUrl();
  }

  /**
   * Create an image element with error handling
   */
  createImageElement(
    imageUrl: string, 
    alt: string = '', 
    className: string = ''
  ): HTMLImageElement {
    const img = document.createElement('img');
    const fullUrl = this.getImageUrl(imageUrl);
    
    img.src = fullUrl;
    img.alt = alt;
    img.className = className;
    
    // Handle load error
    img.onerror = () => {
      this.failedImages.add(fullUrl);
      img.src = this.getPlaceholderUrl();
    };
    
    // Track successful loads
    img.onload = () => {
      this.loadedImages.add(fullUrl);
    };
    
    return img;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.loadedImages.clear();
    this.failedImages.clear();
  }
}

// Export singleton instance
export const imageService = ImageService.getInstance();
