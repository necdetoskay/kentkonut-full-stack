// Hero Component API Integration Test (ESM version)
// This script simulates the Hero component's API integration behavior

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
    const bannerGroups = await bannerService.getActiveBannerGroups();
    
    if (bannerGroups.length > 0) {
      const mainGroup = bannerGroups[0];
      bannerGroup = mainGroup;
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
      console.warn('⚠️ API\'den banner verisi gelmedi');
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

  return {
    isLoading,
    error,
    banners,
    bannerGroup,
    dataSource: banners.length > 0 ? 'API' : 'Fallback'
  };
}

// Run the test
simulateHeroComponentLoad()
  .then(result => {
    console.log('\n🎉 Hero Component Integration Test Complete!');
    console.log('📊 Final Result:', {
      success: !result.error && !result.isLoading,
      dataSource: result.dataSource,
      bannerCount: result.banners.length,
      hasError: !!result.error,
      isLoading: result.isLoading
    });
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
  });
