// Test script for hafriyat sahalar API integration
const testApiIntegration = async () => {
  try {
    console.log('🧪 Testing Hafriyat Sahalar API Integration...\n');

    // Test 1: Get all sahalar
    console.log('1️⃣ Testing GET /api/hafriyat-sahalar');
    const listResponse = await fetch('http://localhost:3000/api/hafriyat-sahalar?aktif=true');
    const listData = await listResponse.json();
    
    if (listData.success) {
      console.log('✅ GET request successful');
      console.log(`   Found ${listData.data.length} sahalar`);
      
      if (listData.data.length > 0) {
        const firstSaha = listData.data[0];
        console.log(`   Sample saha: ${firstSaha.ad} (ID: ${firstSaha.id})`);
        
        // Test 2: Get specific saha
        console.log('\n2️⃣ Testing GET /api/hafriyat-sahalar/[id]');
        const detailResponse = await fetch(`http://localhost:3000/api/hafriyat-sahalar/${firstSaha.id}`);
        const detailData = await detailResponse.json();
        
        if (detailData.success) {
          console.log('✅ GET [id] request successful');
          console.log(`   Saha details: ${detailData.data.ad}`);
          console.log(`   Bolge: ${detailData.data.bolge.ad}`);
          console.log(`   Yetkili: ${detailData.data.bolge.yetkiliKisi}`);
        } else {
          console.log('❌ GET [id] request failed:', detailData.message);
        }
      }
    } else {
      console.log('❌ GET request failed:', listData.message);
    }

    // Test 3: Get bolgeler for form
    console.log('\n3️⃣ Testing GET /api/hafriyat-bolgeler');
    const bolgelerResponse = await fetch('http://localhost:3000/api/hafriyat-bolgeler?aktif=true');
    const bolgelerData = await bolgelerResponse.json();
    
    if (bolgelerData.success) {
      console.log('✅ Bolgeler request successful');
      console.log(`   Found ${bolgelerData.data.length} bolgeler`);
      bolgelerData.data.forEach(bolge => {
        console.log(`   - ${bolge.ad} (Yetkili: ${bolge.yetkiliKisi})`);
      });
    } else {
      console.log('❌ Bolgeler request failed:', bolgelerData.message);
    }

    console.log('\n🎉 API Integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run the test
testApiIntegration();
