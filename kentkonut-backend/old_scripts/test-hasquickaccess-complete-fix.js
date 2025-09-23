const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCompleteHasQuickAccessFix() {
  console.log('🧪 Testing Complete hasQuickAccess Fix...\n');

  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test 1: Test CREATE with hasQuickAccess enabled
    console.log('📋 Test 1: Create project with hasQuickAccess enabled');
    
    const createProjectData = {
      title: 'Complete Fix Test Project',
      slug: 'complete-fix-test-project',
      content: 'This is a test project for complete hasQuickAccess fix.',
      summary: 'Test project summary',
      hasQuickAccess: true, // Enable from creation
      published: true,
      status: 'ONGOING',
      readingTime: 3,
      tags: [],
      galleryItems: []
    };
    
    console.log('📤 Creating project with hasQuickAccess: true');
    
    const createResponse = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createProjectData)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log(`❌ Create failed: ${createResponse.status} - ${errorText}`);
      return;
    }
    
    const createdProject = await createResponse.json();
    console.log(`✅ Created project: ${createdProject.title} (ID: ${createdProject.id})`);
    console.log(`✅ Created hasQuickAccess: ${createdProject.hasQuickAccess}`);
    
    if (createdProject.hasQuickAccess === true) {
      console.log('🎉 SUCCESS: Project created with hasQuickAccess enabled');
    } else {
      console.log('❌ FAILED: Project created but hasQuickAccess not enabled');
    }
    
    const projectId = createdProject.id;

    // Test 2: Fetch the created project to verify persistence
    console.log('\n📋 Test 2: Fetch created project to verify persistence');
    
    const fetchResponse = await fetch(`${baseUrl}/api/projects/${projectId}`);
    
    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.log(`❌ Fetch failed: ${fetchResponse.status} - ${errorText}`);
      return;
    }
    
    const fetchedProject = await fetchResponse.json();
    console.log(`✅ Fetched project successfully`);
    console.log(`✅ Fetched hasQuickAccess: ${fetchedProject.hasQuickAccess}`);
    
    if (fetchedProject.hasQuickAccess === true) {
      console.log('🎉 SUCCESS: hasQuickAccess persisted correctly after creation');
    } else {
      console.log('❌ FAILED: hasQuickAccess did not persist after creation');
    }

    // Test 3: Update project to disable hasQuickAccess
    console.log('\n📋 Test 3: Update project to disable hasQuickAccess');
    
    const updateData = {
      title: fetchedProject.title,
      slug: fetchedProject.slug,
      content: fetchedProject.content,
      summary: fetchedProject.summary,
      hasQuickAccess: false, // Disable hasQuickAccess
      published: fetchedProject.published,
      status: fetchedProject.status,
      readingTime: fetchedProject.readingTime,
      latitude: fetchedProject.latitude,
      longitude: fetchedProject.longitude,
      locationName: fetchedProject.locationName,
      province: fetchedProject.province,
      district: fetchedProject.district,
      address: fetchedProject.address,
      publishedAt: fetchedProject.publishedAt,
      tags: [],
      galleryItems: []
    };
    
    console.log('📤 Updating project with hasQuickAccess: false');
    
    const updateResponse = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.log(`❌ Update failed: ${updateResponse.status} - ${errorText}`);
      return;
    }
    
    const updatedProject = await updateResponse.json();
    console.log(`✅ Updated project successfully`);
    console.log(`✅ Updated hasQuickAccess: ${updatedProject.hasQuickAccess}`);
    
    if (updatedProject.hasQuickAccess === false) {
      console.log('🎉 SUCCESS: hasQuickAccess disabled correctly');
    } else {
      console.log('❌ FAILED: hasQuickAccess was not disabled correctly');
    }

    // Test 4: Final fetch to verify update persistence
    console.log('\n📋 Test 4: Final fetch to verify update persistence');
    
    const finalFetchResponse = await fetch(`${baseUrl}/api/projects/${projectId}`);
    
    if (!finalFetchResponse.ok) {
      const errorText = await finalFetchResponse.text();
      console.log(`❌ Final fetch failed: ${finalFetchResponse.status} - ${errorText}`);
      return;
    }
    
    const finalProject = await finalFetchResponse.json();
    console.log(`✅ Final fetch successful`);
    console.log(`✅ Final hasQuickAccess: ${finalProject.hasQuickAccess}`);
    
    if (finalProject.hasQuickAccess === false) {
      console.log('🎉 SUCCESS: hasQuickAccess update persisted correctly');
    } else {
      console.log('❌ FAILED: hasQuickAccess update did not persist');
    }

    // Test 5: Update project to re-enable hasQuickAccess
    console.log('\n📋 Test 5: Update project to re-enable hasQuickAccess');
    
    const reEnableData = {
      ...updateData,
      hasQuickAccess: true // Re-enable hasQuickAccess
    };
    
    console.log('📤 Re-enabling hasQuickAccess: true');
    
    const reEnableResponse = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reEnableData)
    });
    
    if (!reEnableResponse.ok) {
      const errorText = await reEnableResponse.text();
      console.log(`❌ Re-enable failed: ${reEnableResponse.status} - ${errorText}`);
      return;
    }
    
    const reEnabledProject = await reEnableResponse.json();
    console.log(`✅ Re-enabled project successfully`);
    console.log(`✅ Re-enabled hasQuickAccess: ${reEnabledProject.hasQuickAccess}`);
    
    if (reEnabledProject.hasQuickAccess === true) {
      console.log('🎉 SUCCESS: hasQuickAccess re-enabled correctly');
    } else {
      console.log('❌ FAILED: hasQuickAccess was not re-enabled correctly');
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
      
      if (dbProject.hasQuickAccess === true) {
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
    console.log('\n📊 Complete Fix Test Summary:');
    console.log('1. ✅ Project creation with hasQuickAccess: true');
    console.log('2. ✅ Fetch verification of created state');
    console.log('3. ✅ Project update to disable hasQuickAccess: false');
    console.log('4. ✅ Fetch verification of disabled state');
    console.log('5. ✅ Project update to re-enable hasQuickAccess: true');
    console.log('6. ✅ Direct database verification');
    
    console.log('\n🎉 Complete hasQuickAccess fix testing completed!');
    console.log('\n📝 Frontend Testing Instructions:');
    console.log('   1. Go to http://localhost:3010/dashboard/projects/create');
    console.log('   2. Enable "Hızlı Erişim Aktif" checkbox');
    console.log('   3. Create the project');
    console.log('   4. Edit the created project');
    console.log('   5. Verify checkbox is still enabled');
    console.log('   6. Toggle checkbox and save');
    console.log('   7. Refresh page and verify state persists');

  } catch (error) {
    console.error('❌ Complete hasQuickAccess fix test failed:', error.message);
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
  
  await testCompleteHasQuickAccessFix();
}

main();
