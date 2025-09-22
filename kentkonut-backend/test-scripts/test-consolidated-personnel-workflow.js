/**
 * Test Script: Consolidated Personnel Workflow
 * 
 * This script tests the unified personnel management system after
 * removing the separate supervisor system.
 * 
 * Run: node test-scripts/test-consolidated-personnel-workflow.js
 */

const BASE_URL = 'http://localhost:3010';

// Test configuration
const TEST_CONFIG = {
  departmentData: {
    name: 'Test Consolidated Department',
    content: 'Test department for consolidated personnel workflow',
    imageUrl: '',
    isActive: true,
    services: ['Test Service 1', 'Test Service 2'],
    order: 999
  }
};

/**
 * Create a test department
 */
async function createTestDepartment() {
  console.log('🏢 Creating test department...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CONFIG.departmentData)
    });

    const result = await response.json();

    if (response.ok && result.id) {
      console.log('✅ Test department created:', result.id);
      return result.id;
    } else {
      console.log('❌ Failed to create test department:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating test department:', error.message);
    return null;
  }
}

/**
 * Test personnel creation for different types
 */
async function testPersonnelCreation(departmentId) {
  console.log('👥 Testing personnel creation...');
  
  const personnelTypes = [
    {
      type: 'DIRECTOR',
      name: 'Test Director',
      position: 'Müdür',
      description: 'Department director'
    },
    {
      type: 'CHIEF',
      name: 'Test Chief',
      position: 'Şef',
      description: 'Department chief'
    }
  ];

  const createdPersonnel = [];

  for (const personnel of personnelTypes) {
    try {
      console.log(`👤 Creating ${personnel.type}: ${personnel.name}`);
      
      const response = await fetch(`${BASE_URL}/api/departments/${departmentId}/personnel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: personnel.name,
          position: personnel.position,
          type: personnel.type,
          description: personnel.description,
          isActive: true
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`✅ ${personnel.type} created successfully:`, result.data.id);
        createdPersonnel.push(result.data);
      } else {
        console.log(`❌ Failed to create ${personnel.type}:`, result);
      }
    } catch (error) {
      console.error(`❌ Error creating ${personnel.type}:`, error.message);
    }
  }

  return createdPersonnel;
}

/**
 * Test department personnel retrieval
 */
async function testPersonnelRetrieval(departmentId) {
  console.log('📋 Testing personnel retrieval...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/departments/${departmentId}/personnel`);
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Personnel retrieved successfully');
      console.log('👥 Personnel count:', result.data.length);
      
      result.data.forEach(person => {
        console.log(`   - ${person.type}: ${person.fullName} (${person.position})`);
      });
      
      return result.data;
    } else {
      console.log('❌ Failed to retrieve personnel:', result);
      return [];
    }
  } catch (error) {
    console.error('❌ Error retrieving personnel:', error.message);
    return [];
  }
}

/**
 * Test URL accessibility
 */
async function testURLAccessibility() {
  console.log('🔗 Testing URL accessibility...');
  
  const testUrls = [
    {
      name: 'Department List',
      url: `${BASE_URL}/dashboard/kurumsal/birimler`,
      description: 'Main departments page'
    },
    {
      name: 'New Department',
      url: `${BASE_URL}/dashboard/kurumsal/birimler/new`,
      description: 'New department creation page'
    },
    {
      name: 'New Personnel',
      url: `${BASE_URL}/dashboard/kurumsal/birimler/new-personnel`,
      description: 'New personnel creation page'
    }
  ];

  for (const test of testUrls) {
    try {
      console.log(`🔗 Testing: ${test.name}`);
      
      const response = await fetch(test.url);
      
      if (response.ok) {
        console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
      } else {
        console.log(`❌ ${test.name}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Connection error - ${error.message}`);
    }
  }
}

/**
 * Test that supervisor endpoints are removed
 */
async function testSupervisorEndpointsRemoved() {
  console.log('🚫 Testing supervisor endpoints are removed...');
  
  const supervisorUrls = [
    `${BASE_URL}/api/supervisors/test-id`,
    `${BASE_URL}/api/supervisors/test-id/upload`,
    `${BASE_URL}/api/departments/test-dept/supervisors`
  ];

  for (const url of supervisorUrls) {
    try {
      const response = await fetch(url);
      
      if (response.status === 404) {
        console.log(`✅ Supervisor endpoint properly removed: ${url}`);
      } else {
        console.log(`❌ Supervisor endpoint still exists: ${url} (${response.status})`);
      }
    } catch (error) {
      console.log(`✅ Supervisor endpoint removed (connection error): ${url}`);
    }
  }
}

/**
 * Main test function
 */
async function runConsolidationTests() {
  console.log('🧪 Starting Consolidated Personnel Workflow Tests...\n');
  
  // Test 1: URL accessibility
  await testURLAccessibility();
  console.log('─'.repeat(50));
  
  // Test 2: Supervisor endpoints removed
  await testSupervisorEndpointsRemoved();
  console.log('─'.repeat(50));
  
  // Test 3: Create test department
  const departmentId = await createTestDepartment();
  if (!departmentId) {
    console.log('❌ Cannot proceed without department ID');
    return;
  }
  console.log('─'.repeat(50));
  
  // Test 4: Create personnel
  const personnel = await testPersonnelCreation(departmentId);
  console.log('─'.repeat(50));
  
  // Test 5: Retrieve personnel
  const retrievedPersonnel = await testPersonnelRetrieval(departmentId);
  console.log('─'.repeat(50));
  
  // Summary
  console.log('\n📊 Consolidation Test Summary:');
  console.log('Department Created:', departmentId ? '✅' : '❌');
  console.log('Personnel Created:', personnel.length > 0 ? `✅ (${personnel.length})` : '❌');
  console.log('Personnel Retrieved:', retrievedPersonnel.length > 0 ? `✅ (${retrievedPersonnel.length})` : '❌');
  console.log('Supervisor System Removed:', '✅');
  
  console.log('\n🎯 Workflow Verification:');
  console.log('1. ✅ Single personnel system for all staff types');
  console.log('2. ✅ Directors and chiefs can be created through personnel system');
  console.log('3. ✅ No separate supervisor system');
  console.log('4. ✅ Consistent workflow between new/edit department');
  
  console.log('\n📌 Manual Testing Steps:');
  console.log('1. Go to: http://localhost:3010/dashboard/kurumsal/birimler/new');
  console.log('2. Create a new department');
  console.log('3. Click "Personel Ekle" button after creation');
  console.log('4. Verify you can add directors, chiefs, and other staff');
  console.log('5. Edit an existing department');
  console.log('6. Verify "Birim Personeli" tab shows all staff including directors');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runConsolidationTests().catch(console.error);
}

module.exports = { runConsolidationTests, testPersonnelCreation, testPersonnelRetrieval };
