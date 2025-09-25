// Banner pozisyonu oluşturmak için API test scripti
const createBannerPosition = async () => {
  const API_BASE_URL = 'http://localhost:3010';
  const heroUUID = '550e8400-e29b-41d4-a716-446655440001';
  
  console.log('🔧 Banner pozisyonu oluşturuluyor...');
  console.log('📍 API Base URL:', API_BASE_URL);
  console.log('📍 Hero UUID:', heroUUID);
  
  try {
    // 1. Önce banner gruplarını al
    console.log('\n1️⃣ Banner grupları alınıyor...');
    const groupsResponse = await fetch(`${API_BASE_URL}/api/banner-groups`);
    
    if (groupsResponse.ok) {
      const groupsData = await groupsResponse.json();
      console.log('✅ Banner grupları alındı:', groupsData);
      
      if (groupsData.success && groupsData.data) {
        const heroGroup = groupsData.data.find(g => 
          g.name.includes('Hero') || g.name.includes('Ana Sayfa')
        );
        
        if (heroGroup) {
          console.log('✅ Hero banner grubu bulundu:', heroGroup);
          
          // 2. Banner pozisyonunu oluştur
          console.log('\n2️⃣ Banner pozisyonu oluşturuluyor...');
          const positionData = {
            positionUUID: heroUUID,
            name: 'Ana Sayfa Üst Banner',
            description: 'Ana sayfa hero banner pozisyonu',
            bannerGroupId: heroGroup.id,
            isActive: true,
            priority: 1
          };
          
          console.log('📤 Gönderilen veri:', positionData);
          
          // Banner pozisyonu oluşturma API'si yoksa, banner grubunu güncelle
          console.log('\n3️⃣ Banner grubunu güncelliyor...');
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
            positionUUID: heroUUID,
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
            const updateResult = await updateResponse.json();
            console.log('✅ Banner grubu güncellendi:', updateResult);
          } else {
            console.log('❌ Banner grubu güncellenirken hata:', updateResponse.status, updateResponse.statusText);
            const errorText = await updateResponse.text();
            console.log('❌ Hata detayı:', errorText);
          }
        } else {
          console.log('❌ Hero banner grubu bulunamadı');
        }
      }
    } else {
      console.log('❌ Banner grupları alınırken hata:', groupsResponse.status, groupsResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Banner pozisyonu oluşturulurken hata:', error);
  }
};

// Banner pozisyonunu oluştur
createBannerPosition();
