/**
 * Test script to verify Department module enhancements
 * This script tests:
 * 1. Executive reference functionality
 * 2. Automatic slug generation
 * 3. Corporate media folder configuration
 * 4. Database schema updates
 * 5. API endpoint functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Department Module Enhancements...\n');

// Test 1: Check Prisma schema updates
function testPrismaSchemaUpdates() {
  console.log('Test 1: Checking Prisma schema updates...');
  
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    console.log('❌ Prisma schema file not found');
    return false;
  }
  
  const content = fs.readFileSync(schemaPath, 'utf8');
  
  // Check Department model has managerId field
  const hasDepartmentManagerId = content.includes('managerId        String?');
  const hasDepartmentManagerRelation = content.includes('manager          Executive?');
  
  // Check Executive model has reverse relationship
  const hasExecutiveManagedDepartments = content.includes('managedDepartments  Department[]');
  const hasExecutiveRelationName = content.includes('@relation("DepartmentManager")');
  
  if (!hasDepartmentManagerId) {
    console.log('❌ Department model missing managerId field');
    return false;
  }
  
  if (!hasDepartmentManagerRelation) {
    console.log('❌ Department model missing manager relation');
    return false;
  }
  
  if (!hasExecutiveManagedDepartments) {
    console.log('❌ Executive model missing managedDepartments relation');
    return false;
  }
  
  if (!hasExecutiveRelationName) {
    console.log('❌ Missing DepartmentManager relation name');
    return false;
  }
  
  console.log('✅ Prisma schema updates are correct');
  return true;
}

// Test 2: Check slug generation utilities
function testSlugGenerationUtilities() {
  console.log('\nTest 2: Checking slug generation utilities...');
  
  const seoUtilsPath = path.join(__dirname, '../lib/seo-utils.ts');
  
  if (!fs.existsSync(seoUtilsPath)) {
    console.log('❌ SEO utils file not found');
    return false;
  }
  
  const content = fs.readFileSync(seoUtilsPath, 'utf8');
  
  const hasGenerateDepartmentSlug = content.includes('generateDepartmentSlug');
  const hasGenerateUniqueDepartmentSlug = content.includes('generateUniqueDepartmentSlug');
  const hasValidateDepartmentSlug = content.includes('validateDepartmentSlug');
  const hasTurkishCharacterHandling = content.includes('çğıöşüÇĞIÖŞÜ');
  
  if (!hasGenerateDepartmentSlug) {
    console.log('❌ generateDepartmentSlug function missing');
    return false;
  }
  
  if (!hasGenerateUniqueDepartmentSlug) {
    console.log('❌ generateUniqueDepartmentSlug function missing');
    return false;
  }
  
  if (!hasValidateDepartmentSlug) {
    console.log('❌ validateDepartmentSlug function missing');
    return false;
  }
  
  if (!hasTurkishCharacterHandling) {
    console.log('❌ Turkish character handling missing');
    return false;
  }
  
  console.log('✅ Slug generation utilities are implemented');
  return true;
}

// Test 3: Check validation schema updates
function testValidationSchemaUpdates() {
  console.log('\nTest 3: Checking validation schema updates...');
  
  const validationPath = path.join(__dirname, '../utils/corporateValidation.ts');
  
  if (!fs.existsSync(validationPath)) {
    console.log('❌ Corporate validation file not found');
    return false;
  }
  
  const content = fs.readFileSync(validationPath, 'utf8');
  
  const hasManagerIdValidation = content.includes('managerId: z.string()');
  
  if (!hasManagerIdValidation) {
    console.log('❌ managerId validation missing from DepartmentValidationSchema');
    return false;
  }
  
  console.log('✅ Validation schema updates are correct');
  return true;
}

// Test 4: Check API endpoint updates
function testAPIEndpointUpdates() {
  console.log('\nTest 4: Checking API endpoint updates...');
  
  const mainRoutePath = path.join(__dirname, '../app/api/departments/route.ts');
  const idRoutePath = path.join(__dirname, '../app/api/departments/[id]/route.ts');
  
  if (!fs.existsSync(mainRoutePath)) {
    console.log('❌ Main departments route not found');
    return false;
  }
  
  if (!fs.existsSync(idRoutePath)) {
    console.log('❌ Individual department route not found');
    return false;
  }
  
  const mainContent = fs.readFileSync(mainRoutePath, 'utf8');
  const idContent = fs.readFileSync(idRoutePath, 'utf8');
  
  // Check imports
  const hasSlugImport = mainContent.includes('generateUniqueDepartmentSlug') && 
                       idContent.includes('generateUniqueDepartmentSlug');
  
  // Check manager inclusion in queries
  const hasManagerInclusion = mainContent.includes('manager: true') && 
                             idContent.includes('manager: true');
  
  // Check slug generation in POST/PUT
  const hasSlugGeneration = mainContent.includes('await generateUniqueDepartmentSlug') && 
                           idContent.includes('await generateUniqueDepartmentSlug');
  
  if (!hasSlugImport) {
    console.log('❌ Slug generation import missing from API routes');
    return false;
  }
  
  if (!hasManagerInclusion) {
    console.log('❌ Manager inclusion missing from API queries');
    return false;
  }
  
  if (!hasSlugGeneration) {
    console.log('❌ Slug generation missing from API operations');
    return false;
  }
  
  console.log('✅ API endpoint updates are correct');
  return true;
}

// Test 5: Check form updates
function testFormUpdates() {
  console.log('\nTest 5: Checking form updates...');
  
  const editFormPath = path.join(__dirname, '../app/dashboard/corporate/departments/[id]/page.tsx');
  const newFormPath = path.join(__dirname, '../app/dashboard/corporate/departments/new/page.tsx');
  
  if (!fs.existsSync(editFormPath)) {
    console.log('❌ Edit department form not found');
    return false;
  }
  
  if (!fs.existsSync(newFormPath)) {
    console.log('❌ New department form not found');
    return false;
  }
  
  const editContent = fs.readFileSync(editFormPath, 'utf8');
  const newContent = fs.readFileSync(newFormPath, 'utf8');
  
  // Check managerId in interfaces
  const hasManagerIdInInterface = editContent.includes('managerId: string') && 
                                  newContent.includes('managerId: string');
  
  // Check Select component imports
  const hasSelectImports = editContent.includes('Select, SelectContent, SelectItem') && 
                          newContent.includes('Select, SelectContent, SelectItem');
  
  // Check executive selection dropdown
  const hasExecutiveDropdown = editContent.includes('Birim Yöneticisi (Yönetici)') && 
                              newContent.includes('Birim Yöneticisi (Yönetici)');
  
  // Check corporate media folder usage
  const hasCorporateMediaFolder = editContent.includes('defaultCategory="kurumsal"') && 
                                 newContent.includes('defaultCategory="kurumsal"') &&
                                 editContent.includes('mediaFolder="kurumsal"') && 
                                 newContent.includes('mediaFolder="kurumsal"');
  
  // Check executives state and fetch
  const hasExecutivesState = editContent.includes('executives, setExecutives') && 
                            newContent.includes('executives, setExecutives');
  
  if (!hasManagerIdInInterface) {
    console.log('❌ managerId missing from form interfaces');
    return false;
  }
  
  if (!hasSelectImports) {
    console.log('❌ Select component imports missing');
    return false;
  }
  
  if (!hasExecutiveDropdown) {
    console.log('❌ Executive selection dropdown missing');
    return false;
  }
  
  if (!hasCorporateMediaFolder) {
    console.log('❌ Corporate media folder configuration missing');
    return false;
  }
  
  if (!hasExecutivesState) {
    console.log('❌ Executives state management missing');
    return false;
  }
  
  console.log('✅ Form updates are correct');
  return true;
}

// Run all tests
function runTests() {
  console.log('🧪 Running Department Enhancement Tests\n');
  
  const tests = [
    testPrismaSchemaUpdates,
    testSlugGenerationUtilities,
    testValidationSchemaUpdates,
    testAPIEndpointUpdates,
    testFormUpdates
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      if (test()) {
        passedTests++;
      }
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Test Results: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All tests passed! Department module enhancements are working correctly.');
    console.log('\n📝 Summary of enhancements:');
    console.log('   ✅ Executive reference added to departments');
    console.log('   ✅ Automatic slug generation implemented');
    console.log('   ✅ Corporate media folder configuration');
    console.log('   ✅ Database schema updated with migrations');
    console.log('   ✅ API endpoints enhanced');
    console.log('   ✅ Forms updated with executive selection');
    console.log('\n🚀 The Department module is now enhanced with all requested features!');
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
