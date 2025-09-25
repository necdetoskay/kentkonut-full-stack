// Banner grup güncelleme test scripti
const testBannerGroupUpdate = async () => {
  const API_BASE_URL = 'http://localhost:3021';
  
  try {
    console.log('🔧 Banner grup güncelleme test ediliyor...');
    
    // 1. Banner gruplarını al
    const groupsResponse = await fetch(`${API_BASE_URL}/api/banner-groups`);
    const groupsData = await groupsResponse.json();
    
    if (groupsData.success && groupsData.data.length > 0) {
      const heroGroup = groupsData.data.find(g => 
        g.name.includes('Hero') || g.name.includes('Ana Sayfa')
      );
      
      if (heroGroup) {
        console.log('✅ Hero banner grubu bulundu:', heroGroup);
        
        // 2. Banner grubunu güncelle
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
        
        console.log('📤 Gönderilen veri:', updateData);
        
        const updateResponse = await fetch(`${API_BASE_URL}/api/banner-groups/${heroGroup.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        console.log('📥 Response status:', updateResponse.status);
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log('✅ Banner grubu güncellendi:', updateResult);
        } else {
          const errorText = await updateResponse.text();
          console.log('❌ Banner grubu güncellenemedi:', errorText);
        }
      } else {
        console.log('❌ Hero banner grubu bulunamadı');
      }
    } else {
      console.log('❌ Banner grupları bulunamadı');
    }
  } catch (error) {
    console.error('❌ Test sırasında hata:', error);
  }
};

testBannerGroupUpdate();
