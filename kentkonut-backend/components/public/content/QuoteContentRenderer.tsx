"use client";

import { SafeHtmlRenderer } from '@/components/content/SafeHtmlRenderer';
import { Quote, Star } from 'lucide-react';

interface QuoteContentProps {
  content: {
    id: string;
    title?: string;
    content?: string;
    config?: {
      quote?: string;
      author?: string;
      authorTitle?: string;
      authorImage?: string;
      style?: 'simple' | 'card' | 'testimonial' | 'highlight';
      alignment?: 'left' | 'center' | 'right';
      showQuoteIcon?: boolean;
      rating?: number; // 1-5 stars for testimonials
      backgroundColor?: string;
      textColor?: string;
    };
    caption?: string;
  };
}

export function QuoteContentRenderer({ content }: QuoteContentProps) {
  const quote = content.config?.quote || content.content;
  const author = content.config?.author;
  const authorTitle = content.config?.authorTitle;
  const authorImage = content.config?.authorImage;
  const style = content.config?.style || 'simple';
  const alignment = content.config?.alignment || 'center';
  const showQuoteIcon = content.config?.showQuoteIcon !== false;
  const rating = content.config?.rating;
  const backgroundColor = content.config?.backgroundColor;
  const textColor = content.config?.textColor;

  if (!quote || quote.trim() === '') {
    return (
      <div className="mb-6">
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 text-gray-500 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-2">💬</div>
          <p>Bu alıntı bloğunda içerik bulunmuyor</p>
        </div>
      </div>
    );
  }

  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'center':
      default:
        return 'text-center';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex justify-center space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderSimpleQuote = () => (
    <div className={`${getAlignmentClasses()} mb-6`}>
      <blockquote className="relative">
        {showQuoteIcon && (
          <Quote className="w-8 h-8 text-gray-400 mb-4 mx-auto" />
        )}
        <div className="text-xl italic text-gray-700 leading-relaxed mb-4">
          <SafeHtmlRenderer content={quote} />
        </div>
        {(author || authorTitle) && (
          <footer className="text-gray-600">
            <cite className="not-italic">
              {author && <span className="font-medium">{author}</span>}
              {author && authorTitle && <span>, </span>}
              {authorTitle && <span className="text-sm">{authorTitle}</span>}
            </cite>
          </footer>
        )}
      </blockquote>
    </div>
  );

  const renderCardQuote = () => (
    <div className="mb-6">
      <div className={`bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-500 ${getAlignmentClasses()}`}>
        {showQuoteIcon && (
          <Quote className="w-10 h-10 text-blue-500 mb-4 mx-auto" />
        )}
        <blockquote className="text-lg text-gray-700 leading-relaxed mb-6">
          <SafeHtmlRenderer content={quote} />
        </blockquote>
        {(author || authorTitle) && (
          <footer className="border-t pt-4">
            <cite className="not-italic text-gray-600">
              {author && <span className="font-semibold">{author}</span>}
              {author && authorTitle && <span>, </span>}
              {authorTitle && <span className="text-sm">{authorTitle}</span>}
            </cite>
          </footer>
        )}
      </div>
    </div>
  );

  const renderTestimonialQuote = () => (
    <div className="mb-6">
      <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 ${getAlignmentClasses()}`}>
        {rating && renderStars(rating)}
        
        <blockquote className="text-lg text-gray-700 leading-relaxed mb-6">
          {showQuoteIcon && (
            <Quote className="w-8 h-8 text-blue-400 mb-4 mx-auto" />
          )}
          <SafeHtmlRenderer content={quote} />
        </blockquote>

        {(author || authorTitle || authorImage) && (
          <footer className="flex items-center justify-center space-x-4">
            {authorImage && (
              <img
                src={authorImage}
                alt={author || 'Author'}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
              />
            )}
            <div className="text-left">
              {author && (
                <div className="font-semibold text-gray-800">{author}</div>
              )}
              {authorTitle && (
                <div className="text-sm text-gray-600">{authorTitle}</div>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );

  const renderHighlightQuote = () => (
    <div className="mb-6">
      <div 
        className={`relative rounded-lg p-8 ${getAlignmentClasses()}`}
        style={{
          backgroundColor: backgroundColor || '#f8fafc',
          color: textColor || '#1f2937'
        }}
      >
        {/* Background Quote Icon */}
        <Quote className="absolute top-4 left-4 w-16 h-16 text-gray-200 opacity-50" />
        
        <div className="relative z-10">
          <blockquote className="text-2xl font-light leading-relaxed mb-6">
            <SafeHtmlRenderer content={quote} />
          </blockquote>

          {(author || authorTitle) && (
            <footer className="border-t pt-4">
              <cite className="not-italic">
                {author && (
                  <span className="text-lg font-semibold">{author}</span>
                )}
                {author && authorTitle && <span>, </span>}
                {authorTitle && (
                  <span className="text-base opacity-80">{authorTitle}</span>
                )}
              </cite>
            </footer>
          )}
        </div>
      </div>
    </div>
  );

  const renderQuoteByStyle = () => {
    switch (style) {
      case 'card':
        return renderCardQuote();
      case 'testimonial':
        return renderTestimonialQuote();
      case 'highlight':
        return renderHighlightQuote();
      case 'simple':
      default:
        return renderSimpleQuote();
    }
  };

  return (
    <div className="mb-6">
      {/* Quote Title */}
      {content.title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {content.title}
        </h3>
      )}

      {/* Quote Content */}
      {renderQuoteByStyle()}

      {/* Quote Caption */}
      {content.caption && (
        <p className="text-center text-gray-600 italic text-sm">
          {content.caption}
        </p>
      )}
    </div>
  );
}
