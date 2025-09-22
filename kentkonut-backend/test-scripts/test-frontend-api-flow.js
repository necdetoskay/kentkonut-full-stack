// Test frontend API calls simulation
const testData = {
  // This simulates the exact data structure sent from the frontend forms
  frontendCreatePayload: {
    ad: 'Frontend Test Saha',
    konumAdi: 'Frontend Test Konumu',
    enlem: 40.7589,
    boylam: -73.9851,
    durum: 'DEVAM_EDIYOR',
    ilerlemeyuzdesi: 60,
    tonBasiUcret: 180.75,
    kdvOrani: 20,
    toplamTon: 8000,
    tamamlananTon: 4800,
    baslangicTarihi: '2025-01-01T09:00:00.000Z',
    tahminibitisTarihi: '2025-06-30T17:00:00.000Z',
    aciklama: 'Frontend test açıklaması',
    bolgeId: 'cmc3gntip0000wcwx6nep27uq', // Use actual bolge ID
    // SEO fields - always sent from frontend now
    seoTitle: 'Frontend Test SEO Başlığı',
    seoDescription: 'Frontend test için SEO açıklaması',
    seoKeywords: 'frontend, test, hafriyat',
    seoLink: 'frontend-test-slug',
    seoCanonicalUrl: 'https://example.com/frontend-test',
    // Gallery - sent as array from frontend
    resimler: [
      {
        url: 'https://picsum.photos/800/600?random=10',
        alt: 'Frontend Test Resim 1',
        description: 'Frontend test resim açıklaması 1'
      },
      {
        url: 'https://picsum.photos/800/600?random=11',
        alt: 'Frontend Test Resim 2', 
        description: 'Frontend test resim açıklaması 2'
      }
    ]
  },
  
  frontendUpdatePayload: {
    ad: 'Updated Frontend Test Saha',
    konumAdi: 'Updated Frontend Test Konumu', 
    ilerlemeyuzdesi: 85,
    tonBasiUcret: 200.50,
    tamamlananTon: 6800,
    aciklama: 'Updated frontend test açıklaması',
    // SEO updates
    seoTitle: 'Updated Frontend Test SEO Başlığı',
    seoDescription: 'Updated frontend test için SEO açıklaması',
    seoKeywords: 'updated, frontend, test, hafriyat',
    seoLink: 'updated-frontend-test-slug',
    seoCanonicalUrl: '', // Test empty value
    // Updated gallery
    resimler: [
      {
        url: 'https://picsum.photos/800/600?random=12',
        alt: 'Updated Frontend Test Resim 1',
        description: 'Updated frontend test resim açıklaması 1'
      },
      {
        url: 'https://picsum.photos/800/600?random=13',
        alt: 'Updated Frontend Test Resim 2',
        description: 'Updated frontend test resim açıklaması 2'
      },
      {
        url: 'https://picsum.photos/800/600?random=14',
        alt: 'Updated Frontend Test Resim 3',
        description: 'Updated frontend test resim açıklaması 3'
      }
    ]
  }
};

