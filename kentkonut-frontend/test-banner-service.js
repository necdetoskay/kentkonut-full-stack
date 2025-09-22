// Banner Service Test Script
// Bu script banner service'ini test eder

// Environment variable'ı simüle et
process.env.VITE_API_URL = 'http://localhost:3002';

// Banner Service'i simüle et
class BannerService {
  constructor() {
    this.baseUrl = process.env.VITE_API_URL || 'http://localhost:3002';
  }

  async getActiveBannerGroups() {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/banners`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Banner grupları yüklenirken hata:', error);
      return [];
    }
  }

  async recordBannerView(bannerId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannerId,
          type: 'view'
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Banner görüntülenme kaydedilirken hata:', error);
      return null;
    }
  }

  async recordBannerClick(bannerId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannerId,
          type: 'click'
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Banner tıklama kaydedilirken hata:', error);
      return null;
    }
  }

  filterActiveBanners(banners) {
    const now = new Date();
    
    return banners.filter(banner => {
      if (!banner.active) return false;
      
      if (banner.startDate) {
        const startDate = new Date(banner.startDate);
        if (now < startDate) return false;
      }
      
      if (banner.endDate) {
        const endDate = new Date(banner.endDate);
        if (now > endDate) return false;
      }
      
      return true;
    }).sort((a, b) => a.order - b.order);
  }
}

// Test fonksiyonu
async function testBannerService() {
  console.log('🧪 Banner Service Test Başlıyor...\n');
  
  const bannerService = new BannerService();
  
  // Test 1: Banner gruplarını getir
  console.log('📋 Test 1: Banner gruplarını getir');
  try {
    const bannerGroups = await bannerService.getActiveBannerGroups();
    console.log('✅ Banner grupları başarıyla alındı:', bannerGroups.length, 'grup');
    
    if (bannerGroups.length > 0) {
      const firstGroup = bannerGroups[0];
      console.log('📊 İlk grup:', firstGroup.name);
      console.log('🎯 Banner sayısı:', firstGroup.banners.length);
      console.log('⚙️ Ayarlar:', {
        playMode: firstGroup.playMode,
        duration: firstGroup.duration,
        animation: firstGroup.animation
      });
      
      // Test 2: Aktif bannerları filtrele
      console.log('\n📋 Test 2: Aktif bannerları filtrele');
      const activeBanners = bannerService.filterActiveBanners(firstGroup.banners);
      console.log('✅ Aktif banner sayısı:', activeBanners.length);
      
      if (activeBanners.length > 0) {
        const firstBanner = activeBanners[0];
        console.log('🎨 İlk banner:', firstBanner.title);
        
        // Test 3: Banner view kaydı
        console.log('\n📋 Test 3: Banner view kaydı');
        const viewResult = await bannerService.recordBannerView(firstBanner.id);
        if (viewResult && viewResult.success) {
          console.log('✅ View kaydı başarılı, ID:', viewResult.id);
        } else {
          console.log('❌ View kaydı başarısız');
        }
        
        // Test 4: Banner click kaydı
        console.log('\n📋 Test 4: Banner click kaydı');
        const clickResult = await bannerService.recordBannerClick(firstBanner.id);
        if (clickResult && clickResult.success) {
          console.log('✅ Click kaydı başarılı, ID:', clickResult.id);
        } else {
          console.log('❌ Click kaydı başarısız');
        }
      }
    }
  } catch (error) {
    console.error('❌ Test başarısız:', error);
  }
  
  console.log('\n🎉 Banner Service Test Tamamlandı!');
}

// Test'i çalıştır
testBannerService();
