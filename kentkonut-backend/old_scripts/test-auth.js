const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Testing authentication with credentials...');
    
    // First get CSRF token
    const csrfResponse = await fetch('http://localhost:3021/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF Token:', csrfData.csrfToken);
    
    // Test login with correct NextAuth endpoint
    const loginResponse = await fetch('http://localhost:3021/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'seeduser@example.com',
        password: 'password',
        csrfToken: csrfData.csrfToken,
        callbackUrl: 'http://localhost:3021'
      })
    });
    
    console.log('Login Response Status:', loginResponse.status);
    console.log('Login Response Headers:', Object.fromEntries(loginResponse.headers));
    
    if (loginResponse.status === 302) {
      console.log('Login successful - redirected to:', loginResponse.headers.get('location'));
    } else {
      const loginText = await loginResponse.text();
      console.log('Login Response Body:', loginText.substring(0, 500));
    }
    
    // Test session after login
    const sessionResponse = await fetch('http://localhost:3021/api/auth/session', {
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || ''
      }
    });
    
    console.log('Session Response Status:', sessionResponse.status);
    const sessionData = await sessionResponse.json();
    console.log('Session Data:', sessionData);
    
  } catch (error) {
    console.error('Auth test error:', error.message);
  }
}

testAuth();