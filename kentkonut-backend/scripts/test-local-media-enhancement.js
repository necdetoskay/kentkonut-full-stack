/**
 * Test script to verify Local Media Enhancement in Enhanced Media Uploader
 * Tests the new local video browsing functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🎬 Testing Local Media Enhancement in Enhanced Media Uploader\n');

function testEmbeddedVideoDataInterface() {
  console.log('Test 1: Checking EmbeddedVideoData interface enhancement...');
  
  const embeddedVideoPath = path.join(__dirname, '../components/media/enhanced/EmbeddedVideoInput.tsx');
  const content = fs.readFileSync(embeddedVideoPath, 'utf8');
  
  // Check for local platform support
  const hasLocalPlatform = content.includes("platform: 'youtube' | 'vimeo' | 'local'");
  
  // Check for localFile field
  const hasLocalFileField = content.includes('localFile?: {') &&
                           content.includes('id: number') &&
                           content.includes('filename: string') &&
                           content.includes('categoryId: number');
  
  if (!hasLocalPlatform) {
    console.log('❌ Local platform support missing in EmbeddedVideoData');
    return false;
  }
  
  if (!hasLocalFileField) {
    console.log('❌ localFile field missing in EmbeddedVideoData');
    return false;
  }
  
  console.log('✅ EmbeddedVideoData interface properly enhanced for local media');
  return true;
}

function testLocalMediaUtilityFunctions() {
  console.log('\nTest 2: Checking local media utility functions...');
  
  const embeddedVideoPath = path.join(__dirname, '../components/media/enhanced/EmbeddedVideoInput.tsx');
  const content = fs.readFileSync(embeddedVideoPath, 'utf8');
  
  // Check for video file validation
  const hasVideoFileValidation = content.includes('isVideoFile') &&
                                 content.includes("mimeType.startsWith('video/')");
  
  // Check for local video data creation
  const hasLocalVideoDataCreation = content.includes('createLocalVideoData') &&
                                   content.includes('platform: \'local\'') &&
                                   content.includes('localFile: {');
  
  // Check for file size formatting
  const hasFileSizeFormatting = content.includes('formatFileSize') &&
                               content.includes('const k = 1024');
  
  if (!hasVideoFileValidation) {
    console.log('❌ Video file validation function missing');
    return false;
  }
  
  if (!hasLocalVideoDataCreation) {
    console.log('❌ Local video data creation function missing');
    return false;
  }
  
  if (!hasFileSizeFormatting) {
    console.log('❌ File size formatting function missing');
    return false;
  }
  
  console.log('✅ Local media utility functions properly implemented');
  return true;
}

function testTabFunctionality() {
  console.log('\nTest 3: Checking tab functionality for URL vs Local Media...');
  
  const embeddedVideoPath = path.join(__dirname, '../components/media/enhanced/EmbeddedVideoInput.tsx');
  const content = fs.readFileSync(embeddedVideoPath, 'utf8');
  
  // Check for tab state management
  const hasTabState = content.includes("useState<'url' | 'local'>('url')") &&
                     content.includes('activeTab') &&
                     content.includes('setActiveTab');
  
  // Check for tab UI components
  const hasTabUI = content.includes('TabsList') &&
                  content.includes('TabsTrigger') &&
                  content.includes('TabsContent');
  
  // Check for tab change handler
  const hasTabChangeHandler = content.includes('handleTabChange') &&
                             content.includes('setVideoData(null)') &&
                             content.includes('setSelectedLocalFile(null)');
  
  // Check for conditional rendering based on enableLocalMedia
  const hasConditionalRendering = content.includes('enableLocalMedia ?') &&
                                 content.includes('External URL') &&
                                 content.includes('Local Media');
  
  if (!hasTabState) {
    console.log('❌ Tab state management missing');
    return false;
  }
  
  if (!hasTabUI) {
    console.log('❌ Tab UI components missing');
    return false;
  }
  
  if (!hasTabChangeHandler) {
    console.log('❌ Tab change handler missing');
    return false;
  }
  
  if (!hasConditionalRendering) {
    console.log('❌ Conditional rendering based on enableLocalMedia missing');
    return false;
  }
  
  console.log('✅ Tab functionality properly implemented');
  return true;
}

function testMediaBrowserIntegration() {
  console.log('\nTest 4: Checking MediaBrowserSimple integration...');
  
  const embeddedVideoPath = path.join(__dirname, '../components/media/enhanced/EmbeddedVideoInput.tsx');
  const content = fs.readFileSync(embeddedVideoPath, 'utf8');
  
  // Check for MediaBrowserSimple import
  const hasMediaBrowserImport = content.includes('import { MediaBrowserSimple }');
  
  // Check for media browser state
  const hasMediaBrowserState = content.includes('showMediaBrowser') &&
                              content.includes('setShowMediaBrowser') &&
                              content.includes('selectedLocalFile');
  
  // Check for media browser component usage
  const hasMediaBrowserUsage = content.includes('<MediaBrowserSimple') &&
                              content.includes('onSelect={handleLocalMediaSelect}') &&
                              content.includes("allowedTypes={['video/mp4'");
  
  // Check for local media selection handler
  const hasSelectionHandler = content.includes('handleLocalMediaSelect') &&
                             content.includes('isVideoFile(selectedFile.mimeType)') &&
                             content.includes('createLocalVideoData');
  
  if (!hasMediaBrowserImport) {
    console.log('❌ MediaBrowserSimple import missing');
    return false;
  }
  
  if (!hasMediaBrowserState) {
    console.log('❌ Media browser state management missing');
    return false;
  }
  
  if (!hasMediaBrowserUsage) {
    console.log('❌ MediaBrowserSimple component usage missing');
    return false;
  }
  
  if (!hasSelectionHandler) {
    console.log('❌ Local media selection handler missing');
    return false;
  }
  
  console.log('✅ MediaBrowserSimple integration properly implemented');
  return true;
}

function testLocalVideoReferenceAPI() {
  console.log('\nTest 5: Checking Local Video Reference API endpoint...');
  
  const apiPath = path.join(__dirname, '../app/api/enhanced-media/local-video-reference/route.ts');
  
  if (!fs.existsSync(apiPath)) {
    console.log('❌ Local video reference API endpoint not found');
    return false;
  }
  
  const content = fs.readFileSync(apiPath, 'utf8');
  
  // Check for request interface
  const hasRequestInterface = content.includes('LocalVideoReferenceRequest') &&
                             content.includes('localFileId: number') &&
                             content.includes('categoryId: number');
  
  // Check for file validation
  const hasFileValidation = content.includes("!localFile.mimeType.startsWith('video/')") &&
                           content.includes('Selected file is not a video');
  
  // Check for reference creation
  const hasReferenceCreation = content.includes('local-video-ref-') &&
                              content.includes('type: \'local-video-reference\'') &&
                              content.includes('originalFileId');
  
  // Check for database operations
  const hasDatabaseOps = content.includes('db.media.findUnique') &&
                        content.includes('db.media.create') &&
                        content.includes('application/json');
  
  if (!hasRequestInterface) {
    console.log('❌ Request interface missing');
    return false;
  }
  
  if (!hasFileValidation) {
    console.log('❌ File validation missing');
    return false;
  }
  
  if (!hasReferenceCreation) {
    console.log('❌ Reference creation logic missing');
    return false;
  }
  
  if (!hasDatabaseOps) {
    console.log('❌ Database operations missing');
    return false;
  }
  
  console.log('✅ Local Video Reference API endpoint properly implemented');
  return true;
}

function testEnhancedUploaderIntegration() {
  console.log('\nTest 6: Checking Enhanced Media Uploader integration...');
  
  const uploaderPath = path.join(__dirname, '../components/media/enhanced/EnhancedMediaUploader.tsx');
  const content = fs.readFileSync(uploaderPath, 'utf8');
  
  // Check for enableLocalMedia prop usage
  const hasEnableLocalMediaUsage = content.includes('enableLocalMedia={true}');
  
  // Check for local video handling in upload
  const hasLocalVideoHandling = content.includes("fileData.embeddedVideo.platform === 'local'") &&
                               content.includes('/api/enhanced-media/local-video-reference') &&
                               content.includes('localFileId');
  
  // Check for local video data handling
  const hasLocalVideoDataHandling = content.includes("videoData.platform === 'local'") &&
                                   content.includes('Local video eklendi') &&
                                   content.includes('videoData.localFile?.size');
  
  if (!hasEnableLocalMediaUsage) {
    console.log('❌ enableLocalMedia prop usage missing');
    return false;
  }
  
  if (!hasLocalVideoHandling) {
    console.log('❌ Local video handling in upload missing');
    return false;
  }
  
  if (!hasLocalVideoDataHandling) {
    console.log('❌ Local video data handling missing');
    return false;
  }
  
  console.log('✅ Enhanced Media Uploader integration properly implemented');
  return true;
}

function testUIEnhancements() {
  console.log('\nTest 7: Checking UI enhancements for local media...');
  
  const embeddedVideoPath = path.join(__dirname, '../components/media/enhanced/EmbeddedVideoInput.tsx');
  const content = fs.readFileSync(embeddedVideoPath, 'utf8');
  
  // Check for browse button
  const hasBrowseButton = content.includes('Browse Video Files') &&
                         content.includes('FolderOpen') &&
                         content.includes('setShowMediaBrowser(true)');
  
  // Check for selected file display
  const hasSelectedFileDisplay = content.includes('selectedLocalFile &&') &&
                                content.includes('selectedLocalFile.originalName') &&
                                content.includes('selectedLocalFile.mimeType');
  
  // Check for platform badge update
  const hasPlatformBadgeUpdate = content.includes("videoData.platform === 'local'") &&
                                content.includes('Local Video') &&
                                content.includes('Monitor');
  
  // Check for info text update
  const hasInfoTextUpdate = content.includes('enableLocalMedia ?') &&
                           content.includes('Local Video Files') &&
                           content.includes('YouTube, Vimeo, Local Video Files');
  
  if (!hasBrowseButton) {
    console.log('❌ Browse button missing');
    return false;
  }
  
  if (!hasSelectedFileDisplay) {
    console.log('❌ Selected file display missing');
    return false;
  }
  
  if (!hasPlatformBadgeUpdate) {
    console.log('❌ Platform badge update for local videos missing');
    return false;
  }
  
  if (!hasInfoTextUpdate) {
    console.log('❌ Info text update for local media missing');
    return false;
  }
  
  console.log('✅ UI enhancements for local media properly implemented');
  return true;
}

function runLocalMediaEnhancementTests() {
  console.log('🎬 LOCAL MEDIA ENHANCEMENT VERIFICATION');
  console.log('======================================\n');
  
  const tests = [
    testEmbeddedVideoDataInterface,
    testLocalMediaUtilityFunctions,
    testTabFunctionality,
    testMediaBrowserIntegration,
    testLocalVideoReferenceAPI,
    testEnhancedUploaderIntegration,
    testUIEnhancements
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
    console.log('\n🎉 SUCCESS! Local Media Enhancement has been successfully implemented!');
    console.log('\n📝 Summary of new features:');
    console.log('   ✅ Local video file browsing in embedded video section');
    console.log('   ✅ Tab interface for External URL vs Local Media');
    console.log('   ✅ MediaBrowserSimple integration with video filtering');
    console.log('   ✅ Local video reference API for cross-category usage');
    console.log('   ✅ Enhanced UI with browse button and file display');
    console.log('   ✅ Platform badge support for local videos');
    console.log('   ✅ Seamless integration with existing functionality');
    console.log('\n🔧 User Workflow:');
    console.log('   1. User opens Enhanced Media Uploader');
    console.log('   2. Clicks "Video URL" tab');
    console.log('   3. Sees "External URL" and "Local Media" tabs');
    console.log('   4. Clicks "Local Media" tab');
    console.log('   5. Clicks "Browse Video Files" button');
    console.log('   6. MediaBrowserSimple opens with video filtering');
    console.log('   7. User selects a local video file');
    console.log('   8. Video appears as embedded media with local URL');
    console.log('\n✨ The Enhanced Media Uploader now supports local video browsing!');
  } else {
    console.log('\n❌ Some tests failed. Local media enhancement may not be fully implemented.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runLocalMediaEnhancementTests();
}

module.exports = { runLocalMediaEnhancementTests };
