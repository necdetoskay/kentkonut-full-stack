const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint:');
  try {
    const healthResult = await makeRequest('http://localhost:3010/api/health');
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Data:`, healthResult.data);
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
  }
  console.log('');

  // Test 2: Hero banner position
  console.log('2️⃣ Testing hero banner position:');
  const heroUUID = '550e8400-e29b-41d4-a716-446655440001';
  try {
    const bannerResult = await makeRequest(`http://localhost:3010/api/public/banners/position/${heroUUID}`);
    console.log(`   Status: ${bannerResult.status}`);
    console.log(`   CORS Headers:`);
    console.log(`     Access-Control-Allow-Origin: ${bannerResult.headers['access-control-allow-origin']}`);
    console.log(`     Access-Control-Allow-Methods: ${bannerResult.headers['access-control-allow-methods']}`);
    console.log(`   Data:`, JSON.stringify(bannerResult.data, null, 2));
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
  }
  console.log('');

  // Test 3: Banner groups endpoint
  console.log('3️⃣ Testing banner groups endpoint:');
  try {
    const groupsResult = await makeRequest('http://localhost:3010/api/banner-groups');
    console.log(`   Status: ${groupsResult.status}`);
    console.log(`   Data:`, JSON.stringify(groupsResult.data, null, 2));
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
  }
}

testAPI().catch(console.error);
