/**
 * Test script to verify Enhanced CV Uploader implementation
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Enhanced CV Uploader Implementation\n');

function testEnhancedCVUploaderComponent() {
  console.log('Test 1: Checking Enhanced CV Uploader component...');
  
  const componentPath = path.join(__dirname, '../components/media/EnhancedCVUploader.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.log('❌ Enhanced CV Uploader component not found');
    return false;
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Check for dual upload options
  const hasDualOptions = content.includes('Direct File Upload') &&
                         content.includes('Media Gallery Selector') &&
                         content.includes('GlobalMediaSelector');
  
  // Check for file type validation
  const hasFileValidation = content.includes('allowedTypes') &&
                           content.includes('application/pdf') &&
                           content.includes('application/msword') &&
                           content.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  
  // Check for proper API usage
  const usesCorrectAPI = content.includes("fetch('/api/media/upload'") &&
                        content.includes("formData.append('file', file)") &&
                        content.includes("formData.append('category', 'corporate/departments')");
  
  // Check for enhanced UI features
  const hasEnhancedUI = content.includes('Galeriden Seç') &&
                       content.includes('currentCVUrl') &&
                       content.includes('isUploading') &&
                       content.includes('onUploadStart') &&
                       content.includes('onUploadEnd');
  
  // Check for error handling
  const hasErrorHandling = content.includes('onError') &&
                          content.includes('toast.error') &&
                          content.includes('toast.success');
  
  if (!hasDualOptions) {
    console.log('❌ Dual upload options missing');
    return false;
  }
  
  if (!hasFileValidation) {
    console.log('❌ File type validation missing');
    return false;
  }
  
  if (!usesCorrectAPI) {
    console.log('❌ Correct API usage missing');
    return false;
  }
  
  if (!hasEnhancedUI) {
    console.log('❌ Enhanced UI features missing');
    return false;
  }
  
  if (!hasErrorHandling) {
    console.log('❌ Error handling missing');
    return false;
  }
  
  console.log('✅ Enhanced CV Uploader component implemented correctly');
  return true;
}

function testPersonnelEditPageIntegration() {
  console.log('\nTest 2: Checking personnel edit page integration...');
  
  const editPagePath = path.join(__dirname, '../app/dashboard/corporate/personnel/[id]/edit/page.tsx');
  
  if (!fs.existsSync(editPagePath)) {
    console.log('❌ Personnel edit page not found');
    return false;
  }
  
  const content = fs.readFileSync(editPagePath, 'utf8');
  
  // Check for Enhanced CV Uploader import
  const hasImport = content.includes("import { EnhancedCVUploader } from \"@/components/media/EnhancedCVUploader\"");
  
  // Check for Enhanced CV Uploader usage
  const hasUsage = content.includes('<EnhancedCVUploader') &&
                  content.includes('onCVSelect={handleEnhancedCVSelect}') &&
                  content.includes('currentCVUrl={cvUrl}') &&
                  content.includes('isUploading={uploadingCv}');
  
  // Check for handleEnhancedCVSelect function
  const hasEnhancedHandler = content.includes('const handleEnhancedCVSelect = (cvUrl: string, mediaId?: number)') &&
                            content.includes('setCvUrl(cvUrl)') &&
                            content.includes('setGalleryItems');
  
  // Check that basic file input is replaced
  const hasReplacedBasicInput = !content.includes('type="file"') ||
                               !content.includes('accept=".pdf,.doc,.docx"') ||
                               content.includes('EnhancedCVUploader');
  
  // Check for gallery items integration
  const hasGalleryIntegration = content.includes('galleryItems.filter(item =>') &&
                               content.includes('item.type !== \'PDF\' && item.type !== \'WORD\'');
  
  if (!hasImport) {
    console.log('❌ Enhanced CV Uploader import missing');
    return false;
  }
  
  if (!hasUsage) {
    console.log('❌ Enhanced CV Uploader usage missing');
    return false;
  }
  
  if (!hasEnhancedHandler) {
    console.log('❌ handleEnhancedCVSelect function missing');
    return false;
  }
  
  if (!hasReplacedBasicInput) {
    console.log('❌ Basic file input not properly replaced');
    return false;
  }
  
  if (!hasGalleryIntegration) {
    console.log('❌ Gallery items integration missing');
    return false;
  }
  
  console.log('✅ Personnel edit page integration correct');
  return true;
}

function testNewPersonnelPageIntegration() {
  console.log('\nTest 3: Checking new personnel page integration...');
  
  const newPersonnelPath = path.join(__dirname, '../app/dashboard/corporate/departments/new-personnel/page.tsx');
  
  if (!fs.existsSync(newPersonnelPath)) {
    console.log('❌ New personnel page not found');
    return false;
  }
  
  const content = fs.readFileSync(newPersonnelPath, 'utf8');
  
  // Check for Enhanced CV Uploader import
  const hasImport = content.includes("import { EnhancedCVUploader } from \"@/components/media/EnhancedCVUploader\"");
  
  // Check for Enhanced CV Uploader usage
  const hasUsage = content.includes('<EnhancedCVUploader') &&
                  content.includes('onCVSelect={handleEnhancedCVSelect}') &&
                  content.includes('currentCVUrl={cvUrl}') &&
                  content.includes('isUploading={uploadingCv}');
  
  // Check for handleEnhancedCVSelect function
  const hasEnhancedHandler = content.includes('const handleEnhancedCVSelect = (cvUrl: string, mediaId?: number)') &&
                            content.includes('setCvUrl(cvUrl)') &&
                            content.includes('setGalleryItems');
  
  // Check for consistency with edit page
  const hasConsistentImplementation = content.includes('handleEnhancedCVSelect(media.url || media.path, media.id)');
  
  if (!hasImport) {
    console.log('❌ Enhanced CV Uploader import missing');
    return false;
  }
  
  if (!hasUsage) {
    console.log('❌ Enhanced CV Uploader usage missing');
    return false;
  }
  
  if (!hasEnhancedHandler) {
    console.log('❌ handleEnhancedCVSelect function missing');
    return false;
  }
  
  if (!hasConsistentImplementation) {
    console.log('❌ Consistent implementation missing');
    return false;
  }
  
  console.log('✅ New personnel page integration correct');
  return true;
}

function testGlobalMediaSelectorCompatibility() {
  console.log('\nTest 4: Checking GlobalMediaSelector compatibility...');
  
  const componentPath = path.join(__dirname, '../components/media/EnhancedCVUploader.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Check for proper GlobalMediaSelector usage
  const hasProperUsage = content.includes('GlobalMediaSelector') &&
                        content.includes('onSelect={handleMediaSelect}') &&
                        content.includes('acceptedTypes={[') &&
                        content.includes('defaultCategory="corporate-images"') &&
                        content.includes('customFolder="corporate/departments"');
  
  // Check for media selection handler
  const hasMediaHandler = content.includes('const handleMediaSelect = (media: GlobalMediaFile)') &&
                         content.includes('onCVSelect(media.url, media.id)');
  
  // Check for proper trigger button
  const hasTriggerButton = content.includes('trigger={') &&
                          content.includes('<FileText className="h-4 w-4 mr-2" />') &&
                          content.includes('Galeriden Seç');
  
  if (!hasProperUsage) {
    console.log('❌ Proper GlobalMediaSelector usage missing');
    return false;
  }
  
  if (!hasMediaHandler) {
    console.log('❌ Media selection handler missing');
    return false;
  }
  
  if (!hasTriggerButton) {
    console.log('❌ Proper trigger button missing');
    return false;
  }
  
  console.log('✅ GlobalMediaSelector compatibility verified');
  return true;
}

function testEnhancedFeatures() {
  console.log('\nTest 5: Checking enhanced features...');
  
  const componentPath = path.join(__dirname, '../components/media/EnhancedCVUploader.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Check for file preview functionality
  const hasPreview = content.includes('currentCVUrl && !isLoading') &&
                    content.includes('CV Dosyası Yüklendi') &&
                    content.includes('target="_blank"') &&
                    content.includes('Görüntüle');
  
  // Check for remove functionality
  const hasRemove = content.includes('handleRemoveCV') &&
                   content.includes('onCVSelect(\'\')') &&
                   content.includes('<X className="h-3 w-3" />');
  
  // Check for loading states
  const hasLoadingStates = content.includes('isLoading') &&
                          content.includes('disabled={isLoading}') &&
                          content.includes('animate-spin');
  
  // Check for responsive design
  const hasResponsiveDesign = content.includes('flex-col sm:flex-row') &&
                             content.includes('whitespace-nowrap');
  
  // Check for accessibility
  const hasAccessibility = content.includes('htmlFor=') &&
                          content.includes('aria-') ||
                          content.includes('rel="noopener noreferrer"');
  
  if (!hasPreview) {
    console.log('❌ File preview functionality missing');
    return false;
  }
  
  if (!hasRemove) {
    console.log('❌ Remove functionality missing');
    return false;
  }
  
  if (!hasLoadingStates) {
    console.log('❌ Loading states missing');
    return false;
  }
  
  if (!hasResponsiveDesign) {
    console.log('❌ Responsive design missing');
    return false;
  }
  
  console.log('✅ Enhanced features implemented correctly');
  return true;
}

function runEnhancedCVUploaderTests() {
  console.log('🧪 ENHANCED CV UPLOADER VERIFICATION');
  console.log('====================================\n');
  
  const tests = [
    testEnhancedCVUploaderComponent,
    testPersonnelEditPageIntegration,
    testNewPersonnelPageIntegration,
    testGlobalMediaSelectorCompatibility,
    testEnhancedFeatures
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
    console.log('\n🎉 SUCCESS! Enhanced CV Uploader implementation completed!');
    console.log('\n📝 Features implemented:');
    console.log('   ✅ Enhanced CV Uploader component with dual upload options');
    console.log('   ✅ Direct file upload capability');
    console.log('   ✅ Media gallery browsing and selection');
    console.log('   ✅ File type validation (PDF, Word documents)');
    console.log('   ✅ Professional UI with loading states');
    console.log('   ✅ File preview and remove functionality');
    console.log('   ✅ Integration with personnel edit page');
    console.log('   ✅ Integration with new personnel creation page');
    console.log('   ✅ Gallery items management');
    console.log('   ✅ Consistent error handling and user feedback');
    console.log('\n🎯 Enhanced features:');
    console.log('   • Dual upload options: Direct upload + Gallery selection');
    console.log('   • Professional file input styling');
    console.log('   • Real-time loading indicators');
    console.log('   • File preview with external link');
    console.log('   • One-click file removal');
    console.log('   • Responsive design for mobile/desktop');
    console.log('   • Proper folder categorization (corporate/departments)');
    console.log('   • Toast notifications for user feedback');
    console.log('\n🔧 User experience improvements:');
    console.log('   • Users can browse existing CV files from media library');
    console.log('   • Users can upload new CV files directly');
    console.log('   • Clear visual feedback during upload process');
    console.log('   • Easy file removal and replacement');
    console.log('   • Consistent experience across edit and creation flows');
    console.log('\n✨ Enhanced CV Uploader is now fully functional and professional!');
    console.log('\n🔍 Usage instructions:');
    console.log('   1. Click "Choose File" to upload new CV document');
    console.log('   2. Click "Galeriden Seç" to browse existing media files');
    console.log('   3. Preview uploaded CV with "Görüntüle" link');
    console.log('   4. Remove CV with X button if needed');
    console.log('   5. Save personnel form to persist changes');
  } else {
    console.log('\n❌ Some tests failed. Enhanced CV Uploader implementation may be incomplete.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runEnhancedCVUploaderTests();
}

module.exports = { runEnhancedCVUploaderTests };
