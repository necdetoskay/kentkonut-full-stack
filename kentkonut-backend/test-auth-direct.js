// NextJS test script
const { execSync } = require('child_process');

// Test using NextJS API route
const fetch = require('node-fetch');

async function testDirectAuth() {
    const passwords = ['admin123', 'password', '123456', 'admin', 'kentkonut123', 'KentKonut2025'];
    
    for (const password of passwords) {
        try {
            console.log(`Testing password: ${password}`);
            
            const response = await fetch('http://localhost:3021/api/test-auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@kentkonut.com',
                    password: password
                })
            });
            
            const result = await response.json();
            console.log(`Result for ${password}:`, result);
            
            if (result.success) {
                console.log(`✅ CORRECT PASSWORD FOUND: ${password}`);
                break;
            }
            
        } catch (error) {
            console.error(`Test failed for ${password}:`, error);
        }
    }
}

testDirectAuth();