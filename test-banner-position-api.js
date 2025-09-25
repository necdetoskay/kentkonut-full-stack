// Banner pozisyonu API test scripti
const testBannerPositionAPI = async () => {
  const API_BASE_URL = 'http://localhost:3021';
  const heroUUID = '550e8400-e29b-41d4-a716-446655440001';
  
  try {
    console.log('🔍 Banner pozisyonu API test ediliyor...');
    
    const response = await fetch(`${API_BASE_URL}/api/public/banners/position/${heroUUID}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Banner pozisyonu API yanıtı:', data);
      
      if (data.bannerGroup) {
        console.log('✅ Banner grubu bulundu:', data.bannerGroup.name);
        console.log('📊 Banner sayısı:', data.banners?.length || 0);
        
        if (data.banners && data.banners.length > 0) {
          console.log('📊 Bannerlar:', data.banners.map(b => ({
            id: b.id,
            title: b.title,
            imageUrl: b.imageUrl,
            isActive: b.isActive
          })));
        } else {
          console.log('❌ Banner grubunda aktif banner yok');
        }
      } else {
        console.log('❌ Banner grubu bulunamadı');
      }
    } else {
      console.log('❌ API hatası:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('❌ Hata detayı:', errorText);
    }
  } catch (error) {
    console.error('❌ Test sırasında hata:', error);
  }
};

testBannerPositionAPI();
