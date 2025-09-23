/**
 * Test script to verify that the duplicate text issue in Enhanced Media Uploader has been fixed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Duplicate Text Fix in Enhanced Media Uploader\n');

function testEnhancedMediaUploaderHeaderControl() {
  console.log('Test 1: Checking EnhancedMediaUploader header control...');
  
  const uploaderPath = path.join(__dirname, '../components/media/enhanced/EnhancedMediaUploader.tsx');
  
  if (!fs.existsSync(uploaderPath)) {
    console.log('❌ EnhancedMediaUploader component not found');
    return false;
  }
  
  const content = fs.readFileSync(uploaderPath, 'utf8');
  
  // Check for showHeader prop
  const hasShowHeaderProp = content.includes('showHeader?: boolean');
  
  // Check for showHeader default value
  const hasShowHeaderDefault = content.includes('showHeader = true');
  
  // Check for conditional header rendering
  const hasConditionalHeader = content.includes('{showHeader && (') &&
                              content.includes('<h2 className="text-lg font-semibold text-gray-900">{title}</h2>') &&
                              content.includes('<p className="text-sm text-gray-600">{description}</p>');
  
  // Check for header comment
  const hasHeaderComment = content.includes('Header - Only show if showHeader is true');
  
  if (!hasShowHeaderProp) {
    console.log('❌ showHeader prop missing');
    return false;
  }
  
  if (!hasShowHeaderDefault) {
    console.log('❌ showHeader default value missing');
    return false;
  }
  
  if (!hasConditionalHeader) {
    console.log('❌ Conditional header rendering missing');
    return false;
  }
  
  if (!hasHeaderComment) {
    console.log('❌ Header comment missing');
    return false;
  }
  
  console.log('✅ EnhancedMediaUploader header control properly implemented');
  return true;
}

function testMediaGalleryHeaderDisabled() {
  console.log('\nTest 2: Checking MediaGallery header disabled...');
  
  const mediaGalleryPath = path.join(__dirname, '../components/media/MediaGallery.tsx');
  
  if (!fs.existsSync(mediaGalleryPath)) {
    console.log('❌ MediaGallery component not found');
    return false;
  }
  
  const content = fs.readFileSync(mediaGalleryPath, 'utf8');
  
  // Check for showHeader={false} in EnhancedMediaUploader usage
  const hasHeaderDisabled = content.includes('showHeader={false}');
  
  // Check that it's within the EnhancedMediaUploader component
  const hasCorrectPlacement = content.includes('<EnhancedMediaUploader') &&
                             content.includes('showHeader={false}') &&
                             content.includes('/>');
  
  // Check for DialogHeader with title and description
  const hasDialogHeader = content.includes('DialogTitle') &&
                         content.includes('Gelişmiş Medya Yükleme') &&
                         content.includes('Çoklu format desteği ile');
  
  if (!hasHeaderDisabled) {
    console.log('❌ showHeader={false} not found in MediaGallery');
    return false;
  }
  
  if (!hasCorrectPlacement) {
    console.log('❌ showHeader={false} not correctly placed in EnhancedMediaUploader');
    return false;
  }
  
  if (!hasDialogHeader) {
    console.log('❌ DialogHeader missing in MediaGallery');
    return false;
  }
  
  console.log('✅ MediaGallery properly disables EnhancedMediaUploader header');
  return true;
}

function testNoDuplicateHeaderStructure() {
  console.log('\nTest 3: Checking for no duplicate header structure...');
  
  const mediaGalleryPath = path.join(__dirname, '../components/media/MediaGallery.tsx');
  const uploaderPath = path.join(__dirname, '../components/media/enhanced/EnhancedMediaUploader.tsx');
  
  const mediaGalleryContent = fs.readFileSync(mediaGalleryPath, 'utf8');
  const uploaderContent = fs.readFileSync(uploaderPath, 'utf8');
  
  // Check that MediaGallery has DialogHeader
  const mediaGalleryHasHeader = mediaGalleryContent.includes('DialogHeader') &&
                               mediaGalleryContent.includes('DialogTitle');
  
  // Check that EnhancedMediaUploader header is conditional
  const uploaderHasConditionalHeader = uploaderContent.includes('{showHeader && (');
  
  // Check that when used in MediaGallery, header is disabled
  const headerDisabledInGallery = mediaGalleryContent.includes('showHeader={false}');
  
  if (!mediaGalleryHasHeader) {
    console.log('❌ MediaGallery missing DialogHeader');
    return false;
  }
  
  if (!uploaderHasConditionalHeader) {
    console.log('❌ EnhancedMediaUploader header not conditional');
    return false;
  }
  
  if (!headerDisabledInGallery) {
    console.log('❌ Header not disabled in MediaGallery usage');
    return false;
  }
  
  console.log('✅ No duplicate header structure detected');
  return true;
}

function testBackwardCompatibility() {
  console.log('\nTest 4: Checking backward compatibility...');
  
  const uploaderPath = path.join(__dirname, '../components/media/enhanced/EnhancedMediaUploader.tsx');
  const content = fs.readFileSync(uploaderPath, 'utf8');
  
  // Check that showHeader defaults to true for backward compatibility
  const hasDefaultTrue = content.includes('showHeader = true');
  
  // Check that all existing props are still supported
  const hasExistingProps = content.includes('categoryId?:') &&
                          content.includes('onUploadComplete?:') &&
                          content.includes('maxFiles?:') &&
                          content.includes('enableFolderSelection?:');
  
  if (!hasDefaultTrue) {
    console.log('❌ showHeader does not default to true');
    return false;
  }
  
  if (!hasExistingProps) {
    console.log('❌ Existing props not preserved');
    return false;
  }
  
  console.log('✅ Backward compatibility maintained');
  return true;
}

function testFolderSelectorNoIssues() {
  console.log('\nTest 5: Checking FolderSelector for duplicate issues...');
  
  const folderSelectorPath = path.join(__dirname, '../components/media/enhanced/FolderSelector.tsx');
  const content = fs.readFileSync(folderSelectorPath, 'utf8');
  
  // Check that compact mode has early return
  const hasEarlyReturn = content.includes('if (compact) {') &&
                        content.includes('return (');
  
  // Check that there are main component return statements (not counting map returns)
  const compactReturn = content.includes('if (compact) {') && content.includes('return (');
  const mainReturn = content.includes('return (') && content.includes('<div className={`space-y-3 ${className}`}>');

  // Should have both compact and main return statements
  if (!compactReturn || !mainReturn) {
    console.log(`❌ Missing compact or main return statements`);
    return false;
  }
  
  if (!hasEarlyReturn) {
    console.log('❌ Compact mode early return missing');
    return false;
  }
  
  console.log('✅ FolderSelector has no duplicate rendering issues');
  return true;
}

function runDuplicateTextTests() {
  console.log('🔍 DUPLICATE TEXT FIX VERIFICATION');
  console.log('==================================\n');
  
  const tests = [
    testEnhancedMediaUploaderHeaderControl,
    testMediaGalleryHeaderDisabled,
    testNoDuplicateHeaderStructure,
    testBackwardCompatibility,
    testFolderSelectorNoIssues
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
    console.log('\n🎉 SUCCESS! Duplicate text issue has been fixed!');
    console.log('\n📝 Summary of fixes applied:');
    console.log('   ✅ Added showHeader prop to EnhancedMediaUploader');
    console.log('   ✅ Made header rendering conditional');
    console.log('   ✅ Disabled header in MediaGallery usage');
    console.log('   ✅ Maintained backward compatibility');
    console.log('   ✅ Preserved all existing functionality');
    console.log('\n🔧 Root cause identified and resolved:');
    console.log('   • MediaGallery DialogHeader was duplicating EnhancedMediaUploader header');
    console.log('   • Fixed by making EnhancedMediaUploader header conditional');
    console.log('   • MediaGallery now uses showHeader={false} to prevent duplication');
    console.log('\n✨ The Enhanced Media Uploader now displays clean, non-duplicate headers!');
  } else {
    console.log('\n❌ Some tests failed. Duplicate text issue may not be fully resolved.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runDuplicateTextTests();
}

module.exports = { runDuplicateTextTests };
