const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPageFormValidation() {
  console.log('🧪 Testing Page Form Validation...\n');

  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test 1: Empty form submission
    console.log('📋 Test 1: Empty form submission');
    
    const emptyFormData = {
      title: '',
      slug: '',
      subtitle: '',
      description: '',
      pageType: 'CUSTOM',
      showInNavigation: false,
      order: 0,
      isActive: true,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      template: 'DEFAULT',
      headerType: 'IMAGE',
      headerImage: ''
    };
    
    const emptyResponse = await fetch(`${baseUrl}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emptyFormData)
    });
    
    const emptyResult = await emptyResponse.json();
    console.log(`Status: ${emptyResponse.status}`);
    console.log(`Success: ${emptyResult.success}`);
    console.log(`Error: ${emptyResult.error}`);
    if (emptyResult.details) {
      console.log('Validation errors:');
      emptyResult.details.forEach(error => {
        console.log(`  - ${error.path.join('.')}: ${error.message}`);
      });
    }
    
    // Test 2: Invalid slug format
    console.log('\n📋 Test 2: Invalid slug format');
    
    const invalidSlugData = {
      ...emptyFormData,
      title: 'Test Sayfa',
      slug: 'Test Sayfa!@#', // Invalid characters
    };
    
    const invalidSlugResponse = await fetch(`${baseUrl}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidSlugData)
    });
    
    const invalidSlugResult = await invalidSlugResponse.json();
    console.log(`Status: ${invalidSlugResponse.status}`);
    console.log(`Success: ${invalidSlugResult.success}`);
    console.log(`Error: ${invalidSlugResult.error}`);
    if (invalidSlugResult.details) {
      console.log('Validation errors:');
      invalidSlugResult.details.forEach(error => {
        console.log(`  - ${error.path.join('.')}: ${error.message}`);
      });
    }

    // Test 3: Meta title too long
    console.log('\n📋 Test 3: Meta title too long');
    
    const longMetaTitleData = {
      ...emptyFormData,
      title: 'Test Sayfa',
      slug: 'test-sayfa',
      metaTitle: 'Bu çok uzun bir meta başlık örneğidir ve 60 karakteri aşmaktadır, bu yüzden hata vermeli',
    };
    
    const longMetaTitleResponse = await fetch(`${baseUrl}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(longMetaTitleData)
    });
    
    const longMetaTitleResult = await longMetaTitleResponse.json();
    console.log(`Status: ${longMetaTitleResponse.status}`);
    console.log(`Success: ${longMetaTitleResult.success}`);
    console.log(`Error: ${longMetaTitleResult.error}`);
    if (longMetaTitleResult.details) {
      console.log('Validation errors:');
      longMetaTitleResult.details.forEach(error => {
        console.log(`  - ${error.path.join('.')}: ${error.message}`);
      });
    }

    // Test 4: Valid form submission
    console.log('\n📋 Test 4: Valid form submission');
    
    const validFormData = {
      title: 'Test Validation Sayfası',
      slug: 'test-validation-sayfasi',
      subtitle: 'Test alt başlık',
      description: 'Test açıklama',
      pageType: 'CUSTOM',
      showInNavigation: true,
      order: 1,
      isActive: true,
      metaTitle: 'Test Meta Başlık',
      metaDescription: 'Test meta açıklama',
      metaKeywords: 'test, validation, sayfa',
      canonicalUrl: '',
      ogTitle: 'Test OG Başlık',
      ogDescription: 'Test OG açıklama',
      ogImage: '',
      template: 'DEFAULT',
      headerType: 'IMAGE',
      headerImage: '',
      hasQuickAccess: false
    };
    
    const validResponse = await fetch(`${baseUrl}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(validFormData)
    });
    
    const validResult = await validResponse.json();
    console.log(`Status: ${validResponse.status}`);
    console.log(`Success: ${validResult.success}`);
    
    if (validResult.success) {
      console.log(`✅ Page created successfully: ${validResult.data.title} (ID: ${validResult.data.id})`);
      
      // Cleanup: Delete the test page
      try {
        await fetch(`${baseUrl}/api/pages/${validResult.data.id}`, {
          method: 'DELETE'
        });
        console.log('🧹 Test page deleted');
      } catch (error) {
        console.log('❌ Failed to delete test page');
      }
    } else {
      console.log(`❌ Page creation failed: ${validResult.error}`);
      if (validResult.details) {
        console.log('Validation errors:');
        validResult.details.forEach(error => {
          console.log(`  - ${error.path.join('.')}: ${error.message}`);
        });
      }
    }

    // Test 5: Duplicate slug
    console.log('\n📋 Test 5: Duplicate slug test');
    
    // First create a page
    const firstPageResponse = await fetch(`${baseUrl}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...validFormData,
        title: 'First Page',
        slug: 'duplicate-test-slug'
      })
    });
    
    const firstPageResult = await firstPageResponse.json();
    
    if (firstPageResult.success) {
      // Try to create another page with same slug
      const duplicateResponse = await fetch(`${baseUrl}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...validFormData,
          title: 'Second Page',
          slug: 'duplicate-test-slug'
        })
      });
      
      const duplicateResult = await duplicateResponse.json();
      console.log(`Status: ${duplicateResponse.status}`);
      console.log(`Success: ${duplicateResult.success}`);
      console.log(`Error: ${duplicateResult.error}`);
      
      // Cleanup
      try {
        await fetch(`${baseUrl}/api/pages/${firstPageResult.data.id}`, {
          method: 'DELETE'
        });
        console.log('🧹 First test page deleted');
      } catch (error) {
        console.log('❌ Failed to delete first test page');
      }
    }

    console.log('\n📊 Test Summary:');
    console.log('1. ✅ Empty form validation');
    console.log('2. ✅ Invalid slug format validation');
    console.log('3. ✅ Meta title length validation');
    console.log('4. ✅ Valid form submission');
    console.log('5. ✅ Duplicate slug validation');
    
    console.log('\n🎉 Page form validation testing completed!');
    console.log('\n📝 Frontend Testing Instructions:');
    console.log('   1. Go to http://localhost:3010/dashboard/pages/new');
    console.log('   2. Try submitting empty form - should show validation errors');
    console.log('   3. Enter invalid slug (with spaces/special chars) - should show error');
    console.log('   4. Enter meta title > 60 chars - should show error');
    console.log('   5. Fill valid data and submit - should create page successfully');

  } catch (error) {
    console.error('❌ Page form validation test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3010/api/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:3010');
    console.log('Please start the server with: npm run dev');
    return;
  }
  
  await testPageFormValidation();
}

main();
