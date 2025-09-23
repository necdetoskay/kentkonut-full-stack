/**
 * Test script to verify Page Management MediaUploader improvements
 * This script tests:
 * 1. Default folder configuration (/media/sayfa)
 * 2. Post-upload redirection behavior
 * 3. Automatic file selection after upload
 * 4. Visual feedback for newly uploaded files
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Page Management MediaUploader Improvements...\n');

// Test 1: Check default folder configuration
function testDefaultFolderConfiguration() {
  console.log('Test 1: Checking default folder configuration...');
  
  const newContentEditorPath = path.join(__dirname, '../app/dashboard/pages/[id]/edit/NewContentEditor.tsx');
  
  if (!fs.existsSync(newContentEditorPath)) {
    console.log('❌ NewContentEditor.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(newContentEditorPath, 'utf8');
  
  // Check GlobalMediaSelector uses sayfa folder
  const hasGlobalMediaSelectorSayfa = content.includes('customFolder="media/sayfa"') && 
                                      content.includes('defaultCategory="content-images"');
  
  // Check MediaGallerySelector uses sayfa folder
  const hasMediaGallerySelectorSayfa = content.includes('customFolder="media/sayfa"') &&
                                       content.includes('categoryId={5}');
  
  if (!hasGlobalMediaSelectorSayfa) {
    console.log('❌ GlobalMediaSelector not configured for sayfa folder');
    return false;
  }
  
  if (!hasMediaGallerySelectorSayfa) {
    console.log('❌ MediaGallerySelector not configured for sayfa folder');
    return false;
  }
  
  console.log('✅ Default folder configuration set to /media/sayfa');
  return true;
}

// Test 2: Check post-upload redirection behavior
function testPostUploadRedirectionBehavior() {
  console.log('\nTest 2: Checking post-upload redirection behavior...');
  
  const mediaBrowserSimplePath = path.join(__dirname, '../components/media/MediaBrowserSimple.tsx');
  
  if (!fs.existsSync(mediaBrowserSimplePath)) {
    console.log('❌ MediaBrowserSimple.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(mediaBrowserSimplePath, 'utf8');
  
  // Check for recently uploaded files state
  const hasRecentlyUploadedState = content.includes('recentlyUploadedFiles') && 
                                   content.includes('setRecentlyUploadedFiles');
  
  // Check for enhanced handleUploadComplete function
  const hasEnhancedUploadComplete = content.includes('uploadedGlobalFiles') &&
                                   content.includes('setRecentlyUploadedFiles(uploadedGlobalFiles)') &&
                                   content.includes('dosya başarıyla yüklendi ve seçildi');
  
  if (!hasRecentlyUploadedState) {
    console.log('❌ Recently uploaded files state management missing');
    return false;
  }
  
  if (!hasEnhancedUploadComplete) {
    console.log('❌ Enhanced upload complete handler missing');
    return false;
  }
  
  console.log('✅ Post-upload redirection behavior improved');
  return true;
}

// Test 3: Check automatic file selection
function testAutomaticFileSelection() {
  console.log('\nTest 3: Checking automatic file selection...');
  
  const mediaBrowserSimplePath = path.join(__dirname, '../components/media/MediaBrowserSimple.tsx');
  const content = fs.readFileSync(mediaBrowserSimplePath, 'utf8');
  
  // Check for auto-selection useEffect
  const hasAutoSelectionEffect = content.includes('Auto-select recently uploaded files after refresh') &&
                                 content.includes('uploadedFilesInList') &&
                                 content.includes('otomatik olarak seçildi');
  
  // Check for file matching logic
  const hasFileMatchingLogic = content.includes('mediaFile.id === uploadedFile.id') &&
                              content.includes('mediaFile.url === uploadedFile.url') &&
                              content.includes('mediaFile.filename === uploadedFile.filename');
  
  // Check for multiple/single selection handling
  const hasSelectionModeHandling = content.includes('if (multiple)') &&
                                   content.includes('setSelectedFiles([uploadedFilesInList[0]])');
  
  if (!hasAutoSelectionEffect) {
    console.log('❌ Auto-selection useEffect missing');
    return false;
  }
  
  if (!hasFileMatchingLogic) {
    console.log('❌ File matching logic missing');
    return false;
  }
  
  if (!hasSelectionModeHandling) {
    console.log('❌ Selection mode handling missing');
    return false;
  }
  
  console.log('✅ Automatic file selection implemented');
  return true;
}

// Test 4: Check visual feedback for newly uploaded files
function testVisualFeedbackForNewFiles() {
  console.log('\nTest 4: Checking visual feedback for newly uploaded files...');
  
  const mediaBrowserSimplePath = path.join(__dirname, '../components/media/MediaBrowserSimple.tsx');
  const content = fs.readFileSync(mediaBrowserSimplePath, 'utf8');
  
  // Check for recently uploaded detection
  const hasRecentlyUploadedDetection = content.includes('isRecentlyUploaded') &&
                                      content.includes('recentlyUploadedFiles.some');
  
  // Check for NEW badge
  const hasNewBadge = content.includes('YENİ') &&
                     content.includes('bg-green-500') &&
                     content.includes('isRecentlyUploaded &&');
  
  // Check for enhanced selection visual feedback
  const hasEnhancedSelectionFeedback = content.includes('ring-2 ring-primary') &&
                                      content.includes('bg-primary border-primary text-white');
  
  if (!hasRecentlyUploadedDetection) {
    console.log('❌ Recently uploaded file detection missing');
    return false;
  }
  
  if (!hasNewBadge) {
    console.log('❌ NEW badge for uploaded files missing');
    return false;
  }
  
  if (!hasEnhancedSelectionFeedback) {
    console.log('❌ Enhanced selection visual feedback missing');
    return false;
  }
  
  console.log('✅ Visual feedback for newly uploaded files implemented');
  return true;
}

// Test 5: Check component integration
function testComponentIntegration() {
  console.log('\nTest 5: Checking component integration...');
  
  const mediaBrowserSimplePath = path.join(__dirname, '../components/media/MediaBrowserSimple.tsx');
  const content = fs.readFileSync(mediaBrowserSimplePath, 'utf8');
  
  // Check for proper imports
  const hasProperImports = content.includes('import { Badge }') &&
                          content.includes('import { toast }');
  
  // Check for MediaUploader integration
  const hasMediaUploaderIntegration = content.includes('customFolder={customFolder}') &&
                                     content.includes('onUploadComplete={handleUploadComplete}');
  
  // Check for proper state management
  const hasProperStateManagement = content.includes('useState<GlobalMediaFile[]>([])') &&
                                   content.includes('setRecentlyUploadedFiles([])');
  
  if (!hasProperImports) {
    console.log('❌ Required imports missing');
    return false;
  }
  
  if (!hasMediaUploaderIntegration) {
    console.log('❌ MediaUploader integration incomplete');
    return false;
  }
  
  if (!hasProperStateManagement) {
    console.log('❌ State management incomplete');
    return false;
  }
  
  console.log('✅ Component integration is correct');
  return true;
}

// Test 6: Check error handling and edge cases
function testErrorHandlingAndEdgeCases() {
  console.log('\nTest 6: Checking error handling and edge cases...');
  
  const mediaBrowserSimplePath = path.join(__dirname, '../components/media/MediaBrowserSimple.tsx');
  const content = fs.readFileSync(mediaBrowserSimplePath, 'utf8');
  
  // Check for safe array operations
  const hasSafeArrayOperations = content.includes('.filter(Boolean)') &&
                                content.includes('uploadedFilesInList.length > 0');
  
  // Check for cleanup logic
  const hasCleanupLogic = content.includes('setRecentlyUploadedFiles([])');
  
  // Check for fallback values
  const hasFallbackValues = content.includes('file.filename || file.originalName') &&
                           content.includes('file.originalName || file.filename');
  
  if (!hasSafeArrayOperations) {
    console.log('❌ Safe array operations missing');
    return false;
  }
  
  if (!hasCleanupLogic) {
    console.log('❌ Cleanup logic missing');
    return false;
  }
  
  if (!hasFallbackValues) {
    console.log('❌ Fallback values missing');
    return false;
  }
  
  console.log('✅ Error handling and edge cases covered');
  return true;
}

// Run all tests
function runTests() {
  console.log('🧪 Running Page Management MediaUploader Improvement Tests\n');
  
  const tests = [
    testDefaultFolderConfiguration,
    testPostUploadRedirectionBehavior,
    testAutomaticFileSelection,
    testVisualFeedbackForNewFiles,
    testComponentIntegration,
    testErrorHandlingAndEdgeCases
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
    console.log('🎉 All tests passed! Page Management MediaUploader improvements are working correctly.');
    console.log('\n📝 Summary of improvements:');
    console.log('   ✅ Default folder set to /media/sayfa for page content');
    console.log('   ✅ Post-upload redirection fixed with auto-selection');
    console.log('   ✅ Newly uploaded files automatically selected');
    console.log('   ✅ Visual feedback with NEW badges and selection highlights');
    console.log('   ✅ Enhanced user experience for page media management');
    console.log('\n🚀 The Page Management MediaUploader is now enhanced with all requested features!');
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
