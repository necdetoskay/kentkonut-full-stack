const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function debugServiceImages() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Debugging service card images...');
    
    const serviceCards = await prisma.serviceCard.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    
    console.log(`📊 Found ${serviceCards.length} service cards:`);
    
    for (const card of serviceCards) {
      console.log(`\n📋 ${card.title}:`);
      console.log(`   ID: ${card.id}`);
      console.log(`   Image URL in DB: ${card.imageUrl}`);
      console.log(`   Alt Text: ${card.altText || 'N/A'}`);
      
      // Check if file exists at the stored path
      const storedPath = path.join(process.cwd(), 'public', card.imageUrl);
      const storedExists = fs.existsSync(storedPath);
      console.log(`   File exists at stored path: ${storedExists ? '✅' : '❌'} ${storedPath}`);
      
      // Check if file exists in media directory
      const mediaPath = path.join(process.cwd(), 'public', 'media', card.imageUrl.replace(/^\//, ''));
      const mediaExists = fs.existsSync(mediaPath);
      console.log(`   File exists in media: ${mediaExists ? '✅' : '❌'} ${mediaPath}`);
      
      // Check if file exists in media/services
      const servicesPath = path.join(process.cwd(), 'public', 'media', 'services', path.basename(card.imageUrl));
      const servicesExists = fs.existsSync(servicesPath);
      console.log(`   File exists in media/services: ${servicesExists ? '✅' : '❌'} ${servicesPath}`);
    }
    
    // List all files in public directory structure
    console.log('\n📁 Public directory structure:');
    const publicDir = path.join(process.cwd(), 'public');
    
    function listDirectory(dir, prefix = '') {
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        items.forEach(item => {
          if (item.isDirectory()) {
            console.log(`${prefix}📁 ${item.name}/`);
            if (prefix.length < 6) { // Limit depth
              listDirectory(path.join(dir, item.name), prefix + '  ');
            }
          } else {
            console.log(`${prefix}📄 ${item.name}`);
          }
        });
      } catch (error) {
        console.log(`${prefix}❌ Error reading directory: ${error.message}`);
      }
    }
    
    listDirectory(publicDir);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugServiceImages();
