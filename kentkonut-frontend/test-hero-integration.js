// Hero Component API Integration Test
// This script simulates the Hero component's API integration behavior
import fetch from 'node-fetch';
globalThis.fetch = fetch;

// Simulate environment
process.env.VITE_API_URL = 'http://localhost:3002';

// Banner Service (same as component uses)
class BannerService {
  constructor() {
    this.baseUrl = process.env.VITE_API_URL || 'http://localhost:3002';
  }

  async getActiveBannerGroups() {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/banners`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Banner grupları yüklenirken hata:', error);
      return [];
    }
  }

  async recordBannerView(bannerId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/statistics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId, type: 'view' }),
      });
      return await response.json();
    } catch (error) {
      console.error('Banner görüntülenme kaydedilirken hata:', error);
      return null;
    }
  }

  async recordBannerClick(bannerId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/statistics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId, type: 'click' }),
      });
      return await response.json();
    } catch (error) {
      console.error('Banner tıklama kaydedilirken hata:', error);
      return null;
    }
  }

  filterActiveBanners(banners) {
    const now = new Date();
    return banners.filter(banner => {
      if (!banner.active) return false;
      if (banner.startDate && new Date(banner.startDate) > now) return false;
      if (banner.endDate && new Date(banner.endDate) < now) return false;
      return true;
    }).sort((a, b) => a.order - b.order);
  }
}

// Fallback data (same as Hero component)
const fallbackSlides = [
  {
    id: 1,
    title: "TUANA",
    subtitle: "Evleri 3. ETAP",
    ctaLink: "/projeler/tuana-evleri",
    imageUrl: "/images/carousel/carousel-0.png"
  },
  {
    id: 2,
    title: "HAFRIYAT",
    subtitle: "Doğal topografyayı koruyor ve ağaçlandırıyoruz",
    ctaLink: "/hizmetler/hafriyat",
    imageUrl: "/images/carousel/carousel-1.png"
  },
  {
    id: 3,
    title: "SAĞLIKENT",
    subtitle: "Şifa veren ellere vefa ile...",
    ctaLink: "/projeler/saglikent-konutlari",
    imageUrl: "/images/carousel/carousel-2.png"
  },
  {
    id: 4,
    title: "YILDIZ",
    subtitle: "İzmit'in değeri",
    ctaLink: "/projeler/yildiz-konutlari",
    imageUrl: "/images/carousel/carousel-3.png"
  },
  {
    id: 5,
    title: "KENT KONUT",
    subtitle: "Kaliteli yaşam alanları",
    ctaLink: "/projeler/kent-konut",
    imageUrl: "/images/carousel/carousel-4.png"
  }
];

// Simulate Hero Component's loadBanners function
async function simulateHeroComponentLoad() {
  console.log('🎭 Hero Component API Integration Test\n');
  
  const bannerService = new BannerService();
  let isLoading = true;
  let error = null;
  let banners = [];
  let bannerGroup = null;

  console.log('📋 Step 1: Simulating Hero Component Mount');
  console.log('⏳ isLoading:', isLoading);

  try {
    console.log('\n📡 Step 2: Fetching banner data from API...');
    
    // Simulate the exact logic from Hero component
    const bannerGroups = await bannerService.getActiveBannerGroups();
    
    if (bannerGroups.length > 0) {
      // İlk aktif grubu al (ana sayfa carousel için)
      const mainGroup = bannerGroups[0];
      bannerGroup = mainGroup;
      
      // Aktif bannerları filtrele ve sırala
      const activeBanners = bannerService.filterActiveBanners(mainGroup.banners);
      banners = activeBanners;
      
      console.log('✅ Banner verileri yüklendi:', { 
        groupName: mainGroup.name,
        bannerCount: activeBanners.length,
        settings: {
          playMode: mainGroup.playMode,
          duration: mainGroup.duration,
          animation: mainGroup.animation
        }
      });
    } else {
      // API'den veri gelmezse fallback kullan
      console.warn('⚠️ API\'den banner verisi gelmedi, fallback kullanılıyor');
      banners = [];
    }
  } catch (err) {
    console.error('❌ Banner verileri yüklenirken hata:', err);
    error = 'Banner verileri yüklenemedi';
    banners = [];
  } finally {
    isLoading = false;
  }

  console.log('\n📋 Step 3: Final component state');
  console.log('⏳ isLoading:', isLoading);
  console.log('❌ error:', error);
  console.log('📊 banners count:', banners.length);
  console.log('🎯 bannerGroup:', bannerGroup ? bannerGroup.name : 'null');

  // Determine slides to use (same logic as Hero component)
  const slidesToUse = banners.length > 0 ? banners : fallbackSlides;
  console.log('🎨 slidesToUse:', slidesToUse.length, 'slides');
  console.log('📝 Data source:', banners.length > 0 ? 'API' : 'Fallback');

  return {
    isLoading,
    error,
    banners,
    bannerGroup,
    slidesToUse,
    dataSource: banners.length > 0 ? 'API' : 'Fallback'
  };
}

// Test the Hero component integration
simulateHeroComponentLoad()
  .then(result => {
    console.log('\n🎉 Hero Component Integration Test Complete!');
    console.log('📊 Final Result:', {
      success: !result.error && !result.isLoading,
      dataSource: result.dataSource,
      slideCount: result.slidesToUse.length,
      hasError: !!result.error,
      isLoading: result.isLoading
    });
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
  });
