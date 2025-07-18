// This script will attempt to verify the Prisma client connection
// Note: This may not work if dependencies are not properly installed

try {
  console.log('Attempting to import PrismaClient...');
  const { PrismaClient } = require('@prisma/client');
  
  console.log('PrismaClient imported successfully!');
  console.log('Attempting to create a Prisma client instance...');
  
  const prisma = new PrismaClient();
  
  console.log('Prisma client instance created successfully!');
  console.log('Attempting to connect to the database...');
  
  async function main() {
    try {
      // Test connection by querying users
      const users = await prisma.user.findMany();
      console.log('Successfully connected to the database!');
      console.log(`Found ${users.length} users in the database.`);
      
      // Close the connection
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  }
  
  main();
} catch (error) {
  console.error('Error importing or using PrismaClient:', error);
}
