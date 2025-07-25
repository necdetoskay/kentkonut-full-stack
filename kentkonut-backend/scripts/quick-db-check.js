const { PrismaClient } = require('@prisma/client');

async function quickCheck() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking database...');
    
    const bannerCount = await prisma.banner.count();
    const bannerGroupCount = await prisma.bannerGroup.count();
    const bannerPositionCount = await prisma.bannerPosition.count();
    
    console.log(`Banners: ${bannerCount}`);
    console.log(`Banner Groups: ${bannerGroupCount}`);
    console.log(`Banner Positions: ${bannerPositionCount}`);
    
    if (bannerCount === 0) {
      console.log('❌ BANNER DATA LOST! Need to restore.');
    } else {
      console.log('✅ Banner data exists.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickCheck();
