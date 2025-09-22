/**
 * Test Script: Birim Yönetim Modülü URL Düzeltme Testi
 * 
 * Bu script birim yönetim modülündeki URL'lerin Türkçe olarak düzgün çalıştığını test eder.
 * 
 * Test Edilen URL'ler:
 * - /dashboard/kurumsal/birimler (Ana sayfa)
 * - /dashboard/kurumsal/birimler/new (Yeni birim ekleme)
 * - /dashboard/kurumsal/birimler/[id] (Birim düzenleme)
 * 
 * Çalıştırma: node test-scripts/test-birim-url-fix.js
 */

const BASE_URL = 'http://localhost:3010';

// Test URL'leri
const testUrls = [
  {
    name: 'Birimler Ana Sayfası',
    url: `${BASE_URL}/dashboard/kurumsal/birimler`,
    expectedTitle: 'Birimlerimiz',
    description: 'Birim listesi sayfası'
  },
  {
    name: 'Yeni Birim Ekleme',
    url: `${BASE_URL}/dashboard/kurumsal/birimler/new`,
    expectedTitle: 'Yeni Birim Oluştur',
    description: 'Yeni birim ekleme formu'
  },
  {
    name: 'Birim Hızlı Bağlantılar',
    url: `${BASE_URL}/dashboard/kurumsal/birim-hizli-baglanti`,
    expectedTitle: 'Birim Hızlı Linkleri',
    description: 'Birim hızlı bağlantı yönetimi'
  }
];

// Test fonksiyonu
async function runTests() {
  console.log('🧪 Birim Yönetim Modülü URL Testi Başlatılıyor...\n');
  
  for (const test of testUrls) {
    try {
      console.log(`📋 Test: ${test.name}`);
      console.log(`🔗 URL: ${test.url}`);
      console.log(`📝 Açıklama: ${test.description}`);
      
      const response = await fetch(test.url);
      
      if (response.ok) {
        console.log(`✅ Başarılı: ${response.status} ${response.statusText}`);
      } else {
        console.log(`❌ Hata: ${response.status} ${response.statusText}`);
      }
      
      console.log('─'.repeat(50));
    } catch (error) {
      console.log(`❌ Bağlantı Hatası: ${error.message}`);
      console.log('─'.repeat(50));
    }
  }
  
  console.log('\n🎯 Test Tamamlandı!');
  console.log('\n📌 Manuel Test Adımları:');
  console.log('1. Birimler sayfasına git: http://localhost:3010/dashboard/kurumsal/birimler');
  console.log('2. "Yeni Birim" butonuna tıkla');
  console.log('3. URL\'nin /dashboard/kurumsal/birimler/new olduğunu doğrula');
  console.log('4. Form doldur ve kaydet');
  console.log('5. Başarılı kayıt sonrası birimler listesine yönlendirildiğini kontrol et');
  console.log('6. Birim düzenleme sayfasının çalıştığını kontrol et');
}

// Test çalıştır
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testUrls, runTests };
