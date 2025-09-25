// Banner pozisyonlarını kontrol etmek için test script
const testBannerPositions = async () => {
  const API_BASE_URL = 'http://localhost:3010';
  
  // Hero banner pozisyonunu test et
  const heroUUID = '550e8400-e29b-41d4-a716-446655440001';
  
  try {
    console.log('🔍 Hero banner pozisyonunu test ediliyor...');
    const response = await fetch(`${API_BASE_URL}/api/public/banners/position/${heroUUID}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Hero banner pozisyonu bulundu:', data);
      
      if (data.bannerGroup && data.banners && data.banners.length > 0) {
        console.log('✅ Banner grubu ve bannerlar mevcut');
        console.log('📊 Banner grubu:', data.bannerGroup.name);
        console.log('📊 Banner sayısı:', data.banners.length);
        console.log('📊 Bannerlar:', data.banners.map(b => ({ id: b.id, title: b.title, imageUrl: b.imageUrl })));
      } else {
        console.log('❌ Banner grubu veya bannerlar bulunamadı');
        console.log('📊 Banner grubu:', data.bannerGroup);
        console.log('📊 Bannerlar:', data.banners);
      }
    } else {
      console.log('❌ API çağrısı başarısız:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('❌ Hata detayı:', errorText);
    }
  } catch (error) {
    console.error('❌ Test sırasında hata:', error);
  }
};

// Test'i çalıştır
testBannerPositions();
