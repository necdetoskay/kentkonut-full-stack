/**
 * Content Migration Utility
 * Converts TipTap HTML content to Quill-compatible format
 */

import { ensureAbsoluteUrl } from './url-utils';

interface ImageAttributes {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  position?: string;
  align?: string;
  class?: string;
  style?: string;
}

/**
 * Convert TipTap HTML content to Quill-compatible HTML
 */
export function convertTipTapToQuill(tiptapContent: string): string {
  if (!tiptapContent || tiptapContent.trim() === '') {
    return '';
  }

  // Only run on client side
  if (typeof window === 'undefined') {
    return tiptapContent; // Return original content on server
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = tiptapContent;

  // Convert TipTap image wrappers to Quill floating images
  convertImageWrappers(tempDiv);
  
  // Convert direct images with data-align attributes
  convertDirectImages(tempDiv);
  
  // Clean up any remaining TipTap-specific attributes
  cleanupTipTapAttributes(tempDiv);
  
  // Ensure all image URLs are absolute
  ensureAbsoluteImageUrls(tempDiv);

  return tempDiv.innerHTML;
}

/**
 * Convert TipTap image wrapper divs to Quill floating image format
 */
function convertImageWrappers(container: HTMLElement): void {
  const imageWrappers = container.querySelectorAll('div[data-type="image-wrapper"]');
  
  imageWrappers.forEach(wrapper => {
    const img = wrapper.querySelector('img');
    if (!img) return;

    const attributes = extractImageAttributes(wrapper, img);
    const quillImageDiv = createQuillFloatingImage(attributes);
    
    // Replace the wrapper with the new Quill format
    wrapper.parentNode?.replaceChild(quillImageDiv, wrapper);
  });
}

/**
 * Convert direct images with TipTap attributes
 */
function convertDirectImages(container: HTMLElement): void {
  const directImages = container.querySelectorAll('img[data-align], img.float-left, img.float-right, img.text-center');
  
  directImages.forEach(img => {
    const attributes = extractImageAttributes(null, img as HTMLImageElement);
    const quillImageDiv = createQuillFloatingImage(attributes);
    
    // Replace the image with the new Quill format
    img.parentNode?.replaceChild(quillImageDiv, img);
  });
}

/**
 * Extract image attributes from TipTap format
 */
function extractImageAttributes(wrapper: Element | null, img: HTMLImageElement): ImageAttributes {
  const attributes: ImageAttributes = {
    src: img.src || img.getAttribute('src') || '',
    alt: img.alt || img.getAttribute('alt') || ''
  };

  // Get width and height
  if (img.width) attributes.width = img.width;
  if (img.height) attributes.height = img.height;
  
  // Extract width/height from style
  const imgStyle = img.getAttribute('style') || '';
  const widthMatch = imgStyle.match(/width:\s*(\d+)px/);
  const heightMatch = imgStyle.match(/height:\s*(\d+)px/);
  
  if (widthMatch) attributes.width = parseInt(widthMatch[1]);
  if (heightMatch) attributes.height = parseInt(heightMatch[1]);

  // Determine float position from various sources
  let float = 'none';
  
  // Check wrapper classes and attributes
  if (wrapper) {
    const wrapperClass = wrapper.getAttribute('class') || '';
    const wrapperPosition = wrapper.getAttribute('data-position') || '';
    
    if (wrapperClass.includes('float-left') || wrapperPosition === 'left') {
      float = 'left';
    } else if (wrapperClass.includes('float-right') || wrapperPosition === 'right') {
      float = 'right';
    } else if (wrapperClass.includes('text-center') || wrapperPosition === 'center') {
      float = 'none';
    }
  }
  
  // Check image classes and attributes
  const imgClass = img.getAttribute('class') || '';
  const imgAlign = img.getAttribute('data-align') || '';
  
  if (imgClass.includes('float-left') || imgAlign.includes('float-left')) {
    float = 'left';
  } else if (imgClass.includes('float-right') || imgAlign.includes('float-right')) {
    float = 'right';
  } else if (imgClass.includes('text-center') || imgAlign === 'center') {
    float = 'none';
  }

  attributes.position = float;
  
  return attributes;
}

/**
 * Create Quill floating image div element
 */
function createQuillFloatingImage(attributes: ImageAttributes): HTMLElement {
  const div = document.createElement('div');
  div.className = 'quill-floating-image';
  div.setAttribute('contenteditable', 'false');
  div.setAttribute('data-float', attributes.position || 'none');
  div.setAttribute('data-src', attributes.src);
  div.setAttribute('data-alt', attributes.alt || '');

  // Apply float styling
  if (attributes.position === 'left') {
    div.classList.add('float-left');
    div.style.float = 'left';
    div.style.margin = '0 15px 10px 0';
    div.style.maxWidth = '50%';
  } else if (attributes.position === 'right') {
    div.classList.add('float-right');
    div.style.float = 'right';
    div.style.margin = '0 0 10px 15px';
    div.style.maxWidth = '50%';
  } else {
    div.classList.add('center');
    div.style.display = 'block';
    div.style.margin = '15px auto';
    div.style.textAlign = 'center';
    div.style.maxWidth = '80%';
  }

  // Set width if specified
  if (attributes.width) {
    div.style.width = `${attributes.width}px`;
  }

  // Create image element
  const img = document.createElement('img');
  img.setAttribute('src', attributes.src);
  img.setAttribute('alt', attributes.alt || '');
  img.style.width = '100%';
  img.style.height = 'auto';
  img.style.display = 'block';
  img.style.borderRadius = '4px';

  // Set specific height if provided
  if (attributes.height) {
    img.style.height = `${attributes.height}px`;
    img.style.objectFit = 'cover';
  }

  div.appendChild(img);
  return div;
}

/**
 * Clean up TipTap-specific attributes
 */
function cleanupTipTapAttributes(container: HTMLElement): void {
  // Remove TipTap-specific attributes
  const elementsWithTipTapAttrs = container.querySelectorAll('[data-type], [data-position], [data-align]');
  
  elementsWithTipTapAttrs.forEach(element => {
    // Only remove if not our new Quill elements
    if (!element.classList.contains('quill-floating-image')) {
      element.removeAttribute('data-type');
      element.removeAttribute('data-position');
      element.removeAttribute('data-align');
    }
  });

  // Remove TipTap-specific classes
  const elementsWithTipTapClasses = container.querySelectorAll('.image-wrapper, .tiptap-image');
  
  elementsWithTipTapClasses.forEach(element => {
    element.classList.remove('image-wrapper', 'tiptap-image');
  });
}

/**
 * Ensure all image URLs are absolute
 */
function ensureAbsoluteImageUrls(container: HTMLElement): void {
  const images = container.querySelectorAll('img');
  
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src) {
      const absoluteUrl = ensureAbsoluteUrl(src);
      if (absoluteUrl) {
        img.setAttribute('src', absoluteUrl);
      }
    }
  });
}

