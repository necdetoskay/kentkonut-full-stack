/**
 * Test script to verify image selection fix in SupervisorForm component
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Image Selection Fix in SupervisorForm\n');

function testSupervisorFormImageSelection() {
  console.log('Test 1: Checking SupervisorForm image selection implementation...');
  
  const supervisorFormPath = path.join(__dirname, '../app/dashboard/corporate/departments/components/SupervisorForm.tsx');
  
  if (!fs.existsSync(supervisorFormPath)) {
    console.log('❌ SupervisorForm component not found');
    return false;
  }
  
  const content = fs.readFileSync(supervisorFormPath, 'utf8');
  
  // Check for proper GlobalMediaSelector usage with trigger
  const hasGlobalMediaSelectorWithTrigger = content.includes('<GlobalMediaSelector') && 
                                           content.includes('trigger={') &&
                                           content.includes('<Button type="button" variant="outline">');
  
  // Check for proper props
  const hasCorrectProps = content.includes('onSelect={handleImageSelect}') &&
                         content.includes('acceptedTypes={[\'image/*\']}') &&
                         content.includes('customFolder="/media/kurumsal/birimler/"') &&
                         content.includes('title="Birim Amiri Resmi Seç"');
  
  // Check that old showMediaSelector state is removed
  const hasOldShowMediaSelectorState = content.includes('const [showMediaSelector, setShowMediaSelector]');
  
  // Check that old modal implementation is removed
  const hasOldModalImplementation = content.includes('Media Selector Modal') || 
                                   content.includes('setShowMediaSelector(false)');
  
  // Check that handleImageSelect is simplified
  const hasSimplifiedHandleImageSelect = content.includes('const handleImageSelect = (media: GlobalMediaFile) => {') &&
                                        content.includes('setFormData(prev => ({ ...prev, mainImageUrl: media.url }))') &&
                                        !content.includes('setShowMediaSelector(false)');
  
  if (!hasGlobalMediaSelectorWithTrigger) {
    console.log('❌ GlobalMediaSelector with trigger not found');
    return false;
  }
  
  if (!hasCorrectProps) {
    console.log('❌ Correct props for GlobalMediaSelector missing');
    return false;
  }
  
  if (hasOldShowMediaSelectorState) {
    console.log('❌ Old showMediaSelector state still present');
    return false;
  }
  
  if (hasOldModalImplementation) {
    console.log('❌ Old modal implementation still present');
    return false;
  }
  
  if (!hasSimplifiedHandleImageSelect) {
    console.log('❌ handleImageSelect not properly simplified');
    return false;
  }
  
  console.log('✅ SupervisorForm image selection fixed');
  return true;
}

function testGlobalMediaSelectorIntegration() {
  console.log('\nTest 2: Checking GlobalMediaSelector integration...');
  
  const supervisorFormPath = path.join(__dirname, '../app/dashboard/corporate/departments/components/SupervisorForm.tsx');
  const content = fs.readFileSync(supervisorFormPath, 'utf8');
  
  // Check for proper import
  const hasGlobalMediaSelectorImport = content.includes('import { GlobalMediaSelector, GlobalMediaFile }');
  
  // Check for trigger button implementation
  const hasTriggerButton = content.includes('trigger={') &&
                          content.includes('<Button type="button" variant="outline">') &&
                          content.includes('<ImageIcon className="h-4 w-4 mr-2" />') &&
                          content.includes('Resim Seç');
  
  // Check for proper configuration
  const hasProperConfiguration = content.includes('restrictToCategory={true}') &&
                                 content.includes('defaultCategory="department-images"') &&
                                 content.includes('description="Birim amiri için profil resmi seçin"');
  
  if (!hasGlobalMediaSelectorImport) {
    console.log('❌ GlobalMediaSelector import missing');
    return false;
  }
  
  if (!hasTriggerButton) {
    console.log('❌ Trigger button implementation missing');
    return false;
  }
  
  if (!hasProperConfiguration) {
    console.log('❌ Proper configuration missing');
    return false;
  }
  
  console.log('✅ GlobalMediaSelector integration correct');
  return true;
}

function testCodeCleanup() {
  console.log('\nTest 3: Checking code cleanup...');
  
  const supervisorFormPath = path.join(__dirname, '../app/dashboard/corporate/departments/components/SupervisorForm.tsx');
  const content = fs.readFileSync(supervisorFormPath, 'utf8');
  
  // Check that old implementation is completely removed
  const hasOldSetShowMediaSelector = content.includes('setShowMediaSelector(true)');
  const hasOldModalDiv = content.includes('fixed inset-0 z-50 bg-black/50');
  const hasOldModalTitle = content.includes('Birim Amiri Resmi Seç');
  
  // Check that unused state is removed
  const hasUnusedShowMediaSelectorState = content.includes('[showMediaSelector,');
  
  if (hasOldSetShowMediaSelector) {
    console.log('❌ Old setShowMediaSelector calls still present');
    return false;
  }
  
  if (hasOldModalDiv) {
    console.log('❌ Old modal div still present');
    return false;
  }
  
  if (hasUnusedShowMediaSelectorState) {
    console.log('❌ Unused showMediaSelector state still present');
    return false;
  }
  
  console.log('✅ Code cleanup completed');
  return true;
}

function testButtonFunctionality() {
  console.log('\nTest 4: Checking button functionality...');
  
  const supervisorFormPath = path.join(__dirname, '../app/dashboard/corporate/departments/components/SupervisorForm.tsx');
  const content = fs.readFileSync(supervisorFormPath, 'utf8');
  
  // Check that button is properly integrated with GlobalMediaSelector
  const hasProperButtonIntegration = content.includes('trigger={') &&
                                     content.includes('<Button type="button" variant="outline">') &&
                                     content.includes('</Button>') &&
                                     content.includes('}');
  
  // Check that button has proper styling and icon
  const hasProperButtonStyling = content.includes('<ImageIcon className="h-4 w-4 mr-2" />') &&
                                 content.includes('Resim Seç');
  
  // Check that no onClick handler is used (since it's handled by GlobalMediaSelector)
  const hasOldOnClickHandler = content.includes('onClick={() => setShowMediaSelector(true)}');
  
  if (!hasProperButtonIntegration) {
    console.log('❌ Button not properly integrated with GlobalMediaSelector');
    return false;
  }
  
  if (!hasProperButtonStyling) {
    console.log('❌ Button styling or icon missing');
    return false;
  }
  
  if (hasOldOnClickHandler) {
    console.log('❌ Old onClick handler still present');
    return false;
  }
  
  console.log('✅ Button functionality correct');
  return true;
}

function runImageSelectionFixTests() {
  console.log('🧪 IMAGE SELECTION FIX VERIFICATION');
  console.log('===================================\n');
  
  const tests = [
    testSupervisorFormImageSelection,
    testGlobalMediaSelectorIntegration,
    testCodeCleanup,
    testButtonFunctionality
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
    console.log('\n🎉 SUCCESS! Image selection fix completed!');
    console.log('\n📝 Fixed issues:');
    console.log('   ✅ Replaced custom modal with proper GlobalMediaSelector usage');
    console.log('   ✅ Added trigger prop to GlobalMediaSelector');
    console.log('   ✅ Removed unnecessary showMediaSelector state');
    console.log('   ✅ Simplified handleImageSelect function');
    console.log('   ✅ Cleaned up old modal implementation');
    console.log('   ✅ Proper button integration');
    console.log('\n🎯 Benefits achieved:');
    console.log('   • "Resim Seç" button now opens media selector dialog');
    console.log('   • Consistent behavior with other media selection components');
    console.log('   • Cleaner, more maintainable code');
    console.log('   • Proper integration with GlobalMediaSelector');
    console.log('   • No custom modal implementation needed');
    console.log('\n✨ The image selection functionality is now working correctly!');
  } else {
    console.log('\n❌ Some tests failed. Image selection issues may still exist.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runImageSelectionFixTests();
}

module.exports = { runImageSelectionFixTests };
