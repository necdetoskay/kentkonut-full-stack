#!/usr/bin/env node

/**
 * Test the test corporate cards endpoint
 */

const http = require('http');

async function testEndpoint() {
  console.log('🧪 Testing Test Corporate Cards Endpoint...\n');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3010,
      path: '/api/test-corporate-cards',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log('📡 Making request to:', `http://${options.hostname}:${options.port}${options.path}`);

    const req = http.request(options, (res) => {
      console.log(`📊 Response Status: ${res.statusCode}`);

      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log('\n📦 Response Body:');
        try {
          const parsed = JSON.parse(body);
          console.log(JSON.stringify(parsed, null, 2));
        } catch (error) {
          console.log('Raw response:', body);
        }
        
        resolve({
          status: res.statusCode,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run test
testEndpoint().catch(console.error);
