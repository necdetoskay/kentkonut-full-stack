const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🧪 Creating Test Data for QuickAccessDisplay...\n');

  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test 1: Create a test page with hasQuickAccess enabled
    console.log('📋 Test 1: Create test page with hasQuickAccess');
    
    const testPageData = {
      title: 'Test Display Page',
      slug: 'test-display-page',
      content: 'This is a test page for QuickAccessDisplay component.',
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

    // Test 2: Create quick access links for the page
    console.log('\n📋 Test 2: Create quick access links');
    
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
        title: 'Hakkımızda',
        url: '/hakkimizda',
        icon: 'info',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 1
      },
      {
        title: 'İletişim',
        url: '/iletisim',
        icon: 'phone',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 2
      },
      {
        title: 'Projelerimiz',
        url: '/projeler',
        icon: 'building',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 3
      },
      {
        title: 'Haberler',
        url: '/haberler',
        icon: 'news',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: 4
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
        console.log(`❌ Failed to create link: ${linkData.title} - ${errorText}`);
      }
    }

    // Test 3: Create a test project with hasQuickAccess
    console.log('\n📋 Test 3: Create test project with hasQuickAccess');
    
    const testProjectData = {
      title: 'Test Display Project',
      slug: 'test-display-project',
      content: 'This is a test project for QuickAccessDisplay component.',
      summary: 'Test project summary',
      hasQuickAccess: true,
      published: true
    };
    
    const createProjectResponse = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProjectData)
    });
    
    if (createProjectResponse.ok) {
      const createdProject = await createProjectResponse.json();
      console.log(`✅ Created test project: ${createdProject.data.title} (ID: ${createdProject.data.id})`);
      
      const projectId = createdProject.data.id;

      // Create links for project
      const projectLinksToCreate = [
        {
          title: 'Proje Detayları',
          url: `/projeler/${createdProject.data.slug}`,
          icon: 'file',
          moduleType: 'project',
          projectId: projectId,
          sortOrder: 0
        },
        {
          title: 'Proje Galerisi',
          url: `/projeler/${createdProject.data.slug}/galeri`,
          icon: 'image',
          moduleType: 'project',
          projectId: projectId,
          sortOrder: 1
        },
        {
          title: 'Proje Lokasyonu',
          url: `/projeler/${createdProject.data.slug}/konum`,
          icon: 'map',
          moduleType: 'project',
          projectId: projectId,
          sortOrder: 2
        }
      ];

      for (const linkData of projectLinksToCreate) {
        const createLinkResponse = await fetch(`${baseUrl}/api/quick-access-links`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(linkData)
        });
        
        if (createLinkResponse.ok) {
          const createdLink = await createLinkResponse.json();
          console.log(`✅ Created project link: ${createdLink.data.title}`);
        }
      }
    } else {
      console.log('❌ Failed to create test project');
    }

    console.log('\n🎉 Test data creation completed!');
    console.log('\n📍 Visit http://localhost:3010/test-quick-access-display to test the component');

  } catch (error) {
    console.error('❌ Test data creation failed:', error.message);
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
  
  await createTestData();
}

main();
