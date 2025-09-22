const fetch = require('node-fetch');

async function testSessionCheck() {
  try {
    console.log('Testing session endpoint...');
    
    // Test session endpoint
    const sessionResponse = await fetch('http://localhost:3021/api/auth/session', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Session response status:', sessionResponse.status);
    console.log('Session response headers:', sessionResponse.headers.raw());
    
    const sessionData = await sessionResponse.text();
    console.log('Session data:', sessionData);
    
    // Test providers endpoint
    console.log('\nTesting providers endpoint...');
    const providersResponse = await fetch('http://localhost:3021/api/auth/providers', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Providers response status:', providersResponse.status);
    const providersData = await providersResponse.text();
    console.log('Providers data:', providersData);
    
    // Test signin endpoint structure
    console.log('\nTesting signin endpoint...');
    const signinResponse = await fetch('http://localhost:3021/api/auth/signin', {
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    });
    
    console.log('Signin response status:', signinResponse.status);
    const signinData = await signinResponse.text();
    console.log('Signin page length:', signinData.length);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSessionCheck();