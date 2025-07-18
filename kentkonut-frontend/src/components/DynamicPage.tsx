import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../assets/styles.css';

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
}

const DynamicPage: React.FC<DynamicPageProps> = ({ slug, fallbackContent }) => {
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
        const galleryImages = content.config.images.map((img: any) => `http://localhost:3010${img.url}`);
        allImages.push(...galleryImages);
      }
    });

    return allImages;
  };

  // HTML'i tüm stilleriyle birlikte wrapper içine al
  const getStyledContent = (htmlContent: string) => {
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

        /* Floating images - TipTap FloatImage node için */
        .styled-content-wrapper img {
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .styled-content-wrapper img:hover {
          opacity: 0.9;
        }

        .styled-content-wrapper img[data-float="left"] {
          float: left !important;
          margin: 0 20px 20px 0 !important;
          clear: left !important;
          display: block !important;
          max-width: 300px !important;
          height: auto !important;
        }

        .styled-content-wrapper img[data-float="right"] {
          float: right !important;
          margin: 0 0 20px 20px !important;
          clear: right !important;
          display: block !important;
          max-width: 300px !important;
          height: auto !important;
        }

        .styled-content-wrapper img[data-float="center"],
        .styled-content-wrapper img[data-float="none"] {
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
        ${htmlContent}
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

      const apiUrl = `http://localhost:3010/api/public/pages/${slug}`;
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
                      src={`http://localhost:3010${image.url}`}
                      alt={image.alt || `Gallery image ${imgIndex + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        const galleryImages = content.config.images.map((img: any) => `http://localhost:3010${img.url}`);
                        handleImageClick(`http://localhost:3010${image.url}`, galleryImages);
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
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Sayfa yükleniyor...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !page) {
    return (
      <>
        <Navbar />
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
        <Footer />
      </>
    );
  }

  if (!page) {
    return (
      <>
        <Navbar />
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
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-20"> {/* Navbar için padding */}
        {/* Hero Section */}
      {page.headerImage && (
        <div className="w-full relative" style={{ height: '220px' }}>
          <img 
            src={page.headerImage} 
            alt={page.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
          
          {/* Breadcrumb Navigation */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 bg-white rounded-full px-8 py-4 shadow-md">
            <div className="flex items-center text-sm">
              <a href="/" className="text-blue-600 hover:text-blue-800">
                <i className="fas fa-home mr-2"></i>
              </a>
              <span className="mx-2">/</span>
              <span className="text-gray-800 font-medium">{page.title}</span>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="container mx-auto px-4 py-8">
        {!page.headerImage && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-xl text-gray-600">
                {page.subtitle}
              </p>
            )}
            {page.description && (
              <p className="text-gray-700 mt-4">
                {page.description}
              </p>
            )}
          </div>
        )}
        
        {/* Page Title */}
        {page.title && (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-blue-800 text-center mb-8">
              {page.title}
            </h1>
          </div>
        )}

        {/* Dynamic Content */}
        {page.contents && page.contents.length > 0 ? (
          <div className="space-y-6">
            {page.contents
              .filter(content => content.isActive !== false) // EditorJS blocks don't have isActive, so include them
              .sort((a, b) => (a.order || 0) - (b.order || 0)) // EditorJS blocks might not have order
              .map((content, index) => renderContent(content, index))
            }
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Bu sayfa için henüz içerik eklenmemiş.</p>
          </div>
        )}
      </div>

      <Footer />
      </div> {/* Navbar padding wrapper closing */}

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
