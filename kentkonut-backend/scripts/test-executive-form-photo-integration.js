/**
 * Test script to verify that the profile photo functionality has been successfully
 * moved from the sidebar into the "Yönetici Bilgileri" tab
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Executive Form Photo Integration\n');

function testPhotoSectionMovedToTab() {
  console.log('Test 1: Checking photo section moved to "Yönetici Bilgileri" tab...');
  
  const formPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page.tsx');
  
  if (!fs.existsSync(formPath)) {
    console.log('❌ Executive form page not found');
    return false;
  }
  
  const content = fs.readFileSync(formPath, 'utf8');
  
  // Check that photo section is inside the "info" TabsContent
  const hasPhotoInTab = content.includes('<TabsContent value="info">') &&
                       content.includes('Profil Fotoğrafı') &&
                       content.includes('GlobalMediaSelector');
  
  // Check that photo section appears after the basic info but before settings
  const photoSectionIndex = content.indexOf('Profil Fotoğrafı');
  const settingsIndex = content.indexOf('Settings */');
  const tabContentIndex = content.indexOf('<TabsContent value="info">');
  
  const isPhotoInCorrectPosition = photoSectionIndex > tabContentIndex && 
                                  photoSectionIndex < settingsIndex;
  
  if (!hasPhotoInTab) {
    console.log('❌ Photo section not found in "Yönetici Bilgileri" tab');
    return false;
  }
  
  if (!isPhotoInCorrectPosition) {
    console.log('❌ Photo section not in correct position within tab');
    return false;
  }
  
  console.log('✅ Photo section successfully moved to "Yönetici Bilgileri" tab');
  return true;
}

function testSidebarPhotoSectionRemoved() {
  console.log('\nTest 2: Checking sidebar photo section removed...');
  
  const formPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page.tsx');
  const content = fs.readFileSync(formPath, 'utf8');
  
  // Check that the old sidebar structure is removed
  const hasOldGridStructure = content.includes('lg:grid-cols-3') ||
                             content.includes('lg:col-span-2');
  
  // Check that the old media selection card outside tabs is removed
  const hasOldMediaCard = content.includes('Media Selection - PROJELERDEKİ GİBİ ÇALIŞAN YAKLAŞIM');
  
  if (hasOldGridStructure) {
    console.log('❌ Old grid structure still present');
    return false;
  }
  
  if (hasOldMediaCard) {
    console.log('❌ Old media selection card still present');
    return false;
  }
  
  console.log('✅ Sidebar photo section successfully removed');
  return true;
}

function testLayoutStructure() {
  console.log('\nTest 3: Checking new layout structure...');
  
  const formPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page.tsx');
  const content = fs.readFileSync(formPath, 'utf8');
  
  // Check for new centered layout
  const hasNewLayout = content.includes('max-w-4xl mx-auto');
  
  // Check that save button is moved to bottom of tabs
  const saveButtonIndex = content.indexOf('Save className="mr-2 h-4 w-4"');
  const tabsEndIndex = content.indexOf('</Tabs>');
  
  const isSaveButtonInCorrectPosition = saveButtonIndex > tabsEndIndex;
  
  if (!hasNewLayout) {
    console.log('❌ New centered layout not implemented');
    return false;
  }
  
  if (!isSaveButtonInCorrectPosition) {
    console.log('❌ Save button not in correct position');
    return false;
  }
  
  console.log('✅ New layout structure properly implemented');
  return true;
}

function testPhotoFunctionalityPreserved() {
  console.log('\nTest 4: Checking photo functionality preserved...');
  
  const formPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page.tsx');
  const content = fs.readFileSync(formPath, 'utf8');
  
  // Check that all photo-related functionality is preserved
  const hasImagePreview = content.includes('selectedMedia &&') &&
                         content.includes('aspect-square') &&
                         content.includes('object-cover');
  
  const hasRemoveButton = content.includes('Fotoğrafı Kaldır') &&
                         content.includes('setSelectedMedia(null)');
  
  const hasMediaSelector = content.includes('GlobalMediaSelector') &&
                          content.includes('onSelect={handleMediaSelect}') &&
                          content.includes('customFolder="media/kurumsal"');
  
  const hasMediaHandling = content.includes('handleMediaSelect') &&
                          content.includes('setSelectedMedia');
  
  if (!hasImagePreview) {
    console.log('❌ Image preview functionality missing');
    return false;
  }
  
  if (!hasRemoveButton) {
    console.log('❌ Remove button functionality missing');
    return false;
  }
  
  if (!hasMediaSelector) {
    console.log('❌ Media selector functionality missing');
    return false;
  }
  
  if (!hasMediaHandling) {
    console.log('❌ Media handling functions missing');
    return false;
  }
  
  console.log('✅ Photo functionality properly preserved');
  return true;
}

