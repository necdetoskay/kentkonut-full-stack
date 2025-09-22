const fetch = require('node-fetch');

async function testDirectAPI() {
  try {
    console.log('Testing direct API call...');
    
    // Direct POST to credentials endpoint
    const response = await fetch('http://localhost:3021/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@kentkonut.com',
        password: '123456'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Direct API call successful!');
    } else {
      console.log('❌ Direct API call failed');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDirectAPI();