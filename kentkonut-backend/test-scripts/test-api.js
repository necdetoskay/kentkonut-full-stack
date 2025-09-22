// Test script for the fixed API
const testUpdateSaha = async () => {
  try {
    // Test data with SEO fields
    const testData = {
      ad: "Test Saha Güncellemesi",
      konumAdi: "Test Konum",
      durum: "DEVAM_EDIYOR",
      ilerlemeyuzdesi: 75,
      tonBasiUcret: 85,
      kdvOrani: 18,
      bolgeId: "cmc3gntiv0002wcwx5t1o38ye", // Use existing bolge ID from error
      aciklama: "<p>Test açıklama güncellemesi</p>",
      seoTitle: "Test SEO Başlığı",
      seoDescription: "Test SEO açıklaması",
      seoKeywords: "test, seo, keywords",
      seoLink: "test-seo-link",
      seoCanonicalUrl: "https://kentkonut.com/test-seo"
    };

    const response = await fetch('http://localhost:3000/api/hafriyat-sahalar/cmc3gntjf000ewcwxwmwy0b3w', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ API çalışıyor! SEO alanları başarıyla eklendi.');
      console.log('Güncellenen saha:', result.data.ad);
      console.log('SEO Başlığı:', result.data.seoTitle);
    } else {
      console.log('\n❌ API hatası:', result.message);
    }

  } catch (error) {
    console.error('❌ Test hatası:', error.message);
  }
};

testUpdateSaha();
