// TipTap Editor Integration for KentKonutAdvancedUploader
// Provides seamless integration with existing TipTap editor and GlobalMediaSelector patterns

import { Editor } from '@tiptap/react';
import { GalleryFileInfo } from '@/types/advanced-uploader';
import { GlobalMediaFile } from '@/components/media/GlobalMediaSelector';

/**
 * TipTap Editor Integration Utilities
 */
export class TipTapEditorIntegration {
  /**
   * Convert GalleryFileInfo to GlobalMediaFile format for compatibility
   */
  static toGlobalMediaFile(file: GalleryFileInfo): GlobalMediaFile {
    return {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      alt: file.alt || '',
      caption: file.caption || '',
      mimeType: file.mimeType,
      size: file.size,
      // GlobalMediaFile doesn't have `path` or `uploadedBy`
      categoryId: file.categoryId,
      createdAt: file.createdAt instanceof Date ? file.createdAt.toISOString() : (file.createdAt as unknown as string),
      updatedAt: file.updatedAt instanceof Date ? file.updatedAt.toISOString() : (file.updatedAt as unknown as string),
      thumbnailSmall: file.thumbnailSmall,
      thumbnailMedium: file.thumbnailMedium,
      thumbnailLarge: file.thumbnailLarge,
      // category object is optional on GlobalMediaFile and not provided here
    };
  }

  /**
   * Convert GlobalMediaFile to GalleryFileInfo format
   */
  static fromGlobalMediaFile(file: GlobalMediaFile): GalleryFileInfo {
    return {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      alt: file.alt,
      caption: file.caption,
      mimeType: file.mimeType,
      size: file.size,
      type: file.mimeType.startsWith('image/') ? 'image' 
           : file.mimeType.startsWith('video/') ? 'video'
           : file.mimeType === 'application/pdf' ? 'pdf'
           : file.mimeType.includes('word') || file.mimeType.includes('document') ? 'document'
           : 'other',
      thumbnailSmall: file.thumbnailSmall,
      thumbnailMedium: file.thumbnailMedium,
      thumbnailLarge: file.thumbnailLarge,
      createdAt: new Date(file.createdAt),
      updatedAt: new Date(file.updatedAt || file.createdAt),
      categoryId: file.categoryId ?? (file.category?.id ?? 0),
      category: file.category ? { id: file.category.id, name: file.category.name, icon: '' } : undefined,
    };
  }

  /**
   * Insert a single image into TipTap editor
   */
  static insertImage(file: GalleryFileInfo, editor: Editor, options?: {
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
  }) {
    if (!editor || file.type !== 'image') {
      console.warn('Editor not available or file is not an image');
      return false;
    }

    try {
      // Use the best available image URL (prefer medium thumbnail for performance)
      const imageUrl = file.thumbnailMedium || file.url;
      
      editor.chain().focus().setImage({
        src: imageUrl,
        alt: options?.alt || file.alt || file.originalName,
        title: options?.title || file.originalName,
        ...(options?.width && { width: options.width }),
        ...(options?.height && { height: options.height })
      }).run();

      console.log('✅ Image inserted into TipTap editor:', file.originalName);
      return true;
    } catch (error) {
      console.error('❌ Failed to insert image into editor:', error);
      return false;
    }
  }

  /**
   * Insert a floating image into TipTap editor (for FloatImageEditor compatibility)
   */
  static insertFloatingImage(
    file: GalleryFileInfo, 
    editor: Editor, 
    position: 'left' | 'right' | 'center' = 'center',
    options?: {
      alt?: string;
      title?: string;
      width?: number;
      height?: number;
    }
  ) {
    if (!editor || file.type !== 'image') {
      console.warn('Editor not available or file is not an image');
      return false;
    }

    try {
      const imageUrl = file.thumbnailMedium || file.url;
      
      // Check if FloatImage extension is available
      if (editor.extensionManager.extensions.find(ext => ext.name === 'floatImage')) {
        // Use FloatImage extension if available
        editor.chain().focus().setFloatImage({
          src: imageUrl,
          alt: options?.alt || file.alt || file.originalName,
          title: options?.title || file.originalName,
          float: position,
          ...(options?.width && { width: options.width }),
          ...(options?.height && { height: options.height })
        }).run();
      } else {
        // Fallback to regular image with CSS classes for floating
        const floatClass = position === 'left' ? 'float-left' 
                         : position === 'right' ? 'float-right' 
                         : 'mx-auto block';
        
        editor.chain().focus().setImage({
          src: imageUrl,
          alt: options?.alt || file.alt || file.originalName,
          title: options?.title || file.originalName,
          class: floatClass,
          ...(options?.width && { width: options.width }),
          ...(options?.height && { height: options.height })
        }).run();
      }

      console.log('✅ Floating image inserted into TipTap editor:', file.originalName);
      return true;
    } catch (error) {
      console.error('❌ Failed to insert floating image into editor:', error);
      return false;
    }
  }

