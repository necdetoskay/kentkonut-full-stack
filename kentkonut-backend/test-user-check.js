const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('Checking user in database...');
    
    const user = await prisma.user.findUnique({
      where: {
        email: 'admin@kentkonut.com'
      }
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      
      // Create the user if it doesn't exist
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('123456', 12);
      
      const newUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: 'admin@kentkonut.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin user created:', newUser.email);
    } else {
      console.log('✅ User found:', user.email);
      console.log('User role:', user.role);
      console.log('Has password:', !!user.password);
      
      // Test password verification
      if (user.password) {
        const isValid = await bcrypt.compare('123456', user.password);
        console.log('Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
        
        if (!isValid) {
          console.log('Updating password...');
          const hashedPassword = await bcrypt.hash('123456', 12);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          });
          console.log('✅ Password updated');
        }
      }
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();