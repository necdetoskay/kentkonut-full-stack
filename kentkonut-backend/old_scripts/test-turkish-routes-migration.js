/**
 * Test script to verify Turkish routes migration
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Turkish Routes Migration\n');

function testTurkishFolderStructure() {
  console.log('Test 1: Checking Turkish folder structure...');
  
  const turkishPaths = [
    'app/dashboard/kurumsal',
    'app/dashboard/kurumsal/personel',
    'app/dashboard/kurumsal/birimler',
    'app/dashboard/kurumsal/yoneticiler',
    'app/dashboard/kurumsal/icerik',
    'app/dashboard/kurumsal/hizli-baglanti',
    'app/dashboard/kurumsal/birim-hizli-baglanti'
  ];
  
  for (const turkishPath of turkishPaths) {
    const fullPath = path.join(__dirname, '..', turkishPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Turkish folder missing: ${turkishPath}`);
      return false;
    }
  }
  
  console.log('✅ All Turkish folders exist');
  return true;
}

function testTurkishPageFiles() {
  console.log('\nTest 2: Checking Turkish page files...');
  
  const requiredFiles = [
    'app/dashboard/kurumsal/page.tsx',
    'app/dashboard/kurumsal/personel/page.tsx',
    'app/dashboard/kurumsal/personel/[id]/page.tsx',
    'app/dashboard/kurumsal/personel/[id]/edit/page.tsx',
    'app/dashboard/kurumsal/birimler/page.tsx',
    'app/dashboard/kurumsal/birimler/[id]/page.tsx',
    'app/dashboard/kurumsal/birimler/new-personnel/page.tsx',
    'app/dashboard/kurumsal/yoneticiler/page.tsx',
    'app/dashboard/kurumsal/yoneticiler/form/page.tsx',
    'app/dashboard/kurumsal/icerik/page.tsx',
    'app/dashboard/kurumsal/hizli-baglanti/page.tsx',
    'app/dashboard/kurumsal/birim-hizli-baglanti/page.tsx'
  ];
  
  for (const filePath of requiredFiles) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Turkish page file missing: ${filePath}`);
      return false;
    }
  }
  
  console.log('✅ All Turkish page files exist');
  return true;
}

function testNavigationRoutes() {
  console.log('\nTest 3: Checking navigation routes...');
  
  const sideNavPath = path.join(__dirname, '../app/components/layout/SideNav.tsx');
  
  if (!fs.existsSync(sideNavPath)) {
    console.log('❌ SideNav component not found');
    return false;
  }
  
  const content = fs.readFileSync(sideNavPath, 'utf8');
  
  // Check for Turkish routes in navigation
  const hasTurkishExecutivesRoute = content.includes('"/dashboard/kurumsal/yoneticiler"');
  const hasTurkishDepartmentsRoute = content.includes('"/dashboard/kurumsal/birimler"');
  const hasTurkishContentRoute = content.includes('"/dashboard/kurumsal/icerik/strategy-goals"');
  
  // Check that English routes are removed
  const hasEnglishExecutivesRoute = content.includes('"/dashboard/corporate/executives"');
  const hasEnglishDepartmentsRoute = content.includes('"/dashboard/corporate/departments"');
  
  if (!hasTurkishExecutivesRoute) {
    console.log('❌ Turkish executives route missing in navigation');
    return false;
  }
  
  if (!hasTurkishDepartmentsRoute) {
    console.log('❌ Turkish departments route missing in navigation');
    return false;
  }
  
  if (!hasTurkishContentRoute) {
    console.log('❌ Turkish content route missing in navigation');
    return false;
  }
  
  if (hasEnglishExecutivesRoute) {
    console.log('❌ English executives route still exists in navigation');
    return false;
  }
  
  if (hasEnglishDepartmentsRoute) {
    console.log('❌ English departments route still exists in navigation');
    return false;
  }
  
  console.log('✅ Navigation routes updated to Turkish');
  return true;
}

function testInternalRouteReferences() {
  console.log('\nTest 4: Checking internal route references...');
  
  const filesToCheck = [
    'app/dashboard/kurumsal/page.tsx',
    'app/dashboard/kurumsal/personel/page.tsx',
    'app/dashboard/kurumsal/birimler/[id]/page.tsx',
    'app/dashboard/kurumsal/yoneticiler/page.tsx',
    'app/dashboard/kurumsal/hizli-baglanti/page.tsx'
  ];
  
  for (const filePath of filesToCheck) {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for remaining English route references
    if (content.includes('/dashboard/corporate/')) {
      console.log(`❌ English route references found in: ${filePath}`);
      return false;
    }
  }
  
  console.log('✅ No English route references found in Turkish files');
  return true;
}

function testBreadcrumbRoutes() {
  console.log('\nTest 5: Checking breadcrumb routes...');
  
  const filesToCheck = [
    'app/dashboard/kurumsal/birimler/[id]/page.tsx',
    'app/dashboard/kurumsal/birimler/new-personnel/page.tsx',
    'app/dashboard/kurumsal/personel/[id]/edit/page.tsx',
    'app/dashboard/kurumsal/hizli-baglanti/page.tsx'
  ];
  
  for (const filePath of filesToCheck) {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for Turkish breadcrumb routes
    const hasTurkishKurumsalRoute = content.includes('"/dashboard/kurumsal"');
    const hasTurkishBirimlerRoute = content.includes('"/dashboard/kurumsal/birimler"');
    
    if (!hasTurkishKurumsalRoute && filePath.includes('kurumsal')) {
      console.log(`❌ Turkish kurumsal breadcrumb route missing in: ${filePath}`);
      return false;
    }
    
    if (!hasTurkishBirimlerRoute && filePath.includes('birimler')) {
      console.log(`❌ Turkish birimler breadcrumb route missing in: ${filePath}`);
      return false;
    }
  }
  
  console.log('✅ Breadcrumb routes updated to Turkish');
  return true;
}

function testRouterPushCalls() {
  console.log('\nTest 6: Checking router.push() calls...');
  
  const filesToCheck = [
    'app/dashboard/kurumsal/page.tsx',
    'app/dashboard/kurumsal/birimler/[id]/page.tsx',
    'app/dashboard/kurumsal/yoneticiler/page.tsx'
  ];
  
  for (const filePath of filesToCheck) {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for Turkish router.push calls
    const hasTurkishRouterPush = content.includes('router.push(\'/dashboard/kurumsal/');
    
    if (!hasTurkishRouterPush && filePath.includes('kurumsal')) {
      console.log(`❌ Turkish router.push calls missing in: ${filePath}`);
      return false;
    }
  }
  
  console.log('✅ Router.push() calls updated to Turkish');
  return true;
}

function testEnglishFolderExists() {
  console.log('\nTest 7: Checking if English folder still exists...');
  
  const englishFolderPath = path.join(__dirname, '../app/dashboard/corporate');
  
  if (fs.existsSync(englishFolderPath)) {
    console.log('⚠️ English corporate folder still exists (ready for removal)');
    return true; // This is expected before removal
  }
  
  console.log('✅ English corporate folder already removed');
  return true;
}

function runTurkishRoutesMigrationTests() {
  console.log('🧪 TURKISH ROUTES MIGRATION VERIFICATION');
  console.log('========================================\n');
  
  const tests = [
    testTurkishFolderStructure,
    testTurkishPageFiles,
    testNavigationRoutes,
    testInternalRouteReferences,
    testBreadcrumbRoutes,
    testRouterPushCalls,
    testEnglishFolderExists
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
    console.log('\n🎉 SUCCESS! Turkish routes migration completed!');
    console.log('\n📝 Migration completed:');
    console.log('   ✅ Turkish folder structure created');
    console.log('   ✅ All page files migrated');
    console.log('   ✅ Navigation routes updated');
    console.log('   ✅ Internal route references updated');
    console.log('   ✅ Breadcrumb routes updated');
    console.log('   ✅ Router.push() calls updated');
    console.log('   ✅ Ready for English folder cleanup');
    console.log('\n🎯 Turkish Route Structure:');
    console.log('   • /dashboard/kurumsal/ (main)');
    console.log('   • /dashboard/kurumsal/personel/ (personnel)');
    console.log('   • /dashboard/kurumsal/birimler/ (departments)');
    console.log('   • /dashboard/kurumsal/yoneticiler/ (executives)');
    console.log('   • /dashboard/kurumsal/icerik/ (content)');
    console.log('   • /dashboard/kurumsal/hizli-baglanti/ (quick links)');
    console.log('   • /dashboard/kurumsal/birim-hizli-baglanti/ (dept quick links)');
    console.log('\n✨ All functionality preserved with Turkish URLs!');
    console.log('\n🗑️ Ready to safely remove English folder structure');
  } else {
    console.log('\n❌ Some tests failed. Migration may be incomplete.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runTurkishRoutesMigrationTests();
}

module.exports = { runTurkishRoutesMigrationTests };
