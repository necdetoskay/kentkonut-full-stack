// Banner pozisyonu UUID eşleşmesini kontrol etmek için test scripti
const testBannerPositionMismatch = async () => {
  const API_BASE_URL = 'http://localhost:3010';
  const heroUUID = '550e8400-e29b-41d4-a716-446655440001';
  
  console.log('🔍 Banner pozisyonu UUID eşleşmesi kontrol ediliyor...');
  console.log('📍 API Base URL:', API_BASE_URL);
  console.log('📍 Hero UUID:', heroUUID);
  
  try {
    // 1. Tüm banner pozisyonlarını listele
    console.log('\n1️⃣ Tüm banner pozisyonları listeleniyor...');
    const positionsResponse = await fetch(`${API_BASE_URL}/api/banner-positions`);
    
    if (positionsResponse.ok) {
      const positionsData = await positionsResponse.json();
      console.log('✅ Banner pozisyonları API yanıtı:', positionsData);
      
      if (positionsData.success && positionsData.data) {
        console.log('📊 Toplam banner pozisyonu sayısı:', positionsData.data.length);
        
        positionsData.data.forEach(position => {
          console.log(`📊 Pozisyon: ${position.name} (UUID: ${position.positionUUID}, Aktif: ${position.isActive})`);
          if (position.bannerGroup) {
            console.log(`   └─ Banner Grubu: ${position.bannerGroup.name} (ID: ${position.bannerGroup.id})`);
          }
        });
        
        // Hero UUID'sini kontrol et
        const heroPosition = positionsData.data.find(p => p.positionUUID === heroUUID);
        if (heroPosition) {
          console.log('\n✅ Hero banner pozisyonu bulundu:', heroPosition);
        } else {
          console.log('\n❌ Hero banner pozisyonu bulunamadı!');
          console.log('🔍 Mevcut UUID\'ler:', positionsData.data.map(p => p.positionUUID));
        }
      }
    } else {
      console.log('❌ Banner pozisyonları API hatası:', positionsResponse.status, positionsResponse.statusText);
    }
    
    // 2. Hero banner pozisyonunu direkt test et
    console.log('\n2️⃣ Hero banner pozisyonunu direkt test ediliyor...');
    const heroResponse = await fetch(`${API_BASE_URL}/api/public/banners/position/${heroUUID}`);
    
    if (heroResponse.ok) {
      const heroData = await heroResponse.json();
      console.log('✅ Hero banner pozisyonu API yanıtı:', heroData);
      
      if (heroData.bannerGroup) {
        console.log('✅ Banner grubu bulundu:', heroData.bannerGroup.name);
        console.log('📊 Banner sayısı:', heroData.banners?.length || 0);
        
        if (heroData.banners && heroData.banners.length > 0) {
          console.log('📊 Bannerlar:', heroData.banners.map(b => ({
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
      console.log('❌ Hero banner pozisyonu API hatası:', heroResponse.status, heroResponse.statusText);
      const errorText = await heroResponse.text();
      console.log('❌ Hata detayı:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test sırasında hata:', error);
  }
};

// Test'i çalıştır
testBannerPositionMismatch();
