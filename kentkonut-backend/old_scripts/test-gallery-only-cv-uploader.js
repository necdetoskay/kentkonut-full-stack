/**
 * Test script to verify Gallery-Only CV Uploader implementation
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Gallery-Only CV Uploader Implementation\n');

function testGalleryOnlyCVUploader() {
  console.log('Test 1: Checking Gallery-Only CV Uploader component...');
  
  const componentPath = path.join(__dirname, '../components/media/EnhancedCVUploader.tsx');
  
  if (!fs.existsSync(componentPath)) {
    console.log('❌ Enhanced CV Uploader component not found');
    return false;
  }
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Check that direct file upload is removed
  const hasRemovedDirectUpload = !content.includes('type="file"') &&
                                !content.includes('handleFileUpload') &&
                                !content.includes('onChange={handleFileUpload}') &&
                                !content.includes('accept=".pdf,.doc,.docx"');
  
  // Check that only GlobalMediaSelector remains
  const hasOnlyGallerySelector = content.includes('GlobalMediaSelector') &&
                                content.includes('Galeriden Seç') &&
                                !content.includes('Direct File Upload') &&
                                !content.includes('Upload Options');
  
  // Check for proper button styling
  const hasProperButtonStyling = content.includes('className="w-full sm:w-auto"') &&
                                 content.includes('<FileText className="h-4 w-4 mr-2" />');
  
  // Check for updated description
  const hasUpdatedDescription = content.includes('Mevcut CV dosyalarından birini seçin veya yeni dosya yükleyin') &&
                               content.includes('Galeriden mevcut CV dosyalarını seçebilir veya yeni dosya yükleyebilirsiniz');
  
  // Check that uploadingFile state is removed
  const hasRemovedUploadingFile = !content.includes('uploadingFile') &&
                                 !content.includes('setUploadingFile');
  
  // Check that isLoading only uses isUploading
  const hasSimplifiedLoading = content.includes('const isLoading = isUploading;') &&
                              !content.includes('uploadingFile || isUploading');
  
  if (!hasRemovedDirectUpload) {
    console.log('❌ Direct file upload not properly removed');
    return false;
  }
  
  if (!hasOnlyGallerySelector) {
    console.log('❌ Gallery selector not properly configured');
    return false;
  }
  
  if (!hasProperButtonStyling) {
    console.log('❌ Proper button styling missing');
    return false;
  }
  
  if (!hasUpdatedDescription) {
    console.log('❌ Updated description missing');
    return false;
  }
  
  if (!hasRemovedUploadingFile) {
    console.log('❌ uploadingFile state not properly removed');
    return false;
  }
  
  if (!hasSimplifiedLoading) {
    console.log('❌ Loading logic not simplified');
    return false;
  }
  
  console.log('✅ Gallery-Only CV Uploader component implemented correctly');
  return true;
}

function testPersonnelEditPageUpdate() {
  console.log('\nTest 2: Checking personnel edit page description update...');
  
  const editPagePath = path.join(__dirname, '../app/dashboard/corporate/personnel/[id]/edit/page.tsx');
  
  if (!fs.existsSync(editPagePath)) {
    console.log('❌ Personnel edit page not found');
    return false;
  }
  
  const content = fs.readFileSync(editPagePath, 'utf8');
  
  // Check for updated description
  const hasUpdatedDescription = content.includes('description="Galeriden mevcut CV dosyalarını seçebilir veya yeni dosya yükleyebilirsiniz"');
  
  // Check that old description is removed
  const hasRemovedOldDescription = !content.includes('PDF veya Word dosyası yükleyebilir veya galeriden seçebilirsiniz');
  
  // Check that EnhancedCVUploader is still used
  const stillUsesEnhancedUploader = content.includes('<EnhancedCVUploader') &&
                                   content.includes('onCVSelect={handleEnhancedCVSelect}');
  
  if (!hasUpdatedDescription) {
    console.log('❌ Updated description missing in edit page');
    return false;
  }
  
  if (!hasRemovedOldDescription) {
    console.log('❌ Old description not removed from edit page');
    return false;
  }
  
  if (!stillUsesEnhancedUploader) {
    console.log('❌ Enhanced uploader usage missing in edit page');
    return false;
  }
  
  console.log('✅ Personnel edit page updated correctly');
  return true;
}

function testNewPersonnelPageUpdate() {
  console.log('\nTest 3: Checking new personnel page description update...');
  
  const newPersonnelPath = path.join(__dirname, '../app/dashboard/corporate/departments/new-personnel/page.tsx');
  
  if (!fs.existsSync(newPersonnelPath)) {
    console.log('❌ New personnel page not found');
    return false;
  }
  
  const content = fs.readFileSync(newPersonnelPath, 'utf8');
  
  // Check for updated description
  const hasUpdatedDescription = content.includes('description="Galeriden mevcut CV dosyalarını seçebilir veya yeni dosya yükleyebilirsiniz"');
  
  // Check that old description is removed
  const hasRemovedOldDescription = !content.includes('PDF veya Word dosyası yükleyebilir veya galeriden seçebilirsiniz');
  
  // Check that EnhancedCVUploader is still used
  const stillUsesEnhancedUploader = content.includes('<EnhancedCVUploader') &&
                                   content.includes('onCVSelect={handleEnhancedCVSelect}');
  
  if (!hasUpdatedDescription) {
    console.log('❌ Updated description missing in new personnel page');
    return false;
  }
  
  if (!hasRemovedOldDescription) {
    console.log('❌ Old description not removed from new personnel page');
    return false;
  }
  
  if (!stillUsesEnhancedUploader) {
    console.log('❌ Enhanced uploader usage missing in new personnel page');
    return false;
  }
  
  console.log('✅ New personnel page updated correctly');
  return true;
}

function testGlobalMediaSelectorConfiguration() {
  console.log('\nTest 4: Checking GlobalMediaSelector configuration...');
  
  const componentPath = path.join(__dirname, '../components/media/EnhancedCVUploader.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Check for proper GlobalMediaSelector configuration
  const hasProperConfiguration = content.includes('title="CV Dosyası Seç"') &&
                                 content.includes('description="Mevcut CV dosyalarından birini seçin veya yeni dosya yükleyin"') &&
                                 content.includes('acceptedTypes={[') &&
                                 content.includes('application/pdf') &&
                                 content.includes('application/msword') &&
                                 content.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') &&
                                 content.includes('defaultCategory="corporate-images"') &&
                                 content.includes('customFolder="corporate/departments"');
  
  // Check for proper trigger button
  const hasProperTrigger = content.includes('trigger={') &&
                          content.includes('<Button') &&
                          content.includes('variant="outline"') &&
                          content.includes('disabled={isLoading}') &&
                          content.includes('<FileText className="h-4 w-4 mr-2" />') &&
                          content.includes('Galeriden Seç');
  
  // Check for media selection handler
  const hasMediaHandler = content.includes('const handleMediaSelect = (media: GlobalMediaFile)') &&
                         content.includes('onCVSelect(media.url, media.id)') &&
                         content.includes('toast.success("CV başarıyla seçildi.")');
  
  if (!hasProperConfiguration) {
    console.log('❌ Proper GlobalMediaSelector configuration missing');
    return false;
  }
  
  if (!hasProperTrigger) {
    console.log('❌ Proper trigger button missing');
    return false;
  }
  
  if (!hasMediaHandler) {
    console.log('❌ Media selection handler missing');
    return false;
  }
  
  console.log('✅ GlobalMediaSelector configuration correct');
  return true;
}

function testUserExperienceFlow() {
  console.log('\nTest 5: Checking user experience flow...');
  
  const componentPath = path.join(__dirname, '../components/media/EnhancedCVUploader.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Check for simplified UI structure
  const hasSimplifiedUI = content.includes('Media Gallery Selector Only') &&
                          content.includes('flex justify-start') &&
                          !content.includes('flex-col sm:flex-row gap-2');
  
  // Check for proper loading state
  const hasProperLoadingState = content.includes('{isLoading && (') &&
                               content.includes('animate-spin') &&
                               content.includes('Yükleniyor...');
  
  // Check for CV display and removal
  const hasCVDisplay = content.includes('{currentCVUrl && !isLoading && (') &&
                      content.includes('CV Dosyası Yüklendi') &&
                      content.includes('Görüntüle') &&
                      content.includes('handleRemoveCV');
  
  // Check for proper help text
  const hasProperHelpText = content.includes('text-xs text-muted-foreground') &&
                           content.includes('Galeriden mevcut CV dosyalarını seçebilir veya yeni dosya yükleyebilirsiniz');
  
  if (!hasSimplifiedUI) {
    console.log('❌ Simplified UI structure missing');
    return false;
  }
  
  if (!hasProperLoadingState) {
    console.log('❌ Proper loading state missing');
    return false;
  }
  
  if (!hasCVDisplay) {
    console.log('❌ CV display and removal missing');
    return false;
  }
  
  if (!hasProperHelpText) {
    console.log('❌ Proper help text missing');
    return false;
  }
  
  console.log('✅ User experience flow correct');
  return true;
}

function runGalleryOnlyCVUploaderTests() {
  console.log('🧪 GALLERY-ONLY CV UPLOADER VERIFICATION');
  console.log('========================================\n');
  
  const tests = [
    testGalleryOnlyCVUploader,
    testPersonnelEditPageUpdate,
    testNewPersonnelPageUpdate,
    testGlobalMediaSelectorConfiguration,
    testUserExperienceFlow
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
    console.log('\n🎉 SUCCESS! Gallery-Only CV Uploader implementation completed!');
    console.log('\n📝 Changes implemented:');
    console.log('   ✅ Removed direct file upload input');
    console.log('   ✅ Kept only "Galeriden Seç" button');
    console.log('   ✅ Updated component descriptions');
    console.log('   ✅ Simplified UI structure');
    console.log('   ✅ Removed unnecessary state and functions');
    console.log('   ✅ Updated personnel pages descriptions');
    console.log('\n🎯 User experience:');
    console.log('   • Single "Galeriden Seç" button for CV selection');
    console.log('   • Users can browse existing CV files from media library');
    console.log('   • Users can upload new files through the media gallery');
    console.log('   • Simplified, cleaner interface');
    console.log('   • Consistent experience across all pages');
    console.log('\n🔧 Technical improvements:');
    console.log('   • Removed redundant file upload code');
    console.log('   • Simplified component state management');
    console.log('   • Cleaner, more focused component');
    console.log('   • Better separation of concerns');
    console.log('\n✨ CV upload now uses gallery-only approach!');
    console.log('\n🔍 Usage flow:');
    console.log('   1. Click "Galeriden Seç" button');
    console.log('   2. Browse existing CV files or upload new ones');
    console.log('   3. Select desired CV file');
    console.log('   4. CV is immediately available for preview');
    console.log('   5. Save personnel form to persist selection');
  } else {
    console.log('\n❌ Some tests failed. Gallery-only CV uploader implementation may be incomplete.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runGalleryOnlyCVUploaderTests();
}

module.exports = { runGalleryOnlyCVUploaderTests };
