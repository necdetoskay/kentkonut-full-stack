const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testModuleAPIUpdates() {
  console.log('🧪 Testing Module API Updates...\n');

  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test 1: Pages API with hasQuickAccess
    console.log('📋 Test 1: Pages API with hasQuickAccess');
    
    const pagesResponse = await fetch(`${baseUrl}/api/pages`);
    const pagesResult = await pagesResponse.json();
    
    console.log(`✅ Status: ${pagesResponse.status}`);
    console.log(`✅ Pages count: ${pagesResult.data?.length || 0}`);
    
    if (pagesResult.data && pagesResult.data.length > 0) {
      const firstPage = pagesResult.data[0];
      console.log(`✅ First page has hasQuickAccess field: ${firstPage.hasQuickAccess !== undefined}`);
      console.log(`✅ First page has quickAccessLinks: ${firstPage.quickAccessLinks !== undefined}`);
      console.log(`✅ Quick access links count: ${firstPage.quickAccessLinks?.length || 0}`);
    }

    // Test 2: News API with hasQuickAccess
    console.log('\n📋 Test 2: News API with hasQuickAccess');
    
    const newsResponse = await fetch(`${baseUrl}/api/news`);
    const newsResult = await newsResponse.json();
    
    console.log(`✅ Status: ${newsResponse.status}`);
    console.log(`✅ News count: ${newsResult.data?.length || 0}`);
    
    if (newsResult.data && newsResult.data.length > 0) {
      const firstNews = newsResult.data[0];
      console.log(`✅ First news has hasQuickAccess field: ${firstNews.hasQuickAccess !== undefined}`);
      console.log(`✅ First news has quickAccessLinks: ${firstNews.quickAccessLinks !== undefined}`);
    }

    // Test 3: Projects API with hasQuickAccess
    console.log('\n📋 Test 3: Projects API with hasQuickAccess');
    
    const projectsResponse = await fetch(`${baseUrl}/api/projects`);
    const projectsResult = await projectsResponse.json();
    
    console.log(`✅ Status: ${projectsResponse.status}`);
    console.log(`✅ Projects count: ${projectsResult.data?.length || 0}`);
    
    if (projectsResult.data && projectsResult.data.length > 0) {
      const firstProject = projectsResult.data[0];
      console.log(`✅ First project has hasQuickAccess field: ${firstProject.hasQuickAccess !== undefined}`);
      console.log(`✅ First project has quickAccessLinks: ${firstProject.quickAccessLinks !== undefined}`);
      console.log(`✅ Quick access links count: ${firstProject.quickAccessLinks?.length || 0}`);
      
      // Show the actual quick access links
      if (firstProject.quickAccessLinks && firstProject.quickAccessLinks.length > 0) {
        console.log('✅ Quick access links:');
        firstProject.quickAccessLinks.forEach((link, index) => {
          console.log(`  ${index + 1}. ${link.title} - ${link.url}`);
        });
      }
    }

    // Test 4: Departments API with hasQuickAccess
    console.log('\n📋 Test 4: Departments API with hasQuickAccess');
    
    const departmentsResponse = await fetch(`${baseUrl}/api/departments`);
    const departmentsResult = await departmentsResponse.json();
    
    console.log(`✅ Status: ${departmentsResponse.status}`);
    console.log(`✅ Departments count: ${departmentsResult.length || 0}`);
    
    if (departmentsResult.length > 0) {
      const firstDepartment = departmentsResult[0];
      console.log(`✅ First department has hasQuickAccess field: ${firstDepartment.hasQuickAccess !== undefined}`);
      console.log(`✅ First department has quickAccessLinks: ${firstDepartment.quickAccessLinks !== undefined}`);
    }

    // Test 5: Create a page with hasQuickAccess
    console.log('\n📋 Test 5: Create page with hasQuickAccess');
    
    const newPageData = {
      title: 'Test Quick Access Page',
      slug: 'test-quick-access-page',
      content: 'This is a test page with quick access enabled.',
      hasQuickAccess: true,
      isActive: true
    };
    
    const createPageResponse = await fetch(`${baseUrl}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPageData)
    });
    
    const createdPage = await createPageResponse.json();
    
    console.log(`✅ Status: ${createPageResponse.status}`);
    if (createPageResponse.status === 201) {
      console.log(`✅ Created page with hasQuickAccess: ${createdPage.data.hasQuickAccess}`);
      
      // Test 6: Add quick access link to the created page
      console.log('\n📋 Test 6: Add quick access link to created page');
      
      const quickLinkData = {
        title: 'Test Quick Link',
        url: '/test-quick-link',
        icon: 'test',
        moduleType: 'page',
        pageId: createdPage.data.id,
        sortOrder: 1
      };
      
      const createLinkResponse = await fetch(`${baseUrl}/api/quick-access-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quickLinkData)
      });
      
      const createdLink = await createLinkResponse.json();
      
      console.log(`✅ Status: ${createLinkResponse.status}`);
      if (createLinkResponse.status === 201) {
        console.log(`✅ Created quick access link: ${createdLink.data.title}`);
        
        // Test 7: Fetch page with quick access links
        console.log('\n📋 Test 7: Fetch page with quick access links');
        
        const pageWithLinksResponse = await fetch(`${baseUrl}/api/pages/${createdPage.data.id}`);
        const pageWithLinks = await pageWithLinksResponse.json();
        
        console.log(`✅ Status: ${pageWithLinksResponse.status}`);
        console.log(`✅ Page quick access links: ${pageWithLinks.data.quickAccessLinks?.length || 0}`);
        
        // Cleanup
        await fetch(`${baseUrl}/api/quick-access-links/${createdLink.data.id}`, {
          method: 'DELETE'
        });
        console.log('🧹 Cleaned up quick access link');
      }
      
      // Cleanup page
      await fetch(`${baseUrl}/api/pages/${createdPage.data.id}`, {
        method: 'DELETE'
      });
      console.log('🧹 Cleaned up test page');
    } else {
      console.log(`❌ Failed to create page: ${JSON.stringify(createdPage)}`);
    }

    console.log('\n🎉 All module API update tests completed!');

  } catch (error) {
    console.error('❌ Module API test failed:', error.message);
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
  
  await testModuleAPIUpdates();
}

main();
