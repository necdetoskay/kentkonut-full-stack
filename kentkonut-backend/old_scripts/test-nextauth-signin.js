const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function testDatabase() {
  console.log('=== Database User Test ===');
  
  try {
    console.log('\n1. Looking for admin user...');
    
    const user = await db.user.findUnique({
      where: {
        email: 'admin@kentkonut.com'
      }
    });
    
    console.log('User found:', !!user);
    if (user) {
      console.log('User details:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasPassword: !!user.password
      });
      
      if (user.password) {
        console.log('\n2. Testing password...');
        const isValid = await bcrypt.compare('123456', user.password);
        console.log('Password valid:', isValid);
      }
    }
    
  } catch (error) {
    console.error('Database Error:', error);
  } finally {
    await db.$disconnect();
  }
}

testDatabase();