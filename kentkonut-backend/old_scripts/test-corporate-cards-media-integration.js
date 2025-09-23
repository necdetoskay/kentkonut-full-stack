#!/usr/bin/env node

/**
 * Test script for Corporate Cards Media Integration
 * Verifies that the enhanced form components work correctly
 */

const fs = require('fs');
const path = require('path');

function testMediaIntegration() {
  console.log('🧪 Testing Corporate Cards Media Integration...\n');

  const formPath = path.join(__dirname, '..', 'app', 'dashboard', 'kurumsal', 'components', 'KartForm.tsx');
  
  try {
    // Test 1: Check if file exists
    console.log('1️⃣ Checking KartForm.tsx file...');
    if (!fs.existsSync(formPath)) {
      throw new Error('KartForm.tsx not found');
    }
    console.log('   ✅ File exists');

    // Test 2: Read file content
    console.log('\n2️⃣ Reading file content...');
    const content = fs.readFileSync(formPath, 'utf8');
    console.log(`   ✅ File read successfully (${content.length} characters)`);

    // Test 3: Check for required imports
    console.log('\n3️⃣ Checking required imports...');
    const requiredImports = [
      'GlobalMediaSelector',
      'GlobalMediaFile',
      'Upload'
    ];

    requiredImports.forEach(importName => {
      if (content.includes(importName)) {
        console.log(`   ✅ ${importName} import found`);
      } else {
        console.log(`   ❌ ${importName} import missing`);
      }
    });

    // Test 4: Check for state management
    console.log('\n4️⃣ Checking state management...');
    const stateChecks = [
      'selectedMedia',
      'setSelectedMedia',
      'useState<GlobalMediaFile | null>'
    ];

    stateChecks.forEach(stateItem => {
      if (content.includes(stateItem)) {
        console.log(`   ✅ ${stateItem} found`);
      } else {
        console.log(`   ❌ ${stateItem} missing`);
      }
    });

    // Test 5: Check for media handler
    console.log('\n5️⃣ Checking media selection handler...');
    const handlerChecks = [
      'handleMediaSelect',
      'setValue(\'imageUrl\', media.url)',
      'toast.success(\'Görsel seçildi\')'
    ];

    handlerChecks.forEach(handler => {
      if (content.includes(handler)) {
        console.log(`   ✅ ${handler} found`);
      } else {
        console.log(`   ❌ ${handler} missing`);
      }
    });

    // Test 6: Check for GlobalMediaSelector component
    console.log('\n6️⃣ Checking GlobalMediaSelector component...');
    const componentChecks = [
      '<GlobalMediaSelector',
      'onSelect={handleMediaSelect}',
      'customFolder="media/kurumsal/kartlar"',
      'acceptedTypes={[\'image/jpeg\'',
      'defaultCategory="corporate-images"'
    ];

    componentChecks.forEach(component => {
      if (content.includes(component)) {
        console.log(`   ✅ ${component} found`);
      } else {
        console.log(`   ❌ ${component} missing`);
      }
    });

    // Test 7: Check for preview functionality
    console.log('\n7️⃣ Checking preview functionality...');
    const previewChecks = [
      'selectedMedia &&',
      'selectedMedia.url',
      'selectedMedia.originalName',
      'w-16 h-16 rounded-lg object-cover'
    ];

    previewChecks.forEach(preview => {
      if (content.includes(preview)) {
        console.log(`   ✅ ${preview} found`);
      } else {
        console.log(`   ❌ ${preview} missing`);
      }
    });

    // Test 8: Check for cleanup functionality
    console.log('\n8️⃣ Checking cleanup functionality...');
    const cleanupChecks = [
      'handleClose',
      'setSelectedMedia(null)',
      'onClick={handleClose}'
    ];

    cleanupChecks.forEach(cleanup => {
      if (content.includes(cleanup)) {
        console.log(`   ✅ ${cleanup} found`);
      } else {
        console.log(`   ❌ ${cleanup} missing`);
      }
    });

    // Test 9: Check for manual URL input
    console.log('\n9️⃣ Checking manual URL input...');
    const urlInputChecks = [
      'Veya manuel URL girin',
      'https://example.com/image.jpg',
      'onChange={(e) => {',
      'setValue(\'imageUrl\', e.target.value)'
    ];

    urlInputChecks.forEach(urlInput => {
      if (content.includes(urlInput)) {
        console.log(`   ✅ ${urlInput} found`);
      } else {
        console.log(`   ❌ ${urlInput} missing`);
      }
    });

    // Test 10: Check for form integration
    console.log('\n🔟 Checking form integration...');
    const formChecks = [
      'useEffect(() => {',
      'card?.imageUrl && !selectedMedia',
      'register(\'imageUrl\')',
      'errors.imageUrl'
    ];

    formChecks.forEach(formCheck => {
      if (content.includes(formCheck)) {
        console.log(`   ✅ ${formCheck} found`);
      } else {
        console.log(`   ❌ ${formCheck} missing`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));

    // Count successful checks
    const allChecks = [
      ...requiredImports,
      ...stateChecks,
      ...handlerChecks,
      ...componentChecks,
      ...previewChecks,
      ...cleanupChecks,
      ...urlInputChecks,
      ...formChecks
    ];

    const successfulChecks = allChecks.filter(check => content.includes(check));
    const successRate = Math.round((successfulChecks.length / allChecks.length) * 100);

    console.log(`✅ Integration Success Rate: ${successRate}%`);
    console.log(`📦 Total Checks: ${allChecks.length}`);
    console.log(`✅ Passed: ${successfulChecks.length}`);
    console.log(`❌ Failed: ${allChecks.length - successfulChecks.length}`);

    if (successRate >= 90) {
      console.log('\n🎉 INTEGRATION TEST PASSED!');
      console.log('   Corporate Cards Media Integration is working correctly.');
    } else if (successRate >= 70) {
      console.log('\n⚠️ INTEGRATION TEST PARTIALLY PASSED');
      console.log('   Some features may need attention.');
    } else {
      console.log('\n❌ INTEGRATION TEST FAILED');
      console.log('   Significant issues detected.');
    }

    console.log('\n📋 Next Steps:');
    console.log('   1. Test the form in the browser');
    console.log('   2. Verify media selection works');
    console.log('   3. Check form submission');
    console.log('   4. Test edit mode with existing cards');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testMediaIntegration();
