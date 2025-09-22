// Hafriyat API Test Scripti
const baseUrl = 'http://localhost:3002/api';

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error(`\n❌ Error testing ${method} ${endpoint}:`, error.message);
  }
}

async function runHafriyatTests() {
  console.log('🏗️ HAFRİYAT MODÜLÜ API TESTLERİ');
  console.log('================================');

  // 1. Bölgeleri listele
  console.log('\n📍 1. BÖLGELER LİSTESİ');
  await testAPI('/hafriyat-bolgeler');

  // 2. Sahaları listele
  console.log('\n🏗️ 2. SAHALAR LİSTESİ');
  await testAPI('/hafriyat-sahalar');

  // 3. Belge kategorilerini listele
  console.log('\n📄 3. BELGE KATEGORİLERİ');
  await testAPI('/hafriyat-belge-kategorileri');

  // 4. Resim kategorilerini listele
  console.log('\n🖼️ 4. RESİM KATEGORİLERİ');
  await testAPI('/hafriyat-resim-kategorileri');

  // 5. Filtreleme testleri
  console.log('\n🔍 5. FİLTRELEME TESTLERİ');
  
  // Aktif bölgeler
  await testAPI('/hafriyat-bolgeler?aktif=true');
  
  // Devam eden sahalar
  await testAPI('/hafriyat-sahalar?durum=DEVAM_EDIYOR');
  
  // Arama testi
  await testAPI('/hafriyat-sahalar?arama=Körfez');

  // 6. Sayfalama testi
  console.log('\n📄 6. SAYFALAMA TESTİ');
  await testAPI('/hafriyat-sahalar?page=1&limit=3');

  console.log('\n✅ Tüm testler tamamlandı!');
}

// Async function'ı çalıştır
runHafriyatTests().catch(console.error);
