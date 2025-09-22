const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing NextAuth signin with CSRF endpoint...');
    
    // 1. Get CSRF token from dedicated endpoint
    const csrfResponse = await fetch('http://localhost:3021/api/auth/csrf', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const csrfData = await csrfResponse.json();
    const cookies = csrfResponse.headers.get('set-cookie');
    console.log('CSRF Token:', csrfData.csrfToken);
    console.log('Got cookies from CSRF endpoint');
    
    // 2. Submit credentials with CSRF token
    const formData = new URLSearchParams({
      email: 'admin@kentkonut.com',
      password: '123456',
      csrfToken: csrfData.csrfToken,
      callbackUrl: 'http://localhost:3021/dashboard',
      json: 'true'
    });
    
    const loginResponse = await fetch('http://localhost:3021/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
        'Accept': 'application/json'
      },
      body: formData,
      redirect: 'manual'
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers.raw());
    
    // Check for JWT cookies specifically
    const loginCookies = loginResponse.headers.get('set-cookie');
    console.log('Login cookies:', loginCookies);
    
    if (loginCookies) {
      const hasSessionToken = loginCookies.includes('authjs.session-token') || loginCookies.includes('next-auth.session-token');
      const hasJWT = loginCookies.includes('authjs.csrf-token') || loginCookies.includes('next-auth.csrf-token');
      console.log('Has session token:', hasSessionToken);
      console.log('Has CSRF token:', hasJWT);
    }
    
    const responseText = await loginResponse.text();
    console.log('Response body (first 500 chars):', responseText.substring(0, 500));
    
    if (loginResponse.status === 302) {
      const location = loginResponse.headers.get('location');
      console.log('✅ Login successful! Redirected to:', location);
      
      // Check if redirect contains error
      if (location && location.includes('error=')) {
        console.log('❌ But there was an error in the redirect:', location);
      } else {
        console.log('✅ No errors detected in redirect');
        
        // Test session with new cookies
        const allCookies = [cookies, loginResponse.headers.get('set-cookie')]
          .filter(Boolean)
          .join('; ');
          
        if (allCookies) {
          console.log('\nTesting session with login cookies...');
          const sessionResponse = await fetch('http://localhost:3021/api/auth/session', {
            headers: {
              'Cookie': allCookies,
              'Accept': 'application/json'
            }
          });
          
          const sessionData = await sessionResponse.json();
          console.log('Session data:', sessionData);
          
          if (sessionData && sessionData.user) {
            console.log('✅ Login completely successful! User:', sessionData.user.email);
          } else {
            console.log('❌ Login redirect successful but no session created');
          }
        }
      }
    } else {
      console.log('❌ Login failed with status:', loginResponse.status);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();