const fetch = require('node-fetch');

async function testNextAuthDirect() {
  try {
    console.log('=== NextAuth Direct Test ===');
    
    // 1. Get CSRF token
    console.log('\n1. Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3021/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF Token:', csrfData.csrfToken);
    
    // 2. Test credentials signin with detailed logging
    console.log('\n2. Testing credentials signin...');
    // Create form data for NextAuth (NextAuth expects form data)
    const formData = new URLSearchParams();
    formData.append('email', 'admin@kentkonut.com');
    formData.append('password', 'password');
    formData.append('csrfToken', csrfData.csrfToken);
    formData.append('callbackUrl', 'http://localhost:3021/dashboard');
    
    const signinResponse = await fetch('http://localhost:3021/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfResponse.headers.get('set-cookie') || ''
      },
      body: formData,
      redirect: 'manual'
    });
    
    console.log('\nSignin Response Status:', signinResponse.status);
    console.log('Signin Response Headers:');
    for (const [key, value] of signinResponse.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const signinText = await signinResponse.text();
    console.log('\nSignin Response Body:', signinText);
    
    // Check for session tokens in cookies
    const setCookieHeaders = signinResponse.headers.get('set-cookie');
    console.log('\nSet-Cookie headers:', setCookieHeaders);
    
    const hasSessionToken = setCookieHeaders && (
      setCookieHeaders.includes('next-auth.session-token') ||
      setCookieHeaders.includes('__Secure-next-auth.session-token') ||
      setCookieHeaders.includes('authjs.session-token')
    );
    
    console.log('Has session token:', hasSessionToken);
    
    // 3. Try to get session
    console.log('\n3. Checking session...');
    const sessionResponse = await fetch('http://localhost:3021/api/auth/session', {
      headers: {
        'Cookie': setCookieHeaders || ''
      }
    });
    
    const sessionData = await sessionResponse.json();
    console.log('Session data:', sessionData);
    
    if (signinResponse.status === 302) {
      console.log('\n✅ Login redirect successful');
      if (hasSessionToken) {
        console.log('✅ Session token created');
      } else {
        console.log('❌ No session token created - authorize function likely returned null');
      }
    } else {
      console.log('❌ Login failed with status:', signinResponse.status);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testNextAuthDirect();