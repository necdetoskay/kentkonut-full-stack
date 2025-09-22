"use client";

import { SafeHtmlRenderer } from '@/components/content/SafeHtmlRenderer';
import { ensureAbsoluteUrl } from '@/lib/url-utils';

interface ImageContentProps {
  content: {
    id: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    alt?: string;
    caption?: string;
  };
}

export function ImageContentRenderer({ content }: ImageContentProps) {
  return (
    <div className="mb-6">
      <div className="rounded-lg overflow-hidden relative bg-gray-100 min-h-[100px]">
        {content.imageUrl ? (
          <img 
            src={ensureAbsoluteUrl(content.imageUrl) || ''}
            alt={content.alt || content.title || "Görsel"}
            className="max-w-full w-auto h-auto mx-auto"
            loading="lazy"
            onError={(e) => {
              // Resim yüklenemediğinde hata mesajını göster
              e.currentTarget.style.display = 'none';
              const errorElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (errorElement) errorElement.style.display = 'flex';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-100 text-gray-500">
            <p>Bu içerikte görsel bulunamadı</p>
          </div>
        )}
        <div className="hidden flex-col items-center justify-center py-10 bg-gray-100 text-gray-500">
          <p>Görsel yüklenemedi</p>
        </div>
      </div>
      
      {content.caption && (
        <p className="text-center text-gray-600 mt-2 italic">
          {content.caption}
        </p>
      )}
      
      {content.content && content.content.trim() !== '' && (
        <div className="mt-6 max-w-none">
          <SafeHtmlRenderer
            content={content.content}
            className=""
          />
        </div>
      )}
    </div>
  );
}
