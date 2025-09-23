const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDragDrop() {
  console.log('🧪 Testing Drag & Drop Functionality...\n');

  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test 1: Create a test page with hasQuickAccess enabled
    console.log('📋 Test 1: Create test page with hasQuickAccess');
    
    const testPageData = {
      title: 'Test Drag Drop Page',
      slug: 'test-drag-drop-page',
      content: 'This is a test page for drag & drop functionality.',
      hasQuickAccess: true,
      isActive: true
    };
    
    const createPageResponse = await fetch(`${baseUrl}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPageData)
    });
    
    if (!createPageResponse.ok) {
      throw new Error('Failed to create test page');
    }
    
    const createdPage = await createPageResponse.json();
    console.log(`✅ Created test page: ${createdPage.data.title} (ID: ${createdPage.data.id})`);
    
    const pageId = createdPage.data.id;

    // Test 2: Create multiple quick access links
    console.log('\n📋 Test 2: Create multiple quick access links');
    
    const linksToCreate = [
      {
        title: 'Link A',
        url: '/link-a',
        icon: 'a',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 0
      },
      {
        title: 'Link B',
        url: '/link-b',
        icon: 'b',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 1
      },
      {
        title: 'Link C',
        url: '/link-c',
        icon: 'c',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 2
      },
      {
        title: 'Link D',
        url: '/link-d',
        icon: 'd',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 3
      }
    ];

    const createdLinks = [];
    for (const linkData of linksToCreate) {
      const createLinkResponse = await fetch(`${baseUrl}/api/quick-access-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(linkData)
      });
      
      if (createLinkResponse.ok) {
        const createdLink = await createLinkResponse.json();
        createdLinks.push(createdLink.data);
        console.log(`✅ Created link: ${createdLink.data.title} (Order: ${createdLink.data.sortOrder})`);
      } else {
        console.log(`❌ Failed to create link: ${linkData.title}`);
      }
    }

    // Test 3: Get initial order
    console.log('\n📋 Test 3: Get initial order');
    
    const getInitialLinksResponse = await fetch(`${baseUrl}/api/quick-access-links/module/page/${pageId}`);
    const initialLinks = await getInitialLinksResponse.json();
    
    console.log(`✅ Status: ${getInitialLinksResponse.status}`);
    console.log(`✅ Initial links count: ${initialLinks.length}`);
    
    if (initialLinks.length > 0) {
      console.log('✅ Initial order:');
      initialLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.title} (Order: ${link.sortOrder})`);
      });
    }

    // Test 4: Reorder links (simulate drag & drop)
    console.log('\n📋 Test 4: Reorder links (simulate drag & drop)');
    
    // New order: D, A, C, B (reverse and shuffle)
    const reorderData = {
      items: [
        { id: createdLinks[3].id, sortOrder: 0 }, // D -> 0
        { id: createdLinks[0].id, sortOrder: 1 }, // A -> 1
        { id: createdLinks[2].id, sortOrder: 2 }, // C -> 2
        { id: createdLinks[1].id, sortOrder: 3 }  // B -> 3
      ]
    };
    
    const reorderResponse = await fetch(`${baseUrl}/api/quick-access-links/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reorderData)
    });
    
    if (reorderResponse.ok) {
      const reorderResult = await reorderResponse.json();
      console.log(`✅ Reorder successful: ${reorderResult.data.updated} links updated`);
    } else {
      const errorText = await reorderResponse.text();
      console.log(`❌ Reorder failed: ${reorderResponse.status} - ${errorText}`);
    }

    // Test 5: Get updated order
    console.log('\n📋 Test 5: Get updated order');
    
    const getUpdatedLinksResponse = await fetch(`${baseUrl}/api/quick-access-links/module/page/${pageId}`);
    const updatedLinks = await getUpdatedLinksResponse.json();
    
    console.log(`✅ Status: ${getUpdatedLinksResponse.status}`);
    console.log(`✅ Updated links count: ${updatedLinks.length}`);
    
    if (updatedLinks.length > 0) {
      console.log('✅ Updated order:');
      updatedLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.title} (Order: ${link.sortOrder})`);
      });
    }

    // Test 6: Verify order is correct
    console.log('\n📋 Test 6: Verify order is correct');
    
    const expectedOrder = ['Link D', 'Link A', 'Link C', 'Link B'];
    const actualOrder = updatedLinks.map(link => link.title);
    
    const orderCorrect = JSON.stringify(expectedOrder) === JSON.stringify(actualOrder);
    console.log(`✅ Order verification: ${orderCorrect ? 'PASSED' : 'FAILED'}`);
    
    if (!orderCorrect) {
      console.log(`   Expected: ${expectedOrder.join(', ')}`);
      console.log(`   Actual: ${actualOrder.join(', ')}`);
    }

    // Cleanup: Delete created links
    console.log('\n🧹 Cleanup: Deleting created links');
    for (const link of createdLinks) {
      try {
        await fetch(`${baseUrl}/api/quick-access-links/${link.id}`, {
          method: 'DELETE'
        });
        console.log(`🧹 Deleted link: ${link.title}`);
      } catch (error) {
        console.log(`❌ Failed to delete link: ${link.title}`);
      }
    }

    // Cleanup: Delete test page
    console.log('\n🧹 Cleanup: Deleting test page');
    try {
      await fetch(`${baseUrl}/api/pages/${pageId}`, {
        method: 'DELETE'
      });
      console.log(`🧹 Deleted test page: ${createdPage.data.title}`);
    } catch (error) {
      console.log(`❌ Failed to delete test page`);
    }

    console.log('\n🎉 Drag & Drop functionality tests completed!');

  } catch (error) {
    console.error('❌ Drag & Drop test failed:', error.message);
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
  
  await testDragDrop();
}

main();
