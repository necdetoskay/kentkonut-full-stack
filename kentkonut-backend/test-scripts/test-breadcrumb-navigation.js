/**
 * Test Script: Breadcrumb Navigation in Personnel Creation
 * 
 * This script tests the enhanced breadcrumb navigation that includes department names
 * when adding new personnel to specific departments.
 * 
 * Run: node test-scripts/test-breadcrumb-navigation.js
 */

const BASE_URL = 'http://localhost:3010';

/**
 * Test department API endpoints
 */
async function testDepartmentAPI() {
  console.log('🏢 Testing department API endpoints...');
  
  try {
    // Test departments list
    console.log('📋 Testing departments list...');
    const listResponse = await fetch(`${BASE_URL}/api/departments`);
    
    if (!listResponse.ok) {
      throw new Error(`Departments list failed: ${listResponse.status}`);
    }
    
    const departments = await listResponse.json();
    console.log(`✅ Found ${departments.length} departments`);
    
    if (departments.length === 0) {
      console.log('⚠️ No departments found - creating test department...');
      
      // Create a test department
      const createResponse = await fetch(`${BASE_URL}/api/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test Breadcrumb Department',
          content: 'Test department for breadcrumb navigation',
          imageUrl: '',
          isActive: true,
          services: ['Test Service'],
          order: 999
        })
      });
      
      if (!createResponse.ok) {
        throw new Error(`Department creation failed: ${createResponse.status}`);
      }
      
      const newDepartment = await createResponse.json();
      console.log('✅ Test department created:', newDepartment.id);
      return newDepartment;
    }
    
    // Test individual department fetch
    const testDept = departments[0];
    console.log(`🔍 Testing individual department fetch for: ${testDept.name}`);
    
    const deptResponse = await fetch(`${BASE_URL}/api/departments/${testDept.id}`);
    
    if (!deptResponse.ok) {
      throw new Error(`Department fetch failed: ${deptResponse.status}`);
    }
    
    const department = await deptResponse.json();
    console.log(`✅ Department details fetched: ${department.name}`);
    
    return department;
    
  } catch (error) {
    console.error('❌ Department API test failed:', error.message);
    return null;
  }
}

/**
 * Test breadcrumb navigation URLs
 */
async function testBreadcrumbNavigation(department) {
  console.log('🧭 Testing breadcrumb navigation...');
  
  if (!department) {
    console.log('❌ No department available for testing');
    return false;
  }
  
  const testUrls = [
    {
      name: 'Department Detail Page',
      url: `${BASE_URL}/dashboard/kurumsal/birimler/${department.id}`,
      description: 'Department detail page that should be linked in breadcrumb'
    },
    {
      name: 'New Personnel Page',
      url: `${BASE_URL}/dashboard/kurumsal/birimler/new-personnel?departmentId=${department.id}`,
      description: 'New personnel page with department context'
    },
    {
      name: 'Departments List',
      url: `${BASE_URL}/dashboard/kurumsal/birimler`,
      description: 'Departments list page'
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
        
        // Check if the response contains expected content
        const html = await response.text();
        
        if (test.name === 'New Personnel Page') {
          // Check for breadcrumb-related content
          const hasBreadcrumb = html.includes('Breadcrumb') || 
                               html.includes('breadcrumb') ||
                               html.includes(department.name);
          
          if (hasBreadcrumb) {
            console.log(`  ✅ Page contains breadcrumb elements`);
          } else {
            console.log(`  ⚠️ Breadcrumb elements not clearly visible in HTML`);
          }
        }
        
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
 * Test breadcrumb component functionality
 */
async function testBreadcrumbComponent() {
  console.log('🧩 Testing breadcrumb component functionality...');
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Check if the new personnel page file exists and contains our changes
    const filePath = path.join(process.cwd(), 'kentkonut-backend', 'app', 'dashboard', 'kurumsal', 'birimler', 'new-personnel', 'page.tsx');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ New personnel page file not found');
      return false;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check for our implemented features
    const checks = [
      {
        name: 'Current Department State',
        pattern: /currentDepartment.*useState/,
        description: 'State for storing current department'
      },
      {
        name: 'Fetch Current Department Function',
        pattern: /fetchCurrentDepartment/,
        description: 'Function to fetch department details'
      },
      {
        name: 'Dynamic Breadcrumb',
        pattern: /currentDepartment.*name.*href/,
        description: 'Dynamic breadcrumb with department name and link'
      },
      {
        name: 'Department Effect Hook',
        pattern: /useEffect.*departmentId.*fetchCurrentDepartment/,
        description: 'Effect hook to fetch department when ID changes'
      }
    ];
    
    let allChecksPass = true;
    
    for (const check of checks) {
      if (check.pattern.test(fileContent)) {
        console.log(`✅ ${check.name}: Found`);
      } else {
        console.log(`❌ ${check.name}: Not found`);
        allChecksPass = false;
      }
    }
    
    return allChecksPass;
    
  } catch (error) {
    console.error('❌ Error checking breadcrumb component:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Starting Breadcrumb Navigation Tests...\n');
  
  // Test 1: Department API
  const department = await testDepartmentAPI();
  console.log('─'.repeat(50));
  
  // Test 2: Breadcrumb component
  const componentTest = await testBreadcrumbComponent();
  console.log('─'.repeat(50));
  
  // Test 3: Navigation URLs
  const navigationTest = await testBreadcrumbNavigation(department);
  console.log('─'.repeat(50));
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('Department API:', department ? '✅' : '❌');
  console.log('Breadcrumb Component:', componentTest ? '✅' : '❌');
  console.log('Navigation URLs:', navigationTest ? '✅' : '❌');
  
  const allPassed = department && componentTest && navigationTest;
  
  console.log('\n🎯 Overall Result:', allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
  
  if (allPassed && department) {
    console.log('\n📌 Manual Testing Steps:');
    console.log(`1. Go to: ${BASE_URL}/dashboard/kurumsal/birimler`);
    console.log('2. Click on any department to view details');
    console.log('3. Click "Add Personnel" or similar button');
    console.log('4. Verify breadcrumb shows: Dashboard > Kurumsal > Birimler > [Department Name] > Yeni Personel');
    console.log('5. Click on department name in breadcrumb to verify navigation');
    console.log(`6. Direct test URL: ${BASE_URL}/dashboard/kurumsal/birimler/new-personnel?departmentId=${department.id}`);
  } else {
    console.log('\n🔧 Issues to Address:');
    if (!department) console.log('- Check department API and database');
    if (!componentTest) console.log('- Verify breadcrumb component implementation');
    if (!navigationTest) console.log('- Check page accessibility and navigation');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testDepartmentAPI, testBreadcrumbNavigation };
