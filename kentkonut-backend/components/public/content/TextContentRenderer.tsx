"use client";

import { SafeHtmlRenderer } from '@/components/content/SafeHtmlRenderer';

interface TextContentProps {
  content: {
    id: string;
    title?: string;
    content?: string;
    caption?: string;
  };
}

export function TextContentRenderer({ content }: TextContentProps) {
  if (!content.content || content.content.trim() === '') {
    return (
      <div className="mb-6">
        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 text-gray-500 rounded-lg">
          <p>Bu içerikte metin bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* İçerik metni */}
      <div className="max-w-none">
        <SafeHtmlRenderer
          content={content.content}
          className=""
        />
      </div>
      
      {/* Caption */}
      {content.caption && (
        <p className="text-center text-gray-600 mt-4 italic">
          {content.caption}
        </p>
      )}
    </div>
  );
}
