const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function testGalleryImagesSave() {
  try {
    console.log('🔍 Testing Hafriyat Gallery Images Save Fix...\n');

    // Find a test saha
    const testSaha = await db.hafriyatSaha.findFirst({
      include: {
        resimler: true
      }
    });

    if (!testSaha) {
      console.log('❌ No test saha found. Creating one...');
      return;
    }

    console.log(`✅ Found test saha: ${testSaha.ad} (ID: ${testSaha.id})`);
    console.log(`📸 Current images count: ${testSaha.resimler.length}`);

    // Test the API with gallery images
    const testGalleryImages = [
      {
        url: '/uploads/test-image-1.jpg',
        alt: 'Test image 1',
        description: 'Test description 1'
      },
      {
        url: '/uploads/test-image-2.jpg', 
        alt: 'Test image 2',
        description: 'Test description 2'
      }
    ];

    const testPayload = {
      ad: testSaha.ad + ' (Updated)',
      resimler: testGalleryImages
    };

    console.log('\n🧪 Testing API call with gallery images...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(`http://localhost:3000/api/hafriyat-sahalar/${testSaha.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ API call successful!');
      
      // Check if images were saved
      const updatedSaha = await db.hafriyatSaha.findUnique({
        where: { id: testSaha.id },
        include: {
          resimler: {
            include: {
              kategori: true
            },
            orderBy: { sira: 'asc' }
          }
        }
      });

      console.log(`📸 New images count: ${updatedSaha.resimler.length}`);
      
      if (updatedSaha.resimler.length > testSaha.resimler.length) {
        console.log('✅ Gallery images were successfully saved!');
        
        // Show the newly added images
        const newImages = updatedSaha.resimler.slice(-testGalleryImages.length);
        console.log('\n📷 Newly added images:');
        newImages.forEach((img, index) => {
          console.log(`  ${index + 1}. ${img.baslik}`);
          console.log(`     URL: ${img.dosyaYolu}`);
          console.log(`     Alt: ${img.altMetin}`);
          console.log(`     Category: ${img.kategori.ad}`);
        });
      } else {
        console.log('⚠️ Images may not have been saved (no count increase)');
      }
    } else {
      console.log('❌ API call failed:', result.message || 'Unknown error');
      console.log('Response:', result);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await db.$disconnect();
  }
}

async function checkScrollbarFix() {
  console.log('\n\n🖥️ Checking Scrollbar Fix...\n');
  
  try {
    // Read the edit page file to verify the scrollbar fix
    const fs = require('fs');
    const path = require('path');
    
    const editPagePath = path.join(__dirname, 'app', 'dashboard', 'hafriyat', 'sahalar', '[id]', 'duzenle', 'page.tsx');
    
    if (fs.existsSync(editPagePath)) {
      const content = fs.readFileSync(editPagePath, 'utf8');
      
      // Check for fixed loading state
      if (content.includes('py-12') && !content.includes('min-h-[400px]')) {
        console.log('✅ Loading state scrollbar fix confirmed: Using py-12 instead of min-h-[400px]');
      } else if (content.includes('min-h-[400px]')) {
        console.log('❌ Scrollbar issue may still exist: min-h-[400px] found');
      } else {
        console.log('ℹ️ Loading state structure may have changed');
      }
      
      // Check for any other potential height constraints that could cause scrollbar issues
      const heightMatches = content.match(/(?:min-h-\[[\d]+px\]|max-h-\[[\d]+px\]|h-\[[\d]+px\])/g);
      if (heightMatches && heightMatches.length > 0) {
        console.log('⚠️ Found height constraints that might affect scrollbar:');
        heightMatches.forEach(match => console.log(`   - ${match}`));
        console.log('   These should be reviewed to ensure they don\'t cause double scrollbars');
      } else {
        console.log('✅ No problematic height constraints found');
      }
      
    } else {
      console.log('❌ Edit page file not found at expected location');
    }
    
  } catch (error) {
    console.error('❌ Scrollbar check failed:', error.message);
  }
}

// Run tests
testGalleryImagesSave().then(() => {
  checkScrollbarFix();
});
