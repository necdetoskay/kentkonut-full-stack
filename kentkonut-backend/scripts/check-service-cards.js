const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkServiceCards() {
  try {
    console.log('🔍 Checking service cards in database...');
    
    const serviceCards = await prisma.serviceCard.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    
    console.log(`📊 Found ${serviceCards.length} service cards:`);
    
    serviceCards.forEach(card => {
      console.log(`  ${card.displayOrder}. ${card.title}`);
      console.log(`     ID: ${card.id}`);
      console.log(`     Slug: ${card.slug}`);
      console.log(`     Active: ${card.isActive}`);
      console.log(`     Featured: ${card.isFeatured}`);
      console.log(`     Image: ${card.imageUrl}`);
      console.log(`     Color: ${card.color}`);
      console.log('');
    });
    
    // Test API endpoint
    console.log('🧪 Testing API endpoint...');
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('http://localhost:3010/api/hizmetlerimiz');
      console.log(`API Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log('API Error:', errorText);
      }
    } catch (apiError) {
      console.log('API Request Failed:', apiError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServiceCards();
