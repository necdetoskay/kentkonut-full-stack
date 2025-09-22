const { PrismaClient } = require('@prisma/client');

async function checkFeaturedServices() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking featured service cards...');
    
    const allServices = await prisma.serviceCard.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    
    console.log(`📊 Total service cards: ${allServices.length}`);
    
    allServices.forEach(service => {
      console.log(`\n📋 ${service.title}:`);
      console.log(`   ID: ${service.id}`);
      console.log(`   Active: ${service.isActive ? '✅' : '❌'}`);
      console.log(`   Featured: ${service.isFeatured ? '✅' : '❌'}`);
      console.log(`   Display Order: ${service.displayOrder}`);
      console.log(`   Image URL: ${service.imageUrl}`);
    });
    
    const featuredServices = allServices.filter(s => s.isFeatured);
    const activeServices = allServices.filter(s => s.isActive);
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total: ${allServices.length}`);
    console.log(`   Active: ${activeServices.length}`);
    console.log(`   Featured: ${featuredServices.length}`);
    
    if (featuredServices.length === 0) {
      console.log('\n⚠️ No featured services found! This might be why the frontend is using fallback data.');
      console.log('💡 Consider marking some services as featured or removing the featured filter from the frontend.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeaturedServices();
