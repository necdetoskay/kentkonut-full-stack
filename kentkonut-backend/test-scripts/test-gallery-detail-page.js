// Test galeri fonksiyonalitesi için detay sayfasını test et
const testUrl = 'http://localhost:3001/dashboard/hafriyat/sahalar/cmc4tkvku0002i7lx73q81bzw';

async function testGalleryPage() {
  console.log('🧪 Hafriyat Saha Detay Sayfası Galeri Testi');
  console.log('=' .repeat(50));
  
  try {
    // API'den saha verisini al
    console.log('📡 APIden saha verisi alınıyor...');
    const response = await fetch('http://localhost:3001/api/hafriyat-sahalar/cmc4tkvku0002i7lx73q81bzw');
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API response failed');
    }
    
    const saha = data.data;
    console.log(`✅ Saha yüklendi: ${saha.ad}`);
    console.log(`📊 Resim sayısı: ${saha.resimler?.length || 0}`);
    
    if (saha.resimler && saha.resimler.length > 0) {
      console.log('🖼️  Galeri resimleri:');
      saha.resimler.forEach((resim, index) => {
        console.log(`  ${index + 1}. ${resim.baslik}`);
        console.log(`     📁 Kategori: ${resim.kategori?.ad || 'Yok'}`);
        console.log(`     🔗 URL: ${resim.dosyaYolu}`);
        console.log(`     📝 Açıklama: ${resim.aciklama || 'Yok'}`);
        console.log('');
      });
      
      console.log('✅ Galeri bölümü verisi hazır!');
      console.log(`🌐 Test URL: ${testUrl}`);
      console.log('');
      console.log('📋 Detay sayfasında beklenen özellikler:');
      console.log('  ✅ Sol kolonda: Ana galeri grid (3 sütun)');
      console.log('  ✅ Sağ kolonda: Galeri önizlemesi (ilk 4 resim)');
      console.log('  ✅ Hover efektleri: Resim zoom + link butonu');
      console.log('  ✅ Kategori badgeleri resim üzerinde');
      console.log('  ✅ Dış link açma özelliği');
      console.log('  ✅ Scroll to gallery özelliği');
      
    } else {
      console.log('⚠️ Bu saha için galeri resmi yok.');
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error.message);
  }
}

testGalleryPage();
