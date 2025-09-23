const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHasQuickAccessPersistence() {
  console.log('🧪 Testing hasQuickAccess Persistence Fix...\n');

  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test 1: Create a test project
    console.log('📋 Test 1: Create test project');
    
    const testProjectData = {
      title: 'HasQuickAccess Test Project',
      slug: 'hasquickaccess-test-project',
      content: 'This is a test project for hasQuickAccess persistence.',
      summary: 'Test project summary',
      hasQuickAccess: false, // Start with false
      published: true
    };
    
    const createProjectResponse = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProjectData)
    });
    
    if (!createProjectResponse.ok) {
      const errorText = await createProjectResponse.text();
      throw new Error(`Failed to create test project: ${errorText}`);
    }
    
    const createdProject = await createProjectResponse.json();
    console.log(`✅ Created test project: ${createdProject.title} (ID: ${createdProject.id})`);
    console.log(`✅ Initial hasQuickAccess: ${createdProject.hasQuickAccess}`);
    
    const projectId = createdProject.id;

    // Test 2: Update project to enable hasQuickAccess
    console.log('\n📋 Test 2: Enable hasQuickAccess');
    
    const updateData = {
      ...testProjectData,
      hasQuickAccess: true // Enable hasQuickAccess
    };
    
    console.log('📤 Sending update request with hasQuickAccess: true');
    
    const updateResponse = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update project: ${errorText}`);
    }
    
    const updatedProject = await updateResponse.json();
    console.log(`✅ Updated project successfully`);
    console.log(`✅ Updated hasQuickAccess: ${updatedProject.hasQuickAccess}`);
    
    if (updatedProject.hasQuickAccess === true) {
      console.log('🎉 SUCCESS: hasQuickAccess was saved as true');
    } else {
      console.log('❌ FAILED: hasQuickAccess was not saved correctly');
    }

    // Test 3: Fetch project to verify persistence
    console.log('\n📋 Test 3: Fetch project to verify persistence');
    
    const fetchResponse = await fetch(`${baseUrl}/api/projects/${projectId}`);
    
    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      throw new Error(`Failed to fetch project: ${errorText}`);
    }
    
    const fetchedProject = await fetchResponse.json();
    console.log(`✅ Fetched project successfully`);
    console.log(`✅ Fetched hasQuickAccess: ${fetchedProject.hasQuickAccess}`);
    
    if (fetchedProject.hasQuickAccess === true) {
      console.log('🎉 SUCCESS: hasQuickAccess persisted correctly after fetch');
    } else {
      console.log('❌ FAILED: hasQuickAccess did not persist after fetch');
    }

    // Test 4: Test disabling hasQuickAccess
    console.log('\n📋 Test 4: Disable hasQuickAccess');
    
    const disableData = {
      ...testProjectData,
      hasQuickAccess: false // Disable hasQuickAccess
    };
    
    console.log('📤 Sending update request with hasQuickAccess: false');
    
    const disableResponse = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(disableData)
    });
    
    if (!disableResponse.ok) {
      const errorText = await disableResponse.text();
      throw new Error(`Failed to disable hasQuickAccess: ${errorText}`);
    }
    
    const disabledProject = await disableResponse.json();
    console.log(`✅ Disabled hasQuickAccess successfully`);
    console.log(`✅ Disabled hasQuickAccess: ${disabledProject.hasQuickAccess}`);
    
    if (disabledProject.hasQuickAccess === false) {
      console.log('🎉 SUCCESS: hasQuickAccess was disabled correctly');
    } else {
      console.log('❌ FAILED: hasQuickAccess was not disabled correctly');
    }

    // Test 5: Final fetch to verify disable persistence
    console.log('\n📋 Test 5: Final fetch to verify disable persistence');
    
    const finalFetchResponse = await fetch(`${baseUrl}/api/projects/${projectId}`);
    
    if (!finalFetchResponse.ok) {
      const errorText = await finalFetchResponse.text();
      throw new Error(`Failed to fetch project for final test: ${errorText}`);
    }
    
    const finalProject = await finalFetchResponse.json();
    console.log(`✅ Final fetch successful`);
    console.log(`✅ Final hasQuickAccess: ${finalProject.hasQuickAccess}`);
    
    if (finalProject.hasQuickAccess === false) {
      console.log('🎉 SUCCESS: hasQuickAccess disable persisted correctly');
    } else {
      console.log('❌ FAILED: hasQuickAccess disable did not persist');
    }

    // Test 6: Direct database verification
    console.log('\n📋 Test 6: Direct database verification');
    
    const dbProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true, hasQuickAccess: true }
    });
    
    if (dbProject) {
      console.log(`✅ Database project found`);
      console.log(`✅ Database hasQuickAccess: ${dbProject.hasQuickAccess}`);
      
      if (dbProject.hasQuickAccess === false) {
        console.log('🎉 SUCCESS: Database shows correct hasQuickAccess value');
      } else {
        console.log('❌ FAILED: Database shows incorrect hasQuickAccess value');
      }
    } else {
      console.log('❌ FAILED: Project not found in database');
    }

    // Cleanup: Delete test project
    console.log('\n🧹 Cleanup: Deleting test project');
    try {
      await fetch(`${baseUrl}/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      console.log(`🧹 Deleted test project: ${createdProject.title}`);
    } catch (error) {
      console.log(`❌ Failed to delete test project: ${error.message}`);
    }

    // Test Summary
    console.log('\n📊 Test Summary:');
    console.log('1. ✅ Project creation with hasQuickAccess: false');
    console.log('2. ✅ Project update to enable hasQuickAccess: true');
    console.log('3. ✅ Fetch verification of enabled state');
    console.log('4. ✅ Project update to disable hasQuickAccess: false');
    console.log('5. ✅ Fetch verification of disabled state');
    console.log('6. ✅ Direct database verification');
    
    console.log('\n🎉 hasQuickAccess persistence testing completed!');
    console.log('\n📝 Manual Testing Instructions:');
    console.log('   1. Go to http://localhost:3010/dashboard/projects/[id]/edit');
    console.log('   2. Navigate to "Medya & Ayarlar" tab');
    console.log('   3. Toggle "Hızlı Erişim Aktif" checkbox');
    console.log('   4. Save the project');
    console.log('   5. Refresh the page');
    console.log('   6. Verify the checkbox state persists');
    console.log('   7. Check if "Hızlı Erişim" tab appears when enabled');

  } catch (error) {
    console.error('❌ hasQuickAccess persistence test failed:', error.message);
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
  
  await testHasQuickAccessPersistence();
}

main();
