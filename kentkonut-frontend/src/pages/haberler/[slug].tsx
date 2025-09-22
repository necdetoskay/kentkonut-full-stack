import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import React, { Suspense, lazy } from 'react';
import DOMPurify from 'dompurify';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt?: string;
  type: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED';
  embedUrl?: string;
  mimeType?: string;
}

interface NewsDetail {
  id: number;
  title: string;
  content: string;
  summary?: string;
  publishedAt?: string;
  media?: { url: string };
  galleryItems?: { media: MediaItem }[];
  slug: string;
  viewCount?: number;
  shareCount?: number;
  downloadCount?: number;
  likeCount?: number;
}

import { getApiBaseUrl } from '@/config/ports';

const backendBase = getApiBaseUrl();

// URL oluşturma yardımcı fonksiyonu
const getMediaUrl = (url?: string) => {
  if (!url) return null;
  let normalizedUrl = url;
  // http ile başlıyorsa dokunma
  if (normalizedUrl.startsWith('http')) return normalizedUrl;
  // public ile başlıyorsa temizle
  normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
  // public/haberler ile başlıyorsa sadece /haberler/ ile başlat
  normalizedUrl = normalizedUrl.replace(/^\/public\/haberler\//, '/haberler/');
  // uploads ile başlıyorsa temizle ve /haberler/ ile başlat
  normalizedUrl = normalizedUrl.replace(/^\/uploads\/haberler\//, '/haberler/');
  normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/haberler/');
  // haberler ile başlamıyorsa ekle
  if (!normalizedUrl.startsWith('/haberler/')) {
    normalizedUrl = '/haberler/' + normalizedUrl.replace(/^\//, '');
  }
  return `${backendBase}${normalizedUrl}`;
};

// 1. Küçük yardımcı fonksiyonlar dışarı alındı
const getMediaTitle = (media: MediaItem) => media.alt || media.filename;
const getMediaDescription = (media: MediaItem) => media.alt || '';

// Modal bileşeni
function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC ile kapatma ve focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusableEls = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        } else if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Modal açıldığında ilk butona focus
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const btn = modalRef.current.querySelector<HTMLElement>('button, [tabindex]:not([tabindex="-1"])');
      btn?.focus();
    }
  }, [isOpen]);

  // Modal açıkken body scroll'u engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 transition-opacity duration-300 animate-fade-in" onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative outline-none shadow-xl transition-transform duration-300 animate-modal-pop"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Kapat"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

const NewsGallery = lazy(() => import('@/components/NewsGallery').then(mod => ({ default: mod.NewsGallery })));

// Gelişmiş sosyal medya paylaşım + istatistik barı
function SocialBar({ title, newsId, stats }: { 
  title: string, 
  newsId: number,
  stats: { 
    viewCount: number;
    shareCount: number;
    downloadCount: number;
    likeCount: number;
  } 
}) {
  const [currentStats, setCurrentStats] = useState(stats);
  const [isLiked, setIsLiked] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleShare = async (platform: string) => {
    try {
      await fetch(`${backendBase}/api/news/${newsId}/share`, {
        method: 'PATCH'
      });
      setCurrentStats(prev => ({ ...prev, shareCount: prev.shareCount + 1 }));
    } catch (error) {
      console.error('Share count update failed:', error);
    }
  };

  const handleLike = async () => {
    if (isLiked) return;
    
    try {
      await fetch(`${backendBase}/api/news/${newsId}/like`, {
        method: 'PATCH'
      });
      setCurrentStats(prev => ({ ...prev, likeCount: prev.likeCount + 1 }));
      setIsLiked(true);
    } catch (error) {
      console.error('Like count update failed:', error);
    }
  };

  return (
    <div className="w-full bg-gray-100 rounded-lg flex flex-row flex-wrap lg:flex-nowrap items-center justify-between gap-4 px-4 py-3 mt-8 mb-4 overflow-x-auto">
      {/* Sol: Paylaşım ve etkileşim butonları */}
      <div className="flex items-center gap-3 flex-nowrap min-w-0">
        <span className="font-semibold text-gray-600 text-sm whitespace-nowrap">Paylaş:</span>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShare('facebook')}
          aria-label="Facebook'ta paylaş"
          className="rounded bg-white hover:bg-blue-100 text-blue-600 w-9 h-9 flex items-center justify-center transition border border-gray-200 shadow-sm"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShare('twitter')}
          aria-label="Twitter'da paylaş"
          className="rounded bg-white hover:bg-sky-100 text-sky-500 w-9 h-9 flex items-center justify-center transition border border-gray-200 shadow-sm"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.916 4.916 0 0 0 16.616 3c-2.72 0-4.924 2.206-4.924 4.924 0 .386.044.763.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.724-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.423.232-2.173.084.612 1.908 2.387 3.293 4.487 3.33A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
        </a>
        <a
          href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShare('whatsapp')}
          aria-label="WhatsApp'ta paylaş"
          className="rounded bg-white hover:bg-green-100 text-green-500 w-9 h-9 flex items-center justify-center transition border border-gray-200 shadow-sm"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.463 3.479 1.341 4.991L2 22l5.115-1.341a9.953 9.953 0 0 0 4.889 1.247h.004c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.182-2.929-7.071A9.953 9.953 0 0 0 12.004 2.003zm5.993 15.99c-.26.737-1.516 1.414-2.104 1.505-.557.085-1.24.12-1.995-.117-.427-.135-.98-.316-1.684-.62-2.978-1.162-4.922-4.159-5.068-4.357-.146-.198-1.213-1.611-1.213-3.074 0-1.462.768-2.18 1.04-2.478.272-.298.594-.373.792-.373.199 0 .398.002.571.01.182.01.427-.069.669.51.247.595.841 2.058.916 2.206.075.149.124.323.025.521-.1.199-.149.323-.3.497-.148.173-.312.387-.446.52-.148.148-.303.309-.13.606.173.298.77 1.271 1.653 2.059 1.135 1.012 2.093 1.326 2.39 1.475.297.148.471.123.644-.075.173-.198.742-.867.94-1.164.199-.298.397-.249.67-.15.272.1 1.733.818 2.03.967.297.149.496.223.57.347.075.123.075.718-.173 1.413z"/></svg>
        </a>
        {/* Beğeni butonu */}
        <button
          onClick={handleLike}
          disabled={isLiked}
          className={`rounded w-9 h-9 flex items-center justify-center transition border border-gray-200 shadow-sm ${
            isLiked 
              ? 'bg-red-500 text-white' 
              : 'bg-white hover:bg-red-500 hover:text-white text-red-500'
          }`}
          aria-label="Beğen"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181"/></svg>
        </button>
      </div>
      {/* Sağ: İstatistikler */}
      <div className="flex items-center gap-3 text-gray-600 text-sm flex-wrap">
        <span className="flex items-center gap-1">
          <span>👁️</span> {currentStats.viewCount} görüntülenme
        </span>
        <span className="flex items-center gap-1">
          <span>📤</span> {currentStats.shareCount} paylaşım
        </span>
        <span className="flex items-center gap-1">
          <span>❤️</span> {currentStats.likeCount} beğeni
        </span>
        <span className="flex items-center gap-1">
          <span>📥</span> {currentStats.downloadCount} indirme
        </span>
      </div>
    </div>
  );
}

const HaberDetay = () => {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Diğer haberler için state
  const [otherNews, setOtherNews] = useState<NewsDetail[]>([]);
  const [otherLoading, setOtherLoading] = useState(true);
  const [otherError, setOtherError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const apiUrl = `${backendBase}/api/news/slug/${slug}`;
    
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error('Haber bulunamadı');
        return res.json();
      })
      .then(data => {
        setNews(data.data || data);
      })
      .catch(err => {
        setError(err.message || 'Bilinmeyen hata');
      })
      .finally(() => {
        setLoading(false);
      });

    // Diğer haberleri çek
    setOtherLoading(true);
    setOtherError(null);
    fetch(`${backendBase}/api/news?limit=5&published=true`)
      .then(res => {
        if (!res.ok) throw new Error('Diğer haberler alınamadı');
        return res.json();
      })
      .then(data => {
        // Aktif haber hariç tut
        const filtered = (data.news || []).filter((n: NewsDetail) => n.slug !== slug);
        setOtherNews(filtered);
      })
      .catch(err => {
        setOtherError(err.message || 'Bilinmeyen hata');
      })
      .finally(() => setOtherLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;
  }
  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }
  if (!news) {
    return <div className="text-center py-20 text-gray-500">Haber bulunamadı.</div>;
  }

  // İçerik XSS koruması
  const sanitizedContent = DOMPurify.sanitize(news.content);

  const imageUrl = news.media?.url ? getMediaUrl(news.media.url) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header spacer - responsive */}
      <div className="h-[100px] md:h-[140px] w-full flex-shrink-0"></div>
      {/* Ana içerik ve sağ sidebar */}
      <div className="kent-container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 px-2 sm:px-6">
        {/* Ana içerik */}
        <div className="col-span-1 lg:col-span-9 bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
          {/* Haberler ana sayfasına dönüş linki */}
          <a href="/haberler" className="inline-flex items-center gap-2 text-kentblue font-semibold text-base mb-4 hover:text-blue-700 transition-colors group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Haberler'e Dön
          </a>
          <h1 className="text-2xl sm:text-3xl font-bold text-kentblue mb-4 mt-2">{news.title}</h1>
          <div className="flex items-center mb-4 text-gray-400 text-sm">
            <span>{news.publishedAt ? new Date(news.publishedAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
          </div>
          {/* Ana görsel */}
          <div className="w-full h-48 sm:h-72 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt={news.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-gray-400">Ana Görsel Yok</span>
            )}
          </div>
          {/* İçerik */}
          <div className="prose max-w-none mb-6 sm:mb-8 text-sm sm:text-base text-justify" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          
          {/* Sosyal medya + istatistik barı */}
          <SocialBar 
            title={news.title} 
            newsId={news.id}
            stats={{ 
              viewCount: news.viewCount || 0,
              shareCount: news.shareCount || 0,
              downloadCount: news.downloadCount || 0,
              likeCount: news.likeCount || 0
            }} 
          />
          
          {/* Gelişmiş galeri */}
          {news && news.galleryItems && news.galleryItems.length > 0 && (
            <Suspense fallback={<div className="text-center py-8 text-gray-400">Galeri yükleniyor...</div>}>
              <NewsGallery galleryItems={news.galleryItems} newsId={news.id} />
            </Suspense>
          )}
        </div>
        
        {/* Sağ sidebar: Diğer Haberler */}
        <aside className="col-span-1 lg:col-span-3 mt-8 lg:mt-0">
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <h3 className="text-base sm:text-lg font-bold mb-4">Diğer Haberler</h3>
            {otherLoading ? (
              <div className="text-gray-400 py-6 text-center">Yükleniyor...</div>
            ) : otherError ? (
              <div className="text-red-500 py-6 text-center">{otherError}</div>
            ) : otherNews.length === 0 ? (
              <div className="text-gray-400 py-6 text-center">Başka haber yok.</div>
            ) : (
              <ul className="space-y-4">
                {otherNews.map((item) => {
                  const thumb = item.media?.url ? getMediaUrl(item.media.url) : null;
                  return (
                    <li key={item.id} className="flex gap-3 items-center">
                      <Link to={`/haberler/${item.slug}`} className="flex gap-3 items-center group">
                        <div className="w-16 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {thumb ? (
                            <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-gray-400">Görsel yok</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm group-hover:underline line-clamp-2">{item.title}</div>
                          <div className="text-xs text-gray-400">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '-'}</div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
      
    </div>
  );
};

export default HaberDetay;