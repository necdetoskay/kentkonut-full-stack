"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { ensureAbsoluteUrl } from "@/lib/url-utils";

interface SafeHtmlRendererProps {
  content: string; // Type definition says string but we'll handle undefined internally
  className?: string;
}

export function SafeHtmlRenderer({ content, className = "" }: SafeHtmlRendererProps) {
  const [sanitizedContent, setSanitizedContent] = useState("");
  
  // Ensure content is always a string, even more explicitly
  const safeContent = typeof content === 'string' ? content : '';

  useEffect(() => {
    // Debug logları üretim için kaldırıldı

    // Configure DOMPurify to allow safe HTML tags and attributes
    const config = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'div', 'span',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'figure', 'figcaption'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
        'width', 'height', 'style', 'loading', 'decoding', 'data-align',
        'data-float', 'data-width'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ADD_ATTR: ['target'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
    };

    // Process the content - now expecting HTML input directly
    let processedContent = safeContent;

    // Filter out blob URLs for security and prevent broken images
    if (processedContent && processedContent.includes('blob:')) {
      console.warn('SafeHtmlRenderer: Blob URLs detected and filtered out');
      processedContent = processedContent.replace(
        /src="blob:[^"]*"/gi,
        'src="" data-error="blob-url-filtered"'
      );
    }
    
    // Ensure all image URLs are absolute
    if (processedContent && processedContent.includes('<img')) {
      processedContent = processedContent.replace(
        /<img([^>]*?)src="([^"]*?)"([^>]*?)>/gi,
        (_match, before, src, after) => {
          const absoluteSrc = ensureAbsoluteUrl(src) || '';
          // Add additional classes for better styling and error handling with fallback
          return `<img${before}src="${absoluteSrc}"${after} class="max-w-full my-4 mx-auto rounded-lg" loading="lazy" onerror="this.onerror=null;this.style.display='none';" />`;
        }
      );
    }

    // If content appears to be plain text (no HTML tags), wrap in paragraphs
    if (safeContent && !safeContent.includes('<') && !safeContent.includes('>')) {
      processedContent = safeContent
        .split('\n\n')
        .filter(paragraph => paragraph.trim())
        .map(paragraph => {
          const withBreaks = paragraph.trim().replace(/\n/g, '<br>');
          return `<p>${withBreaks}</p>`;
        })
        .join('');
    }

    // Sanitize the HTML content
    const clean = DOMPurify.sanitize(processedContent, config);
    setSanitizedContent(clean);
  }, [content, safeContent]);

  return (
    <>
      <div
        className={`tiptap-render max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      >
        {/* Content rendered via dangerouslySetInnerHTML */}
      </div>


    </>
  );
}

// Enhanced version with additional styling and image optimization
export function EnhancedHtmlRenderer({ content, className = "" }: SafeHtmlRendererProps) {
  const [sanitizedContent, setSanitizedContent] = useState("");

  useEffect(() => {
    const config = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'div', 'span',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'figure', 'figcaption'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
        'width', 'height', 'style', 'loading', 'decoding', 'data-align',
        'data-float', 'data-width'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    };

    // Process the content - now expecting HTML input directly
    let processedContent = content;

    // If content appears to be plain text (no HTML tags), wrap in paragraphs
    if (content && !content.includes('<') && !content.includes('>')) {
      processedContent = content
        .split('\n\n')
        .filter(paragraph => paragraph.trim())
        .map(paragraph => {
          const withBreaks = paragraph.trim().replace(/\n/g, '<br>');
          return `<p>${withBreaks}</p>`;
        })
        .join('');
    } else if (content) {
      // Enhance existing HTML with better image attributes
      processedContent = content.replace(/<img([^>]*?)src="([^"]*?)"([^>]*?)>/g, (match, before, src, after) => {
        // Only add loading and decoding if not already present
        const hasLoading = match.includes('loading=');
        const hasDecoding = match.includes('decoding=');

        let additionalAttrs = '';
        if (!hasLoading) additionalAttrs += ' loading="lazy"';
        if (!hasDecoding) additionalAttrs += ' decoding="async"';

        return `<img${before}src="${src}"${after}${additionalAttrs} />`;
      });
    }

    const clean = DOMPurify.sanitize(processedContent, config);
    setSanitizedContent(clean);
  }, [content]);

  return (
    <div
      className={`tiptap-render max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
