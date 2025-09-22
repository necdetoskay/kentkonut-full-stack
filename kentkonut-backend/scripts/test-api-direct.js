#!/usr/bin/env node

/**
 * Direct API endpoint test
 */

const http = require('http');

async function testApiEndpoint() {
  console.log('🧪 Testing Corporate Cards API Endpoint Directly...\n');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3010,
      path: '/api/admin/kurumsal/kartlar',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log('📡 Making request to:', `http://${options.hostname}:${options.port}${options.path}`);

    const req = http.request(options, (res) => {
      console.log(`📊 Response Status: ${res.statusCode}`);
      console.log(`📋 Response Headers:`, res.headers);

      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log('\n📦 Response Body:');
        try {
          const parsed = JSON.parse(body);
          console.log(JSON.stringify(parsed, null, 2));
          
          if (res.statusCode === 200) {
            console.log('\n✅ API endpoint is working!');
            console.log(`   Found ${parsed.data?.length || 0} cards`);
          } else {
            console.log('\n❌ API endpoint failed');
            console.log(`   Error: ${parsed.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.log('Raw response:', body);
          console.log('Parse error:', error.message);
        }
        
        resolve({
          status: res.statusCode,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('\n🔧 Server not running. Please start the development server:');
        console.log('   npm run dev');
        console.log('   or');
        console.log('   npx next dev --port 3010');
      }
      
      reject(error);
    });

    req.end();
  });
}

// Run test
testApiEndpoint().catch(console.error);
