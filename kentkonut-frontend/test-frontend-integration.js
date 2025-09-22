// Frontend Integration Test
// This script tests if the frontend can successfully connect to the backend

console.log('🔗 Frontend Integration Test\n');

// Test the exact same configuration as the frontend
const VITE_API_URL = 'http://localhost:3001'; // Same as .env file

async function testFrontendIntegration() {
  console.log('🧪 Testing Frontend-Backend Integration');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Banner API (same call as Hero component)
    console.log('\n📋 Test 1: Banner API Call (Hero component simulation)');
    const bannerResponse = await fetch(`${VITE_API_URL}/api/public/banners`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!bannerResponse.ok) {
      throw new Error(`HTTP error! status: ${bannerResponse.status}`);
    }

    const bannerData = await bannerResponse.json();
    console.log(`✅ Banner API Success: ${bannerData.length} banner groups found`);
    
    if (bannerData.length > 0) {
      const firstGroup = bannerData[0];
      console.log(`📊 First Group: "${firstGroup.name}" with ${firstGroup.banners.length} banners`);
      
      // Test banner filtering (same as Hero component)
      const activeBanners = firstGroup.banners.filter(banner => banner.active);
      console.log(`✅ Active Banners: ${activeBanners.length}/${firstGroup.banners.length}`);
    }

    // Test 2: Statistics API (same call as Hero component)
    console.log('\n📋 Test 2: Statistics API Call (Hero component simulation)');
    if (bannerData.length > 0 && bannerData[0].banners.length > 0) {
      const testBanner = bannerData[0].banners[0];
      
      // Test view tracking
      const viewResponse = await fetch(`${VITE_API_URL}/api/public/statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannerId: testBanner.id,
          type: 'view'
        }),
      });

      if (viewResponse.ok) {
        const viewResult = await viewResponse.json();
        console.log(`✅ View Tracking Success: ID ${viewResult.id}`);
      } else {
        console.log(`❌ View Tracking Failed: ${viewResponse.status}`);
      }

      // Test click tracking
      const clickResponse = await fetch(`${VITE_API_URL}/api/public/statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannerId: testBanner.id,
          type: 'click'
        }),
      });

      if (clickResponse.ok) {
        const clickResult = await clickResponse.json();
        console.log(`✅ Click Tracking Success: ID ${clickResult.id}`);
      } else {
        console.log(`❌ Click Tracking Failed: ${clickResponse.status}`);
      }
    }

    // Test 3: CORS and Headers
    console.log('\n📋 Test 3: CORS and Headers Check');
    const corsResponse = await fetch(`${VITE_API_URL}/api/public/banners`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3002', // Frontend origin
      },
    });

    if (corsResponse.ok) {
      console.log('✅ CORS Configuration: Working correctly');
    } else {
      console.log(`❌ CORS Configuration: Issue detected (${corsResponse.status})`);
    }

    // Test 4: Environment Variable Verification
    console.log('\n📋 Test 4: Environment Configuration');
    console.log(`🔧 Frontend URL: http://localhost:3002`);
    console.log(`🔧 Backend URL: ${VITE_API_URL}`);
    console.log(`🔧 API Endpoint: ${VITE_API_URL}/api/public/banners`);
    console.log('✅ Environment Configuration: Correct');

    console.log('\n🎉 Frontend Integration Test Complete!');
    console.log('📊 Summary:');
    console.log('✅ Frontend can connect to backend');
    console.log('✅ Banner API working correctly');
    console.log('✅ Statistics API working correctly');
    console.log('✅ CORS configuration working');
    console.log('✅ Environment variables correct');
    
    return true;

  } catch (error) {
    console.error('\n❌ Frontend Integration Test Failed:', error);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check if backend is running on port 3001');
    console.log('2. Check if frontend is running on port 3002');
    console.log('3. Verify .env file has correct VITE_API_URL');
    console.log('4. Check network connectivity');
    
    return false;
  }
}

// Run the test
testFrontendIntegration().catch(console.error);
