"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ContentRenderer } from '@/components/public/content';
import { QuickNavigation } from '@/components/public/navigation';
import { PageHeader, PageFooter } from '@/components/public/layout';
import { usePageData, useNavigation } from '@/hooks/public';

export default function PublicPageView() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Use custom hooks for data fetching and navigation
  const { page, loading, error } = usePageData(slug);
  const { 
    navigationItems, 
    activeSection, 
    showQuickNavigation, 
    setShowQuickNavigation, 
    scrollToSection 
  } = useNavigation(page?.contents || []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sayfa yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <ExternalLink className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sayfa Bulunamadı</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        page={page}
        navigationItems={navigationItems}
        showQuickNavigation={showQuickNavigation}
        onToggleQuickNavigation={() => setShowQuickNavigation(!showQuickNavigation)}
        onNavigate={scrollToSection}
        activeSection={activeSection}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* CSS Styles */}
        <style jsx global>{`
          .content-display img {
            max-width: 100%;
            height: auto;
            margin: 1rem auto;
            border-radius: 0.375rem;
          }
          .content-display figure {
            margin: 2rem auto;
            text-align: center;
          }
          .content-display figcaption {
            font-style: italic;
            color: #6b7280;
            font-size: 0.875rem;
            margin-top: 0.5rem;
          }
          .content-display blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1rem;
            margin: 1.5rem 0;
            font-style: italic;
            background-color: #f8fafc;
            padding: 1rem;
            border-radius: 0.375rem;
          }
          
          .badge-youtube {
            background-color: #dc2626;
          }
          
          .badge-vimeo {
            background-color: #3b82f6;
          }
          
          .badge-local {
            background-color: #4f46e5;
          }
        `}</style>

        {/* Page Contents */}
        <div className="space-y-8">
          {page.contents
            .filter(content => content.isActive)
            .sort((a, b) => a.order - b.order)
            .map((content) => (
              <ContentRenderer key={content.id} content={content} />
            ))}
        </div>

        {/* Empty State */}
        {page.contents.filter(content => content.isActive).length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ExternalLink className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              İçerik Bulunamadı
            </h3>
            <p className="text-gray-500">
              Bu sayfa için henüz yayınlanmış içerik bulunmuyor.
            </p>
          </div>
        )}
      </main>

      {/* Quick Navigation */}
      <QuickNavigation
        items={navigationItems}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Footer */}
      <PageFooter updatedAt={page.updatedAt} />
    </div>
  );
}
