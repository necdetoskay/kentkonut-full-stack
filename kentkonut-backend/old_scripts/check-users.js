const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true // Include password hash
      }
    });
    
    console.log(`Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`- ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'No password'}`);
      
      // Test password verification
      if (user.password) {
        try {
          const isValidAdmin = await bcrypt.compare('Admin123!', user.password);
          console.log(`  Password 'Admin123!' is valid: ${isValidAdmin}`);
          
          const isValidPassword = await bcrypt.compare('password', user.password);
          console.log(`  Password 'password' is valid: ${isValidPassword}`);
        } catch (error) {
          console.log(`  Password verification error: ${error.message}`);
        }
      }
      console.log('---');
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();