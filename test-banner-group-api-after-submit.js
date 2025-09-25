// Banner grup API'sini test et - form submit'ten sonra
const testBannerGroupAPIAfterSubmit = async () => {
  const API_BASE_URL = 'http://localhost:3021';
  
  try {
    console.log('🔍 Banner grup API test ediliyor (form submit sonrası)...');
    
    const response = await fetch(`${API_BASE_URL}/api/banner-groups/1`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Banner grup API yanıtı:', data);
      
      if (data.success && data.bannerGroup) {
        console.log('📊 Banner grup pozisyon bilgisi:');
        console.log('  - positionUUID:', data.bannerGroup.positionUUID);
        console.log('  - fallbackGroupId:', data.bannerGroup.fallbackGroupId);
        
        // Pozisyon UUID'sine göre pozisyon adını bul
        const positionOptions = [
          { value: '550e8400-e29b-41d4-a716-446655440001', label: 'Ana Sayfa Üst Banner' },
          { value: '550e8400-e29b-41d4-a716-446655440002', label: 'Yan Menü Banner' },
          { value: '550e8400-e29b-41d4-a716-446655440003', label: 'Alt Banner' }
        ];
        
        const selectedPosition = positionOptions.find(opt => opt.value === data.bannerGroup.positionUUID);
        console.log('  - Seçili pozisyon:', selectedPosition?.label || 'Bilinmeyen');
      }
    } else {
      console.log('❌ API hatası:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Test sırasında hata:', error);
  }
};

testBannerGroupAPIAfterSubmit();
