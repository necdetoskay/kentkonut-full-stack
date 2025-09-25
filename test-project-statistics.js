// Proje istatistikleri API test scripti
const testProjectStatistics = async () => {
  const API_BASE_URL = 'http://localhost:3021';
  
  try {
    console.log('📊 Proje istatistikleri API test ediliyor...');
    
    const response = await fetch(`${API_BASE_URL}/api/projects/statistics`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ İstatistikler API yanıtı:', data);
      
      if (data.success) {
        console.log('📊 İstatistikler:');
        console.log('  - Devam Eden Konut-İşyeri:', data.data.devamEdenKonutIsyeri);
        console.log('  - Tamamlanan Konut:', data.data.tamamlananKonut);
        console.log('  - Tamamlanan İşyeri:', data.data.tamamlananIsyeri);
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

testProjectStatistics();
