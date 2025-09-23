const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHasQuickAccessDebug() {
  console.log('🔍 Testing hasQuickAccess Complete Data Flow...\n');

  const baseUrl = 'http://localhost:3010';
  
  try {
    // Step 1: Direct database check for existing project
    console.log('📋 Step 1: Check existing project in database');
    
    const projectId = 3; // Use existing project
    
    const dbProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        title: true, 
        hasQuickAccess: true,
        published: true,
        status: true
      }
    });
    
    if (!dbProject) {
      console.log('❌ Project not found in database');
      return;
    }
    
    console.log(`✅ Database project found: ${dbProject.title}`);
    console.log(`🔍 Current hasQuickAccess in DB: ${dbProject.hasQuickAccess}`);
    console.log(`🔍 Type in DB: ${typeof dbProject.hasQuickAccess}`);

    // Step 2: Test GET API
    console.log('\n📋 Step 2: Test GET API');
    
    const getResponse = await fetch(`${baseUrl}/api/projects/${projectId}`);
    
    if (!getResponse.ok) {
      console.log(`❌ GET API failed: ${getResponse.status}`);
      return;
    }
    
    const getProject = await getResponse.json();
    console.log(`✅ GET API successful`);
    console.log(`🔍 hasQuickAccess from GET API: ${getProject.hasQuickAccess}`);
    console.log(`🔍 Type from GET API: ${typeof getProject.hasQuickAccess}`);

    // Step 3: Test PUT API to enable hasQuickAccess
    console.log('\n📋 Step 3: Test PUT API to enable hasQuickAccess');
    
    const updateData = {
      title: getProject.title,
      slug: getProject.slug,
      content: getProject.content,
      summary: getProject.summary,
      status: getProject.status,
      latitude: getProject.latitude,
      longitude: getProject.longitude,
      locationName: getProject.locationName,
      province: getProject.province,
      district: getProject.district,
      address: getProject.address,
      published: getProject.published,
      publishedAt: getProject.publishedAt,
      readingTime: getProject.readingTime,
      hasQuickAccess: true, // Enable hasQuickAccess
      tags: [],
      galleryItems: []
    };
    
    console.log(`🔍 Sending hasQuickAccess: ${updateData.hasQuickAccess}`);
    console.log(`🔍 Type being sent: ${typeof updateData.hasQuickAccess}`);
    
    const putResponse = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!putResponse.ok) {
      const errorText = await putResponse.text();
      console.log(`❌ PUT API failed: ${putResponse.status} - ${errorText}`);
      return;
    }
    
    const putProject = await putResponse.json();
    console.log(`✅ PUT API successful`);
    console.log(`🔍 hasQuickAccess from PUT response: ${putProject.hasQuickAccess}`);
    console.log(`🔍 Type from PUT response: ${typeof putProject.hasQuickAccess}`);

    // Step 4: Verify in database after PUT
    console.log('\n📋 Step 4: Verify in database after PUT');
    
    const dbProjectAfterPut = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        title: true, 
        hasQuickAccess: true 
      }
    });
    
    console.log(`✅ Database check after PUT`);
    console.log(`🔍 hasQuickAccess in DB after PUT: ${dbProjectAfterPut.hasQuickAccess}`);
    console.log(`🔍 Type in DB after PUT: ${typeof dbProjectAfterPut.hasQuickAccess}`);

    // Step 5: Test GET API again to verify persistence
    console.log('\n📋 Step 5: Test GET API again to verify persistence');
    
    const getResponse2 = await fetch(`${baseUrl}/api/projects/${projectId}`);
    
    if (!getResponse2.ok) {
      console.log(`❌ Second GET API failed: ${getResponse2.status}`);
      return;
    }
    
    const getProject2 = await getResponse2.json();
    console.log(`✅ Second GET API successful`);
    console.log(`🔍 hasQuickAccess from second GET: ${getProject2.hasQuickAccess}`);
    console.log(`🔍 Type from second GET: ${typeof getProject2.hasQuickAccess}`);

    // Step 6: Test PUT API to disable hasQuickAccess
    console.log('\n📋 Step 6: Test PUT API to disable hasQuickAccess');
    
    const disableData = {
      ...updateData,
      hasQuickAccess: false // Disable hasQuickAccess
    };
    
    console.log(`🔍 Sending hasQuickAccess: ${disableData.hasQuickAccess}`);
    console.log(`🔍 Type being sent: ${typeof disableData.hasQuickAccess}`);
    
    const putResponse2 = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(disableData)
    });
    
    if (!putResponse2.ok) {
      const errorText = await putResponse2.text();
      console.log(`❌ Second PUT API failed: ${putResponse2.status} - ${errorText}`);
      return;
    }
    
    const putProject2 = await putResponse2.json();
    console.log(`✅ Second PUT API successful`);
    console.log(`🔍 hasQuickAccess from second PUT response: ${putProject2.hasQuickAccess}`);
    console.log(`🔍 Type from second PUT response: ${typeof putProject2.hasQuickAccess}`);

    // Step 7: Final database verification
    console.log('\n📋 Step 7: Final database verification');
    
    const dbProjectFinal = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        title: true, 
        hasQuickAccess: true 
      }
    });
    
    console.log(`✅ Final database check`);
    console.log(`🔍 Final hasQuickAccess in DB: ${dbProjectFinal.hasQuickAccess}`);
    console.log(`🔍 Final type in DB: ${typeof dbProjectFinal.hasQuickAccess}`);

    // Summary
    console.log('\n📊 Data Flow Summary:');
    console.log(`1. Initial DB value: ${dbProject.hasQuickAccess}`);
    console.log(`2. GET API value: ${getProject.hasQuickAccess}`);
    console.log(`3. PUT enable response: ${putProject.hasQuickAccess}`);
    console.log(`4. DB after enable: ${dbProjectAfterPut.hasQuickAccess}`);
    console.log(`5. GET after enable: ${getProject2.hasQuickAccess}`);
    console.log(`6. PUT disable response: ${putProject2.hasQuickAccess}`);
    console.log(`7. Final DB value: ${dbProjectFinal.hasQuickAccess}`);
    
    // Check for consistency
    const enableWorked = dbProjectAfterPut.hasQuickAccess === true && getProject2.hasQuickAccess === true;
    const disableWorked = dbProjectFinal.hasQuickAccess === false && putProject2.hasQuickAccess === false;
    
    console.log('\n🎯 Test Results:');
    console.log(`Enable functionality: ${enableWorked ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Disable functionality: ${disableWorked ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Overall status: ${enableWorked && disableWorked ? '🎉 ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    console.log('\n📝 Next Steps:');
    console.log('1. Check browser console logs when editing project');
    console.log('2. Verify frontend form data includes hasQuickAccess');
    console.log('3. Check if TabbedProjectForm is receiving correct initial data');

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
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
  
  await testHasQuickAccessDebug();
}

main();
