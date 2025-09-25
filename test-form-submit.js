// Banner grup form submit test scripti
const testBannerGroupFormSubmit = async () => {
  const API_BASE_URL = 'http://localhost:3021';
  
  try {
    console.log('🔧 Banner grup form submit test ediliyor...');
    
    // Form verisi (mevcut banner grup verisi + pozisyon değişikliği)
    const formData = {
      name: 'Ana Sayfa Hero Banner',
      description: 'Ana sayfa hero banner grubu - SİLİNEMEZ',
      isActive: true,
      deletable: false,
      width: 1200,
      height: 400,
      mobileWidth: 400,
      mobileHeight: 200,
      tabletWidth: 800,
      tabletHeight: 300,
      displayDuration: 5000,
      transitionDuration: 0.5,
      animationType: 'SOLUKLESTIR',
      positionUUID: '550e8400-e29b-41d4-a716-446655440001', // Ana Sayfa Üst Banner
      fallbackGroupId: null
    };
    
    console.log('📤 Gönderilen form verisi:', formData);
    
    const response = await fetch(`${API_BASE_URL}/api/banner-groups/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    console.log('📥 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Banner grubu güncellendi:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ API hatası:', response.status, response.statusText);
      console.log('❌ Hata detayı:', errorText);
    }
  } catch (error) {
    console.error('❌ Test sırasında hata:', error);
  }
};

testBannerGroupFormSubmit();
