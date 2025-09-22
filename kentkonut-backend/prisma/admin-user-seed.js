const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Admin User Only Seed - for container startup
 * This file only creates the admin user account
 * Safe to run multiple times (idempotent)
 */

async function seedAdminUser() {
  console.log('👤 Seeding admin user...');
  
  // Admin kullanıcısı
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });

  if (!adminExists) {
    const adminUser = await prisma.user.create({
      data: {
        id: 'admin-user-1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123!', 10),
        role: 'ADMIN',
      }
    });
    console.log('✅ Admin user created:', adminUser.email);
    return adminUser;
  } else {
    console.log('⏭️  Admin user already exists:', adminExists.email);
    return adminExists;
  }
}

async function main() {
  console.log('🚀 Starting admin user seed for container startup...');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  try {
    const user = await seedAdminUser();
    
    console.log('✅ Admin user seed completed successfully!');
    console.log('📅 Completed at:', new Date().toISOString());
    
    return {
      success: true,
      user,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error during admin user seeding:', error);
    throw error;
  }
}

// Export for API usage
module.exports = { main, seedAdminUser };

// Run if called directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Fatal error during admin user seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
