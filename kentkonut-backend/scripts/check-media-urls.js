// Check media URLs in database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMediaUrls() {
  try {
    console.log('🔍 Checking media URLs in database...');
    
    const mediaRecords = await prisma.media.findMany({
      where: {
        mimeType: {
          startsWith: 'image/'
        }
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log(`📊 Found ${mediaRecords.length} image records:`);
    
    for (const media of mediaRecords) {
      console.log(`\n📄 Media ID: ${media.id}`);
      console.log(`   📁 Filename: ${media.filename}`);
      console.log(`   🔗 URL: ${media.url}`);
      console.log(`   📂 Category: ${media.category.name}`);
      console.log(`   📍 Path: ${media.path}`);
      
      // Check if file exists
      const fs = require('fs');
      const fileExists = fs.existsSync(media.path);
      console.log(`   💾 File exists: ${fileExists ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMediaUrls();
