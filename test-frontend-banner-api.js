// Frontend banner API test scripti
const testFrontendBannerAPI = async () => {
  const API_BASE_URL = 'http://localhost:3010';
  const heroUUID = '550e8400-e29b-41d4-a716-446655440001';
  
  console.log('🔍 Frontend banner API testi başlatılıyor...');
  console.log('📍 API Base URL:', API_BASE_URL);
  console.log('📍 Hero UUID:', heroUUID);
  
  try {
    // 1. Hero banner pozisyonunu test et
    console.log('\n1️⃣ Hero banner pozisyonunu test ediliyor...');
    const positionResponse = await fetch(`${API_BASE_URL}/api/public/banners/position/${heroUUID}`);
    
    if (positionResponse.ok) {
      const positionData = await positionResponse.json();
      console.log('✅ Hero banner pozisyonu API yanıtı:', positionData);
      
      if (positionData.bannerGroup) {
        console.log('✅ Banner grubu bulundu:', positionData.bannerGroup.name);
        console.log('📊 Banner sayısı:', positionData.banners?.length || 0);
        
        if (positionData.banners && positionData.banners.length > 0) {
          console.log('📊 Bannerlar:', positionData.banners.map(b => ({
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
      console.log('❌ Hero banner pozisyonu API hatası:', positionResponse.status, positionResponse.statusText);
      const errorText = await positionResponse.text();
      console.log('❌ Hata detayı:', errorText);
    }
    
    // 2. Tüm banner gruplarını test et
    console.log('\n2️⃣ Tüm banner gruplarını test ediliyor...');
    const groupsResponse = await fetch(`${API_BASE_URL}/api/banner-groups`);
    
    if (groupsResponse.ok) {
      const groupsData = await groupsResponse.json();
      console.log('✅ Banner grupları API yanıtı:', groupsData);
      
      if (groupsData.success && groupsData.data) {
        console.log('📊 Toplam banner grubu sayısı:', groupsData.data.length);
        groupsData.data.forEach(group => {
          console.log(`📊 Grup: ${group.name} (ID: ${group.id}, Aktif: ${group.isActive})`);
        });
      }
    } else {
      console.log('❌ Banner grupları API hatası:', groupsResponse.status, groupsResponse.statusText);
    }
    
    // 3. Tüm banner pozisyonlarını test et
    console.log('\n3️⃣ Banner pozisyonlarını kontrol ediliyor...');
    const positionsResponse = await fetch(`${API_BASE_URL}/api/banner-positions`);
    
    if (positionsResponse.ok) {
      const positionsData = await positionsResponse.json();
      console.log('✅ Banner pozisyonları API yanıtı:', positionsData);
    } else {
      console.log('❌ Banner pozisyonları API hatası:', positionsResponse.status, positionsResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Test sırasında hata:', error);
  }
};

// Test'i çalıştır
testFrontendBannerAPI();
