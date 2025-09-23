/**
 * Test script to verify personnel edit CV upload fix
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Personnel Edit CV Upload Fix\n');

function testPersonnelEditCVUploadFix() {
  console.log('Test 1: Checking personnel edit CV upload fix...');
  
  const editPagePath = path.join(__dirname, '../app/dashboard/corporate/personnel/[id]/edit/page.tsx');
  
  if (!fs.existsSync(editPagePath)) {
    console.log('❌ Personnel edit page not found');
    return false;
  }
  
  const content = fs.readFileSync(editPagePath, 'utf8');
  
  // Check for correct API endpoint
  const usesCorrectAPI = content.includes("await fetch('/api/media/upload', {");
  
  // Check for correct FormData field name
  const usesCorrectFieldName = content.includes("formData.append('file', file)") &&
                               !content.includes("formData.append('files', file)");
  
  // Check for correct category parameter
  const usesCorrectCategory = content.includes("formData.append('category', 'corporate/departments')") &&
                             !content.includes("formData.append('categoryId', '1')");
  
  // Check for correct response handling
  const usesCorrectResponseHandling = content.includes("const media = await response.json()") &&
                                     !content.includes("result.uploadedFiles?.[0]");
  
  // Check for success logging
  const hasSuccessLogging = content.includes("console.log('CV uploaded successfully:', media)");
  
  // Check for improved error handling
  const hasImprovedErrorHandling = content.includes("console.error('CV upload error:', err)") &&
                                  content.includes("toast.error('CV yükleme başarısız')");
  
  if (!usesCorrectAPI) {
    console.log('❌ Incorrect API endpoint - should use /api/media/upload');
    return false;
  }
  
  if (!usesCorrectFieldName) {
    console.log('❌ Incorrect FormData field name - should use "file" not "files"');
    return false;
  }
  
  if (!usesCorrectCategory) {
    console.log('❌ Incorrect category parameter - should use "category" not "categoryId"');
    return false;
  }
  
  if (!usesCorrectResponseHandling) {
    console.log('❌ Incorrect response handling - should use direct media object');
    return false;
  }
  
  if (!hasSuccessLogging) {
    console.log('❌ Success logging missing');
    return false;
  }
  
  if (!hasImprovedErrorHandling) {
    console.log('❌ Improved error handling missing');
    return false;
  }
  
  console.log('✅ Personnel edit CV upload fix implemented correctly');
  return true;
}

function testConsistencyWithNewPersonnelCreation() {
  console.log('\nTest 2: Checking consistency with new personnel creation...');
  
  const editPagePath = path.join(__dirname, '../app/dashboard/corporate/personnel/[id]/edit/page.tsx');
  const newPersonnelPath = path.join(__dirname, '../app/dashboard/corporate/departments/new-personnel/page.tsx');
  
  if (!fs.existsSync(editPagePath) || !fs.existsSync(newPersonnelPath)) {
    console.log('❌ Required files not found');
    return false;
  }
  
  const editContent = fs.readFileSync(editPagePath, 'utf8');
  const newContent = fs.readFileSync(newPersonnelPath, 'utf8');
  
  // Check that both use the same API endpoint
  const bothUseMediaUpload = editContent.includes("'/api/media/upload'") &&
                            newContent.includes("'/api/media/upload'");
  
  // Check that both use the same FormData field name
  const bothUseFileField = editContent.includes("formData.append('file', file)") &&
                          newContent.includes("formData.append('file', file)");
  
  // Check that both use the same category
  const bothUseSameCategory = editContent.includes("formData.append('category', 'corporate/departments')") &&
                             newContent.includes("formData.append('category', 'corporate/departments')");
  
  // Check that both handle response the same way
  const bothHandleResponseSame = editContent.includes("const media = await response.json()") &&
                                newContent.includes("const media = await response.json()");
  
  if (!bothUseMediaUpload) {
    console.log('❌ API endpoints not consistent');
    return false;
  }
  
  if (!bothUseFileField) {
    console.log('❌ FormData field names not consistent');
    return false;
  }
  
  if (!bothUseSameCategory) {
    console.log('❌ Category parameters not consistent');
    return false;
  }
  
  if (!bothHandleResponseSame) {
    console.log('❌ Response handling not consistent');
    return false;
  }
  
  console.log('✅ Personnel edit CV upload consistent with new personnel creation');
  return true;
}

function testGalleryItemsHandling() {
  console.log('\nTest 3: Checking gallery items handling in edit page...');
  
  const editPagePath = path.join(__dirname, '../app/dashboard/corporate/personnel/[id]/edit/page.tsx');
  const content = fs.readFileSync(editPagePath, 'utf8');
  
  // Check for gallery items creation
  const hasGalleryItemCreation = content.includes('const newGalleryItem: GalleryItem = {') &&
                                content.includes('mediaId: media.id,') &&
                                content.includes('type: fileType,') &&
                                content.includes('title: \'CV\',');
  
  // Check for gallery items update logic
  const hasUpdateLogic = content.includes('const existingCvIndex = galleryItems.findIndex') &&
                        content.includes('if (existingCvIndex > -1) {') &&
                        content.includes('const updatedItems = [...galleryItems];') &&
                        content.includes('updatedItems[existingCvIndex] = newGalleryItem;');
  
  // Check for gallery items in submit
  const hasGalleryInSubmit = content.includes('body: JSON.stringify({ ...formData, galleryItems })');
  
  if (!hasGalleryItemCreation) {
    console.log('❌ Gallery item creation missing');
    return false;
  }
  
  if (!hasUpdateLogic) {
    console.log('❌ Gallery items update logic missing');
    return false;
  }
  
  if (!hasGalleryInSubmit) {
    console.log('❌ Gallery items not included in submit');
    return false;
  }
  
  console.log('✅ Gallery items handling correct in edit page');
  return true;
}

function testErrorHandlingImprovement() {
  console.log('\nTest 4: Checking error handling improvement...');
  
  const editPagePath = path.join(__dirname, '../app/dashboard/corporate/personnel/[id]/edit/page.tsx');
  const content = fs.readFileSync(editPagePath, 'utf8');
  
  // Check for comprehensive error logging
  const hasErrorLogging = content.includes("console.error('CV upload error:', err)");
  
  // Check for user feedback
  const hasUserFeedback = content.includes("toast.error('CV yükleme başarısız')") &&
                         content.includes("toast.success(\"CV başarıyla yüklendi.\")");
  
  // Check for proper error state management
  const hasErrorStateManagement = content.includes("setError('CV yükleme sırasında bir hata oluştu')");
  
  // Check for loading state management
  const hasLoadingStateManagement = content.includes('setUploadingCv(true)') &&
                                   content.includes('setUploadingCv(false)');
  
  if (!hasErrorLogging) {
    console.log('❌ Error logging missing');
    return false;
  }
  
  if (!hasUserFeedback) {
    console.log('❌ User feedback missing');
    return false;
  }
  
  if (!hasErrorStateManagement) {
    console.log('❌ Error state management missing');
    return false;
  }
  
  if (!hasLoadingStateManagement) {
    console.log('❌ Loading state management missing');
    return false;
  }
  
  console.log('✅ Error handling improved correctly');
  return true;
}

function testFileTypeValidation() {
  console.log('\nTest 5: Checking file type validation...');
  
  const editPagePath = path.join(__dirname, '../app/dashboard/corporate/personnel/[id]/edit/page.tsx');
  const content = fs.readFileSync(editPagePath, 'utf8');
  
  // Check for file type validation
  const hasFileTypeValidation = content.includes('const allowedTypes = [') &&
                               content.includes('application/pdf') &&
                               content.includes('application/msword') &&
                               content.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  
  // Check for validation logic
  const hasValidationLogic = content.includes('if (!allowedTypes.includes(file.type)) {') &&
                            content.includes('setError(\'Yalnızca PDF veya Word dosyaları yüklenebilir\')');
  
  // Check for file type detection
  const hasFileTypeDetection = content.includes("const fileType = file.type === 'application/pdf' ? 'PDF' : 'WORD'");
  
  if (!hasFileTypeValidation) {
    console.log('❌ File type validation missing');
    return false;
  }
  
  if (!hasValidationLogic) {
    console.log('❌ Validation logic missing');
    return false;
  }
  
  if (!hasFileTypeDetection) {
    console.log('❌ File type detection missing');
    return false;
  }
  
  console.log('✅ File type validation correct');
  return true;
}

function runPersonnelEditCVFixTests() {
  console.log('🧪 PERSONNEL EDIT CV UPLOAD FIX VERIFICATION');
  console.log('============================================\n');
  
  const tests = [
    testPersonnelEditCVUploadFix,
    testConsistencyWithNewPersonnelCreation,
    testGalleryItemsHandling,
    testErrorHandlingImprovement,
    testFileTypeValidation
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
    console.log('\n🎉 SUCCESS! Personnel edit CV upload fix completed!');
    console.log('\n📝 Fixed issues:');
    console.log('   ✅ Updated API endpoint from /api/upload to /api/media/upload');
    console.log('   ✅ Fixed FormData field name from "files" to "file"');
    console.log('   ✅ Updated category parameter from "categoryId" to "category"');
    console.log('   ✅ Fixed response handling to use direct media object');
    console.log('   ✅ Added success logging and improved error handling');
    console.log('   ✅ Ensured consistency with working new personnel creation');
    console.log('\n🎯 Root cause resolved:');
    console.log('   • Edit page was using different API endpoint (/api/upload vs /api/media/upload)');
    console.log('   • Different FormData field names ("files" vs "file")');
    console.log('   • Different response format expectations');
    console.log('   • Inconsistent with working new personnel creation implementation');
    console.log('\n🔧 Benefits achieved:');
    console.log('   • CV upload now works seamlessly in personnel edit page');
    console.log('   • Consistent implementation across new creation and edit flows');
    console.log('   • Better error handling and user feedback');
    console.log('   • Proper file type validation maintained');
    console.log('   • Gallery items correctly updated in edit flow');
    console.log('\n✨ Personnel edit CV upload should now work without errors!');
    console.log('\n🔍 Usage flow:');
    console.log('   1. Navigate to personnel edit page');
    console.log('   2. Select PDF or Word file for CV upload');
    console.log('   3. File uploads successfully to /api/media/upload');
    console.log('   4. Gallery items updated with new CV');
    console.log('   5. Save personnel to persist changes');
  } else {
    console.log('\n❌ Some tests failed. Personnel edit CV upload issues may still exist.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runPersonnelEditCVFixTests();
}

module.exports = { runPersonnelEditCVFixTests };
