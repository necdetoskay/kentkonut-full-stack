const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testQuickAccessAPI() {
  console.log('🧪 Testing Quick Access API Endpoints...\n');

  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test 1: GET all quick access links
    console.log('📋 Test 1: GET /api/quick-access-links');
    
    const getAllResponse = await fetch(`${baseUrl}/api/quick-access-links`);
    const allLinks = await getAllResponse.json();
    
    console.log(`✅ Status: ${getAllResponse.status}`);
    console.log(`✅ Total links: ${allLinks.data?.length || 0}`);

    if (allLinks.data && allLinks.data.length > 0) {
      console.log(`✅ First link: ${allLinks.data[0].title} (${allLinks.data[0].moduleType})`);
    }

    // Test 2: GET links by module type
    console.log('\n📋 Test 2: GET /api/quick-access-links?moduleType=project');
    
    const getByModuleResponse = await fetch(`${baseUrl}/api/quick-access-links?moduleType=project`);
    const projectLinks = await getByModuleResponse.json();
    
    console.log(`✅ Status: ${getByModuleResponse.status}`);
    console.log(`✅ Project links: ${projectLinks.length}`);

    // Test 3: GET links for specific module
    if (projectLinks.length > 0) {
      const firstProjectLink = projectLinks[0];
      const moduleId = firstProjectLink.projectId;
      
      console.log('\n📋 Test 3: GET /api/quick-access-links/module/project/[id]');
      
      const getModuleLinksResponse = await fetch(`${baseUrl}/api/quick-access-links/module/project/${moduleId}`);
      const moduleLinks = await getModuleLinksResponse.json();
      
      console.log(`✅ Status: ${getModuleLinksResponse.status}`);
      console.log(`✅ Module links: ${moduleLinks.length}`);
    }

    // Test 4: POST new quick access link
    console.log('\n📋 Test 4: POST /api/quick-access-links');
    
    // Get a project to link to
    const projects = await prisma.project.findMany({ take: 1 });
    if (projects.length > 0) {
      const testProject = projects[0];
      
      const newLinkData = {
        title: 'Test API Link',
        url: '/test-api-link',
        icon: 'test',
        moduleType: 'project',
        projectId: testProject.id,
        sortOrder: 999
      };
      
      const createResponse = await fetch(`${baseUrl}/api/quick-access-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLinkData)
      });
      
      const createdLink = await createResponse.json();
      
      console.log(`✅ Status: ${createResponse.status}`);
      if (createResponse.status === 201) {
        console.log(`✅ Created link: ${createdLink.title} (ID: ${createdLink.id})`);
        
        // Test 5: GET specific link
        console.log('\n📋 Test 5: GET /api/quick-access-links/[id]');
        
        const getLinkResponse = await fetch(`${baseUrl}/api/quick-access-links/${createdLink.id}`);
        const fetchedLink = await getLinkResponse.json();
        
        console.log(`✅ Status: ${getLinkResponse.status}`);
        console.log(`✅ Fetched link: ${fetchedLink.title}`);
        
        // Test 6: PUT update link
        console.log('\n📋 Test 6: PUT /api/quick-access-links/[id]');
        
        const updateData = {
          title: 'Updated Test API Link',
          sortOrder: 888
        };
        
        const updateResponse = await fetch(`${baseUrl}/api/quick-access-links/${createdLink.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        const updatedLink = await updateResponse.json();
        
        console.log(`✅ Status: ${updateResponse.status}`);
        console.log(`✅ Updated link: ${updatedLink.title}`);
        
        // Test 7: DELETE link
        console.log('\n📋 Test 7: DELETE /api/quick-access-links/[id]');
        
        const deleteResponse = await fetch(`${baseUrl}/api/quick-access-links/${createdLink.id}`, {
          method: 'DELETE'
        });
        
        const deleteResult = await deleteResponse.json();
        
        console.log(`✅ Status: ${deleteResponse.status}`);
        console.log(`✅ Delete result: ${deleteResult.message}`);
        
      } else {
        console.log(`❌ Create failed: ${JSON.stringify(createdLink)}`);
      }
    }

    // Test 8: Error handling - Invalid module type
    console.log('\n📋 Test 8: Error handling - Invalid module type');
    
    const invalidModuleResponse = await fetch(`${baseUrl}/api/quick-access-links?moduleType=invalid`);
    const invalidResult = await invalidModuleResponse.json();
    
    console.log(`✅ Status: ${invalidModuleResponse.status}`);
    console.log(`✅ Error handling works: ${invalidResult.length === 0 ? 'Yes' : 'No'}`);

    console.log('\n🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
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
  
  await testQuickAccessAPI();
}

main();
