const fetch = require('node-fetch');
const fs = require('fs');

async function debugSigninPage() {
  try {
    console.log('Debugging signin page...');
    
    const signinResponse = await fetch('http://localhost:3021/api/auth/signin', {
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    });
    
    const signinHtml = await signinResponse.text();
    
    // Save HTML to file for inspection
    fs.writeFileSync('signin-page-debug.html', signinHtml);
    console.log('Signin page saved to signin-page-debug.html');
    
    // Look for different CSRF token patterns
    const patterns = [
      /name="csrfToken"\s+value="([^"]+)"/i,
      /name='csrfToken'\s+value='([^']+)'/i,
      /"csrfToken"\s*:\s*"([^"]+)"/i,
      /'csrfToken'\s*:\s*'([^']+)'/i,
      /csrf[_-]?token["']?\s*[:=]\s*["']([^"']+)["']/i
    ];
    
    console.log('\nSearching for CSRF token patterns...');
    for (let i = 0; i < patterns.length; i++) {
      const match = signinHtml.match(patterns[i]);
      if (match) {
        console.log(`✅ Found CSRF token with pattern ${i + 1}:`, match[1]);
        return match[1];
      }
    }
    
    // Search for any input fields
    const inputMatches = signinHtml.match(/<input[^>]*>/gi);
    if (inputMatches) {
      console.log('\nFound input fields:');
      inputMatches.forEach((input, index) => {
        console.log(`${index + 1}: ${input}`);
      });
    }
    
    // Search for form elements
    const formMatches = signinHtml.match(/<form[^>]*>[\s\S]*?<\/form>/gi);
    if (formMatches) {
      console.log('\nFound forms:');
      formMatches.forEach((form, index) => {
        console.log(`Form ${index + 1}:`, form.substring(0, 200) + '...');
      });
    }
    
    console.log('\n❌ No CSRF token found with any pattern');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugSigninPage();