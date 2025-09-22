const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3010';

// Banner pozisyon UUID sabitleri
const BANNER_POSITION_UUIDS = {
  HERO: '550e8400-e29b-41d4-a716-446655440001',
  SIDEBAR: '550e8400-e29b-41d4-a716-446655440002',
  FOOTER: '550e8400-e29b-41d4-a716-446655440003',
  POPUP: '550e8400-e29b-41d4-a716-446655440004',
  NOTIFICATION: '550e8400-e29b-41d4-a716-446655440005'
};

// HTTP istek yardımcı fonksiyonu
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test fonksiyonları
async function testHealthEndpoint() {
  console.log('\n🔍 Testing Health Endpoint...');
  const result = await makeRequest(`${BASE_URL}/api/health`);
  
  if (result.success) {
    console.log('✅ Health check passed:', result.data);
  } else {
    console.log('❌ Health check failed:', result.error);
  }
  
  return result.success;
}

async function testBannerGroupsEndpoint() {
  console.log('\n🔍 Testing Banner Groups Endpoint...');
  const result = await makeRequest(`${BASE_URL}/api/public/banners`);
  
  if (result.success) {
    console.log('✅ Banner groups endpoint working:', {
      groupsFound: result.data?.groups?.length || 0,
      totalBanners: result.data?.groups?.reduce((sum, group) => sum + (group.banners?.length || 0), 0) || 0
    });
    console.log('   Groups:', result.data?.groups?.map(g => `${g.name} (${g.banners?.length || 0} banners)`));
  } else {
    console.log('❌ Banner groups endpoint failed:', result.error);
  }
  
  return result.success;
}

async function testBannerPositionEndpoint(positionName, uuid) {
  console.log(`\n🔍 Testing ${positionName} Banner Position...`);
  const result = await makeRequest(`${BASE_URL}/api/public/banners/position/${uuid}`);
  
  if (result.success) {
    console.log(`✅ ${positionName} position working:`, {
      position: result.data?.position?.name,
      bannerGroup: result.data?.bannerGroup?.name,
      bannersFound: result.data?.banners?.length || 0
    });
    
    if (result.data?.banners?.length > 0) {
      console.log('   Banners:', result.data.banners.map(b => `"${b.title}" (${b.imageUrl})`));
    }
  } else {
    console.log(`❌ ${positionName} position failed:`, result.error);
  }
  
  return result.success;
}

async function testAllBannerPositions() {
  console.log('\n🔍 Testing All Banner Positions...');
  let successCount = 0;
  const positions = Object.entries(BANNER_POSITION_UUIDS);
  
  for (const [name, uuid] of positions) {
    const success = await testBannerPositionEndpoint(name, uuid);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Position Test Summary: ${successCount}/${positions.length} positions working`);
  return successCount === positions.length;
}

async function testCORSHeaders() {
  console.log('\n🔍 Testing CORS Headers...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/public/banners`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };

    console.log('✅ CORS Headers:', corsHeaders);
    return true;
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
    return false;
  }
}

async function testFrontendSimulation() {
  console.log('\n🔍 Testing Frontend Simulation...');
  
  // Frontend'den gelecek bir istek gibi test et
  const result = await makeRequest(`${BASE_URL}/api/public/banners/position/${BANNER_POSITION_UUIDS.HERO}`, {
    headers: {
      'Origin': 'http://localhost:3000',
      'User-Agent': 'Mozilla/5.0 (Frontend Test)',
      'Accept': 'application/json'
    }
  });
  
  if (result.success) {
    console.log('✅ Frontend simulation successful');
    
    // Banner click tracking simülasyonu
    if (result.data?.banners?.length > 0) {
      const firstBanner = result.data.banners[0];
      console.log(`   Simulating click on banner: "${firstBanner.title}"`);
      
      const trackResult = await makeRequest(`${BASE_URL}/api/public/banners/${firstBanner.id}/track`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'click',
          userAgent: 'Mozilla/5.0 (Frontend Test)',
          sessionId: 'test-session-123'
        })
      });
      
      if (trackResult.success) {
        console.log('✅ Banner tracking simulation successful');
      } else {
        console.log('⚠️  Banner tracking simulation failed:', trackResult.error);
      }
    }
  } else {
    console.log('❌ Frontend simulation failed:', result.error);
  }
  
  return result.success;
}

// Ana test fonksiyonu
async function runBannerAPITests() {
  console.log('🚀 Starting Banner API Test Suite');
  console.log('=====================================');
  
  const testResults = [];
  
  // Test 1: Health Check
  testResults.push(await testHealthEndpoint());
  
  // Test 2: Banner Groups
  testResults.push(await testBannerGroupsEndpoint());
  
  // Test 3: All Banner Positions
  testResults.push(await testAllBannerPositions());
  
  // Test 4: CORS Headers
  testResults.push(await testCORSHeaders());
  
  // Test 5: Frontend Simulation
  testResults.push(await testFrontendSimulation());
  
  // Sonuçları özetle
  const passedTests = testResults.filter(result => result).length;
  const totalTests = testResults.length;
  
  console.log('\n🎯 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Banner API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend and database setup.');
  }
  
  return passedTests === totalTests;
}

// Scripti çalıştır
if (require.main === module) {
  runBannerAPITests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test suite crashed:', error);
      process.exit(1);
    });
}

module.exports = {
  runBannerAPITests,
  testHealthEndpoint,
  testBannerGroupsEndpoint,
  testBannerPositionEndpoint,
  testAllBannerPositions,
  testCORSHeaders,
  testFrontendSimulation,
  BANNER_POSITION_UUIDS
};