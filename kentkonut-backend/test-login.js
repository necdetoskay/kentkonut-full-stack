const { signIn } = require('next-auth/react');
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login with seed user credentials...');
    
    const response = await fetch('http://localhost:3021/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'seeduser@example.com',
        password: 'password',
        csrfToken: 'test-token'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
  } catch (error) {
    console.error('Login test error:', error.message);
  }
}

testLogin();