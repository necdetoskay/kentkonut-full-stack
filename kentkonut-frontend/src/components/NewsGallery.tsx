import React, { useState, useEffect, useRef } from 'react';
import { getApiBaseUrl } from '../config/ports';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt?: string;
  type: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED';
  embedUrl?: string;
  mimeType?: string;
}

const backendBase = getApiBaseUrl();

const getMediaUrl = (url?: string) => {
  if (!url) return null;
  let normalizedUrl = url;
  if (normalizedUrl.startsWith('http')) return normalizedUrl;
  normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
  normalizedUrl = normalizedUrl.replace(/^\/public\/haberler\//, '/haberler/');
  normalizedUrl = normalizedUrl.replace(/^\/uploads\/haberler\//, '/haberler/');
  normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/haberler/');
  if (!normalizedUrl.startsWith('/haberler/')) {
    normalizedUrl = '/haberler/' + normalizedUrl.replace(/^\//, '');
  }
  return `${backendBase}${normalizedUrl}`;
};

function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const btn = modalRef.current.querySelector<HTMLElement>('button, [tabindex]:not([tabindex="-1"])');
      btn?.focus();
    }
  }, [isOpen]);

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

// NewsGallery bileşeni
export function NewsGallery({ galleryItems, newsId }: { galleryItems: { media: MediaItem }[], newsId: number }) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [fadeKey, setFadeKey] = useState(0);

  if (!galleryItems || galleryItems.length === 0) return null;

  const openModal = (media: MediaItem, index: number) => {
    setSelectedMedia(media);
    setCurrentIndex(index);
    setModalOpen(true);
    setLoadingMedia(true);
    setMediaError(null);
    setFadeKey(prev => prev + 1);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMedia(null);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextMedia();
      if (e.key === 'ArrowLeft') prevMedia();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, currentIndex, galleryItems]);

  const nextMedia = () => {
    if (currentIndex < galleryItems.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedMedia(galleryItems[nextIdx].media);
      setLoadingMedia(true);
      setMediaError(null);
      setFadeKey(prev => prev + 1);
    }
  };
  const prevMedia = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setSelectedMedia(galleryItems[prevIdx].media);
      setLoadingMedia(true);
      setMediaError(null);
      setFadeKey(prev => prev + 1);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (embedUrl: string) => {
    const videoId = getYouTubeVideoId(embedUrl);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const getMediaIcon = (type: string, mimeType?: string) => {
    if (type === 'EMBED' || mimeType?.startsWith('video/')) return '🎥';
    if (type === 'PDF' || mimeType === 'application/pdf') return '📄';
    if (type === 'WORD' || mimeType?.includes('word')) return '📝';
    return '🖼️';
  };

  const handleMediaClick = async (media: MediaItem) => {
    if (media.type === 'PDF' || media.type === 'WORD') {
      try {
        await fetch(`${backendBase}/api/news/${newsId}/download`, { method: 'PATCH' });
        const mediaUrl = getMediaUrl(media.url);
        if (!mediaUrl) return;
        const link = document.createElement('a');
        link.href = mediaUrl;
        link.download = media.filename || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        // hata yönetimi
      }
    } else {
      openModal(media, galleryItems.findIndex(item => item.media.id === media.id));
    }
  };

  return (
    <>
      <div className="mt-6">
        <h4 className="font-semibold mb-4 text-lg text-gray-800">Galeri ({galleryItems.length})</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {galleryItems.map((item, i) => {
            const media = item.media;
            const url = getMediaUrl(media.url);
            let thumbnailUrl = null;
            let isVideo = false;
            if (media.type === 'EMBED' && media.embedUrl) {
              thumbnailUrl = getYouTubeThumbnail(media.embedUrl);
              isVideo = true;
            } else if (media.type === 'IMAGE') {
              thumbnailUrl = url;
              isVideo = false;
            } else if (media.type === 'VIDEO' || (media.mimeType && media.mimeType.startsWith('video/'))) {
              thumbnailUrl = url;
              isVideo = true;
            }
            return (
              <div key={media.id} className="flex flex-col items-center group cursor-pointer">
                <div
                  className="w-full h-24 sm:h-32 rounded-lg overflow-hidden bg-gray-100 border shadow-sm hover:shadow-md transition-shadow flex items-center justify-center group-hover:scale-105 group-hover:z-10 transition-transform duration-200"
                  onClick={() => openModal(media, i)}
                >
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={media.alt || media.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class=\"w-full h-full flex flex-col items-center justify-center bg-gray-50\"><div class=\"text-3xl mb-2\">❌</div><div class=\"text-xs text-red-500\">Yüklenemedi</div></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                      <div className="text-3xl mb-2">❌</div>
                      <div className="text-xs text-red-500">Yüklenemedi</div>
                    </div>
                  )}
                </div>
                <div className="w-full mt-2 text-xs text-center text-gray-700">
                  {media.alt && <div>{media.alt}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={closeModal}>
        {selectedMedia && (
          <div className="p-4 flex flex-col items-center w-full max-w-2xl">
            {/* Lightbox navigation */}
            <div className="flex w-full justify-between items-center mb-2">
              <button
                onClick={prevMedia}
                disabled={currentIndex === 0}
                className={`p-2 rounded-full text-2xl font-bold transition ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                aria-label="Önceki medya"
              >
                &#8592;
              </button>
              <span className="text-xs text-gray-400">{currentIndex + 1} / {galleryItems.length}</span>
              <button
                onClick={nextMedia}
                disabled={currentIndex === galleryItems.length - 1}
                className={`p-2 rounded-full text-2xl font-bold transition ${currentIndex === galleryItems.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                aria-label="Sonraki medya"
              >
                &#8594;
              </button>
            </div>
            {/* Başlık ve açıklama */}
            <div className="w-full mb-4 text-center">
              <div className="text-xl font-bold text-kentblue">
                {selectedMedia.alt || selectedMedia.filename}
              </div>
              {selectedMedia.alt && (
                <div className="text-gray-500 text-sm mt-1">{selectedMedia.alt}</div>
              )}
            </div>
            {/* Medya */}
            <div key={fadeKey} className={`w-full flex items-center justify-center transition-opacity duration-300 ${loadingMedia ? 'opacity-0' : 'opacity-100'}`}
              style={{ minHeight: '200px', minWidth: '200px' }}>
              {mediaError ? (
                <div className="text-center text-red-600 text-lg">{mediaError}</div>
              ) : selectedMedia.type === 'IMAGE' ? (
                <img
                  src={getMediaUrl(selectedMedia.url)}
                  alt={selectedMedia.alt || selectedMedia.filename}
                  className="w-full max-w-2xl h-auto rounded object-contain"
                  style={{ maxHeight: '70vh' }}
                  onLoad={() => setLoadingMedia(false)}
                  onError={() => { setMediaError('Görsel yüklenemedi.'); setLoadingMedia(false); }}
                />
              ) : selectedMedia.type === 'EMBED' && selectedMedia.embedUrl ? (
                <iframe
                  src={selectedMedia.embedUrl.includes('youtube.com')
                    ? selectedMedia.embedUrl.replace('watch?v=', 'embed/')
                    : selectedMedia.embedUrl}
                  className="w-full max-w-2xl aspect-video rounded"
                  allowFullScreen
                  title={selectedMedia.filename}
                  style={{ minHeight: '200px' }}
                  onLoad={() => setLoadingMedia(false)}
                  onError={() => { setMediaError('Video yüklenemedi.'); setLoadingMedia(false); }}
                />
              ) : selectedMedia.type === 'VIDEO' ? (
                <video
                  controls
                  className="w-full max-w-2xl aspect-video rounded"
                  src={getMediaUrl(selectedMedia.url)}
                  style={{ maxHeight: '70vh' }}
                  onLoadedData={() => setLoadingMedia(false)}
                  onError={() => { setMediaError('Video yüklenemedi.'); setLoadingMedia(false); }}
                >
                  Tarayıcınız video oynatmayı desteklemiyor.
                </video>
              ) : (
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">{getMediaIcon(selectedMedia.type, selectedMedia.mimeType)}</div>
                  <h3 className="text-lg font-semibold mb-2">{selectedMedia.filename}</h3>
                  <p className="text-gray-600 mb-4">Bu dosya türü önizlenemiyor.</p>
                  <button
                    onClick={() => handleMediaClick(selectedMedia)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Dosyayı İndir
                  </button>
                </div>
              )}
            </div>
            {loadingMedia && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white bg-opacity-60">
                <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                <div className="text-blue-600 font-semibold">Yükleniyor...</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}