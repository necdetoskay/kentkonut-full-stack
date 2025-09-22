"use client";

import { useState } from 'react';
import { Tag } from 'lucide-react';

interface NavigationItem {
  id: string;
  title: string;
  type: string;
  order: number;
}

interface QuickNavigationProps {
  items: NavigationItem[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export function QuickNavigation({ items, activeSection, onNavigate }: QuickNavigationProps) {
  const [showQuickNavigation, setShowQuickNavigation] = useState(false);

  if (items.length === 0) {
    return null;
  }

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
    setShowQuickNavigation(false);
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
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Ana floating buton */}
        <button
          onClick={() => setShowQuickNavigation(!showQuickNavigation)}
          className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
            showQuickNavigation 
              ? 'bg-blue-600 text-white rotate-45' 
              : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-xl'
          }`}
          title="İçindekiler"
        >
          <Tag className="w-5 h-5" />
        </button>
        
        {/* Floating hızlı erişim menüsü */}
        {showQuickNavigation && (
          <div className="absolute bottom-16 right-0 w-72 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto">
            <div className="p-3 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Hızlı Erişim
              </h4>
            </div>
            <nav className="p-2">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left mb-1 ${
                    activeSection === item.id 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-xs text-gray-400 font-mono w-6">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {getTypeIcon(item.type)}
                    <span className="truncate text-xs">{item.title}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
