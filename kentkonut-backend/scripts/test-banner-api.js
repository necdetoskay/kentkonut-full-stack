const fetch = require('node-fetch');

async function testBannerAPI() {
  console.log('🧪 Testing Banner API endpoints...\n');

  const baseUrl = 'http://localhost:3010';
  const heroUUID = '550e8400-e29b-41d4-a716-446655440001';

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint:');
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      const healthData = await healthResponse.json();
      console.log(`   Status: ${healthResponse.status}`);
      console.log(`   Response: ${JSON.stringify(healthData)}\n`);
    } catch (error) {
      console.log(`   ❌ Health check failed: ${error.message}\n`);
    }

    // Test 2: Banner groups endpoint
    console.log('2️⃣ Testing banner groups endpoint:');
    try {
      const groupsResponse = await fetch(`${baseUrl}/api/banner-groups`);
      console.log(`   Status: ${groupsResponse.status}`);
      
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        console.log(`   Found ${groupsData.length} banner groups`);
        groupsData.forEach(group => {
          console.log(`   - ${group.name} (ID: ${group.id}, Active: ${group.isActive})`);
        });
      } else {
        const errorText = await groupsResponse.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
      console.log('');
    } catch (error) {
      console.log(`   ❌ Banner groups test failed: ${error.message}\n`);
    }

    // Test 3: Hero banner position endpoint
    console.log('3️⃣ Testing hero banner position endpoint:');
    try {
      const positionResponse = await fetch(`${baseUrl}/api/public/banners/position/${heroUUID}`);
      console.log(`   Status: ${positionResponse.status}`);
      
      if (positionResponse.ok) {
        const positionData = await positionResponse.json();
        console.log(`   ✅ Success! Response:`);
        console.log(JSON.stringify(positionData, null, 2));
      } else {
        const errorText = await positionResponse.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
      console.log('');
    } catch (error) {
      console.log(`   ❌ Hero banner position test failed: ${error.message}\n`);
    }

    // Test 4: All banner positions
    console.log('4️⃣ Testing all banner positions:');
    const allPositions = [
      '550e8400-e29b-41d4-a716-446655440001', // Ana Sayfa Üst Banner
      '550e8400-e29b-41d4-a716-446655440002', // Yan Menü Banner
      '550e8400-e29b-41d4-a716-446655440003', // Alt Banner
      '550e8400-e29b-41d4-a716-446655440004', // Popup Banner
      '550e8400-e29b-41d4-a716-446655440005'  // Bildirim Banner
    ];

    for (const uuid of allPositions) {
      try {
        const response = await fetch(`${baseUrl}/api/public/banners/position/${uuid}`);
        console.log(`   Position ${uuid}: Status ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`     Position: ${data.position?.name || 'Unknown'}`);
          console.log(`     Banner Group: ${data.bannerGroup?.name || 'None'}`);
          console.log(`     Banners: ${data.banners?.length || 0}`);
        } else {
          const errorText = await response.text();
          console.log(`     Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`     ❌ Failed: ${error.message}`);
      }
    }

    // Test 5: Test with CORS headers (simulating frontend request)
    console.log('\n5️⃣ Testing with CORS headers (simulating frontend):');
    try {
      const corsResponse = await fetch(`${baseUrl}/api/public/banners/position/${heroUUID}`, {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3001',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Status: ${corsResponse.status}`);
      console.log(`   CORS Headers:`);
      console.log(`     Access-Control-Allow-Origin: ${corsResponse.headers.get('access-control-allow-origin')}`);
      console.log(`     Access-Control-Allow-Methods: ${corsResponse.headers.get('access-control-allow-methods')}`);
      
      if (corsResponse.ok) {
        const corsData = await corsResponse.json();
        console.log(`   ✅ CORS request successful`);
        console.log(`   Banners returned: ${corsData.banners?.length || 0}`);
      } else {
        const errorText = await corsResponse.text();
        console.log(`   ❌ CORS request failed: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ CORS test failed: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Overall test failed:', error);
  }
}

testBannerAPI();
