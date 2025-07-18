const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function debugMediaUploads() {
  console.log('🔍 Debugging Media Upload Issues...\n');

  try {
    // 1. Check recent uploads (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    console.log('📅 Checking uploads from the last 10 minutes...');
    const recentUploads = await db.media.findMany({
      where: {
        createdAt: {
          gte: tenMinutesAgo
        }
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${recentUploads.length} recent uploads:`);
    recentUploads.forEach((upload, index) => {
      console.log(`  ${index + 1}. ${upload.originalName}`);
      console.log(`     - ID: ${upload.id}`);
      console.log(`     - Category: ${upload.category?.name || 'No category'} (ID: ${upload.categoryId})`);
      console.log(`     - URL: ${upload.url}`);
      console.log(`     - Created: ${upload.createdAt}`);
      console.log(`     - File exists: ${upload.path ? 'Yes' : 'No'}`);
      console.log('');
    });

    // 2. Check all uploads today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('📅 Checking all uploads from today...');
    const todayUploads = await db.media.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${todayUploads.length} uploads today:`);
    todayUploads.forEach((upload, index) => {
      console.log(`  ${index + 1}. ${upload.originalName} (${upload.createdAt.toLocaleTimeString()})`);
    });

    // 3. Check media categories
    console.log('\n📂 Available media categories:');
    const categories = await db.mediaCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    categories.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category.name} (ID: ${category.id})`);
    });

    // 4. Check content-images category specifically
    console.log('\n🖼️ Checking content-images category uploads...');
    const contentImagesCategory = categories.find(cat => cat.name === 'content-images');
    
    if (contentImagesCategory) {
      const contentImages = await db.media.findMany({
        where: {
          categoryId: contentImagesCategory.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });

      console.log(`✅ Found ${contentImages.length} images in content-images category (showing last 10):`);
      contentImages.forEach((image, index) => {
        console.log(`  ${index + 1}. ${image.originalName} (${image.createdAt.toLocaleString()})`);
      });
    } else {
      console.log('❌ content-images category not found!');
    }

    // 5. Test API endpoint
    console.log('\n🌐 Testing media API endpoint...');
    try {
      const response = await fetch('http://localhost:3010/api/media?limit=5');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API responded with ${data.data.length} media files`);
        console.log(`📊 Total media files: ${data.pagination.total}`);
      } else {
        console.log(`❌ API responded with status: ${response.status}`);
      }
    } catch (apiError) {
      console.log(`❌ API request failed: ${apiError.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

debugMediaUploads();
