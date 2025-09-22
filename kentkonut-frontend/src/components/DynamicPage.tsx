import React, { useState, useEffect } from 'react';


import '../assets/styles.css';
import { API_BASE_URL } from '../config/environment';

interface PageContent {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  order: number;
  isActive: boolean;
  fullWidth: boolean;
  config?: any;
  alt?: string;
  caption?: string;
}

interface Page {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  headerImage?: string;
  isActive: boolean;
  showInNavigation: boolean;
  order: number;
  pageType: string;
  contents?: PageContent[];
}

interface DynamicPageProps {
  slug: string;
  fallbackContent?: React.ReactNode;
  headerImage?: string;
}

const DynamicPage: React.FC<DynamicPageProps> = ({ slug, fallbackContent, headerImage }) => {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modal'ı kapat
  const closeModal = () => {
    setModalImage(null);
    setIsFullscreen(false);
  };

  // Resme tıklama handler'ı
  const handleImageClick = (imageSrc: string, imageList: string[] = []) => {
    setModalImage(imageSrc);
    setAllImages(imageList.length > 0 ? imageList : [imageSrc]);
    setCurrentImageIndex(imageList.indexOf(imageSrc) >= 0 ? imageList.indexOf(imageSrc) : 0);
  };

  // Önceki resim
  const previousImage = () => {
    if (allImages.length > 1) {
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1;
      setCurrentImageIndex(newIndex);
      setModalImage(allImages[newIndex]);
    }
  };

  // Sonraki resim
  const nextImage = () => {
    if (allImages.length > 1) {
      const newIndex = currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0;
      setCurrentImageIndex(newIndex);
      setModalImage(allImages[newIndex]);
    }
  };

  // Tam ekran toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Resmi indir
  const downloadImage = () => {
    if (modalImage) {
      const link = document.createElement('a');
      link.href = modalImage;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalImage) {
        switch (event.key) {
          case 'Escape':
            closeModal();
            break;
          case 'ArrowLeft':
            previousImage();
            break;
          case 'ArrowRight':
            nextImage();
            break;
          case 'f':
          case 'F':
            toggleFullscreen();
            break;
          case 'd':
          case 'D':
            downloadImage();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalImage, currentImageIndex, allImages, isFullscreen]);

  // Sayfadaki tüm resimleri topla
  const extractImagesFromContent = (contents: PageContent[]): string[] => {
    const allImages: string[] = [];

    contents.forEach(content => {
      if (content.content && typeof content.content === 'string') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content.content, 'text/html');
        const images = doc.querySelectorAll('img');
        const imageSrcs = Array.from(images).map(img => img.src).filter(src => src && src.trim() !== '');
        allImages.push(...imageSrcs);
      }

      // Gallery tipindeki içeriklerin resimlerini de ekle
      if (content.type === 'GALLERY' && content.config?.images) {
        const API_BASE_URL_LOCAL = API_BASE_URL;
        const galleryImages = content.config.images.map((img: any) => `${API_BASE_URL}${img.url}`);
        allImages.push(...galleryImages);
      }
    });

    return allImages;
  };

  // HTML'i tüm stilleriyle birlikte wrapper içine al
  const getStyledContent = (htmlContent: string) => {
    // TinyMCE'den gelen içeriği işle - float özelliklerini ekle
    let processedHtml = htmlContent;
    
    // TinyMCE'den gelen resimleri işle
    // style="float: left;" gibi stil özelliklerini data-float özelliğine dönüştür
    const parser = new DOMParser();
    const doc = parser.parseFromString(processedHtml, 'text/html');
    const images = doc.querySelectorAll('img');
    
    images.forEach(img => {
      const style = img.getAttribute('style') || '';
      
      // Float özelliğini kontrol et
      let floatDir: 'left' | 'right' | 'center' | null = null;
      if (style.includes('float: left')) {
        img.setAttribute('data-float', 'left');
        floatDir = 'left';
      } else if (style.includes('float: right')) {
        img.setAttribute('data-float', 'right');
        floatDir = 'right';
      } else if (style.includes('float: none') || style.includes('margin: auto') || (style.includes('margin-left: auto') && style.includes('margin-right: auto'))) {
        img.setAttribute('data-float', 'center');
        floatDir = 'center';
      }
      
      // Genişlik özelliğini kontrol et
      const width = img.getAttribute('width');
      if (width) {
        img.setAttribute('data-width', width);
      }

      // Eğer görsel bir paragrafın içindeyse ve float verildiyse, paragraf ve sonraki paragrafın margin davranışlarını düzelt
      if (floatDir === 'left' || floatDir === 'right') {
        const parentP = img.closest('p');
        if (parentP) {
          parentP.classList.add('has-float');
          const next = parentP.nextElementSibling as HTMLElement | null;
          if (next && next.tagName === 'P') {
            next.classList.add('after-float');
          }
        }
      }
    });
    
    // İşlenmiş HTML'i al
    if (images.length > 0) {
      processedHtml = doc.body.innerHTML;
    }
    
    const styles = `
      <style>
        .styled-content-wrapper {
          line-height: 1.7;
          font-size: 16px;
          color: #374151;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .styled-content-wrapper p {
          margin-bottom: 1rem;
          line-height: 1.7;
          min-height: 1.7em;
          overflow: visible !important;
          clear: none !important;
          margin-top: 0 !important;
          padding-top: 0 !important;
        }

        .styled-content-wrapper p:first-of-type {
          margin-top: 0 !important;
        }

        /* Float içeren paragraf ve onu takip eden paragrafta margin düzeltmeleri */
        .styled-content-wrapper p.has-float {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          min-height: 0 !important; /* Paragrafın satır yüksekliği kadar yer kaplamasını engelle */
        }

        .styled-content-wrapper p.has-float + p,
        .styled-content-wrapper p.after-float {
          margin-top: 0 !important;
        }

        .styled-content-wrapper p:empty {
          min-height: 1.7em;
          margin-bottom: 1rem;
        }

        .styled-content-wrapper p:empty::before {
          content: "\\00a0";
          opacity: 0;
        }

        .styled-content-wrapper h1, .styled-content-wrapper h2, .styled-content-wrapper h3,
        .styled-content-wrapper h4, .styled-content-wrapper h5, .styled-content-wrapper h6 {
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .styled-content-wrapper strong {
          font-weight: 600;
          color: #1f2937;
        }

        .styled-content-wrapper ul, .styled-content-wrapper ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .styled-content-wrapper li {
          margin-bottom: 0.5rem;
        }

        /* Floating images - TinyMCE ve TipTap için ortak kurallar */
        .styled-content-wrapper img {
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .styled-content-wrapper img:hover {
          opacity: 0.9;
        }

        /* TipTap data-float özelliği için */
        .styled-content-wrapper img[data-float="left"] {
          float: left !important;
          margin: 0 20px 20px 0 !important;
          clear: none !important;
          max-width: 300px !important;
          height: auto !important;
          margin-top: 0 !important;
        }

        .styled-content-wrapper img[data-float="right"] {
          float: right !important;
          margin: 0 0 20px 20px !important;
          clear: none !important;
          max-width: 300px !important;
          height: auto !important;
          margin-top: 0 !important;
        }

        .styled-content-wrapper img[data-float="center"],
        .styled-content-wrapper img[data-float="none"] {
          display: block !important;
          margin: 20px auto !important;
          clear: both !important;
          max-width: 100% !important;
          height: auto !important;
        }

        /* TinyMCE için doğrudan stil özelliklerine göre kurallar */
        .styled-content-wrapper img[style*="float: left"] {
          float: left !important;
          margin: 0 20px 20px 0 !important;
          clear: none !important;
          max-width: 300px !important;
          height: auto !important;
          margin-top: 0 !important;
        }

        .styled-content-wrapper img[style*="float: right"] {
          float: right !important;
          margin: 0 0 20px 20px !important;
          clear: none !important;
          max-width: 300px !important;
          height: auto !important;
          margin-top: 0 !important;
        }

        .styled-content-wrapper img[style*="float: none"],
        .styled-content-wrapper img[style*="margin: auto"],
        .styled-content-wrapper img[style*="margin-left: auto"][style*="margin-right: auto"] {
          display: block !important;
          margin: 20px auto !important;
          clear: both !important;
          max-width: 100% !important;
          height: auto !important;
        }

        /* Floating image genişlik ayarları */
        .styled-content-wrapper img[data-width="150"] {
          max-width: 150px !important;
        }

        .styled-content-wrapper img[data-width="250"] {
          max-width: 250px !important;
        }

        .styled-content-wrapper img[data-width="300"] {
          max-width: 300px !important;
        }

        .styled-content-wrapper img[data-width="400"] {
          max-width: 400px !important;
        }

        .styled-content-wrapper img[data-width="500"] {
          max-width: 500px !important;
        }

        /* Clearfix for floating elements */
        .styled-content-wrapper::after {
          content: "";
          display: table;
          clear: both;
        }
      </style>
      <div class="styled-content-wrapper">
        ${processedHtml}
      </div>
    `;
    return styles;
  };

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL_LOCAL = API_BASE_URL;
      const apiUrl = `${API_BASE_URL}/api/public/pages/${slug}`;
      console.log('🔗 Fetching from:', apiUrl);

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Sayfa bulunamadı');
        } else {
          throw new Error('Sayfa yüklenemedi');
        }
        return;
      }
      
      const result = await response.json();
      console.log('🔍 API Response:', result);

      const data = result.data; // API response has data wrapper
      console.log('📄 Page Data:', data);

      // Parse content based on format
      if (data.content && typeof data.content === 'string') {
        try {
          const contentData = JSON.parse(data.content);
          console.log('📝 Parsed Content:', contentData);

          if (contentData.blocks && Array.isArray(contentData.blocks)) {
            // EditorJS format
            console.log('📋 Content is EditorJS format with blocks:', contentData.blocks.length);
            data.contents = contentData.blocks;
          } else {
            // Not EditorJS, treat as HTML
            console.log('📋 Content is JSON but not EditorJS, treating as HTML');
            data.contents = [{ type: 'TEXT', content: data.content }];
          }
        } catch (e) {
          // JSON parse failed, treat as HTML
          console.log('📋 Content is plain HTML string, treating as HTML');
          data.contents = [{ type: 'TEXT', content: data.content }];
        }
      }

      setPage(data);
      
      // Set dynamic SEO meta tags
      if (data.metaTitle) {
        document.title = data.metaTitle;
      }
      
      if (data.metaDescription) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', data.metaDescription);
        } else {
          const meta = document.createElement('meta');
          meta.name = 'description';
          meta.content = data.metaDescription;
          document.head.appendChild(meta);
        }
      }
      
    } catch (err) {
      console.error('Sayfa yükleme hatası:', err);
      setError('Sayfa yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: PageContent, index: number = 0) => {
    const wrapperClass = content.fullWidth ? 'w-full' : 'container mx-auto px-4';
    
    switch (content.type) {
      case 'TEXT':
      case 'text':
        return (
          <div key={content.id || `text-${index}`} className={`${wrapperClass} py-4`}>
            {content.title && content.title !== 'İçerik' && (
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <h3 className="text-lg text-gray-600 mb-4">
                {content.subtitle}
              </h3>
            )}
            {content.content && (
              <div
                className="max-w-none text-gray-700 simple-tiptap-content"
                dangerouslySetInnerHTML={{
                  __html: typeof content.content === 'string'
                    ? getStyledContent(content.content)
                    : JSON.stringify(content.content)
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'IMG') {
                    const img = target as HTMLImageElement;
                    const allPageImages = extractImagesFromContent(page.contents || []);
                    handleImageClick(img.src, allPageImages);
                  }
                }}
              />
            )}
          </div>
        );

      case 'gallery':
        return (
          <div key={content.id || `gallery-${index}`} className={`${wrapperClass} py-4`}>
            {content.title && (
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">
                {content.title}
              </h2>
            )}
            {content.config?.images && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.config.images.map((image: any, imgIndex: number) => (
                  <div key={imgIndex} className="relative">
                    <img
                      src={`${getApiBaseUrl()}${image.url}`}
                      alt={image.alt || `Gallery image ${imgIndex + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        const galleryImages = content.config.images.map((img: any) => `${getApiBaseUrl()}${img.url}`);
                handleImageClick(`${API_BASE_URL}${image.url}`, galleryImages);
                      }}
                    />
                    {image.caption && (
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'IMAGE':
        return (
          <div key={content.id} className={`${wrapperClass} py-4`}>
            {content.title && (
              <h2 className="text-2xl font-semibold text-blue-800 mb-4 text-center">
                {content.title}
              </h2>
            )}
            {content.imageUrl && (
              <div className="text-center">
                <img 
                  src={content.imageUrl} 
                  alt={content.alt || content.title || 'Görsel'} 
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                />
                {content.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    {content.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        );
        
      case 'VIDEO':
        return (
          <div key={content.id} className={`${wrapperClass} py-4`}>
            {content.title && (
              <h2 className="text-2xl font-semibold text-blue-800 mb-4 text-center">
                {content.title}
              </h2>
            )}
            {content.videoUrl && (
              <div className="aspect-video max-w-4xl mx-auto">
                <iframe
                  src={content.videoUrl.includes('youtube') 
                    ? content.videoUrl.replace('watch?v=', 'embed/') 
                    : content.videoUrl}
                  className="w-full h-full rounded-lg shadow-md"
                  allowFullScreen
                />
              </div>
            )}
            {content.content && (
              <div className="mt-4 text-center">
                <p className="text-gray-700">{content.content}</p>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div key={content.id} className={`${wrapperClass} py-4`}>
            {content.content && (
              <div className="text-gray-700">
                {content.content}
              </div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Sayfa yükleniyor...</p>
            </div>
          </div>
        </div>
        // remove all  occurrences at the end of each render branch
        
      </>
    );
  }

  if (error && !page) {
    return (
      <>
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error}
            </h1>
            {fallbackContent && (
              <div className="mt-8">
                {fallbackContent}
              </div>
            )}
          </div>
        </div>
        
      </>
    );
  }

  if (!page) {
    return (
      <>
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-4">
              Sayfa bulunamadı
            </h1>
            {fallbackContent && (
              <div className="mt-8">
                {fallbackContent}
              </div>
            )}
          </div>
        </div>
        
      </>
    );
  }

  return (
    <>
      
      <div className="min-h-screen bg-gray-50">
        {page && (
          <h1 className="text-3xl font-bold text-center text-gray-900 pt-8 pb-4">
            {page.title}
          </h1>
        )}
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dynamic Content */}
          {page?.contents && page.contents.length > 0 ? (
            <div className="p-6 lg:p-8">
              {page.contents
                .filter(content => content.isActive !== false)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((content, index) => renderContent(content, index))
              }
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Bu sayfa için henüz içerik eklenmemiş.</p>
            </div>
          )}
        </div>
      </div>
      

      {/* Modern Image Modal */}
      {modalImage && (
        <div
          className={`fixed inset-0 bg-black z-50 flex items-center justify-center ${
            isFullscreen ? 'bg-opacity-100' : 'bg-opacity-90'
          }`}
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 left-4 z-20 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white text-xl transition-all duration-200"
          >
            ×
          </button>

          {/* Top Controls */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            {/* Download Button */}
            <button
              onClick={downloadImage}
              className="w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all duration-200"
              title="İndir"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all duration-200"
              title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-200"
                title="Önceki resim"
              >
                ‹
              </button>

              {/* Right Arrow */}
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-200"
                title="Sonraki resim"
              >
                ›
              </button>
            </>
          )}

          {/* Image Container */}
          <div
            className={`relative ${
              isFullscreen ? 'w-full h-full' : 'max-w-[800px] max-h-[600px]'
            } flex items-center justify-center`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="Büyütülmüş görsel"
              className={`${
                isFullscreen ? 'max-w-full max-h-full' : 'max-w-[800px] max-h-[600px]'
              } object-contain`}
            />
          </div>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}

    </>
  );
};

export default DynamicPage;
