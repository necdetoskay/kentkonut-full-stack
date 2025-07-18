// Server-side content renderer for page previews
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

export function renderContentToHTML(content: string): string {
  try {
    // JSON content'i parse et
    const contentData: ContentData = JSON.parse(content);
    
    // Blocks'ları HTML'e çevir
    const htmlParts = contentData.blocks
      .filter(block => block.isActive)
      .sort((a, b) => a.order - b.order)
      .map(block => {
        // Farklı blok tiplerini destekle
        switch (block.type) {
          case 'text':
            const textContent = block.content || '';
            // TipTap HTML'ini direkt kullan, wrapper div'e sadece temel stiller ekle
            return textContent ? `
              <div class="text-content-block" style="margin-bottom: 40px; line-height: 1.7; font-size: 16px; clear: both; display: block; overflow: hidden; width: 100%;">
                ${textContent}
              </div>
            ` : '';

          case 'image':
            if (block.config?.imageUrl) {
              const alt = block.config.alt || block.title || '';
              const caption = block.config.caption || '';
              return `
                <div style="margin: 50px 0; text-align: center; clear: both; display: block; overflow: hidden; width: 100%; position: relative;">
                  <img 
                    src="${block.config.imageUrl}" 
                    alt="${alt}" 
                    style="width: 100%; max-width: 800px; max-height: 600px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 0 auto; display: block; float: none; position: static;"
                  />
                  ${caption ? `<p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 16px; font-style: italic; clear: both; display: block;">${caption}</p>` : ''}
                </div>
              `;
            }
            return '';

          case 'video':
            const videoUrl = block.config?.videoUrl || (block as any).videoUrl;
            if (videoUrl) {
              const caption = block.config?.caption || (block as any).caption;
              
              // Check if it's a YouTube, Vimeo URL or local video file
              let videoElement = '';
              if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
                const videoId = videoUrl.includes('youtu.be/') 
                  ? videoUrl.split('youtu.be/')[1].split('?')[0]
                  : videoUrl.split('v=')[1]?.split('&')[0];
                const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                videoElement = `
                  <iframe 
                    src="${embedUrl}" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                `;
              } else if (videoUrl.includes('vimeo.com/')) {
                const videoId = videoUrl.split('vimeo.com/')[1].split('?')[0];
                const embedUrl = `https://player.vimeo.com/video/${videoId}`;
                videoElement = `
                  <iframe 
                    src="${embedUrl}" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                `;
              } else {
                // Local video file
                videoElement = `
                  <video 
                    controls 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain;"
                    preload="metadata"
                  >
                    <source src="${videoUrl}" type="video/mp4">
                    <source src="${videoUrl}" type="video/webm">
                    <source src="${videoUrl}" type="video/ogg">
                    Tarayıcınız video oynatmayı desteklemiyor.
                  </video>
                `;
              }
              
              return `
                <div style="margin: 40px 0; clear: both; display: block; overflow: hidden; width: 100%; position: relative;">
                  ${block.title ? `<h3 style="margin-bottom: 20px; font-size: 20px; font-weight: 600; color: #1f2937;">${block.title}</h3>` : ''}
                  <div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background-color: #000;">
                    ${videoElement}
                  </div>
                  ${caption ? `<p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 16px; font-style: italic; clear: both; display: block;">${caption}</p>` : ''}
                </div>
              `;
            }
            return '';

          case 'gallery':
            const images = block.config?.images || [];
            if (images.length > 0) {
              const columns = Math.min(block.config?.columns || 4, 5); // Max 5 columns for thumbnails
              const spacing = block.config?.spacing || 'normal';
              const spacingValue = spacing === 'compact' ? '12px' : spacing === 'relaxed' ? '24px' : '18px';
              
              // Calculate fixed thumbnail size
              const thumbnailSize = columns <= 3 ? '160px' : columns === 4 ? '140px' : '120px';
              
              // Simple inline-block approach with proper spacing
              const imageHtml = images.map((image: any, index: number) => {
                const isNotFirstInRow = index % columns !== 0;
                return `<div style="display: inline-block; width: ${thumbnailSize}; height: ${thumbnailSize}; vertical-align: top; ${isNotFirstInRow ? `margin-left: ${spacingValue};` : ''} margin-bottom: ${spacingValue};">
                  <div style="position: relative; width: 100%; height: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.15); background-color: #f8f9fa; cursor: pointer; transition: transform 0.2s ease;">
                    <img src="${image.url}" alt="${image.alt || `Gallery image ${index + 1}`}" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy" />
                    ${image.caption ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; padding: 6px 8px; font-size: 11px; line-height: 1.3; text-align: center; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${image.caption}</div>` : ''}
                  </div>
                </div>`;
              }).join('');
              
              return `
                <div style="margin: 40px 0; clear: both; display: block; overflow: hidden; width: 100%; position: relative;">
                  ${block.title ? `<h3 style="margin-bottom: 20px; font-size: 20px; font-weight: 600; color: #1f2937;">${block.title}</h3>` : ''}
                  <div style="font-size: 0; line-height: 0; text-align: left; width: 100%;">
                    ${imageHtml}
                  </div>
                </div>
              `;
            }
            return '';

          case 'divider':
            return `<hr style="margin: 50px 0; border: 0; border-top: 1px solid #e5e7eb; clear: both;" />`;
          
          default:
            return block.content || '';
        }
      })
      .filter(html => html.trim() !== '');
    
    // Her blok arasına clearfix ekleyelim
    return htmlParts.join('<div style="clear: both; display: block; overflow: hidden; height: 0; line-height: 0; font-size: 0;"></div>');
  } catch (error) {
    console.error('Content parse error:', error);
    // Fallback: content'i direkt HTML olarak kullan
    return content;
  }
}
