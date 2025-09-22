// Test login functionality
import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...');

    // First, get CSRF token
    const csrfResponse = await fetch('http://localhost:3001/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('📋 CSRF Token:', csrfData.csrfToken);

    // Test login with admin credentials
    const loginData = new URLSearchParams({
      email: 'admin@kentkonut.com',
      password: 'admin123',
      csrfToken: csrfData.csrfToken,
      callbackUrl: 'http://localhost:3001/dashboard',
      json: 'true'
    });

    const loginResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: loginData,
      redirect: 'manual'
    });

    console.log('📊 Login response status:', loginResponse.status);
    console.log('📊 Login response headers:', Object.fromEntries(loginResponse.headers.entries()));

    if (loginResponse.status === 302) {
      console.log('✅ Login redirect successful');
      console.log('🔗 Redirect URL:', loginResponse.headers.get('location'));
    } else {
      const responseText = await loginResponse.text();
      console.log('📝 Response body:', responseText);
    }

    // Test session endpoint
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session');
    const sessionData = await sessionResponse.json();
    console.log('👤 Session data:', sessionData);

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testLogin();
