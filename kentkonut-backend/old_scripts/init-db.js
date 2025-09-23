// Database initialization script
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing database with default admin user...');
  
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: 'admin@example.com',
      },
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation.');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('Admin user created successfully:', adminUser.email);
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('Database initialization completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
