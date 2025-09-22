const fetch = require('node-fetch');

async function testPageUpdate() {
  console.log('🧪 Testing Page Update API...\n');

  const baseUrl = 'http://localhost:3010';
  const pageId = 'cmd72line002h7cx5kxcu0ypl'; // The page we created
  
  try {
    // Test 1: Get the current page data
    console.log('📋 Test 1: Get current page data');
    
    const getResponse = await fetch(`${baseUrl}/api/pages/${pageId}`);
    const currentPage = await getResponse.json();
    
    console.log(`GET Status: ${getResponse.status}`);
    console.log(`GET Success: ${currentPage.success}`);
    
    if (!currentPage.success) {
      console.log('❌ Failed to get page data');
      return;
    }
    
    console.log('✅ Current page data retrieved');
    console.log(`Current hasQuickAccess: ${currentPage.data.hasQuickAccess}`);
    
    // Test 2: Update page with hasQuickAccess = true
    console.log('\n📋 Test 2: Update page with hasQuickAccess = true');
    
    const updateData = {
      title: currentPage.data.title,
      slug: currentPage.data.slug,
      content: currentPage.data.content,
      excerpt: currentPage.data.excerpt || '',
      imageUrl: currentPage.data.imageUrl || '',
      order: currentPage.data.order || 0,
      isActive: currentPage.data.isActive,
      metaTitle: currentPage.data.metaTitle || '',
      metaDescription: currentPage.data.metaDescription || '',
      metaKeywords: currentPage.data.metaKeywords || [],
      categoryId: '', // Test empty string handling
      publishedAt: '', // Test empty string handling
      hasQuickAccess: true // This is what we're testing
    };
    
    console.log('📤 Sending update data:', JSON.stringify(updateData, null, 2));
    
    const updateResponse = await fetch(`${baseUrl}/api/pages/${pageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    
    console.log(`PUT Status: ${updateResponse.status}`);
    console.log(`PUT Success: ${updateResult.success}`);
    console.log(`PUT Response:`, JSON.stringify(updateResult, null, 2));
    
    if (updateResult.success) {
      console.log('✅ Page updated successfully');
      console.log(`Updated hasQuickAccess: ${updateResult.data.hasQuickAccess}`);
    } else {
      console.log('❌ Page update failed');
      if (updateResult.details) {
        console.log('Error details:', updateResult.details);
      }
    }
    
    // Test 3: Verify the update by getting the page again
    if (updateResult.success) {
      console.log('\n📋 Test 3: Verify update by getting page again');
      
      const verifyResponse = await fetch(`${baseUrl}/api/pages/${pageId}`);
      const verifiedPage = await verifyResponse.json();
      
      console.log(`Verify Status: ${verifyResponse.status}`);
      console.log(`Verified hasQuickAccess: ${verifiedPage.data.hasQuickAccess}`);
      
      if (verifiedPage.data.hasQuickAccess === true) {
        console.log('✅ Update verified successfully');
      } else {
        console.log('❌ Update verification failed');
      }
    }

  } catch (error) {
    console.error('❌ Page update test failed:', error.message);
    console.error('Stack:', error.stack);
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
  
  await testPageUpdate();
}

main();