function testTabStructureIntegrity() {
  console.log('\nTest 5: Checking tab structure integrity...');
  
  const formPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page.tsx');
  const content = fs.readFileSync(formPath, 'utf8');
  
  // Check that tab structure is intact
  const hasTabsList = content.includes('<TabsList') &&
                     content.includes('Yönetici Bilgileri') &&
                     content.includes('Hızlı Erişim Linkleri');
  
  const hasInfoTab = content.includes('<TabsContent value="info">') &&
                    content.includes('</TabsContent>');
  
  const hasQuickLinksTab = content.includes('<TabsContent value="quicklinks">') &&
                          content.includes('ExecutiveQuickLinksManager');
  
  // Check that photo section is properly integrated within CardContent
  const photoInCardContent = content.includes('Profil Fotoğrafı') &&
                            content.includes('<CardContent className="space-y-6">');
  
  if (!hasTabsList) {
    console.log('❌ Tabs list structure missing');
    return false;
  }
  
  if (!hasInfoTab) {
    console.log('❌ Info tab structure missing');
    return false;
  }
  
  if (!hasQuickLinksTab) {
    console.log('❌ Quick links tab structure missing');
    return false;
  }
  
  if (!photoInCardContent) {
    console.log('❌ Photo section not properly integrated in CardContent');
    return false;
  }
  
  console.log('✅ Tab structure integrity maintained');
  return true;
}

function testBackupExists() {
  console.log('\nTest 6: Checking backup file exists...');
  
  const backupPath = path.join(__dirname, '../app/dashboard/corporate/executives/form/page_backup_20250122.tsx');
  
  if (!fs.existsSync(backupPath)) {
    console.log('❌ Backup file not found');
    return false;
  }
  
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  
  // Check that backup contains the old structure
  const hasOldStructure = backupContent.includes('lg:grid-cols-3') &&
                         backupContent.includes('Media Selection - PROJELERDEKİ GİBİ ÇALIŞAN YAKLAŞIM');
  
  if (!hasOldStructure) {
    console.log('❌ Backup does not contain original structure');
    return false;
  }
  
  console.log('✅ Backup file properly created with original structure');
  return true;
}

function runExecutiveFormPhotoIntegrationTests() {
  console.log('🧪 EXECUTIVE FORM PHOTO INTEGRATION VERIFICATION');
  console.log('===============================================\n');
  
  const tests = [
    testPhotoSectionMovedToTab,
    testSidebarPhotoSectionRemoved,
    testLayoutStructure,
    testPhotoFunctionalityPreserved,
    testTabStructureIntegrity,
    testBackupExists
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
    console.log('\n🎉 SUCCESS! Profile photo functionality successfully moved to "Yönetici Bilgileri" tab!');
    console.log('\n📝 Summary of changes:');
    console.log('   ✅ Profile photo section moved inside "Yönetici Bilgileri" tab');
    console.log('   ✅ Sidebar photo section completely removed');
    console.log('   ✅ Layout changed from 3-column grid to centered single column');
    console.log('   ✅ Save button moved to bottom of tabs');
    console.log('   ✅ All photo functionality preserved (preview, select, remove)');
    console.log('   ✅ Tab structure integrity maintained');
    console.log('   ✅ Backup created with original structure');
    console.log('\n🎯 Benefits achieved:');
    console.log('   • Cleaner, more organized layout');
    console.log('   • All administrator information in one tab');
    console.log('   • Better user experience with logical grouping');
    console.log('   • Consistent with tab design patterns');
    console.log('   • Maintained all existing functionality');
    console.log('\n✨ The executive form now has a clean, organized layout with photo management integrated into the appropriate tab!');
  } else {
    console.log('\n❌ Some tests failed. Photo integration may not be fully complete.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runExecutiveFormPhotoIntegrationTests();
}

module.exports = { runExecutiveFormPhotoIntegrationTests };
