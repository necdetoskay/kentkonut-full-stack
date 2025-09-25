// Banner pozisyonu oluşturmak için basit script
const createBannerPosition = async () => {
  const API_BASE_URL = 'http://localhost:3010';
  
  try {
    console.log('🔧 Banner pozisyonu oluşturuluyor...');
    
    // 1. Banner gruplarını al
    const groupsResponse = await fetch(`${API_BASE_URL}/api/banner-groups`);
    const groupsData = await groupsResponse.json();
    
    if (groupsData.success && groupsData.data.length > 0) {
      const heroGroup = groupsData.data.find(g => 
        g.name.includes('Hero') || g.name.includes('Ana Sayfa')
      );
      
      if (heroGroup) {
        console.log('✅ Hero banner grubu bulundu:', heroGroup.name);
        
        // 2. Banner grubunu güncelle (positionUUID ile)
        const updateData = {
          name: heroGroup.name,
          description: heroGroup.description,
          isActive: heroGroup.isActive,
          deletable: heroGroup.deletable,
          width: heroGroup.width,
          height: heroGroup.height,
          mobileWidth: heroGroup.mobileWidth,
          mobileHeight: heroGroup.mobileHeight,
          tabletWidth: heroGroup.tabletWidth,
          tabletHeight: heroGroup.tabletHeight,
          displayDuration: heroGroup.displayDuration,
          transitionDuration: heroGroup.transitionDuration,
          animationType: heroGroup.animationType,
          positionUUID: '550e8400-e29b-41d4-a716-446655440001',
          fallbackGroupId: null
        };
        
        const updateResponse = await fetch(`${API_BASE_URL}/api/banner-groups/${heroGroup.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        if (updateResponse.ok) {
          console.log('✅ Banner pozisyonu oluşturuldu!');
          
          // 3. Test et
          const testResponse = await fetch(`${API_BASE_URL}/api/public/banners/position/550e8400-e29b-41d4-a716-446655440001`);
          const testData = await testResponse.json();
          
          if (testData.bannerGroup) {
            console.log('✅ Test başarılı! Banner grubu:', testData.bannerGroup.name);
            console.log('📊 Banner sayısı:', testData.banners?.length || 0);
          } else {
            console.log('❌ Test başarısız!');
          }
        } else {
          console.log('❌ Banner pozisyonu oluşturulamadı:', updateResponse.status);
        }
      } else {
        console.log('❌ Hero banner grubu bulunamadı');
      }
    } else {
      console.log('❌ Banner grupları bulunamadı');
    }
  } catch (error) {
    console.error('❌ Hata:', error);
  }
};

createBannerPosition();
