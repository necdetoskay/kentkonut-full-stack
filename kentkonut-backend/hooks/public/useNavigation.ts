"use client";

import { useEffect, useState, useMemo } from 'react';

interface PageContent {
  id: string;
  title?: string;
  type: string;
  order: number;
  isActive: boolean;
}

interface NavigationItem {
  id: string;
  title: string;
  type: string;
  order: number;
}

interface UseNavigationReturn {
  navigationItems: NavigationItem[];
  activeSection: string;
  showQuickNavigation: boolean;
  setShowQuickNavigation: (show: boolean) => void;
  scrollToSection: (sectionId: string) => void;
}

export function useNavigation(contents: PageContent[]): UseNavigationReturn {
  const [activeSection, setActiveSection] = useState<string>('');
  const [showQuickNavigation, setShowQuickNavigation] = useState(false);

  // Sayfa içeriklerinden hızlı erişim menüsü oluşturma
  const navigationItems = useMemo(() => {
    if (!contents) return [];
    
    return contents
      .filter(content => content.isActive && (content.title || content.type === 'VIDEO' || content.type === 'IMAGE'))
      .sort((a, b) => a.order - b.order)
      .map(content => ({
        id: content.id,
        title: content.title || (content.type === 'VIDEO' ? 'Video İçeriği' : content.type === 'IMAGE' ? 'Görsel İçeriği' : 'İçerik'),
        type: content.type,
        order: content.order
      }));
  }, [contents]);

  // Smooth scroll fonksiyonu
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`content-${sectionId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      setActiveSection(sectionId);
    }
  };

  // Intersection Observer for active section tracking
  useEffect(() => {
    if (!contents || contents.length === 0) return;

    const observerOptions = {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id.replace('content-', '');
          setActiveSection(sectionId);
        }
      });
    }, observerOptions);

    // Sadece aktif içerikleri gözlemle
    const activeContents = contents.filter(content => content.isActive);
    activeContents.forEach((content) => {
      const element = document.getElementById(`content-${content.id}`);
      if (element instanceof Element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [contents]);

  return {
    navigationItems,
    activeSection,
    showQuickNavigation,
    setShowQuickNavigation,
    scrollToSection
  };
}
