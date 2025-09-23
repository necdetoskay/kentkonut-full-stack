const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking database status...');
    
    // Check banners
    const banners = await prisma.banner.findMany();
    console.log(`📊 Banners found: ${banners.length}`);
    
    // Check banner groups
    const bannerGroups = await prisma.bannerGroup.findMany();
    console.log(`📊 Banner groups found: ${bannerGroups.length}`);
    
    // Check banner positions
    const bannerPositions = await prisma.bannerPosition.findMany();
    console.log(`📊 Banner positions found: ${bannerPositions.length}`);
    
    // Check service cards
    try {
      const serviceCards = await prisma.serviceCard.findMany();
      console.log(`📊 Service cards found: ${serviceCards.length}`);
    } catch (error) {
      console.log('📊 Service cards table not yet created (this is expected)');
    }
    
    if (banners.length > 0) {
      console.log('✅ Banner data is intact');
      banners.forEach(banner => {
        console.log(`  - ${banner.title} (Group: ${banner.bannerGroupId}, Active: ${banner.isActive})`);
      });
    } else {
      console.log('❌ No banners found - data may have been lost');
    }
    
    if (bannerGroups.length > 0) {
      console.log('✅ Banner groups data is intact');
      bannerGroups.forEach(group => {
        console.log(`  - ${group.name} (Active: ${group.isActive})`);
      });
    } else {
      console.log('❌ No banner groups found');
    }
    
    if (bannerPositions.length > 0) {
      console.log('✅ Banner positions data is intact');
      bannerPositions.forEach(position => {
        console.log(`  - ${position.name} (UUID: ${position.positionUUID})`);
      });
    } else {
      console.log('❌ No banner positions found');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
