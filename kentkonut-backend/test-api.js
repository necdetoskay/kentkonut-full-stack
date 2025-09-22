// Simple API test script
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing Corporate Content API...');
    
    // Test GET /api/corporate-content/type/ABOUT
    console.log('\n1. Testing GET /api/corporate-content/type/ABOUT');
    const getResponse = await fetch('http://localhost:3021/api/corporate-content/type/ABOUT');
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Response:', JSON.stringify(getData, null, 2));
    
    // Test GET /api/corporate-content (all content)
    console.log('\n2. Testing GET /api/corporate-content');
    const getAllResponse = await fetch('http://localhost:3021/api/corporate-content');
    const getAllData = await getAllResponse.json();
    console.log('Status:', getAllResponse.status);
    console.log('Response:', JSON.stringify(getAllData, null, 2));
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

testAPI();
