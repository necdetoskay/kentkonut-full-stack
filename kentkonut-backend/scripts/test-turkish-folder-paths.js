/**
 * Test script to verify Turkish folder paths implementation
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Turkish Folder Paths Implementation\n');

function testEnhancedCVUploaderPaths() {
  console.log('Test 1: Checking Enhanced CV Uploader Turkish paths...');
  
  const componentPath = path.join(__dirname, '../components/media/EnhancedCVUploader.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.log('❌ Enhanced CV Uploader component not found');
    return false;
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Check for Turkish folder paths
  const hasTurkishPaths = content.includes('defaultCategory="kurumsal-images"') &&
                         content.includes('customFolder="kurumsal/birimler"');
  
  // Check that English paths are removed
  const hasRemovedEnglishPaths = !content.includes('defaultCategory="corporate-images"') &&
                                !content.includes('customFolder="corporate/departments"');
  
  if (!hasTurkishPaths) {
    console.log('❌ Turkish folder paths missing in Enhanced CV Uploader');
    return false;
  }
  
  if (!hasRemovedEnglishPaths) {
    console.log('❌ English folder paths not removed from Enhanced CV Uploader');
    return false;
  }
  
  console.log('✅ Enhanced CV Uploader Turkish paths correct');
  return true;
}

function testNewPersonnelPagePaths() {
  console.log('\nTest 2: Checking new personnel page Turkish paths...');
  
  const newPersonnelPath = path.join(__dirname, '../app/dashboard/corporate/departments/new-personnel/page.tsx');
  
  if (!fs.existsSync(newPersonnelPath)) {
    console.log('❌ New personnel page not found');
    return false;
  }
  
  const content = fs.readFileSync(newPersonnelPath, 'utf8');
  
  // Check for Turkish category in handleCvUpload
  const hasTurkishCategory = content.includes("formData.append('category', 'kurumsal/birimler')");
  
  // Check that English category is removed
  const hasRemovedEnglishCategory = !content.includes("formData.append('category', 'corporate/departments')");
  
  if (!hasTurkishCategory) {
    console.log('❌ Turkish category missing in new personnel page');
    return false;
  }
  
  if (!hasRemovedEnglishCategory) {
    console.log('❌ English category not removed from new personnel page');
    return false;
  }
  
  console.log('✅ New personnel page Turkish paths correct');
  return true;
}

function testPersonnelEditPagePaths() {
  console.log('\nTest 3: Checking personnel edit page Turkish paths...');
  
  const editPagePath = path.join(__dirname, '../app/dashboard/corporate/personnel/[id]/edit/page.tsx');
  
  if (!fs.existsSync(editPagePath)) {
    console.log('❌ Personnel edit page not found');
    return false;
  }
  
  const content = fs.readFileSync(editPagePath, 'utf8');
  
  // Check for Turkish category in handleCvUpload
  const hasTurkishCategory = content.includes("formData.append('category', 'kurumsal/birimler')");
  
  // Check that English category is removed
  const hasRemovedEnglishCategory = !content.includes("formData.append('category', 'corporate/departments')");
  
  if (!hasTurkishCategory) {
    console.log('❌ Turkish category missing in personnel edit page');
    return false;
  }
  
  if (!hasRemovedEnglishCategory) {
    console.log('❌ English category not removed from personnel edit page');
    return false;
  }
  
  console.log('✅ Personnel edit page Turkish paths correct');
  return true;
}

function testExecutivesFormPaths() {
  console.log('\nTest 4: Checking executives form Turkish paths...');
  
  const executivesFormPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page.tsx');
  
  if (!fs.existsSync(executivesFormPath)) {
    console.log('❌ Executives form page not found');
    return false;
  }
  
  const content = fs.readFileSync(executivesFormPath, 'utf8');
  
  // Check for Turkish defaultCategory
  const hasTurkishDefaultCategory = content.includes('defaultCategory="kurumsal-images"');
  
  // Check that English defaultCategory is removed
  const hasRemovedEnglishDefaultCategory = !content.includes('defaultCategory="corporate-images"');
  
  // Check for Turkish customFolder (should already be correct)
  const hasTurkishCustomFolder = content.includes('customFolder="media/kurumsal"');
  
  if (!hasTurkishDefaultCategory) {
    console.log('❌ Turkish defaultCategory missing in executives form');
    return false;
  }
  
  if (!hasRemovedEnglishDefaultCategory) {
    console.log('❌ English defaultCategory not removed from executives form');
    return false;
  }
  
  if (!hasTurkishCustomFolder) {
    console.log('❌ Turkish customFolder missing in executives form');
    return false;
  }
  
  console.log('✅ Executives form Turkish paths correct');
  return true;
}

function testExecutivesBackupFormPaths() {
  console.log('\nTest 5: Checking executives backup form Turkish paths...');
  
  const backupFormPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page_backup_20250122.tsx');
  
  if (!fs.existsSync(backupFormPath)) {
    console.log('❌ Executives backup form page not found');
    return false;
  }
  
  const content = fs.readFileSync(backupFormPath, 'utf8');
  
  // Check for Turkish defaultCategory
  const hasTurkishDefaultCategory = content.includes('defaultCategory="kurumsal-images"');
  
  // Check that English defaultCategory is removed
  const hasRemovedEnglishDefaultCategory = !content.includes('defaultCategory="corporate-images"');
  
  if (!hasTurkishDefaultCategory) {
    console.log('❌ Turkish defaultCategory missing in executives backup form');
    return false;
  }
  
  if (!hasRemovedEnglishDefaultCategory) {
    console.log('❌ English defaultCategory not removed from executives backup form');
    return false;
  }
  
  console.log('✅ Executives backup form Turkish paths correct');
  return true;
}

function testFolderPathConsistency() {
  console.log('\nTest 6: Checking folder path consistency...');
  
  const filesToCheck = [
    '../components/media/EnhancedCVUploader.tsx',
    '../app/dashboard/corporate/departments/new-personnel/page.tsx',
    '../app/dashboard/corporate/personnel/[id]/edit/page.tsx',
    '../app/dashboard/corporate/executives/form/page.tsx',
    '../app/dashboard/corporate/executives/form/page_backup_20250122.tsx'
  ];
  
  let allConsistent = true;
  
  for (const filePath of filesToCheck) {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      allConsistent = false;
      continue;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for any remaining English paths (excluding navigation URLs)
    const hasEnglishPaths = content.includes('corporate-images') ||
                           content.includes('defaultCategory="corporate') ||
                           content.includes('customFolder="corporate') ||
                           (content.includes('corporate/departments') &&
                            !content.includes('href="/dashboard/corporate') &&
                            !content.includes("router.push('/dashboard/corporate") &&
                            !content.includes('href: `/dashboard/corporate'));
    
    if (hasEnglishPaths) {
      console.log(`❌ English paths found in: ${filePath}`);
      // Debug: Show what English paths were found
      if (content.includes('corporate/departments') &&
          !content.includes('href="/dashboard/corporate/departments') &&
          !content.includes("router.push('/dashboard/corporate/departments')")) {
        console.log('   - Found: corporate/departments (not in navigation)');
      }
      if (content.includes('corporate-images')) {
        console.log('   - Found: corporate-images');
      }
      if (content.includes('defaultCategory="corporate')) {
        console.log('   - Found: defaultCategory="corporate');
      }
      if (content.includes('customFolder="corporate')) {
        console.log('   - Found: customFolder="corporate');
      }
      allConsistent = false;
    }
  }
  
  if (!allConsistent) {
    return false;
  }
  
  console.log('✅ All folder paths consistent with Turkish naming');
  return true;
}

function testCorrectTurkishPaths() {
  console.log('\nTest 7: Verifying correct Turkish paths usage...');
  
  const expectedPaths = {
    'kurumsal/birimler': 'CV upload category path',
    'kurumsal-images': 'Default category for corporate images',
    'media/kurumsal': 'Custom folder for corporate media'
  };
  
  const filesToCheck = [
    '../components/media/EnhancedCVUploader.tsx',
    '../app/dashboard/corporate/departments/new-personnel/page.tsx',
    '../app/dashboard/corporate/personnel/[id]/edit/page.tsx',
    '../app/dashboard/corporate/executives/form/page.tsx'
  ];
  
  let allPathsFound = true;
  
  for (const [expectedPath, description] of Object.entries(expectedPaths)) {
    let pathFound = false;
    
    for (const filePath of filesToCheck) {
      const fullPath = path.join(__dirname, filePath);
      
      if (!fs.existsSync(fullPath)) continue;
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes(expectedPath)) {
        pathFound = true;
        break;
      }
    }
    
    if (!pathFound) {
      console.log(`❌ Turkish path not found: ${expectedPath} (${description})`);
      allPathsFound = false;
    }
  }
  
  if (!allPathsFound) {
    return false;
  }
  
  console.log('✅ All correct Turkish paths found');
  return true;
}

function runTurkishFolderPathsTests() {
  console.log('🧪 TURKISH FOLDER PATHS VERIFICATION');
  console.log('===================================\n');
  
  const tests = [
    testEnhancedCVUploaderPaths,
    testNewPersonnelPagePaths,
    testPersonnelEditPagePaths,
    testExecutivesFormPaths,
    testExecutivesBackupFormPaths,
    testFolderPathConsistency,
    testCorrectTurkishPaths
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
    console.log('\n🎉 SUCCESS! Turkish folder paths implementation completed!');
    console.log('\n📝 Changes implemented:');
    console.log('   ✅ Enhanced CV Uploader: Updated to use "kurumsal/birimler" and "kurumsal-images"');
    console.log('   ✅ New Personnel Page: Updated category to "kurumsal/birimler"');
    console.log('   ✅ Personnel Edit Page: Updated category to "kurumsal/birimler"');
    console.log('   ✅ Executives Form: Updated defaultCategory to "kurumsal-images"');
    console.log('   ✅ Executives Backup Form: Updated defaultCategory to "kurumsal-images"');
    console.log('   ✅ All English paths removed');
    console.log('   ✅ Consistent Turkish naming throughout system');
    console.log('\n🎯 Folder structure now uses:');
    console.log('   • CV uploads: /media/kurumsal/birimler/');
    console.log('   • Corporate images: kurumsal-images category');
    console.log('   • Custom folder: media/kurumsal');
    console.log('\n🔧 Technical improvements:');
    console.log('   • Consistent Turkish naming conventions');
    console.log('   • Proper folder categorization');
    console.log('   • No English path remnants');
    console.log('   • Unified media organization');
    console.log('\n✨ All media paths now use correct Turkish folder structure!');
    console.log('\n🔍 Folder paths in use:');
    console.log('   1. CV uploads → /media/kurumsal/birimler/');
    console.log('   2. Corporate images → kurumsal-images category');
    console.log('   3. Executive photos → media/kurumsal folder');
    console.log('   4. Department images → kurumsal category');
  } else {
    console.log('\n❌ Some tests failed. Turkish folder paths implementation may be incomplete.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runTurkishFolderPathsTests();
}

module.exports = { runTurkishFolderPathsTests };
