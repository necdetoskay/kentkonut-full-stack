const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Simple bcrypt verification since we can't easily import TS module
async function verifyBcryptPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

const prisma = new PrismaClient();

async function testAuthorizeFunction() {
  try {
    console.log('Testing authorize function logic...');
    
    const credentials = {
      email: 'admin@kentkonut.com',
      password: '123456'
    };
    
    console.log('1. Checking credentials:', credentials);
    
    if (!credentials?.email || !credentials?.password) {
      console.log('❌ Missing credentials');
      return null;
    }
    
    console.log('2. Looking up user in database...');
    const user = await prisma.user.findUnique({
      where: {
        email: credentials.email
      },
    });
    
    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      console.log('User found:', !!user);
      console.log('Has password:', user ? !!user.password : false);
      return null;
    }
    
    console.log('✅ User found:', user.email);
    console.log('User ID:', user.id);
    console.log('User role:', user.role);
    
    console.log('3. Verifying password...');
    const isPasswordValid = await verifyBcryptPassword(
      credentials.password,
      user.password
    );
    
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return null;
    }
    
    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    };
    
    console.log('✅ Authorize would return:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Authorize function error:', error.message);
    console.error('Stack:', error.stack);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

testAuthorizeFunction();