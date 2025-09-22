const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log('Testing Prisma connection...');
    
    // Test page model
    const pageCount = await prisma.page.count();
    console.log('Page count:', pageCount);
    
    // Test banner model
    const bannerGroupCount = await prisma.bannerGroup.count();
    console.log('Banner group count:', bannerGroupCount);
    
    console.log('Prisma connection successful!');
  } catch (error) {
    console.error('Prisma connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
