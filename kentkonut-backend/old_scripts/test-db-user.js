const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testDbUser() {
  try {
    console.log('=== Database User Test ===');
    
    // Check if admin user exists
    console.log('\nLooking for admin@kentkonut.com user...');
    const user = await db.user.findUnique({
      where: {
        email: 'admin@kentkonut.com'
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  Role:', user.role);
      console.log('  Has password:', !!user.password);
      console.log('  Password length:', user.password ? user.password.length : 0);
      console.log('  Created at:', user.createdAt);
    } else {
      console.log('❌ User not found!');
      
      // List all users
      console.log('\nListing all users:');
      const allUsers = await db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });
      
      if (allUsers.length === 0) {
        console.log('  No users found in database');
      } else {
        allUsers.forEach((u, index) => {
          console.log(`  ${index + 1}. ${u.email} (${u.name}) - ${u.role}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await db.$disconnect();
  }
}

testDbUser();