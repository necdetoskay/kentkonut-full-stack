// Frontend-Backend bağlantı testi
import { apiClient, bannerService } from '../services';

export class ConnectionTest {
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔗 Frontend-Backend bağlantısı test ediliyor...');
      
      // Basit health check
      const response = await fetch('http://localhost:3010/api/health');
      if (response.ok) {
        console.log('✅ Backend erişilebilir');
        return true;
      } else {
        console.error('❌ Backend erişilemez');
        return false;
      }
    } catch (error) {
      console.error('❌ Bağlantı hatası:', error);
      return false;
    }
  }

  static async testBannerAPI(): Promise<boolean> {
    try {
      console.log('🎯 Banner API test ediliyor...');
      
      const banners = await bannerService.getActiveBannerGroups();
      console.log('✅ Banner API çalışıyor, banner sayısı:', banners.length);
      return true;
    } catch (error) {
      console.error('❌ Banner API hatası:', error);
      return false;
    }
  }

  static async runAllTests(): Promise<void> {
    console.log('🚀 Tüm bağlantı testleri başlatılıyor...');
    
    const connectionOk = await this.testConnection();
    const bannerApiOk = await this.testBannerAPI();
    
    if (connectionOk && bannerApiOk) {
      console.log('🎉 Tüm testler başarılı! Frontend-Backend bağlantısı kuruldu.');
    } else {
      console.log('⚠️ Bazı testler başarısız oldu. Bağlantı sorunları olabilir.');
    }
  }
}

// Development ortamında otomatik test çalıştır
if ((import.meta as any).env?.DEV) {
  setTimeout(() => {
    ConnectionTest.runAllTests();
  }, 2000); // 2 saniye bekle
}
