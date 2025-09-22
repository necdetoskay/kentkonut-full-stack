"use client";

import { ImageContentRenderer } from './ImageContentRenderer';
import { VideoContentRenderer } from './VideoContentRenderer';
import { TextContentRenderer } from './TextContentRenderer';
import { GalleryContentRenderer } from './GalleryContentRenderer';
import { CTAContentRenderer } from './CTAContentRenderer';
import { QuoteContentRenderer } from './QuoteContentRenderer';
import { ListContentRenderer } from './ListContentRenderer';
import { DividerContentRenderer } from './DividerContentRenderer';

interface PageContent {
  id: string;
  title?: string;
  content?: string;
  type: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  videoUrl?: string;
  alt?: string;
  caption?: string;
  config?: any;
  fullWidth?: boolean;
}

interface ContentRendererProps {
  content: PageContent;
}

export function ContentRenderer({ content }: ContentRendererProps) {  const renderContent = () => {
    switch(content.type.toLowerCase()) {
      case 'image':
        return <ImageContentRenderer content={content} />;
      
      case 'video':
        return <VideoContentRenderer content={content} />;
      
      case 'gallery':
        return <GalleryContentRenderer content={content} />;
      
      case 'cta':
        return <CTAContentRenderer content={content} />;
      
      case 'quote':
        return <QuoteContentRenderer content={content} />;
      
      case 'list':
        return <ListContentRenderer content={content} />;
      
      case 'divider':
        return <DividerContentRenderer content={content} />;
      
      case 'text':
      case 'rich_text':
      default:
        return <TextContentRenderer content={content} />;
    }
  };

  return (
    <section 
      id={`content-${content.id}`} 
      className={`bg-white rounded-lg shadow-sm p-8 scroll-mt-20 ${content.fullWidth ? 'w-full' : ''}`}
    >
      {content.title && (
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
          {content.title}
        </h2>
      )}
      
      {renderContent()}
    </section>
  );
}
