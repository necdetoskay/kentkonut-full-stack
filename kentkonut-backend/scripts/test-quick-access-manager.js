const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testQuickAccessManager() {
  console.log('🧪 Testing QuickAccessLinksManager Component...\n');

  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test 1: Create a test page with hasQuickAccess enabled
    console.log('📋 Test 1: Create test page with hasQuickAccess');
    
    const testPageData = {
      title: 'Test Quick Access Manager Page',
      slug: 'test-quick-access-manager-page',
      content: 'This is a test page for QuickAccessLinksManager component.',
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

    // Test 2: Test module-specific endpoint (should return empty array initially)
    console.log('\n📋 Test 2: Get quick access links for new page');
    
    const getLinksResponse = await fetch(`${baseUrl}/api/quick-access-links/module/page/${pageId}`);
    const initialLinks = await getLinksResponse.json();
    
    console.log(`✅ Status: ${getLinksResponse.status}`);
    console.log(`✅ Initial links count: ${initialLinks.length}`);

    // Test 3: Create quick access links for the page
    console.log('\n📋 Test 3: Create quick access links');
    
    const linksToCreate = [
      {
        title: 'Ana Sayfa',
        url: '/',
        icon: 'home',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 0
      },
      {
        title: 'İletişim',
        url: '/iletisim',
        icon: 'phone',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 1
      },
      {
        title: 'Hakkımızda',
        url: '/hakkimizda',
        icon: 'info',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 2
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
        console.log(`✅ Created link: ${createdLink.data.title}`);
      } else {
        const errorText = await createLinkResponse.text();
        console.log(`❌ Failed to create link: ${linkData.title}`);
        console.log(`   Error: ${createLinkResponse.status} - ${errorText}`);
      }
    }

    // Test 4: Get updated links list
    console.log('\n📋 Test 4: Get updated quick access links');
    
    const getUpdatedLinksResponse = await fetch(`${baseUrl}/api/quick-access-links/module/page/${pageId}`);
    const updatedLinks = await getUpdatedLinksResponse.json();
    
    console.log(`✅ Status: ${getUpdatedLinksResponse.status}`);
    console.log(`✅ Updated links count: ${updatedLinks.length}`);
    
    if (updatedLinks.length > 0) {
      console.log('✅ Links:');
      updatedLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.title} - ${link.url} (Order: ${link.sortOrder})`);
      });
    }

    // Test 5: Update a link
    if (createdLinks.length > 0) {
      console.log('\n📋 Test 5: Update a quick access link');
      
      const linkToUpdate = createdLinks[0];
      const updateData = {
        title: 'Ana Sayfa (Güncellenmiş)',
        url: '/ana-sayfa',
        icon: 'home-updated'
      };
      
      const updateResponse = await fetch(`${baseUrl}/api/quick-access-links/${linkToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (updateResponse.ok) {
        const updatedLink = await updateResponse.json();
        console.log(`✅ Updated link: ${updatedLink.data?.title || 'Link updated'}`);
      } else {
        console.log(`❌ Failed to update link`);
      }
    }

    // Test 6: Toggle link active status
    if (createdLinks.length > 1) {
      console.log('\n📋 Test 6: Toggle link active status');
      
      const linkToToggle = createdLinks[1];
      const toggleResponse = await fetch(`${baseUrl}/api/quick-access-links/${linkToToggle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: false })
      });
      
      if (toggleResponse.ok) {
        console.log(`✅ Toggled link status: ${linkToToggle.title}`);
      } else {
        console.log(`❌ Failed to toggle link status`);
      }
    }

    // Test 7: Get final links list
    console.log('\n📋 Test 7: Get final quick access links');
    
    const getFinalLinksResponse = await fetch(`${baseUrl}/api/quick-access-links/module/page/${pageId}`);
    const finalLinks = await getFinalLinksResponse.json();
    
    console.log(`✅ Status: ${getFinalLinksResponse.status}`);
    console.log(`✅ Final links count: ${finalLinks.length}`);
    
    if (finalLinks.length > 0) {
      console.log('✅ Final links:');
      finalLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.title} - ${link.url} (Active: ${link.isActive})`);
      });
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

    console.log('\n🎉 QuickAccessLinksManager component tests completed!');

  } catch (error) {
    console.error('❌ QuickAccessLinksManager test failed:', error.message);
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
  
  await testQuickAccessManager();
}

main();
