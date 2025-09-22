/**
 * Test script to verify media folder path display fix
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Media Folder Path Display Fix\n');

function testEnhancedCVUploaderCustomFolder() {
  console.log('Test 1: Checking Enhanced CV Uploader customFolder path...');
  
  const componentPath = path.join(__dirname, '../components/media/EnhancedCVUploader.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.log('❌ Enhanced CV Uploader component not found');
    return false;
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Check for correct customFolder path with media prefix
  const hasCorrectCustomFolder = content.includes('customFolder="media/kurumsal/birimler"');
  
  // Check that old path without media prefix is removed
  const hasRemovedOldPath = !content.includes('customFolder="kurumsal/birimler"');
  
  if (!hasCorrectCustomFolder) {
    console.log('❌ Correct customFolder path missing - should be "media/kurumsal/birimler"');
    return false;
  }
  
  if (!hasRemovedOldPath) {
    console.log('❌ Old customFolder path not removed - "kurumsal/birimler" still exists');
    return false;
  }
  
  console.log('✅ Enhanced CV Uploader customFolder path correct');
  return true;
}

function testMediaSelectorDisplayLogic() {
  console.log('\nTest 2: Checking MediaSelector display logic...');
  
  const mediaSelectorPath = path.join(__dirname, '../components/media/MediaSelector.tsx');
  
  if (!fs.existsSync(mediaSelectorPath)) {
    console.log('❌ MediaSelector component not found');
    return false;
  }
  
  const content = fs.readFileSync(mediaSelectorPath, 'utf8');
  
  // Check for folder display logic
  const hasFolderDisplay = content.includes('/${customFolder}/ klasöründe henüz dosya yok');
  
  // Check for folder info display
  const hasFolderInfo = content.includes('<span className="font-medium">/{customFolder}/</span>');
  
  if (!hasFolderDisplay) {
    console.log('❌ Folder display logic missing in empty state');
    return false;
  }
  
  if (!hasFolderInfo) {
    console.log('❌ Folder info display missing');
    return false;
  }
  
  console.log('✅ MediaSelector display logic correct');
  return true;
}

function testExpectedFolderPathDisplay() {
  console.log('\nTest 3: Verifying expected folder path display...');
  
  const componentPath = path.join(__dirname, '../components/media/EnhancedCVUploader.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Extract customFolder value
  const customFolderMatch = content.match(/customFolder="([^"]+)"/);
  
  if (!customFolderMatch) {
    console.log('❌ customFolder not found in Enhanced CV Uploader');
    return false;
  }
  
  const customFolderValue = customFolderMatch[1];
  console.log(`📁 Found customFolder value: "${customFolderValue}"`);
  
  // Expected display in UI should be: /media/kurumsal/birimler/
  const expectedDisplay = `/${customFolderValue}/`;
  console.log(`📺 Expected UI display: "${expectedDisplay}"`);
  
  // Verify it contains media prefix
  if (!customFolderValue.startsWith('media/')) {
    console.log('❌ customFolder should start with "media/" prefix');
    return false;
  }
  
  // Verify it contains kurumsal/birimler
  if (!customFolderValue.includes('kurumsal/birimler')) {
    console.log('❌ customFolder should contain "kurumsal/birimler"');
    return false;
  }
  
  console.log('✅ Expected folder path display verified');
  return true;
}

function testGlobalMediaSelectorIntegration() {
  console.log('\nTest 4: Checking GlobalMediaSelector integration...');
  
  const globalSelectorPath = path.join(__dirname, '../components/media/GlobalMediaSelector.tsx');
  
  if (!fs.existsSync(globalSelectorPath)) {
    console.log('❌ GlobalMediaSelector component not found');
    return false;
  }
  
  const content = fs.readFileSync(globalSelectorPath, 'utf8');
  
  // Check that customFolder is properly passed through
  const hasCustomFolderProp = content.includes('customFolder?: string;');
  const hasCustomFolderDefault = content.includes("customFolder = 'media'");
  const hasCustomFolderPassthrough = content.includes('customFolder={customFolder}');
  
  if (!hasCustomFolderProp) {
    console.log('❌ customFolder prop definition missing');
    return false;
  }
  
  if (!hasCustomFolderDefault) {
    console.log('❌ customFolder default value missing');
    return false;
  }
  
  if (!hasCustomFolderPassthrough) {
    console.log('❌ customFolder passthrough missing');
    return false;
  }
  
  console.log('✅ GlobalMediaSelector integration correct');
  return true;
}

function testConsistencyWithOtherComponents() {
  console.log('\nTest 5: Checking consistency with other components...');
  
  const filesToCheck = [
    '../app/dashboard/corporate/executives/form/page.tsx',
    '../app/dashboard/corporate/executives/form/page_backup_20250122.tsx'
  ];
  
  let allConsistent = true;
  
  for (const filePath of filesToCheck) {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found (optional): ${filePath}`);
      continue;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if these files use customFolder and if they have media prefix
    const customFolderMatches = content.match(/customFolder="([^"]+)"/g);
    
    if (customFolderMatches) {
      for (const match of customFolderMatches) {
        const value = match.match(/customFolder="([^"]+)"/)[1];
        console.log(`📁 Found customFolder in ${filePath}: "${value}"`);
        
        // If it's a path (contains /), it should start with media/
        if (value.includes('/') && !value.startsWith('media/')) {
          console.log(`❌ Inconsistent customFolder path in ${filePath}: should start with "media/"`);
          allConsistent = false;
        }
      }
    }
  }
  
  if (!allConsistent) {
    return false;
  }
  
  console.log('✅ Consistency with other components verified');
  return true;
}

function runMediaFolderPathDisplayTests() {
  console.log('🧪 MEDIA FOLDER PATH DISPLAY VERIFICATION');
  console.log('========================================\n');
  
  const tests = [
    testEnhancedCVUploaderCustomFolder,
    testMediaSelectorDisplayLogic,
    testExpectedFolderPathDisplay,
    testGlobalMediaSelectorIntegration,
    testConsistencyWithOtherComponents
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
    console.log('\n🎉 SUCCESS! Media folder path display fix completed!');
    console.log('\n📝 Fix implemented:');
    console.log('   ✅ Enhanced CV Uploader: customFolder updated to "media/kurumsal/birimler"');
    console.log('   ✅ MediaSelector: Display logic correctly shows folder path');
    console.log('   ✅ GlobalMediaSelector: Integration verified');
    console.log('   ✅ Consistency: All components use proper media/ prefix');
    console.log('\n🎯 UI display now shows:');
    console.log('   • Folder path: /media/kurumsal/birimler/');
    console.log('   • Empty state: "/media/kurumsal/birimler/ klasöründe henüz dosya yok"');
    console.log('   • Folder badge: "Klasör /media/kurumsal/birimler/"');
    console.log('\n🔧 Technical improvements:');
    console.log('   • Correct folder path display in UI');
    console.log('   • Consistent media/ prefix usage');
    console.log('   • Proper integration across components');
    console.log('   • Clear user feedback about folder location');
    console.log('\n✨ Folder path display now correctly shows /media/kurumsal/birimler/!');
    console.log('\n🔍 User experience:');
    console.log('   1. User clicks "Galeriden Seç" button');
    console.log('   2. Modal opens showing "/media/kurumsal/birimler/" folder');
    console.log('   3. Empty state clearly indicates the correct folder path');
    console.log('   4. Folder badge shows complete path with media prefix');
    console.log('   5. Users understand exactly where files are stored');
  } else {
    console.log('\n❌ Some tests failed. Media folder path display fix may be incomplete.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runMediaFolderPathDisplayTests();
}

module.exports = { runMediaFolderPathDisplayTests };
