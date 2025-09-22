"use client";

import { useEffect, useState } from 'react';

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

interface Page {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  headerImage?: string;
  isActive: boolean;
  publishedAt?: string;
  updatedAt: string;
  contents: PageContent[];
}

interface UsePageDataReturn {
  page: Page | null;
  loading: boolean;
  error: string | null;
}

export function usePageData(slug: string): UsePageDataReturn {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        
        // Slug ile sayfayı getir
        const response = await fetch(`/api/pages/by-slug/${encodeURIComponent(slug)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Sayfa bulunamadı');
          } else {
            setError('Bir hata oluştu');
          }
          return;
        }

        const pageData = await response.json();

        // API yanıt yapısında hata kontrolü
        if (!pageData) {
          setError('API yanıtı boş veya geçersiz');
          return;
        }
        
        // Sadece aktif sayfaları göster
        if (!pageData.isActive) {
          setError('Bu sayfa henüz yayınlanmamış');
          return;
        }
        
        // İçerik kontrolü
        if (!pageData.contents || !Array.isArray(pageData.contents)) {
          console.error('Page contents missing or not an array:', pageData.contents);
          setError('Sayfa içerikleri alınamadı');
          return;
        }
        
        setPage(pageData);
        
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Sayfa yüklenirken bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [slug]);

  return { page, loading, error };
}
