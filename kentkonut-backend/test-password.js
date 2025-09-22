const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function testPassword() {
  try {
    console.log('=== Password Test ===');
    
    // Get user from database
    const user = await db.user.findUnique({
      where: {
        email: 'admin@kentkonut.com'
      }
    });
    
    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('Password hash:', user.password.substring(0, 20) + '...');
    
    // Test different passwords
    const testPasswords = ['admin123', 'Admin123!', '123456'];
    
    for (const password of testPasswords) {
      console.log(`\nTesting password: "${password}"`);
      const isValid = await bcrypt.compare(password, user.password);
      console.log(`Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (isValid) {
        console.log(`\n🎉 Correct password found: "${password}"`);
        break;
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await db.$disconnect();
  }
}

testPassword();