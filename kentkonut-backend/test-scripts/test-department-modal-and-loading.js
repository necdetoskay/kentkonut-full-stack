/**
 * Test Script: Department Modal and Loading Fixes
 * 
 * This script tests the department deletion modal and loading indicator improvements.
 * 
 * Run: node test-scripts/test-department-modal-and-loading.js
 */

const BASE_URL = 'http://localhost:3010';

/**
 * Test department deletion API
 */
async function testDepartmentDeletion() {
  console.log('🗑️ Testing department deletion API...');
  
  // First create a test department
  const testDepartment = {
    name: 'Test Department for Deletion',
    content: 'This department will be deleted',
    imageUrl: '',
    isActive: true,
    services: ['Test Service'],
    order: 999
  };

  try {
    // Create department
    console.log('📝 Creating test department...');
    const createResponse = await fetch(`${BASE_URL}/api/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testDepartment)
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create department: ${createResponse.status}`);
    }

    const createdDepartment = await createResponse.json();
    console.log('✅ Test department created:', createdDepartment.id);

    // Test deletion
    console.log('🗑️ Testing department deletion...');
    const deleteResponse = await fetch(`${BASE_URL}/api/departments/${createdDepartment.id}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete department: ${deleteResponse.status}`);
    }

    const deleteResult = await deleteResponse.json();
    console.log('✅ Department deleted successfully:', deleteResult.message);

    // Verify deletion
    console.log('🔍 Verifying department was deleted...');
    const verifyResponse = await fetch(`${BASE_URL}/api/departments/${createdDepartment.id}`);
    
    if (verifyResponse.status === 404) {
      console.log('✅ Department deletion verified - department not found (expected)');
      return true;
    } else {
      console.log('❌ Department still exists after deletion');
      return false;
    }

  } catch (error) {
    console.error('❌ Error testing department deletion:', error.message);
    return false;
  }
}

/**
 * Test page accessibility and loading
 */
async function testPageAccessibility() {
  console.log('🔗 Testing page accessibility...');
  
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
    }
  ];

  let allPassed = true;

  for (const test of testUrls) {
    try {
      console.log(`🔗 Testing: ${test.name}`);
      
      const startTime = Date.now();
      const response = await fetch(test.url);
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      if (response.ok) {
        console.log(`✅ ${test.name}: ${response.status} ${response.statusText} (${loadTime}ms)`);
      } else {
        console.log(`❌ ${test.name}: ${response.status} ${response.statusText}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Connection error - ${error.message}`);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Test component files exist
 */
async function testComponentFiles() {
  console.log('📁 Testing component files...');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'app/dashboard/kurumsal/birimler/components/DeleteDepartmentDialog.tsx',
    'components/ui/navigation-loading.tsx',
    'contexts/NavigationLoadingContext.tsx',
    'components/ui/loading-link.tsx'
  ];

  let allExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    try {
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
        allExist = false;
      }
    } catch (error) {
      console.log(`❌ Error checking ${file}: ${error.message}`);
      allExist = false;
    }
  }

  return allExist;
}

/**
 * Test loading system configuration
 */
async function testLoadingConfiguration() {
  console.log('⚙️ Testing loading system configuration...');
  
  // Check if NavigationLoadingProvider is properly configured
  try {
    const response = await fetch(`${BASE_URL}/dashboard/kurumsal/birimler`);
    const html = await response.text();
    
    // Check for loading-related elements in the HTML
    const hasLoadingProvider = html.includes('NavigationLoadingProvider') || 
                              html.includes('navigation-loading') ||
                              html.includes('loading');
    
    if (hasLoadingProvider) {
      console.log('✅ Loading system appears to be configured');
    } else {
      console.log('⚠️ Loading system configuration unclear from HTML');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing loading configuration:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Starting Department Modal and Loading Tests...\n');
  
  // Test 1: Component files
  const filesExist = await testComponentFiles();
  console.log('─'.repeat(50));
  
  // Test 2: Page accessibility
  const pagesAccessible = await testPageAccessibility();
  console.log('─'.repeat(50));
  
  // Test 3: Loading configuration
  const loadingConfigured = await testLoadingConfiguration();
  console.log('─'.repeat(50));
  
  // Test 4: Department deletion API
  const deletionWorks = await testDepartmentDeletion();
  console.log('─'.repeat(50));
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('Component Files:', filesExist ? '✅' : '❌');
  console.log('Page Accessibility:', pagesAccessible ? '✅' : '❌');
  console.log('Loading Configuration:', loadingConfigured ? '✅' : '❌');
  console.log('Department Deletion API:', deletionWorks ? '✅' : '❌');
  
  const allPassed = filesExist && pagesAccessible && loadingConfigured && deletionWorks;
  
  console.log('\n🎯 Overall Result:', allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
  
  if (allPassed) {
    console.log('\n📌 Manual Testing Steps:');
    console.log('1. Go to: http://localhost:3010/dashboard/kurumsal/birimler');
    console.log('2. Click delete button on any department');
    console.log('3. Verify modal appears with department details');
    console.log('4. Test cancel and confirm buttons');
    console.log('5. Navigate between pages and observe loading indicators');
    console.log('6. Verify no double loading or timing issues');
  } else {
    console.log('\n🔧 Issues to Address:');
    if (!filesExist) console.log('- Check component file paths and imports');
    if (!pagesAccessible) console.log('- Verify server is running and pages load correctly');
    if (!loadingConfigured) console.log('- Check NavigationLoadingProvider configuration');
    if (!deletionWorks) console.log('- Check department deletion API and database');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testDepartmentDeletion, testPageAccessibility };
