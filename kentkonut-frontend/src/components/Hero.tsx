import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import bannerService, { Banner, BannerGroup } from '@/services/bannerService';
import { imageService } from '@/services/imageService';
import { useIsMobile } from '@/hooks/use-mobile';
import { API_BASE_URL } from '../config/environment';
import './Hero.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerGroup, setBannerGroup] = useState<BannerGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Touch gesture states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Mobile performance states
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({});

  // Backend URL'ini al
  const backendUrl = API_BASE_URL;

  // Resim URL'ini düzenle
  const getImageUrl = (imageUrl: string) => {
    return imageService.getImageUrl(imageUrl);
  };
  // Banner verilerini yükle
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🏠 Hero banner verileri yükleniyor...');
        
        // UUID tabanlı hero banner pozisyonunu getir
        const heroData = await bannerService.getHeroBannerByUUID();
        console.log('🔍 Hero data received:', heroData);
        
        if (heroData && heroData.bannerGroup) {
          setBannerGroup(heroData.bannerGroup);
          console.log('📊 Hero grup:', heroData.bannerGroup);
          console.log('📊 Hero grupta banner sayısı:', heroData.banners?.length || 0);
          console.log('📊 Raw banners:', heroData.banners);

          // Aktif bannerları filtrele ve sırala
          const activeBanners = bannerService.filterActiveBanners(heroData.banners || []);
          console.log('🔍 Filtered active banners:', activeBanners);
          setBanners(activeBanners);

          // Record impressions for all loaded banners
          activeBanners.forEach(async (banner) => {
            if (banner.id && typeof banner.id === 'number') {
              try {
                await bannerService.recordBannerImpression(banner.id);
              } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                  // logger.warn('Banner view tracking failed', { context: 'Hero Component', details: error });
                }
              }
            }
          });

          console.log('✅ Aktif hero banner sayısı:', activeBanners.length);
        } else {
          setBanners([]);
          setError('Hero banner grubu bulunamadı');
          console.log('❌ Hero banner grubu bulunamadı');
        }      } catch (err) {
        console.error('Hero banner verileri yüklenirken hata:', err);
        setError('Hero banner verileri yüklenemedi');
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    loadBanners();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Kullanılacak slide verilerini belirle
  const slidesToUse = banners;

  const nextSlide = () => {
    if (isAnimating || slidesToUse.length === 0) return;

    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === slidesToUse.length - 1 ? 0 : prev + 1));

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isAnimating || slidesToUse.length === 0) return;

    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? slidesToUse.length - 1 : prev - 1));

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  // Banner görüntülenme istatistiği kaydet
  const recordBannerView = async (banner: Banner | any) => {
    if (banner.id && typeof banner.id === 'number') {
      await bannerService.recordBannerView(banner.id);
    }
  };
  // Banner tıklama istatistiği kaydet ve yönlendirme
  const handleBannerClick = async (banner: Banner, event?: React.MouseEvent) => {
    // Get the target URL from various possible fields
    const targetUrl = banner.link || banner.linkUrl || banner.ctaLink;

    // Only proceed if there's a valid URL
    if (!targetUrl || targetUrl.trim() === '') {
      return;
    }

    // Get click position for analytics
    const clickPosition = event ? { x: event.clientX, y: event.clientY } : undefined;

    // Record click statistics
    if (banner.id && typeof banner.id === 'number') {
      try {
        // await apiClient.post('/api/analytics/track', trackingData);
      } catch (error) {
        console.error('Banner click kaydedilirken hata:', error);
      }
    }

    // Handle URL navigation with proper security
    const url = targetUrl.trim();

    if (url.startsWith('http://') || url.startsWith('https://')) {
      // External URL - open in new tab with security attributes
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (url.startsWith('/')) {
      // Internal relative URL - navigate in same window
      window.location.href = url;
    } else {
      // Assume it's an internal URL without leading slash
      window.location.href = '/' + url;
    }
  };

  // Check if banner has a valid clickable URL
  const isBannerClickable = (banner: Banner): boolean => {
    const targetUrl = banner.link || banner.linkUrl || banner.ctaLink;
    return !!(targetUrl && targetUrl.trim() !== '');
  };

  // Image loading optimization
  const preloadImage = (src: string) => {
    if (imagesLoaded.has(src) || imageLoadingStates[src]) return;

    setImageLoadingStates(prev => ({ ...prev, [src]: true }));

    const img = new Image();
    img.onload = () => {
      setImagesLoaded(prev => new Set([...prev, src]));
      setImageLoadingStates(prev => ({ ...prev, [src]: false }));
    };
    img.onerror = () => {
      setImageLoadingStates(prev => ({ ...prev, [src]: false }));
    };
    img.src = src;
  };

  // Preload next and previous images for smooth transitions
  const preloadAdjacentImages = () => {
    if (slidesToUse.length === 0) return;

    const nextIndex = (currentSlide + 1) % slidesToUse.length;
    const prevIndex = currentSlide === 0 ? slidesToUse.length - 1 : currentSlide - 1;

    if (slidesToUse[nextIndex]?.imageUrl) {
      preloadImage(slidesToUse[nextIndex].imageUrl);
    }
    if (slidesToUse[prevIndex]?.imageUrl) {
      preloadImage(slidesToUse[prevIndex].imageUrl);
    }
  };

  // Touch handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd]);

  // Enhanced mobile touch support
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Otomatik slide geçişi
  useEffect(() => {
    if (slidesToUse.length === 0) return;

    // Banner grubunun ayarlarına göre interval süresini belirle
    const duration = bannerGroup?.duration || 6000;

    const interval = setInterval(() => {
      nextSlide();
    }, duration);

    return () => clearInterval(interval);
  }, [currentSlide, isAnimating, slidesToUse.length, bannerGroup?.duration]);

  // Mevcut banner görüntülendiğinde istatistik kaydet ve adjacent images preload
  useEffect(() => {
    if (slidesToUse.length > 0 && slidesToUse[currentSlide]) {
      recordBannerView(slidesToUse[currentSlide]);

      // Preload adjacent images for better performance
      preloadAdjacentImages();
    }
  }, [currentSlide, slidesToUse]);

  // Sayaç animasyonu için
  useEffect(() => {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = parseInt(counter.textContent || '0');
      let count = 0;
      const updateCounter = () => {
        const increment = target / 200;
        if (count < target) {
          count += increment;
          counter.textContent = Math.ceil(count).toString();
          setTimeout(updateCounter, 10);
        } else {
          counter.textContent = target.toString();
        }
      };
      updateCounter();
    });
  }, []);

  // Loading state göster
  if (isLoading) {
    return <div className="carousel-container bg-muted animate-pulse" />;
  }

  // Error state göster
  if (error) {
    return (
      <div className="carousel-container flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Banner yoksa boş container göster
  if (slidesToUse.length === 0) {
    return <div className="carousel-container bg-muted" />;
  }

  return (
    <>
      <div
        className={cn(
          'carousel-container relative',
          isMobile ? 'mobile-carousel' : ''
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 1
        }}
      >
        {/* Slides */}
        {slidesToUse.map((slide, index) => {
          const isClickable = isBannerClickable(slide);

          return (
            <div
              key={slide.id}
              className={cn(
                "carousel-slide transition-all duration-300",
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0',
                isClickable ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'
              )}
              onClick={(e) => isClickable && handleBannerClick(slide, e)}
              style={{
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'transform 0.3s ease-in-out'
              }}
              title={isClickable ? `${slide.title} - Tıklayın` : slide.title}
            >
              {/* Slide Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center w-full h-full bg-slide"
                style={{
                  backgroundImage: slide.imageUrl ? `url(${getImageUrl(slide.imageUrl)})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Preload next image for better performance */}
                {index === currentSlide && slidesToUse[currentSlide + 1] && (
                  <link
                    rel="preload"
                    as="image"
                    href={getImageUrl(slidesToUse[currentSlide + 1].imageUrl)}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Hızlı Erişim Kutuları - Banner'ın alt kenarına overlay */}
        {false && (<div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bottom-0 z-30 w-[90%] max-w-5xl rounded-b-lg overflow-hidden shadow-lg">
          <a href="/sanal-pos" className="flex-1 flex flex-col items-start justify-center px-8 py-6 bg-[#86636A] hover:bg-[#a07a82] transition-colors duration-200 min-h-[120px]">
            <div className="flex items-center mb-2">
              <span className="w-4 h-4 bg-white mr-2 inline-block" style={{borderRadius: '2px'}}></span>
              <span className="text-xl font-extrabold text-white">SANAL POS</span>
            </div>
            <div className="text-white text-base font-medium mt-2">Hafriyat Yönetim Bilgi Sistemi<br />için tıklayınız -&gt;&gt;</div>
          </a>
          <a href="/projeler" className="flex-1 flex flex-col items-start justify-center px-8 py-6 bg-[#5B7C7C] hover:bg-[#6e9696] transition-colors duration-200 min-h-[120px] border-l-4 border-r-4 border-white">
            <div className="flex items-center mb-2">
              <span className="w-4 h-4 bg-white mr-2 inline-block" style={{borderRadius: '2px'}}></span>
              <span className="text-xl font-extrabold text-white">PROJELERİMİZ</span>
            </div>
            <div className="text-white text-base font-medium mt-2">Devam Eden ve Tamamlanan<br />Projelerimiz -&gt;&gt;</div>
          </a>
          <a href="/saglik-kent" className="flex-1 flex flex-col items-start justify-center px-8 py-6 bg-[#2E8B57] hover:bg-[#3fa06a] transition-colors duration-200 min-h-[120px]">
            <div className="flex items-center mb-2">
              <span className="w-4 h-4 bg-white mr-2 inline-block" style={{borderRadius: '2px'}}></span>
              <span className="text-xl font-extrabold text-white">SAĞLIK KENT<br />KONUTLARI</span>
            </div>
            <div className="text-white text-base font-bold mt-2">DETAYLI BİLGİ İÇİN TIKLAYINIZ</div>
          </a>
        </div>)}

        {/* Navigation Controls */}
        <div className="carousel-navigation">
          {slidesToUse.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "carousel-navigation-dot",
                index === currentSlide ? 'active' : ''
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrow Controls */}
        <button
          onClick={prevSlide}
          className="carousel-control carousel-control-prev w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="carousel-control carousel-control-next w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Sayaç bölümü */}
      <div className="container-fluid pl-0 pr-0 pt-lg-5 pt-0 pb-lg-0 stats-section" style={{ background: "url(/images/counter_back.png) repeat left top", minHeight: "401px" }}>
        <div className="container pt-2">
          <div className="row pt-2">
            <div className="col-md-4">
              <a href="#" target="_self">
                <div className="counter-box colored">
                  <span className="counter cc1">0</span>
                  <p className="mt-lg-3">
                    <span className="cc2">Konut - İşyeri</span>
                  </p>
                  <p className="mt-0 mt-lg-3">
                    <span className="cc3">Devam Eden</span>
                  </p>
                </div>
              </a>
            </div>
            
            <div className="col-md-4">
              <a href="#" target="_self">
                <div className="counter-box colored">
                  <span className="counter cc1">10608</span>
                  <p className="mt-lg-3">
                    <span className="cc2">Konut</span>
                  </p>
                  <p className="mt-0 mt-lg-3">
                    <span className="cc3">Tamamlanan</span>
                  </p>
                </div>
              </a>
            </div>
            
            <div className="col-md-4">
              <a href="#" target="_self">
                <div className="counter-box colored">
                  <span className="counter cc1">120</span>
                  <p className="mt-lg-3">
                    <span className="cc2">İşyeri</span>
                  </p>
                  <p className="mt-0 mt-lg-3">
                    <span className="cc3">İşyeri Tamamlanan</span>
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
