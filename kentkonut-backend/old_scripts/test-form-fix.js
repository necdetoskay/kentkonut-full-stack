#!/usr/bin/env node

/**
 * Test script to verify the KartForm infinite loop fix
 * 
 * This script checks if the KartForm component has the correct
 * useEffect implementation that prevents infinite re-renders
 */

const fs = require('fs');
const path = require('path');

const FORM_FILE_PATH = path.join(__dirname, '../app/dashboard/kurumsal/components/KartForm.tsx');

function testFormFix() {
  console.log('🧪 Testing KartForm infinite loop fix...\n');

  try {
    // Read the form file
    const formContent = fs.readFileSync(FORM_FILE_PATH, 'utf8');

    // Check for problematic patterns
    const problematicPatterns = [
      {
        pattern: /const watchedValues = watch\(\)/,
        description: 'watch() without specific field (causes infinite loop)'
      },
      {
        pattern: /useEffect\(\s*\(\)\s*=>\s*{\s*setPreviewCard\(watchedValues\)/,
        description: 'useEffect with watchedValues dependency (causes infinite loop)'
      },
      {
        pattern: /\}, \[watchedValues\]\)/,
        description: 'watchedValues in dependency array (causes infinite loop)'
      }
    ];

    // Check for good patterns
    const goodPatterns = [
      {
        pattern: /const title = watch\('title'\)/,
        description: 'Specific field watching (good)'
      },
      {
        pattern: /useMemo\(\(\) => \(\{/,
        description: 'useMemo for preview data (performance optimization)'
      },
      {
        pattern: /useEffect\(\(\) => \{\s*setPreviewCard\(previewCardData\)/,
        description: 'useEffect with memoized data (prevents infinite loop)'
      }
    ];

    let hasProblems = false;
    let hasGoodPatterns = 0;

    console.log('❌ Checking for problematic patterns:');
    problematicPatterns.forEach((check, index) => {
      const found = check.pattern.test(formContent);
      if (found) {
        console.log(`   ${index + 1}. ❌ FOUND: ${check.description}`);
        hasProblems = true;
      } else {
        console.log(`   ${index + 1}. ✅ OK: No ${check.description}`);
      }
    });

    console.log('\n✅ Checking for good patterns:');
    goodPatterns.forEach((check, index) => {
      const found = check.pattern.test(formContent);
      if (found) {
        console.log(`   ${index + 1}. ✅ FOUND: ${check.description}`);
        hasGoodPatterns++;
      } else {
        console.log(`   ${index + 1}. ❌ MISSING: ${check.description}`);
      }
    });

    // Check specific field watching
    const specificWatchPatterns = [
      'title', 'subtitle', 'description', 'imageUrl', 
      'backgroundColor', 'textColor', 'accentColor', 
      'targetUrl', 'cardSize', 'borderRadius', 'imagePosition'
    ];

    console.log('\n📋 Checking specific field watching:');
    let specificFieldsCount = 0;
    specificWatchPatterns.forEach(field => {
      const pattern = new RegExp(`const ${field} = watch\\('${field}'\\)`);
      if (pattern.test(formContent)) {
        specificFieldsCount++;
      }
    });

    console.log(`   ✅ ${specificFieldsCount}/${specificWatchPatterns.length} specific fields are being watched`);

    // Final assessment
    console.log('\n' + '='.repeat(60));
    console.log('📊 ASSESSMENT RESULTS:');
    console.log('='.repeat(60));

    if (hasProblems) {
      console.log('❌ FAILED: Problematic patterns found that can cause infinite loops');
      console.log('   Please fix the issues above before using the component');
      process.exit(1);
    } else if (hasGoodPatterns >= 2 && specificFieldsCount >= 8) {
      console.log('✅ PASSED: All checks passed!');
      console.log('   - No problematic patterns found');
      console.log('   - Good optimization patterns implemented');
      console.log('   - Specific field watching implemented');
      console.log('   - Component should work without infinite loops');
    } else {
      console.log('⚠️  WARNING: Some optimizations missing');
      console.log('   Component might work but could be improved');
    }

    // Additional checks
    console.log('\n📈 Additional Information:');
    console.log(`   - File size: ${(formContent.length / 1024).toFixed(2)} KB`);
    console.log(`   - Total lines: ${formContent.split('\n').length}`);
    console.log(`   - useEffect count: ${(formContent.match(/useEffect/g) || []).length}`);
    console.log(`   - useState count: ${(formContent.match(/useState/g) || []).length}`);
    console.log(`   - watch() calls: ${(formContent.match(/watch\(/g) || []).length}`);

  } catch (error) {
    console.error('❌ Error reading form file:', error.message);
    process.exit(1);
  }
}

// Run the test
testFormFix();
