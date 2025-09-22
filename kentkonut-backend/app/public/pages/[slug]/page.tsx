"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ContentRenderer } from '@/components/public/content';
import { QuickNavigation } from '@/components/public/navigation';
import { PageHeader, PageFooter } from '@/components/public/layout';
import { usePageData, useNavigation } from '@/hooks/public';

export default function PublicPageView() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Use custom hooks for data and navigation
  const { page, loading, error } = usePageData(slug);
  const { 
    navigationItems,
    activeSection,
    showQuickNavigation,
    setShowQuickNavigation,
    scrollToSection
  } = useNavigation(page?.contents || []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sayfa yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sayfa Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız sayfa mevcut değil.</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  const sortedContents = page.contents
    ?.filter(content => content.isActive)
    .sort((a, b) => a.order - b.order) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
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
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana sayfaya dön
          </Link>
        </div>

        {/* Page Contents */}
        <div className="space-y-12">
          {sortedContents.map((content) => (
            <div key={content.id} id={`content-${content.id}`}>
              <ContentRenderer content={content} />
            </div>
          ))}
        </div>

        {/* Quick Navigation */}
        <QuickNavigation
          items={navigationItems}
          activeSection={activeSection}
          onNavigate={scrollToSection}
        />
      </main>

      {/* Page Footer */}
      <PageFooter updatedAt={page.updatedAt} />
    </div>
  );
}