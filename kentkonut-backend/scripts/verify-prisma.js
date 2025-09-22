// Prisma verification script
require('dotenv').config();

async function main() {
  console.log('Verifying Prisma client...');
  
  try {
    console.log('Attempting to import PrismaClient...');
    const { PrismaClient } = require('@prisma/client');
    
    console.log('PrismaClient imported successfully!');
    console.log('Attempting to create a Prisma client instance...');
    
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    console.log('Prisma client instance created successfully!');
    console.log('Attempting to connect to the database...');
    
    try {
      // Test connection by querying users
      const users = await prisma.user.findMany({
        take: 5,
      });
      
      console.log('Successfully connected to the database!');
      console.log(`Found ${users.length} users in the database.`);
      
      if (users.length > 0) {
        console.log('Sample user data (first user):');
        // Print user data without sensitive information
        const { password, ...userWithoutPassword } = users[0];
        console.log(JSON.stringify(userWithoutPassword, null, 2));
      }
      
      // Close the connection
      await prisma.$disconnect();
      console.log('Prisma client disconnected successfully.');
    } catch (error) {
      console.error('Error connecting to the database with Prisma:', error);
      await prisma.$disconnect().catch(err => console.error('Error disconnecting Prisma client:', err));
      process.exit(1);
    }
  } catch (error) {
    console.error('Error importing or using PrismaClient:', error);
    process.exit(1);
  }
}

main();