  /**
   * Insert a gallery of images into TipTap editor
   */
  static insertGallery(
    files: GalleryFileInfo[], 
    editor: Editor,
    options?: {
      layout?: 'grid' | 'carousel' | 'masonry';
      columns?: number;
      spacing?: 'tight' | 'normal' | 'loose';
    }
  ) {
    if (!editor || files.length === 0) {
      console.warn('Editor not available or no files provided');
      return false;
    }

    // Filter only image files
    const imageFiles = files.filter(file => file.type === 'image');
    
    if (imageFiles.length === 0) {
      console.warn('No image files found in the selection');
      return false;
    }

    try {
      // Check if GalleryExtension is available
      if (editor.extensionManager.extensions.find(ext => ext.name === 'gallery')) {
        // Use GalleryExtension if available
        const galleryImages = imageFiles.map(file => ({
          url: file.thumbnailMedium || file.url,
          alt: file.alt || file.originalName,
          caption: file.caption || ''
        }));

        editor.chain().focus().setGallery({
          images: galleryImages,
          layout: options?.layout || 'grid',
          columns: options?.columns || 3,
          spacing: options?.spacing || 'normal'
        }).run();
      } else {
        // Fallback: Insert images one by one
        imageFiles.forEach((file, index) => {
          if (index > 0) {
            editor.chain().focus().createParagraphNear().run();
          }
          this.insertImage(file, editor);
        });
      }

      console.log('✅ Gallery inserted into TipTap editor:', imageFiles.length, 'images');
      return true;
    } catch (error) {
      console.error('❌ Failed to insert gallery into editor:', error);
      return false;
    }
  }

  /**
   * Create a callback function for use with KentKonutAdvancedUploader
   */
  static createEditorInsertCallback(
    editor: Editor,
    insertType: 'image' | 'floating' | 'gallery' = 'image',
    options?: any
  ) {
    return (files: GalleryFileInfo[]) => {
      if (!files || files.length === 0) return;

      switch (insertType) {
        case 'image':
          if (files.length === 1) {
            this.insertImage(files[0], editor, options);
          } else {
            // Multiple files: insert as gallery or one by one
            this.insertGallery(files, editor, options);
          }
          break;
          
        case 'floating':
          if (files.length >= 1) {
            this.insertFloatingImage(files[0], editor, options?.position, options);
          }
          break;
          
        case 'gallery':
          this.insertGallery(files, editor, options);
          break;
          
        default:
          console.warn('Unknown insert type:', insertType);
      }
    };
  }

  /**
   * Get editor capabilities for conditional UI rendering
   */
  static getEditorCapabilities(editor: Editor) {
    if (!editor) {
      return {
        hasImage: false,
        hasFloatImage: false,
        hasGallery: false
      };
    }

    const extensions = editor.extensionManager.extensions;
    
    return {
      hasImage: extensions.some(ext => ext.name === 'image'),
      hasFloatImage: extensions.some(ext => ext.name === 'floatImage'),
      hasGallery: extensions.some(ext => ext.name === 'gallery')
    };
  }

  /**
   * Validate file for editor insertion
   */
  static validateFileForEditor(file: GalleryFileInfo, insertType: string): {
    isValid: boolean;
    reason?: string;
  } {
    if (insertType === 'image' || insertType === 'floating' || insertType === 'gallery') {
      if (file.type !== 'image') {
        return {
          isValid: false,
          reason: 'Sadece resim dosyaları editöre eklenebilir'
        };
      }
    }

    if (!file.url) {
      return {
        isValid: false,
        reason: 'Dosya URL\'si bulunamadı'
      };
    }

    return { isValid: true };
  }
}

// Export utility functions for direct use
export const {
  toGlobalMediaFile,
  fromGlobalMediaFile,
  insertImage,
  insertFloatingImage,
  insertGallery,
  createEditorInsertCallback,
  getEditorCapabilities,
  validateFileForEditor
} = TipTapEditorIntegration;
