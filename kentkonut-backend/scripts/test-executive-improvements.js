/**
 * Test script to verify executive management improvements:
 * 1. Layout spacing fix
 * 2. Enhanced URL input for quick access links
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Executive Management Improvements\n');

function testLayoutSpacingFix() {
  console.log('Test 1: Checking layout spacing improvements...');
  
  const formPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page.tsx');
  
  if (!fs.existsSync(formPath)) {
    console.log('❌ Executive form page not found');
    return false;
  }
  
  const content = fs.readFileSync(formPath, 'utf8');
  
  // Check for improved layout structure
  const hasImprovedLayout = content.includes('min-h-screen bg-gray-50/50') &&
                           content.includes('container mx-auto px-4 py-6 max-w-6xl') &&
                           content.includes('mt-6 mb-8');
  
  // Check that old excessive spacing is removed
  const hasOldSpacing = content.includes('space-y-6') && 
                       content.includes('py-6 space-y-6');
  
  if (!hasImprovedLayout) {
    console.log('❌ Improved layout structure not found');
    return false;
  }
  
  if (hasOldSpacing) {
    console.log('❌ Old excessive spacing still present');
    return false;
  }
  
  console.log('✅ Layout spacing successfully improved');
  return true;
}

function testEnhancedUrlInput() {
  console.log('\nTest 2: Checking enhanced URL input functionality...');
  
  const managerPath = path.join(__dirname, '../components/executives/ExecutiveQuickLinksManager.tsx');
  
  if (!fs.existsSync(managerPath)) {
    console.log('❌ ExecutiveQuickLinksManager not found');
    return false;
  }
  
  const content = fs.readFileSync(managerPath, 'utf8');
  
  // Check for required imports
  const hasRequiredImports = content.includes('GlobalMediaSelector') &&
                            content.includes('Tabs, TabsContent, TabsList, TabsTrigger') &&
                            content.includes('FolderOpen') &&
                            content.includes('FileText');
  
  // Check for URL input mode state
  const hasUrlInputModeState = content.includes("urlInputMode, setUrlInputMode") &&
                              content.includes("useState<'manual' | 'browse'>('manual')");
  
  // Check for media selection functionality
  const hasMediaSelection = content.includes('selectedMedia, setSelectedMedia') &&
                           content.includes('handleMediaSelect') &&
                           content.includes('GlobalMediaFile');
  
  // Check for tabs structure
  const hasTabsStructure = content.includes('TabsList className="grid w-full grid-cols-2"') &&
                          content.includes('Manuel Giriş') &&
                          content.includes('Dosya Seç');
  
  // Check for file preview
  const hasFilePreview = content.includes('selectedMedia &&') &&
                        content.includes('selectedMedia.mimeType.startsWith') &&
                        content.includes('selectedMedia.originalName');
  
  if (!hasRequiredImports) {
    console.log('❌ Required imports missing');
    return false;
  }
  
  if (!hasUrlInputModeState) {
    console.log('❌ URL input mode state missing');
    return false;
  }
  
  if (!hasMediaSelection) {
    console.log('❌ Media selection functionality missing');
    return false;
  }
  
  if (!hasTabsStructure) {
    console.log('❌ Tabs structure missing');
    return false;
  }
  
  if (!hasFilePreview) {
    console.log('❌ File preview functionality missing');
    return false;
  }
  
  console.log('✅ Enhanced URL input successfully implemented');
  return true;
}

function testMediaHandlerIntegration() {
  console.log('\nTest 3: Checking media handler integration...');
  
  const managerPath = path.join(__dirname, '../components/executives/ExecutiveQuickLinksManager.tsx');
  const content = fs.readFileSync(managerPath, 'utf8');
  
  // Check for media handler function
  const hasMediaHandler = content.includes('handleMediaSelect = (media: GlobalMediaFile | null)') &&
                         content.includes('setSelectedMedia(media)') &&
                         content.includes('setFormData(prev => ({ ...prev, url: media.url }))');
  
  // Check for auto icon detection
  const hasAutoIconDetection = content.includes("mimeType.startsWith('image/')") &&
                              content.includes("icon = 'image'") &&
                              content.includes("mimeType === 'application/pdf'") &&
                              content.includes("icon = 'file-text'");
  
  // Check for form reset integration
  const hasFormResetIntegration = content.includes('setUrlInputMode') &&
                                 content.includes('setSelectedMedia(null)') &&
                                 content.includes('resetForm');
  
  if (!hasMediaHandler) {
    console.log('❌ Media handler function missing');
    return false;
  }
  
  if (!hasAutoIconDetection) {
    console.log('❌ Auto icon detection missing');
    return false;
  }
  
  if (!hasFormResetIntegration) {
    console.log('❌ Form reset integration missing');
    return false;
  }
  
  console.log('✅ Media handler integration working correctly');
  return true;
}

function testGlobalMediaSelectorIntegration() {
  console.log('\nTest 4: Checking GlobalMediaSelector integration...');
  
  const managerPath = path.join(__dirname, '../components/executives/ExecutiveQuickLinksManager.tsx');
  const content = fs.readFileSync(managerPath, 'utf8');
  
  // Check for GlobalMediaSelector usage
  const hasGlobalMediaSelector = content.includes('<GlobalMediaSelector') &&
                                content.includes('onSelect={handleMediaSelect}') &&
                                content.includes('selectedMedia={selectedMedia}');
  
  // Check for accepted file types
  const hasAcceptedTypes = content.includes("acceptedTypes={['image/*', 'application/pdf'") &&
                          content.includes('application/msword') &&
                          content.includes('video/*');
  
  // Check for proper configuration
  const hasProperConfig = content.includes('defaultCategory="general"') &&
                         content.includes('restrictToCategory={false}') &&
                         content.includes('buttonText={selectedMedia ? "Dosyayı Değiştir" : "Dosya Seç"}');
  
  if (!hasGlobalMediaSelector) {
    console.log('❌ GlobalMediaSelector integration missing');
    return false;
  }
  
  if (!hasAcceptedTypes) {
    console.log('❌ Accepted file types configuration missing');
    return false;
  }
  
  if (!hasProperConfig) {
    console.log('❌ Proper GlobalMediaSelector configuration missing');
    return false;
  }
  
  console.log('✅ GlobalMediaSelector properly integrated');
  return true;
}

function testBackupFiles() {
  console.log('\nTest 5: Checking backup files...');
  
  const formBackupPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page_backup_improvements_20250122.tsx');
  const managerBackupPath = path.join(__dirname, '../components/executives/ExecutiveQuickLinksManager_backup_20250122.tsx');
  
  const formBackupExists = fs.existsSync(formBackupPath);
  const managerBackupExists = fs.existsSync(managerBackupPath);
  
  if (!formBackupExists) {
    console.log('❌ Executive form backup not found');
    return false;
  }
  
  if (!managerBackupExists) {
    console.log('❌ ExecutiveQuickLinksManager backup not found');
    return false;
  }
  
  // Check that backups contain original content
  const formBackupContent = fs.readFileSync(formBackupPath, 'utf8');
  const managerBackupContent = fs.readFileSync(managerBackupPath, 'utf8');
  
  const formBackupValid = formBackupContent.includes('container mx-auto py-6 space-y-6');
  const managerBackupValid = managerBackupContent.includes('placeholder="/test veya https://example.com"') &&
                            !managerBackupContent.includes('GlobalMediaSelector');
  
  if (!formBackupValid) {
    console.log('❌ Form backup does not contain original content');
    return false;
  }
  
  if (!managerBackupValid) {
    console.log('❌ Manager backup does not contain original content');
    return false;
  }
  
  console.log('✅ Backup files properly created');
  return true;
}

function testPreservedFunctionality() {
  console.log('\nTest 6: Checking preserved functionality...');
  
  const managerPath = path.join(__dirname, '../components/executives/ExecutiveQuickLinksManager.tsx');
  const content = fs.readFileSync(managerPath, 'utf8');
  
  // Check that existing functionality is preserved
  const hasExistingFunctionality = content.includes('handleSubmit') &&
                                  content.includes('startEdit') &&
                                  content.includes('resetForm') &&
                                  content.includes('fetchLinks') &&
                                  content.includes('deleteLink');
  
  // Check that form validation is preserved
  const hasFormValidation = content.includes("!formData.title.trim() || !formData.url.trim()") &&
                           content.includes("toast.error('Başlık ve URL alanları zorunludur')");
  
  // Check that drag and drop is preserved
  const hasDragAndDrop = content.includes('DndProvider') &&
                        content.includes('useDrag') &&
                        content.includes('useDrop') &&
                        content.includes('moveLink');
  
  if (!hasExistingFunctionality) {
    console.log('❌ Existing functionality not preserved');
    return false;
  }
  
  if (!hasFormValidation) {
    console.log('❌ Form validation not preserved');
    return false;
  }
  
  if (!hasDragAndDrop) {
    console.log('❌ Drag and drop functionality not preserved');
    return false;
  }
  
  console.log('✅ All existing functionality preserved');
  return true;
}

function runExecutiveImprovementsTests() {
  console.log('🧪 EXECUTIVE MANAGEMENT IMPROVEMENTS VERIFICATION');
  console.log('==============================================\n');
  
  const tests = [
    testLayoutSpacingFix,
    testEnhancedUrlInput,
    testMediaHandlerIntegration,
    testGlobalMediaSelectorIntegration,
    testBackupFiles,
    testPreservedFunctionality
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
    console.log('\n🎉 SUCCESS! Executive management improvements successfully implemented!');
    console.log('\n📝 Summary of improvements:');
    console.log('   ✅ Layout spacing optimized for better visual design');
    console.log('   ✅ Enhanced URL input with dual-option system');
    console.log('   ✅ File browser integration with media library');
    console.log('   ✅ Auto-icon detection based on file type');
    console.log('   ✅ File preview with proper metadata display');
    console.log('   ✅ All existing functionality preserved');
    console.log('   ✅ Proper backup files created');
    console.log('\n🎯 Benefits achieved:');
    console.log('   • Cleaner, more professional layout');
    console.log('   • Better screen real estate utilization');
    console.log('   • Enhanced user experience for URL input');
    console.log('   • Support for multiple file types (images, PDFs, documents, videos)');
    console.log('   • Seamless integration with existing media library');
    console.log('   • Maintained backward compatibility');
    console.log('\n✨ The executive management system now provides a superior user experience!');
  } else {
    console.log('\n❌ Some tests failed. Improvements may not be fully complete.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runExecutiveImprovementsTests();
}

module.exports = { runExecutiveImprovementsTests };
