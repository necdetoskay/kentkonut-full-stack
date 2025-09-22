// Script to populate missing URL fields in media records
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

// Function to get category subdirectory
function getCategorySubdirectory(categoryName) {
  const subdirectoryMap = {
    'Banner Görselleri': 'banners',
    'Haber Görselleri': 'news',
    'Sayfa İçerikleri': 'page-content',
    'İçerik Görselleri': 'content-images',
    'Genel Medya': 'general'
  };
  
  return subdirectoryMap[categoryName] || 'general';
}

// Function to generate URL from filename and category
function generateMediaUrl(filename, categoryName) {
  const subdirectory = getCategorySubdirectory(categoryName);
  return `/uploads/media/${subdirectory}/${filename}`;
}

async function populateMediaUrls() {
  try {
    console.log('🔍 Checking media records without URL...');
    
    // Get all media records without URL
    const mediaRecords = await prisma.media.findMany({
      where: {
        OR: [
          { url: null },
          { url: '' }
        ]
      },
      include: {
        category: true
      }
    });
    
    console.log(`📊 Found ${mediaRecords.length} media records without URL`);
    
    if (mediaRecords.length === 0) {
      console.log('✅ All media records already have URLs!');
      return;
    }
    
    // Update each record
    let updated = 0;
    let errors = 0;
    
    for (const media of mediaRecords) {
      try {
        const url = generateMediaUrl(media.filename, media.category.name);
        
        await prisma.media.update({
          where: { id: media.id },
          data: { url }
        });
        
        console.log(`✅ Updated media ID ${media.id}: ${media.filename} -> ${url}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating media ID ${media.id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Updated: ${updated} records`);
    console.log(`   ❌ Errors: ${errors} records`);
    console.log(`   📊 Total processed: ${mediaRecords.length} records`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateMediaUrls();
