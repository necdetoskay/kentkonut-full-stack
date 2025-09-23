#!/usr/bin/env node

/**
 * Test script for corporate cards API endpoints
 */

const http = require('http');

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3010,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testing Corporate Cards API Endpoints...\n');

  try {
    // Test 1: GET /api/admin/kurumsal/kartlar
    console.log('1️⃣ Testing GET /api/admin/kurumsal/kartlar');
    const getResult = await makeRequest('GET', '/api/admin/kurumsal/kartlar');
    console.log(`   Status: ${getResult.status}`);
    
    if (getResult.status === 200) {
      console.log('   ✅ SUCCESS');
      console.log(`   📦 Data: ${getResult.data.data?.length || 0} cards found`);
      if (getResult.data.meta) {
        console.log(`   📊 Meta: ${JSON.stringify(getResult.data.meta)}`);
      }
    } else {
      console.log('   ❌ FAILED');
      console.log(`   Error: ${getResult.data.error || getResult.data}`);
    }

    // Test 2: POST /api/admin/kurumsal/kartlar
    console.log('\n2️⃣ Testing POST /api/admin/kurumsal/kartlar');
    const testCard = {
      title: 'Test Kart',
      subtitle: 'Test Alt Başlık',
      description: 'Bu bir test kartıdır',
      backgroundColor: '#f0f0f0',
      textColor: '#333333',
      accentColor: '#007bff',
      isActive: true
    };

    const postResult = await makeRequest('POST', '/api/admin/kurumsal/kartlar', testCard);
    console.log(`   Status: ${postResult.status}`);
    
    if (postResult.status === 201) {
      console.log('   ✅ SUCCESS');
      console.log(`   📦 Created card ID: ${postResult.data.data?.id}`);
      console.log(`   📝 Title: ${postResult.data.data?.title}`);
    } else {
      console.log('   ❌ FAILED');
      console.log(`   Error: ${postResult.data.error || postResult.data}`);
    }

    // Test 3: GET again to see if card was created
    console.log('\n3️⃣ Testing GET again (after POST)');
    const getResult2 = await makeRequest('GET', '/api/admin/kurumsal/kartlar');
    console.log(`   Status: ${getResult2.status}`);
    
    if (getResult2.status === 200) {
      console.log('   ✅ SUCCESS');
      console.log(`   📦 Data: ${getResult2.data.data?.length || 0} cards found`);
      
      // Check if our test card exists
      const testCardExists = getResult2.data.data?.find(card => card.title === 'Test Kart');
      if (testCardExists) {
        console.log('   🎉 Test card found in list!');
      }
    }

    // Test 4: Test working endpoint for comparison
    console.log('\n4️⃣ Testing working endpoint /api/executives (for comparison)');
    const executivesResult = await makeRequest('GET', '/api/executives');
    console.log(`   Status: ${executivesResult.status}`);
    
    if (executivesResult.status === 200) {
      console.log('   ✅ Executives endpoint working');
      console.log(`   📦 Data: ${Array.isArray(executivesResult.data) ? executivesResult.data.length : 'Not array'} executives`);
    } else {
      console.log('   ❌ Executives endpoint failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Server not running. Please start the development server:');
      console.log('   npm run dev');
      console.log('   or');
      console.log('   npx next dev --port 3010');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test completed');
  console.log('='.repeat(60));
}

// Run tests
testEndpoints();
