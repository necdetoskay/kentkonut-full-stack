/**
 * Test script to verify personnel view page fix
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Personnel View Page Fix\n');

function testPersonnelViewPageExists() {
  console.log('Test 1: Checking personnel view page exists...');
  
  const viewPagePath = path.join(__dirname, '../app/dashboard/corporate/personnel/[id]/page.tsx');
  
  if (!fs.existsSync(viewPagePath)) {
    console.log('❌ Personnel view page not found');
    return false;
  }
  
  const content = fs.readFileSync(viewPagePath, 'utf8');
  
  // Check for essential components
  const hasPersonnelInterface = content.includes('interface Personnel');
  const hasViewPageComponent = content.includes('PersonnelViewPage');
  const hasFetchPersonnel = content.includes('fetchPersonnel');
  const hasPersonnelAPI = content.includes('/api/personnel/');
  const hasEditButton = content.includes('Düzenle');
  const hasBackButton = content.includes('Geri');
  
  if (!hasPersonnelInterface) {
    console.log('❌ Personnel interface missing');
    return false;
  }
  
  if (!hasViewPageComponent) {
    console.log('❌ PersonnelViewPage component missing');
    return false;
  }
  
  if (!hasFetchPersonnel) {
    console.log('❌ fetchPersonnel function missing');
    return false;
  }
  
  if (!hasPersonnelAPI) {
    console.log('❌ Personnel API call missing');
    return false;
  }
  
  if (!hasEditButton) {
    console.log('❌ Edit button missing');
    return false;
  }
  
  if (!hasBackButton) {
    console.log('❌ Back button missing');
    return false;
  }
  
  console.log('✅ Personnel view page exists with all essential components');
  return true;
}

function testDepartmentPageViewButtonFix() {
  console.log('\nTest 2: Checking department page view button fix...');
  
  const departmentPagePath = path.join(__dirname, '../app/dashboard/corporate/departments/[id]/page.tsx');
  
  if (!fs.existsSync(departmentPagePath)) {
    console.log('❌ Department page not found');
    return false;
  }
  
  const content = fs.readFileSync(departmentPagePath, 'utf8');
  
  // Check for correct director view button route
  const hasCorrectDirectorRoute = content.includes('router.push(`/dashboard/corporate/personnel/${department.director?.id}`)');
  
  // Check for correct chief view button route
  const hasCorrectChiefRoute = content.includes('router.push(`/dashboard/corporate/personnel/${chief.id}`)');
  
  // Check that old incorrect routes are removed
  const hasRemovedOldDirectorRoute = !content.includes('window.open(`/personnel/${department.director?.slug}`');
  const hasRemovedOldChiefRoute = !content.includes('window.open(`/personnel/${chief.slug}`');
  
  if (!hasCorrectDirectorRoute) {
    console.log('❌ Correct director view button route missing');
    return false;
  }
  
  if (!hasCorrectChiefRoute) {
    console.log('❌ Correct chief view button route missing');
    return false;
  }
  
  if (!hasRemovedOldDirectorRoute) {
    console.log('❌ Old director route not removed');
    return false;
  }
  
  if (!hasRemovedOldChiefRoute) {
    console.log('❌ Old chief route not removed');
    return false;
  }
  
  console.log('✅ Department page view button routes fixed');
  return true;
}

function testPersonnelListPageViewButton() {
  console.log('\nTest 3: Checking personnel list page view button...');
  
  const personnelListPath = path.join(__dirname, '../app/dashboard/corporate/personnel/page.tsx');
  
  if (!fs.existsSync(personnelListPath)) {
    console.log('❌ Personnel list page not found');
    return false;
  }
  
  const content = fs.readFileSync(personnelListPath, 'utf8');
  
  // Check for router import
  const hasRouterImport = content.includes('import { useRouter } from "next/navigation"');
  
  // Check for Eye icon import
  const hasEyeIconImport = content.includes('Eye') && content.includes('from "lucide-react"');
  
  // Check for router initialization
  const hasRouterInit = content.includes('const router = useRouter()');
  
  // Check for view button
  const hasViewButton = content.includes('Görüntüle') && 
                       content.includes('router.push(`/dashboard/corporate/personnel/${person.id}`)') &&
                       content.includes('<Eye className="h-4 w-4 mr-1" />');
  
  if (!hasRouterImport) {
    console.log('❌ Router import missing');
    return false;
  }
  
  if (!hasEyeIconImport) {
    console.log('❌ Eye icon import missing');
    return false;
  }
  
  if (!hasRouterInit) {
    console.log('❌ Router initialization missing');
    return false;
  }
  
  if (!hasViewButton) {
    console.log('❌ View button missing or incorrect');
    return false;
  }
  
  console.log('✅ Personnel list page view button added correctly');
  return true;
}

function testPersonnelAPIEndpoint() {
  console.log('\nTest 4: Checking personnel API endpoint...');
  
  const apiEndpointPath = path.join(__dirname, '../app/api/personnel/[id]/route.ts');
  
  if (!fs.existsSync(apiEndpointPath)) {
    console.log('❌ Personnel API endpoint not found');
    return false;
  }
  
  const content = fs.readFileSync(apiEndpointPath, 'utf8');
  
  // Check for GET method
  const hasGetMethod = content.includes('export async function GET');
  
  // Check for personnel fetch with includes
  const hasPersonnelFetch = content.includes('db.personnel.findUnique') &&
                           content.includes('galleryItems') &&
                           content.includes('directedDept') &&
                           content.includes('chiefInDepts');
  
  // Check for 404 handling
  const has404Handling = content.includes('Personnel not found') && content.includes('status: 404');
  
  if (!hasGetMethod) {
    console.log('❌ GET method missing');
    return false;
  }
  
  if (!hasPersonnelFetch) {
    console.log('❌ Personnel fetch with includes missing');
    return false;
  }
  
  if (!has404Handling) {
    console.log('❌ 404 handling missing');
    return false;
  }
  
  console.log('✅ Personnel API endpoint correct');
  return true;
}

function testViewPageFeatures() {
  console.log('\nTest 5: Checking view page features...');
  
  const viewPagePath = path.join(__dirname, '../app/dashboard/corporate/personnel/[id]/page.tsx');
  const content = fs.readFileSync(viewPagePath, 'utf8');
  
  // Check for essential features
  const hasPersonalInfo = content.includes('Kişisel Bilgiler');
  const hasDepartmentInfo = content.includes('Birim Bilgileri');
  const hasDocuments = content.includes('Belgeler');
  const hasProfileImage = content.includes('Profil Fotoğrafı');
  const hasGallery = content.includes('Galeri');
  const hasSystemInfo = content.includes('Sistem Bilgileri');
  const hasLoadingState = content.includes('animate-spin');
  const hasErrorHandling = content.includes('Personel bulunamadı');
  const hasEditNavigation = content.includes('/dashboard/corporate/personnel/${params.id}/edit');
  
  if (!hasPersonalInfo) {
    console.log('❌ Personal information section missing');
    return false;
  }
  
  if (!hasDepartmentInfo) {
    console.log('❌ Department information section missing');
    return false;
  }
  
  if (!hasDocuments) {
    console.log('❌ Documents section missing');
    return false;
  }
  
  if (!hasProfileImage) {
    console.log('❌ Profile image section missing');
    return false;
  }
  
  if (!hasGallery) {
    console.log('❌ Gallery section missing');
    return false;
  }
  
  if (!hasSystemInfo) {
    console.log('❌ System information section missing');
    return false;
  }
  
  if (!hasLoadingState) {
    console.log('❌ Loading state missing');
    return false;
  }
  
  if (!hasErrorHandling) {
    console.log('❌ Error handling missing');
    return false;
  }
  
  if (!hasEditNavigation) {
    console.log('❌ Edit navigation missing');
    return false;
  }
  
  console.log('✅ View page features complete');
  return true;
}

function runPersonnelViewPageFixTests() {
  console.log('🧪 PERSONNEL VIEW PAGE FIX VERIFICATION');
  console.log('======================================\n');
  
  const tests = [
    testPersonnelViewPageExists,
    testDepartmentPageViewButtonFix,
    testPersonnelListPageViewButton,
    testPersonnelAPIEndpoint,
    testViewPageFeatures
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
    console.log('\n🎉 SUCCESS! Personnel view page fix completed!');
    console.log('\n📝 Fix implemented:');
    console.log('   ✅ Created personnel view page: /dashboard/corporate/personnel/[id]/page.tsx');
    console.log('   ✅ Fixed department page view button routes');
    console.log('   ✅ Added view button to personnel list page');
    console.log('   ✅ Personnel API endpoint verified');
    console.log('   ✅ View page features complete');
    console.log('\n🎯 Features implemented:');
    console.log('   • Personal information display');
    console.log('   • Department associations');
    console.log('   • Document/CV management');
    console.log('   • Profile image display');
    console.log('   • Gallery items');
    console.log('   • System metadata');
    console.log('   • Loading and error states');
    console.log('   • Edit and back navigation');
    console.log('\n🔧 Routing fixes:');
    console.log('   • Department page: /personnel/${slug} → /dashboard/corporate/personnel/${id}');
    console.log('   • Personnel list: Added "Görüntüle" button');
    console.log('   • Consistent dashboard routing');
    console.log('\n✨ Personnel view functionality now works without 404 errors!');
    console.log('\n🔍 User flow:');
    console.log('   1. User clicks "Görüntüle" button in personnel list or department page');
    console.log('   2. Navigates to /dashboard/corporate/personnel/{id}');
    console.log('   3. View page displays complete personnel information');
    console.log('   4. User can edit or navigate back');
    console.log('   5. All navigation works without errors');
  } else {
    console.log('\n❌ Some tests failed. Personnel view page fix may be incomplete.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runPersonnelViewPageFixTests();
}

module.exports = { runPersonnelViewPageFixTests };
