// Test the authorize function directly
import { db } from './lib/db.js';
import { verifyBcryptPassword } from './lib/crypto.js';

async function testAuthorizeFunction() {
  try {
    console.log('Testing authorize function directly...');
    
    const user = await db.user.findUnique({
      where: { email: 'seeduser@example.com' }
    });
    
    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return;
    }
    
    console.log('Found user:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password
    });
    
    const isPasswordValid = await verifyBcryptPassword('password', user.password);
    console.log('Password validation result:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Password is valid - authorize should work');
      console.log('User data that would be returned:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image
      });
    } else {
      console.log('❌ Password validation failed');
    }
    
    // Test the actual authorize function from auth config
    const credentials = {
      email: 'seeduser@example.com',
      password: 'password'
    };
    
    console.log('\nTesting authorize function with credentials:', credentials);
    
    // Simulate the authorize function logic
    const foundUser = await db.user.findUnique({
      where: {
        email: credentials.email,
      },
    });

    if (!foundUser || !foundUser.password) {
      console.log('❌ Authorize would return null - user not found or no password');
      return;
    }

    const isValid = await verifyBcryptPassword(
      credentials.password,
      foundUser.password
    );

    if (!isValid) {
      console.log('❌ Authorize would return null - invalid password');
      return;
    }

    const authorizeResult = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      image: foundUser.image,
    };
    
    console.log('✅ Authorize would return:', authorizeResult);
    
  } catch (error) {
    console.error('Authorize test error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAuthorizeFunction();