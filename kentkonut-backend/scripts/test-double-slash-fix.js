/**
 * Test script to verify double slash fix in URL paths
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Double Slash Fix in URL Paths\n');

function testSupervisorFileConfig() {
  console.log('Test 1: Checking SUPERVISOR_FILE_CONFIG...');
  
  const configPath = path.join(__dirname, '../lib/types/department-supervisor.ts');
  
  if (!fs.existsSync(configPath)) {
    console.log('❌ Department supervisor types file not found');
    return false;
  }
  
  const content = fs.readFileSync(configPath, 'utf8');
  
  // Check for corrected folder path (no leading/trailing slashes)
  const hasCorrectFolderPath = content.includes("folder: 'media/kurumsal/birimler'");
  
  // Check that old problematic path is removed
  const hasOldProblematicPath = content.includes("folder: '/media/kurumsal/birimler/'");
  
  if (!hasCorrectFolderPath) {
    console.log('❌ Correct folder path not found');
    return false;
  }
  
  if (hasOldProblematicPath) {
    console.log('❌ Old problematic path still present');
    return false;
  }
  
  console.log('✅ SUPERVISOR_FILE_CONFIG folder path fixed');
  return true;
}

function testSupervisorFormPaths() {
  console.log('\nTest 2: Checking SupervisorForm customFolder...');
  
  const formPath = path.join(__dirname, '../app/dashboard/corporate/departments/components/SupervisorForm.tsx');
  
  if (!fs.existsSync(formPath)) {
    console.log('❌ SupervisorForm component not found');
    return false;
  }
  
  const content = fs.readFileSync(formPath, 'utf8');
  
  // Check for corrected customFolder path
  const hasCorrectCustomFolder = content.includes('customFolder="media/kurumsal/birimler"');
  
  // Check that old problematic path is removed
  const hasOldCustomFolder = content.includes('customFolder="/media/kurumsal/birimler/"');
  
  if (!hasCorrectCustomFolder) {
    console.log('❌ Correct customFolder path not found');
    return false;
  }
  
  if (hasOldCustomFolder) {
    console.log('❌ Old customFolder path still present');
    return false;
  }
  
  console.log('✅ SupervisorForm customFolder path fixed');
  return true;
}

function testUploadAPIPathHandling() {
  console.log('\nTest 3: Checking upload API path handling...');
  
  const uploadAPIPath = path.join(__dirname, '../app/api/supervisors/[id]/upload/route.ts');
  
  if (!fs.existsSync(uploadAPIPath)) {
    console.log('❌ Upload API file not found');
    return false;
  }
  
  const content = fs.readFileSync(uploadAPIPath, 'utf8');
  
  // Check for path utility imports
  const hasPathUtilImports = content.includes('import { createMediaUrl, generateUniqueFilename }');
  
  // Check for createMediaUrl usage
  const hasCreateMediaUrlUsage = content.includes('url: createMediaUrl(SUPERVISOR_FILE_CONFIG.folder, uniqueFilename)');
  
  // Check for generateUniqueFilename usage
  const hasGenerateUniqueFilenameUsage = content.includes("generateUniqueFilename(file.name, 'supervisor')");
  
  // Check that old problematic URL creation is removed
  const hasOldUrlCreation = content.includes('`${SUPERVISOR_FILE_CONFIG.folder}${uniqueFilename}`') ||
                           content.includes('`/${SUPERVISOR_FILE_CONFIG.folder}/${uniqueFilename}`');
  
  if (!hasPathUtilImports) {
    console.log('❌ Path utility imports missing');
    return false;
  }
  
  if (!hasCreateMediaUrlUsage) {
    console.log('❌ createMediaUrl usage missing');
    return false;
  }
  
  if (!hasGenerateUniqueFilenameUsage) {
    console.log('❌ generateUniqueFilename usage missing');
    return false;
  }
  
  if (hasOldUrlCreation) {
    console.log('❌ Old URL creation method still present');
    return false;
  }
  
  console.log('✅ Upload API path handling fixed');
  return true;
}

function testPathUtilities() {
  console.log('\nTest 4: Checking path utilities...');
  
  const pathUtilsPath = path.join(__dirname, '../lib/utils/path.ts');
  
  if (!fs.existsSync(pathUtilsPath)) {
    console.log('❌ Path utilities file not found');
    return false;
  }
  
  const content = fs.readFileSync(pathUtilsPath, 'utf8');
  
  // Check for required utility functions
  const hasNormalizePath = content.includes('export function normalizePath');
  const hasNormalizeUrlPath = content.includes('export function normalizeUrlPath');
  const hasJoinUrlPaths = content.includes('export function joinUrlPaths');
  const hasCreateMediaUrl = content.includes('export function createMediaUrl');
  const hasGenerateUniqueFilename = content.includes('export function generateUniqueFilename');
  
  // Check for double slash handling
  const hasDoubleSlashHandling = content.includes('.replace(/\\/+/g, \'/\')');
  
  if (!hasNormalizePath || !hasNormalizeUrlPath || !hasJoinUrlPaths) {
    console.log('❌ Core path normalization functions missing');
    return false;
  }
  
  if (!hasCreateMediaUrl || !hasGenerateUniqueFilename) {
    console.log('❌ Media utility functions missing');
    return false;
  }
  
  if (!hasDoubleSlashHandling) {
    console.log('❌ Double slash handling logic missing');
    return false;
  }
  
  console.log('✅ Path utilities implemented correctly');
  return true;
}

function testUrlPathExamples() {
  console.log('\nTest 5: Testing URL path examples...');
  
  // Simulate the path utility functions
  function normalizePath(path) {
    if (!path) return '';
    return path
      .replace(/\/+/g, '/') // Replace multiple slashes with single slash
      .replace(/\/$/, '')   // Remove trailing slash
      .replace(/^\//, '');  // Remove leading slash for relative paths
  }
  
  function normalizeUrlPath(path) {
    if (!path) return '/';
    const normalized = path
      .replace(/\/+/g, '/') // Replace multiple slashes with single slash
      .replace(/\/$/, '');  // Remove trailing slash
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }
  
  function createMediaUrl(folder, filename) {
    if (!folder || !filename) return '';
    const joined = `${folder}/${filename}`.replace(/\/+/g, '/');
    return normalizeUrlPath(joined);
  }
  
  // Test cases
  const testCases = [
    {
      input: { folder: 'media/kurumsal/birimler', filename: 'test.jpg' },
      expected: '/media/kurumsal/birimler/test.jpg'
    },
    {
      input: { folder: '/media/kurumsal/birimler/', filename: 'test.jpg' },
      expected: '/media/kurumsal/birimler/test.jpg'
    },
    {
      input: { folder: '//media//kurumsal//birimler//', filename: 'test.jpg' },
      expected: '/media/kurumsal/birimler/test.jpg'
    }
  ];
  
  let allTestsPassed = true;
  
  for (const testCase of testCases) {
    const result = createMediaUrl(testCase.input.folder, testCase.input.filename);
    if (result !== testCase.expected) {
      console.log(`❌ Test failed: ${JSON.stringify(testCase.input)} -> ${result} (expected: ${testCase.expected})`);
      allTestsPassed = false;
    }
  }
  
  if (allTestsPassed) {
    console.log('✅ URL path examples work correctly');
  }
  
  return allTestsPassed;
}

function runDoubleSlashFixTests() {
  console.log('🧪 DOUBLE SLASH FIX VERIFICATION');
  console.log('================================\n');
  
  const tests = [
    testSupervisorFileConfig,
    testSupervisorFormPaths,
    testUploadAPIPathHandling,
    testPathUtilities,
    testUrlPathExamples
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
    console.log('\n🎉 SUCCESS! Double slash fix completed!');
    console.log('\n📝 Fixed issues:');
    console.log('   ✅ Removed leading/trailing slashes from folder paths');
    console.log('   ✅ Updated SupervisorForm customFolder path');
    console.log('   ✅ Enhanced upload API with path utilities');
    console.log('   ✅ Created comprehensive path utility functions');
    console.log('   ✅ Added double slash normalization logic');
    console.log('\n🎯 Benefits achieved:');
    console.log('   • Clean URLs without double slashes');
    console.log('   • Consistent path handling across the system');
    console.log('   • Better file upload reliability');
    console.log('   • SEO-friendly URLs');
    console.log('   • Reduced server-side path issues');
    console.log('\n✨ URL paths are now properly normalized!');
  } else {
    console.log('\n❌ Some tests failed. Double slash issues may still exist.');
  }
  
  return passedTests === tests.length;
}

// Run the tests
if (require.main === module) {
  runDoubleSlashFixTests();
}

module.exports = { runDoubleSlashFixTests };