/**
 * Convert Quill content back to display format (for frontend)
 */
export function convertQuillToDisplay(quillContent: string): string {
  if (!quillContent || quillContent.trim() === '') {
    return '';
  }

  // For display, we just need to ensure the CSS classes are correct
  // The Quill format should already be compatible with our display CSS
  return quillContent;
}

/**
 * Backup existing content before migration
 */
export function backupContent(content: string, identifier: string): void {
  // Only run on client side
  if (typeof window === 'undefined') {
    return;
  }

  const backup = {
    content,
    timestamp: new Date().toISOString(),
    identifier
  };

  // Store in localStorage for development/testing
  const backups = JSON.parse(localStorage.getItem('tiptap-content-backups') || '[]');
  backups.push(backup);

  // Keep only last 10 backups
  if (backups.length > 10) {
    backups.splice(0, backups.length - 10);
  }

  localStorage.setItem('tiptap-content-backups', JSON.stringify(backups));
}

/**
 * Restore content from backup
 */
export function restoreContent(identifier: string): string | null {
  // Only run on client side
  if (typeof window === 'undefined') {
    return null;
  }

  const backups = JSON.parse(localStorage.getItem('tiptap-content-backups') || '[]');
  const backup = backups.find((b: any) => b.identifier === identifier);

  return backup ? backup.content : null;
}
