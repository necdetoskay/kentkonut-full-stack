import DOMPurify from 'isomorphic-dompurify';

// Configure DOMPurify with allowed tags, attributes, etc.
DOMPurify.setConfig({
  ADD_ATTR: ['target'],
  FORBID_ATTR: ['style', 'onerror', 'onload'],
});

// Extend allowed tags for rich content (departments, personnel)
const richContentConfig = {
  ALLOWED_TAGS: [
    // Basic formatting
    'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'b', 'i', 'strong', 'em', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
    
    // Lists
    'ol', 'ul', 'li', 'dl', 'dt', 'dd',
    
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    
    // Links and formatting
    'a', 'blockquote', 'code', 'pre',
    
    // Media (limited)
    'img', 'figure', 'figcaption',
    
    // Div for containers
    'div', 'span',
  ],
  ALLOWED_ATTR: [
    // Common attributes
    'id', 'class', 'href', 'target', 'rel', 'title', 'alt',
    
    // Image attributes
    'src', 'width', 'height',
    
    // Table attributes
    'colspan', 'rowspan',
  ],
  ALLOW_DATA_ATTR: false,
};

// Export default instance with basic configuration
export { DOMPurify };

// Export specific sanitizer for rich content
export const sanitizeRichContent = (content: string): string => {
  return DOMPurify.sanitize(content, richContentConfig);
};

// Export specific sanitizer for basic content
export const sanitizeBasicContent = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
};