async function testFrontendApiFlow() {
  console.log('🌐 Testing Frontend API Flow Simulation');
  console.log('=' .repeat(50));
  
  let createdSahaId = null;
  
  try {    // 1. Test CREATE API simulation
    console.log('\n📤 Simulating POST /api/hafriyat-sahalar...');
    const createResponse = await fetch('http://localhost:3001/api/hafriyat-sahalar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData.frontendCreatePayload)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Create API failed: ${createResponse.status} - ${errorText}`);
    }
    
    const createResult = await createResponse.json();
    console.log('✅ CREATE API Response:', {
      success: createResult.success,
      sahaId: createResult.data?.id,
      seoTitle: createResult.data?.seoTitle,
      galleryCount: createResult.data?.resimler?.length || 0
    });
    
    if (!createResult.success) {
      throw new Error('Create API returned success: false');
    }
    
    createdSahaId = createResult.data.id;
      // 2. Test GET API simulation
    console.log('\n📥 Simulating GET /api/hafriyat-sahalar/[id]...');
    const getResponse = await fetch(`http://localhost:3001/api/hafriyat-sahalar/${createdSahaId}`);
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      throw new Error(`Get API failed: ${getResponse.status} - ${errorText}`);
    }
    
    const getResult = await getResponse.json();
    console.log('✅ GET API Response:', {
      success: getResult.success,
      sahaAd: getResult.data?.ad,
      seoFields: {
        seoTitle: !!getResult.data?.seoTitle,
        seoDescription: !!getResult.data?.seoDescription,
        seoKeywords: !!getResult.data?.seoKeywords,
        seoLink: !!getResult.data?.seoLink,
        seoCanonicalUrl: !!getResult.data?.seoCanonicalUrl
      },
      galleryCount: getResult.data?.resimler?.length || 0
    });
      // 3. Test UPDATE API simulation
    console.log('\n🔄 Simulating PUT /api/hafriyat-sahalar/[id]...');
    const updateResponse = await fetch(`http://localhost:3001/api/hafriyat-sahalar/${createdSahaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData.frontendUpdatePayload)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Update API failed: ${updateResponse.status} - ${errorText}`);
    }
    
    const updateResult = await updateResponse.json();
    console.log('✅ UPDATE API Response:', {
      success: updateResult.success,
      sahaAd: updateResult.data?.ad,
      seoTitle: updateResult.data?.seoTitle,
      galleryCount: updateResult.data?.resimler?.length || 0
    });
      // 4. Verify final state
    console.log('\n🔍 Verifying final state...');
    const finalGetResponse = await fetch(`http://localhost:3001/api/hafriyat-sahalar/${createdSahaId}`);
    const finalGetResult = await finalGetResponse.json();
    
    console.log('✅ Final Verification:', {
      success: finalGetResult.success,
      sahaAd: finalGetResult.data?.ad,
      allSeoFieldsPresent: !!(
        finalGetResult.data?.seoTitle && 
        finalGetResult.data?.seoDescription && 
        finalGetResult.data?.seoKeywords &&
        finalGetResult.data?.seoLink !== undefined &&
        finalGetResult.data?.seoCanonicalUrl !== undefined
      ),
      galleryImagesCount: finalGetResult.data?.resimler?.length || 0,
      galleryDetails: finalGetResult.data?.resimler?.map(img => ({
        baslik: img.baslik,
        kategori: img.kategori?.ad
      })) || []
    });
    
    console.log('\n🎉 FRONTEND API FLOW TEST PASSED! 🎉');
    
  } catch (error) {
    console.error('\n❌ FRONTEND API TEST FAILED:', error.message);
  } finally {
    // Cleanup
    if (createdSahaId) {
      console.log('\n🧹 Cleaning up test data...');
      try {
        const deleteResponse = await fetch(`http://localhost:3001/api/hafriyat-sahalar/${createdSahaId}`, {
          method: 'DELETE'
        });
        if (deleteResponse.ok) {
          console.log('✅ Test data cleaned up');
        } else {
          console.log('⚠️ Cleanup failed, please delete manually');
        }
      } catch (cleanupError) {
        console.log('⚠️ Cleanup error:', cleanupError.message);
      }
    }
  }
}

// Check if server is running first
async function checkServerAndTest() {  try {
    console.log('🔍 Checking if development server is running...');
    const healthResponse = await fetch('http://localhost:3001/api/health').catch(() => null);
    
    if (!healthResponse) {
      console.log('❌ Development server is not running on localhost:3001');
      console.log('💡 Please run: npm run dev');
      console.log('💡 Then run this test again');
      return;
    }
    
    console.log('✅ Development server is running');
    await testFrontendApiFlow();
    
  } catch (error) {
    console.error('❌ Server check failed:', error.message);
  }
}

checkServerAndTest();
