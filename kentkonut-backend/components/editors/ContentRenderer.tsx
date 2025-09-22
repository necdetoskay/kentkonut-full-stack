'use client';

import { useEffect, useState } from 'react';

interface ContentBlock {
  id: string;
  type: string;
  title?: string;
  content?: string;
  order: number;
  isActive: boolean;
  config?: {
    imageUrl?: string;
    alt?: string;
    caption?: string;
    videoUrl?: string;
    [key: string]: any;
  };
}

interface ContentData {
  blocks: ContentBlock[];
  version: string;
  updatedAt: string;
}

interface ContentRendererProps {
  content: string;
  className?: string;
}

import { getApiBaseUrl } from '@/config/ports';

const ContentRenderer = ({ content, className = "" }: ContentRendererProps) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const apiUrl = getApiBaseUrl();

  useEffect(() => {
    try {
      // JSON content'i parse et
      const contentData: ContentData = JSON.parse(content);
      
      // Blocks'ları HTML'e çevir
      const htmlParts = contentData.blocks
        .filter(block => block.isActive)
        .sort((a, b) => a.order - b.order)
        .map(block => {
          // Farklı blok tiplerini destekle
          switch (block.type) {            case 'text':
              const textContent = block.content || '';
              return textContent ? `<div style="margin-bottom: 40px; line-height: 1.7; font-size: 16px; clear: both; display: block; overflow: hidden; width: 100%;">${textContent}</div>` : '';
            
            case 'image':
              if (block.config?.imageUrl) {
                const alt = block.config.alt || block.title || '';
                const caption = block.config.caption || '';
                // URL'in absolute olduğundan emin ol
                const imageUrl = block.config.imageUrl.startsWith('http') 
                  ? block.config.imageUrl 
                  : `${apiUrl}${block.config.imageUrl}`;                const html = `
                  <div style="margin: 40px 0; text-align: center; clear: both; display: block; overflow: hidden; width: 100%; position: relative;">
                    <img 
                      src="${imageUrl}" 
                      alt="${alt}" 
                      style="width: 100%; max-width: 800px; max-height: 600px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 0 auto; display: block; float: none; position: static;"
                    />
                    ${caption ? `<p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 16px; font-style: italic; clear: both; display: block;">${caption}</p>` : ''}
                  </div>
                `;
                return html;
              }
              return '';            case 'video':
              if (block.config?.videoUrl) {
                return `
                  <div style="margin: 40px 0; clear: both; display: block; overflow: hidden; width: 100%; position: relative;">
                    <div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                      <iframe 
                        src="${block.config.videoUrl}" 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                        allowfullscreen
                      ></iframe>
                    </div>
                    ${block.config.caption ? `<p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 16px; font-style: italic; clear: both; display: block;">${block.config.caption}</p>` : ''}
                  </div>
                `;
              }
              return '';            case 'divider':
              return `<hr style="margin: 50px 0; border: 0; border-top: 1px solid #e5e7eb; clear: both;" />`;
            
            default:
              return block.content || '';
          }
        })        .filter(html => html.trim() !== '');
      
      // Her blok arasına clearfix ekleyelim
      setHtmlContent(htmlParts.join('<div style="clear: both; display: block; overflow: hidden; height: 0; line-height: 0; font-size: 0;"></div>'));
    } catch (error) {
      console.error('Content parse error:', error);
      // Fallback: content'i direkt HTML olarak kullan
      setHtmlContent(content);
    }
  }, [content]);

  return (
    <div 
      className={`content-renderer page-content-images ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default ContentRenderer;
