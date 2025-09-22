"use client";

import Link from 'next/link';
import { ArrowLeft, Eye, Calendar, User, Tag } from 'lucide-react';
import { ensureAbsoluteUrl } from '@/lib/url-utils';

interface PageHeaderProps {
  page: {
    title: string;
    subtitle?: string;
    description?: string;
    headerImage?: string;
    publishedAt?: string;
  };
  navigationItems: Array<{
    id: string;
    title: string;
    type: string;
    order: number;
  }>;
  showQuickNavigation: boolean;
  onToggleQuickNavigation: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export function PageHeader({ 
  page, 
  navigationItems, 
  showQuickNavigation, 
  onToggleQuickNavigation,
  onNavigate,
  activeSection 
}: PageHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <span className="text-red-500">🎥</span>;
      case 'IMAGE':
        return <span className="text-green-500">📷</span>;
      case 'TEXT':
        return <span className="text-blue-500">📝</span>;
      case 'RICH_TEXT':
        return <span className="text-purple-500">📄</span>;
      default:
        return <span className="text-gray-500">📄</span>;
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfa
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              Önizleme
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <header className="mb-8">
        {page.headerImage && (
          <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
            <img
              src={ensureAbsoluteUrl(page.headerImage) || ''}
              alt={page.title}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                console.error('Failed to load header image:', page.headerImage);
              }}
            />
          </div>
        )}
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {page.title}
        </h1>
        
        {page.subtitle && (
          <h2 className="text-xl text-gray-600 mb-6 leading-relaxed">
            {page.subtitle}
          </h2>
        )}

        {page.description && (
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {page.description}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
          {page.publishedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Yayınlandı: {formatDate(page.publishedAt)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Kent Konut</span>
          </div>
          
          {/* Hızlı erişim butonu */}
          {navigationItems.length > 0 && (
            <button
              onClick={onToggleQuickNavigation}
              className="flex items-center gap-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors ml-auto"
            >
              <Tag className="w-4 h-4" />
              <span>İçindekiler</span>
              <span className="text-xs bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full">
                {navigationItems.length}
              </span>
            </button>
          )}
        </div>
        
        {/* Hızlı erişim menüsü */}
        {showQuickNavigation && navigationItems.length > 0 && (
          <div className="mt-4 mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Sayfa İçeriği - Hızlı Erişim
            </h3>
            <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {navigationItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                    activeSection === item.id 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <span className="text-xs text-gray-500 font-mono w-6">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {getTypeIcon(item.type)}
                    <span className="truncate">{item.title}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
