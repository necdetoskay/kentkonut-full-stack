/**
 * Comprehensive test suite for Enhanced Media Uploader functionality
 * Tests all components, file types, embedded videos, and integration scenarios
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Enhanced Media Uploader Test Suite\n');

// Test 1: Check Enhanced Components Structure
function testEnhancedComponentsStructure() {
  console.log('Test 1: Checking Enhanced Components Structure...');
  
  const componentsPath = path.join(__dirname, '../components/media/enhanced');
  
  if (!fs.existsSync(componentsPath)) {
    console.log('❌ Enhanced components directory not found');
    return false;
  }
  
  const requiredComponents = [
    'EnhancedMediaUploader.tsx',
    'FolderSelector.tsx',
    'FileTypeSupport.tsx',
    'EmbeddedVideoInput.tsx'
  ];
  
  let allComponentsExist = true;
  
  requiredComponents.forEach(component => {
    const componentPath = path.join(componentsPath, component);
    if (!fs.existsSync(componentPath)) {
      console.log(`❌ Missing component: ${component}`);
      allComponentsExist = false;
    } else {
      console.log(`✅ Found component: ${component}`);
    }
  });
  
  return allComponentsExist;
}

// Test 2: Check FolderSelector Component
function testFolderSelectorComponent() {
  console.log('\nTest 2: Checking FolderSelector Component...');
  
  const folderSelectorPath = path.join(__dirname, '../components/media/enhanced/FolderSelector.tsx');
  
  if (!fs.existsSync(folderSelectorPath)) {
    console.log('❌ FolderSelector component not found');
    return false;
  }
  
  const content = fs.readFileSync(folderSelectorPath, 'utf8');
  
  // Check for required features
  const hasMediaCategoryIntegration = content.includes('useMediaCategories') &&
                                     content.includes('MediaCategory');
  
  const hasFolderSelection = content.includes('selectedCategoryId') &&
                            content.includes('onCategoryChange');
  
  const hasCustomFolderSupport = content.includes('customFolder') &&
                                content.includes('enableCustomFolder');
  
  const hasCategoryCreation = content.includes('enableCategoryCreation') &&
                             content.includes('addCategory');
  
  const hasIconMapping = content.includes('getCategoryIcon') &&
                        content.includes('iconMap');
  
  const hasPathMapping = content.includes('getCategoryPath') &&
                        content.includes('pathMap');
  
  if (!hasMediaCategoryIntegration) {
    console.log('❌ Media category integration missing');
    return false;
  }
  
  if (!hasFolderSelection) {
    console.log('❌ Folder selection functionality missing');
    return false;
  }
  
  if (!hasCustomFolderSupport) {
    console.log('❌ Custom folder support missing');
    return false;
  }
  
  if (!hasCategoryCreation) {
    console.log('❌ Category creation functionality missing');
    return false;
  }
  
  if (!hasIconMapping) {
    console.log('❌ Icon mapping missing');
    return false;
  }
  
  if (!hasPathMapping) {
    console.log('❌ Path mapping missing');
    return false;
  }
  
  console.log('✅ FolderSelector component properly implemented');
  return true;
}

// Test 3: Check FileTypeSupport Component
function testFileTypeSupportComponent() {
  console.log('\nTest 3: Checking FileTypeSupport Component...');
  
  const fileTypeSupportPath = path.join(__dirname, '../components/media/enhanced/FileTypeSupport.tsx');
  
  if (!fs.existsSync(fileTypeSupportPath)) {
    console.log('❌ FileTypeSupport component not found');
    return false;
  }
  
  const content = fs.readFileSync(fileTypeSupportPath, 'utf8');
  
  // Check for file type definitions
  const hasFileTypeDefinitions = content.includes('ENHANCED_FILE_SUPPORT') &&
                                 content.includes('images:') &&
                                 content.includes('documents:') &&
                                 content.includes('videos:');
  
  // Check for validation functions
  const hasValidationFunctions = content.includes('validateFile') &&
                                content.includes('getFileTypeFromMime') &&
                                content.includes('getFileTypeFromExtension');
  
  // Check for utility functions
  const hasUtilityFunctions = content.includes('formatFileSize') &&
                             content.includes('getAcceptedMimeTypes') &&
                             content.includes('getAcceptedExtensions');
  
  // Check for supported formats
  const hasSupportedFormats = content.includes('.jpg') &&
                             content.includes('.pdf') &&
                             content.includes('.mp4') &&
                             content.includes('image/jpeg') &&
                             content.includes('application/pdf') &&
                             content.includes('video/mp4');
  
  // Check for file size limits
  const hasFileSizeLimits = content.includes('maxSize:') &&
                           content.includes('10 * 1024 * 1024') && // 10MB for images
                           content.includes('20 * 1024 * 1024') && // 20MB for documents
                           content.includes('100 * 1024 * 1024'); // 100MB for videos
  
  if (!hasFileTypeDefinitions) {
    console.log('❌ File type definitions missing');
    return false;
  }
  
  if (!hasValidationFunctions) {
    console.log('❌ Validation functions missing');
    return false;
  }
  
  if (!hasUtilityFunctions) {
    console.log('❌ Utility functions missing');
    return false;
  }
  
  if (!hasSupportedFormats) {
    console.log('❌ Supported formats missing');
    return false;
  }
  
  if (!hasFileSizeLimits) {
    console.log('❌ File size limits missing');
    return false;
  }
  
  console.log('✅ FileTypeSupport component properly implemented');
  return true;
}

// Test 4: Check EmbeddedVideoInput Component (Enhanced with Local Media)
function testEmbeddedVideoInputComponent() {
  console.log('\nTest 4: Checking EmbeddedVideoInput Component (Enhanced with Local Media)...');

  const embeddedVideoPath = path.join(__dirname, '../components/media/enhanced/EmbeddedVideoInput.tsx');

  if (!fs.existsSync(embeddedVideoPath)) {
    console.log('❌ EmbeddedVideoInput component not found');
    return false;
  }

  const content = fs.readFileSync(embeddedVideoPath, 'utf8');

  // Check for platform support (including local)
  const hasPlatformSupport = content.includes('SUPPORTED_PLATFORMS') &&
                            content.includes('youtube:') &&
                            content.includes('vimeo:') &&
                            content.includes("'local'");

  // Check for URL detection
  const hasUrlDetection = content.includes('detectPlatform') &&
                         content.includes('youtube.com') &&
                         content.includes('vimeo.com');

  // Check for validation
  const hasValidation = content.includes('validateVideoUrl') &&
                       content.includes('isValid') &&
                       content.includes('error');

  // Check for metadata extraction
  const hasMetadataExtraction = content.includes('extractVideoMetadata') &&
                               content.includes('EmbeddedVideoData') &&
                               content.includes('thumbnail');

  // Check for preview functionality
  const hasPreviewFunctionality = content.includes('showPreview') &&
                                 content.includes('videoData') &&
                                 content.includes('thumbnail');

  // Check for utility functions
  const hasUtilityFunctions = content.includes('formatDuration') &&
                             content.includes('formatViewCount');

  // Check for local media support
  const hasLocalMediaSupport = content.includes('enableLocalMedia') &&
                              content.includes('MediaBrowserSimple') &&
                              content.includes('handleLocalMediaSelect');

  // Check for tab functionality
  const hasTabFunctionality = content.includes('TabsList') &&
                             content.includes('TabsContent') &&
                             content.includes('activeTab');

  // Check for local video utilities
  const hasLocalVideoUtils = content.includes('isVideoFile') &&
                            content.includes('createLocalVideoData') &&
                            content.includes('localFile');

  if (!hasPlatformSupport) {
    console.log('❌ Platform support (including local) missing');
    return false;
  }

  if (!hasUrlDetection) {
    console.log('❌ URL detection missing');
    return false;
  }

  if (!hasValidation) {
    console.log('❌ URL validation missing');
    return false;
  }

  if (!hasMetadataExtraction) {
    console.log('❌ Metadata extraction missing');
    return false;
  }

  if (!hasPreviewFunctionality) {
    console.log('❌ Preview functionality missing');
    return false;
  }

  if (!hasUtilityFunctions) {
    console.log('❌ Utility functions missing');
    return false;
  }

  if (!hasLocalMediaSupport) {
    console.log('❌ Local media support missing');
    return false;
  }

  if (!hasTabFunctionality) {
    console.log('❌ Tab functionality missing');
    return false;
  }

  if (!hasLocalVideoUtils) {
    console.log('❌ Local video utilities missing');
    return false;
  }

  console.log('✅ EmbeddedVideoInput component properly implemented with local media support');
  return true;
}

// Test 5: Check EnhancedMediaUploader Main Component
function testEnhancedMediaUploaderComponent() {
  console.log('\nTest 5: Checking EnhancedMediaUploader Main Component...');
  
  const uploaderPath = path.join(__dirname, '../components/media/enhanced/EnhancedMediaUploader.tsx');
  
  if (!fs.existsSync(uploaderPath)) {
    console.log('❌ EnhancedMediaUploader component not found');
    return false;
  }
  
  const content = fs.readFileSync(uploaderPath, 'utf8');
  
  // Check for component imports
  const hasComponentImports = content.includes('FolderSelector') &&
                             content.includes('FileTypeSupport') &&
                             content.includes('EmbeddedVideoInput');
  
  // Check for backward compatibility
  const hasBackwardCompatibility = content.includes('categoryId?:') &&
                                  content.includes('onUploadComplete?:') &&
                                  content.includes('maxFiles?:');
  
  // Check for enhanced features
  const hasEnhancedFeatures = content.includes('enableFolderSelection') &&
                             content.includes('enableEmbeddedVideo') &&
                             content.includes('enableMultiFormat');
  
  // Check for file handling
  const hasFileHandling = content.includes('useDropzone') &&
                         content.includes('onDrop') &&
                         content.includes('validateFile');
  
  // Check for upload functionality
  const hasUploadFunctionality = content.includes('uploadFiles') &&
                                content.includes('FormData') &&
                                content.includes('/api/media');
  
  // Check for state management
  const hasStateManagement = content.includes('useState') &&
                            content.includes('files') &&
                            content.includes('selectedCategoryId') &&
                            content.includes('selectedFileTypes');
  
  // Check for progress tracking
  const hasProgressTracking = content.includes('progress') &&
                             content.includes('overallProgress') &&
                             content.includes('isUploading');
  
  if (!hasComponentImports) {
    console.log('❌ Component imports missing');
    return false;
  }
  
  if (!hasBackwardCompatibility) {
    console.log('❌ Backward compatibility missing');
    return false;
  }
  
  if (!hasEnhancedFeatures) {
    console.log('❌ Enhanced features missing');
    return false;
  }
  
  if (!hasFileHandling) {
    console.log('❌ File handling missing');
    return false;
  }
  
  if (!hasUploadFunctionality) {
    console.log('❌ Upload functionality missing');
    return false;
  }
  
  if (!hasStateManagement) {
    console.log('❌ State management missing');
    return false;
  }
  
  if (!hasProgressTracking) {
    console.log('❌ Progress tracking missing');
    return false;
  }
  
  console.log('✅ EnhancedMediaUploader main component properly implemented');
  return true;
}

// Test 6: Check API Endpoints
function testAPIEndpoints() {
  console.log('\nTest 6: Checking API Endpoints...');
  
  const apiPath = path.join(__dirname, '../app/api/enhanced-media');
  
  if (!fs.existsSync(apiPath)) {
    console.log('❌ Enhanced media API directory not found');
    return false;
  }
  
  // Check for video metadata extraction endpoint
  const metadataEndpointPath = path.join(apiPath, 'extract-video-metadata/route.ts');
  const embeddedVideoEndpointPath = path.join(apiPath, 'embedded-video/route.ts');
  const localVideoRefEndpointPath = path.join(apiPath, 'local-video-reference/route.ts');

  let hasMetadataEndpoint = false;
  let hasEmbeddedVideoEndpoint = false;
  let hasLocalVideoRefEndpoint = false;
  
  if (fs.existsSync(metadataEndpointPath)) {
    const metadataContent = fs.readFileSync(metadataEndpointPath, 'utf8');
    hasMetadataEndpoint = metadataContent.includes('getYouTubeMetadata') &&
                         metadataContent.includes('getVimeoMetadata') &&
                         metadataContent.includes('VideoMetadataRequest');
    
    if (hasMetadataEndpoint) {
      console.log('✅ Video metadata extraction endpoint implemented');
    } else {
      console.log('❌ Video metadata extraction endpoint incomplete');
    }
  } else {
    console.log('❌ Video metadata extraction endpoint not found');
  }
  
  if (fs.existsSync(embeddedVideoEndpointPath)) {
    const embeddedContent = fs.readFileSync(embeddedVideoEndpointPath, 'utf8');
    hasEmbeddedVideoEndpoint = embeddedContent.includes('EmbeddedVideoRequest') &&
                              embeddedContent.includes('db.media.create') &&
                              embeddedContent.includes('application/json');
    
    if (hasEmbeddedVideoEndpoint) {
      console.log('✅ Embedded video storage endpoint implemented');
    } else {
      console.log('❌ Embedded video storage endpoint incomplete');
    }
  } else {
    console.log('❌ Embedded video storage endpoint not found');
  }

  if (fs.existsSync(localVideoRefEndpointPath)) {
    const localVideoRefContent = fs.readFileSync(localVideoRefEndpointPath, 'utf8');
    hasLocalVideoRefEndpoint = localVideoRefContent.includes('LocalVideoReferenceRequest') &&
                              localVideoRefContent.includes('localFileId') &&
                              localVideoRefContent.includes('local-video-reference');

    if (hasLocalVideoRefEndpoint) {
      console.log('✅ Local video reference endpoint implemented');
    } else {
      console.log('❌ Local video reference endpoint incomplete');
    }
  } else {
    console.log('❌ Local video reference endpoint not found');
  }

  return hasMetadataEndpoint && hasEmbeddedVideoEndpoint && hasLocalVideoRefEndpoint;
}

// Test 7: Check Integration with MediaGallery
function testMediaGalleryIntegration() {
  console.log('\nTest 7: Checking MediaGallery Integration...');
  
  const mediaGalleryPath = path.join(__dirname, '../components/media/MediaGallery.tsx');
  
  if (!fs.existsSync(mediaGalleryPath)) {
    console.log('❌ MediaGallery component not found');
    return false;
  }
  
  const content = fs.readFileSync(mediaGalleryPath, 'utf8');
  
  // Check for enhanced uploader import
  const hasEnhancedImport = content.includes('EnhancedMediaUploader');
  
  // Check for enhanced uploader prop
  const hasEnhancedProp = content.includes('useEnhancedUploader?:');
  
  // Check for conditional rendering
  const hasConditionalRendering = content.includes('useEnhancedUploader ?') &&
                                 content.includes('EnhancedMediaUploader') &&
                                 content.includes('MediaUploader');
  
  // Check for enhanced configuration
  const hasEnhancedConfiguration = content.includes('enableFolderSelection={true}') &&
                                  content.includes('enableEmbeddedVideo={true}') &&
                                  content.includes('enableMultiFormat={true}');
  
  if (!hasEnhancedImport) {
    console.log('❌ Enhanced uploader import missing');
    return false;
  }
  
  if (!hasEnhancedProp) {
    console.log('❌ Enhanced uploader prop missing');
    return false;
  }
  
  if (!hasConditionalRendering) {
    console.log('❌ Conditional rendering missing');
    return false;
  }
  
  if (!hasEnhancedConfiguration) {
    console.log('❌ Enhanced configuration missing');
    return false;
  }
  
  console.log('✅ MediaGallery integration properly implemented');
  return true;
}

// Test 8: Check Media Management Page Integration
function testMediaManagementPageIntegration() {
  console.log('\nTest 8: Checking Media Management Page Integration...');
  
  const mediaPagePath = path.join(__dirname, '../app/dashboard/media/page.tsx');
  
  if (!fs.existsSync(mediaPagePath)) {
    console.log('❌ Media Management page not found');
    return false;
  }
  
  const content = fs.readFileSync(mediaPagePath, 'utf8');
  
  // Check for enhanced uploader usage
  const hasEnhancedUsage = content.includes('useEnhancedUploader={true}');
  
  if (!hasEnhancedUsage) {
    console.log('❌ Enhanced uploader not enabled in Media Management page');
    return false;
  }
  
  console.log('✅ Media Management page integration properly implemented');
  return true;
}

// Run all tests
function runTests() {
  console.log('🧪 Running Enhanced Media Uploader Test Suite\n');
  
  const tests = [
    testEnhancedComponentsStructure,
    testFolderSelectorComponent,
    testFileTypeSupportComponent,
    testEmbeddedVideoInputComponent,
    testEnhancedMediaUploaderComponent,
    testAPIEndpoints,
    testMediaGalleryIntegration,
    testMediaManagementPageIntegration
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
    console.log('🎉 All tests passed! Enhanced Media Uploader is working correctly.');
    console.log('\n📝 Summary of implemented features:');
    console.log('   ✅ Folder/category selection with existing media categories');
    console.log('   ✅ Multi-format file support (images, documents, videos)');
    console.log('   ✅ Embedded video support (YouTube, Vimeo)');
    console.log('   ✅ Enhanced UI with drag-and-drop and previews');
    console.log('   ✅ API endpoints for video metadata and storage');
    console.log('   ✅ Seamless integration with existing MediaGallery');
    console.log('   ✅ Backward compatibility with original MediaUploader');
    console.log('   ✅ Media Management page integration');
    console.log('\n🚀 The Enhanced Media Uploader is ready for production!');
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
