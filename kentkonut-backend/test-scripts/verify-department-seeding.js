/**
 * Verification Script: Department Seeding Results
 * 
 * This script verifies that the department seeding was successful
 * and checks data integrity.
 * 
 * Run: node test-scripts/verify-department-seeding.js
 */

const BASE_URL = 'http://localhost:3010';

// Expected department names from seeding
const expectedDepartments = [
  'İnsan Kaynakları Müdürlüğü',
  'Mali İşler Müdürlüğü',
  'Bilgi İşlem Müdürlüğü',
  'Halkla İlişkiler Müdürlüğü',
  'Hukuk İşleri Müdürlüğü'
];

/**
 * Test department API and verify seeded data
 */
async function verifyDepartmentSeeding() {
  console.log('🔍 Verifying department seeding results...');
  
  try {
    // Fetch all departments
    const response = await fetch(`${BASE_URL}/api/departments`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const departments = await response.json();
    console.log(`📊 Total departments found: ${departments.length}`);
    
    // Check if our seeded departments exist
    const foundDepartments = [];
    const missingDepartments = [];
    
    for (const expectedName of expectedDepartments) {
      const found = departments.find(dept => dept.name === expectedName);
      if (found) {
        foundDepartments.push(found);
        console.log(`✅ Found: ${expectedName}`);
      } else {
        missingDepartments.push(expectedName);
        console.log(`❌ Missing: ${expectedName}`);
      }
    }
    
    console.log(`\n📈 Seeding Results:`);
    console.log(`   ✅ Successfully seeded: ${foundDepartments.length}/5 departments`);
    console.log(`   ❌ Missing: ${missingDepartments.length}/5 departments`);
    
    if (missingDepartments.length > 0) {
      console.log(`\n⚠️ Missing departments:`);
      missingDepartments.forEach(name => console.log(`   - ${name}`));
    }
    
    return { foundDepartments, missingDepartments, allDepartments: departments };
    
  } catch (error) {
    console.error('❌ Error verifying departments:', error.message);
    return null;
  }
}

/**
 * Verify personnel relationships
 */
async function verifyPersonnelRelationships(departments) {
  console.log('\n👥 Verifying personnel relationships...');
  
  let totalDirectors = 0;
  let totalChiefs = 0;
  let relationshipErrors = [];
  
  for (const dept of departments) {
    try {
      // Fetch department details
      const response = await fetch(`${BASE_URL}/api/departments/${dept.id}`);
      
      if (!response.ok) {
        relationshipErrors.push(`Failed to fetch details for ${dept.name}`);
        continue;
      }
      
      const deptDetails = await response.json();
      
      // Check director
      if (deptDetails.director) {
        totalDirectors++;
        console.log(`  ✅ ${dept.name} has director: ${deptDetails.director.name}`);
      } else {
        relationshipErrors.push(`${dept.name} missing director`);
      }
      
      // Check chiefs
      if (deptDetails.chiefs && deptDetails.chiefs.length > 0) {
        totalChiefs += deptDetails.chiefs.length;
        deptDetails.chiefs.forEach(chief => {
          console.log(`  ✅ ${dept.name} has chief: ${chief.name}`);
        });
      } else {
        relationshipErrors.push(`${dept.name} missing chiefs`);
      }
      
    } catch (error) {
      relationshipErrors.push(`Error checking ${dept.name}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Personnel Summary:`);
  console.log(`   👨‍💼 Total Directors: ${totalDirectors}`);
  console.log(`   👨‍💻 Total Chiefs: ${totalChiefs}`);
  
  if (relationshipErrors.length > 0) {
    console.log(`\n⚠️ Relationship Issues:`);
    relationshipErrors.forEach(error => console.log(`   - ${error}`));
  }
  
  return { totalDirectors, totalChiefs, relationshipErrors };
}

/**
 * Test breadcrumb navigation with seeded departments
 */
async function testBreadcrumbNavigation(departments) {
  console.log('\n🧭 Testing breadcrumb navigation...');
  
  if (departments.length === 0) {
    console.log('⚠️ No departments to test breadcrumb navigation');
    return false;
  }
  
  // Test with first seeded department
  const testDept = departments[0];
  const testUrl = `${BASE_URL}/dashboard/kurumsal/birimler/new-personnel?departmentId=${testDept.id}`;
  
  try {
    console.log(`🔗 Testing breadcrumb with: ${testDept.name}`);
    
    const response = await fetch(testUrl);
    
    if (response.ok) {
      console.log(`✅ New personnel page loads correctly for ${testDept.name}`);
      return true;
    } else {
      console.log(`❌ Failed to load new personnel page: ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error testing breadcrumb navigation: ${error.message}`);
    return false;
  }
}

/**
 * Main verification function
 */
async function runVerification() {
  console.log('🧪 Starting Department Seeding Verification...\n');
  
  // Verify departments
  const deptResult = await verifyDepartmentSeeding();
  if (!deptResult) {
    console.log('❌ Cannot proceed with verification - API not accessible');
    return;
  }
  
  const { foundDepartments, missingDepartments, allDepartments } = deptResult;
  
  // Verify personnel relationships
  const personnelResult = await verifyPersonnelRelationships(foundDepartments);
  
  // Test breadcrumb navigation
  const breadcrumbResult = await testBreadcrumbNavigation(foundDepartments);
  
  // Final summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('═'.repeat(50));
  
  const allDepartmentsSeeded = missingDepartments.length === 0;
  const allPersonnelLinked = personnelResult.relationshipErrors.length === 0;
  const expectedPersonnel = foundDepartments.length; // 1 director + 1 chief per department
  const actualPersonnel = personnelResult.totalDirectors + personnelResult.totalChiefs;
  
  console.log(`Departments Seeded: ${allDepartmentsSeeded ? '✅' : '❌'} (${foundDepartments.length}/5)`);
  console.log(`Personnel Created: ${actualPersonnel === expectedPersonnel * 2 ? '✅' : '❌'} (${actualPersonnel}/${expectedPersonnel * 2})`);
  console.log(`Relationships Linked: ${allPersonnelLinked ? '✅' : '❌'}`);
  console.log(`Breadcrumb Navigation: ${breadcrumbResult ? '✅' : '❌'}`);
  
  const overallSuccess = allDepartmentsSeeded && allPersonnelLinked && breadcrumbResult;
  
  console.log(`\n🎯 Overall Result: ${overallSuccess ? '✅ SUCCESS' : '❌ ISSUES DETECTED'}`);
  
  if (overallSuccess) {
    console.log('\n🎉 All verification tests passed!');
    console.log('📌 Next steps:');
    console.log(`   1. Visit: ${BASE_URL}/dashboard/kurumsal/birimler`);
    console.log('   2. Verify all 5 new departments are visible');
    console.log('   3. Test department detail pages');
    console.log('   4. Test adding personnel to departments');
  } else {
    console.log('\n🔧 Issues detected - please check the logs above');
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  runVerification().catch(console.error);
}

module.exports = { runVerification };
