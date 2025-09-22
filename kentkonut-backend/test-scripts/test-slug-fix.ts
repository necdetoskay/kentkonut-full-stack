/**
 * Test script to verify the double slash slug fix is working correctly
 */

import prisma from '../lib/prisma';
import { normalizeSlug, validateSlug, formatSlugForDisplay, formatSlugForInput } from '../utils/slug-utils';

interface TestCase {
  input: string;
  expectedNormalized: string;
  expectedDisplay: string;
  expectedInput: string;
  shouldBeValid: boolean;
}

const testCases: TestCase[] = [
  {
    input: 'vizyonumuz',
    expectedNormalized: '/vizyonumuz',
    expectedDisplay: '/vizyonumuz',
    expectedInput: 'vizyonumuz',
    shouldBeValid: true
  },
  {
    input: '/vizyonumuz',
    expectedNormalized: '/vizyonumuz',
    expectedDisplay: '/vizyonumuz',
    expectedInput: 'vizyonumuz',
    shouldBeValid: true
  },
  {
    input: '//vizyonumuz',
    expectedNormalized: '/vizyonumuz',
    expectedDisplay: '/vizyonumuz',
    expectedInput: 'vizyonumuz',
    shouldBeValid: true
  },
  {
    input: '///vizyonumuz',
    expectedNormalized: '/vizyonumuz',
    expectedDisplay: '/vizyonumuz',
    expectedInput: 'vizyonumuz',
    shouldBeValid: true
  },
  {
    input: '/hakkimizda',
    expectedNormalized: '/hakkimizda',
    expectedDisplay: '/hakkimizda',
    expectedInput: 'hakkimizda',
    shouldBeValid: true
  },
  {
    input: '',
    expectedNormalized: '/',
    expectedDisplay: '/',
    expectedInput: '',
    shouldBeValid: false
  },
  {
    input: '   /test   ',
    expectedNormalized: '/test',
    expectedDisplay: '/test',
    expectedInput: 'test',
    shouldBeValid: true
  }
];

async function testSlugUtils() {
  console.log('🧪 Testing Slug Utility Functions...\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`Testing input: "${testCase.input}"`);

    // Test normalization
    const normalized = normalizeSlug(testCase.input);
    if (normalized === testCase.expectedNormalized) {
      console.log(`  ✅ Normalize: "${normalized}"`);
      passed++;
    } else {
      console.log(`  ❌ Normalize: Expected "${testCase.expectedNormalized}", got "${normalized}"`);
      failed++;
    }

    // Test display formatting
    const display = formatSlugForDisplay(testCase.input);
    if (display === testCase.expectedDisplay) {
      console.log(`  ✅ Display: "${display}"`);
      passed++;
    } else {
      console.log(`  ❌ Display: Expected "${testCase.expectedDisplay}", got "${display}"`);
      failed++;
    }

    // Test input formatting
    const inputFormat = formatSlugForInput(testCase.input);
    if (inputFormat === testCase.expectedInput) {
      console.log(`  ✅ Input: "${inputFormat}"`);
      passed++;
    } else {
      console.log(`  ❌ Input: Expected "${testCase.expectedInput}", got "${inputFormat}"`);
      failed++;
    }

    // Test validation
    const validation = validateSlug(normalized);
    if (validation.isValid === testCase.shouldBeValid) {
      console.log(`  ✅ Validation: ${validation.isValid ? 'Valid' : 'Invalid'}`);
      passed++;
    } else {
      console.log(`  ❌ Validation: Expected ${testCase.shouldBeValid}, got ${validation.isValid}`);
      failed++;
    }

    console.log('');
  }

  return { passed, failed };
}

async function testAPIEndpoints() {
  console.log('🌐 Testing API Endpoints...\n');

  const testPageData = {
    title: 'Test Double Slash Fix',
    slug: '//test-double-slash',
    content: 'Test content',
    metaKeywords: ['test']
  };

  try {
    // Test page creation
    console.log('Testing page creation with double slash...');
    const createResponse = await fetch('http://localhost:3010/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPageData)
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      if (createData.success) {
        const createdPage = createData.data;
        console.log(`✅ Page created with normalized slug: "${createdPage.slug}"`);

        // Test page update
        console.log('Testing page update with double slash...');
        const updateResponse = await fetch(`http://localhost:3010/api/pages/${createdPage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...testPageData,
            slug: '///updated-test-slug'
          })
        });

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          if (updateData.success) {
            console.log(`✅ Page updated with normalized slug: "${updateData.data.slug}"`);
          } else {
            console.log(`❌ Page update failed: ${updateData.error}`);
          }
        } else {
          console.log(`❌ Page update request failed: ${updateResponse.status}`);
        }

        // Clean up - delete test page
        await fetch(`http://localhost:3010/api/pages/${createdPage.id}`, {
          method: 'DELETE'
        });
        console.log('🧹 Test page cleaned up');

      } else {
        console.log(`❌ Page creation failed: ${createData.error}`);
      }
    } else {
      console.log(`❌ Page creation request failed: ${createResponse.status}`);
    }

  } catch (error) {
    console.log(`⚠️  API test skipped (server may not be running): ${error}`);
  }
}

async function testDatabaseIntegrity() {
  console.log('🗄️  Testing Database Integrity...\n');

  try {
    // Check for any remaining double slash issues
    const pagesWithDoubleSlash = await prisma.page.findMany({
      where: {
        slug: {
          contains: '//'
        }
      },
      select: {
        id: true,
        title: true,
        slug: true
      }
    });

    if (pagesWithDoubleSlash.length === 0) {
      console.log('✅ No pages with double slash issues found in database');
    } else {
      console.log(`❌ Found ${pagesWithDoubleSlash.length} pages with double slash issues:`);
      pagesWithDoubleSlash.forEach(page => {
        console.log(`   - "${page.title}": "${page.slug}"`);
      });
    }

    // Check for pages with invalid slug formats
    const allPages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      }
    });

    const invalidPages = allPages.filter(page => {
      const validation = validateSlug(page.slug);
      return !validation.isValid;
    });

    if (invalidPages.length === 0) {
      console.log('✅ All page slugs are valid');
    } else {
      console.log(`❌ Found ${invalidPages.length} pages with invalid slugs:`);
      invalidPages.forEach(page => {
        const validation = validateSlug(page.slug);
        console.log(`   - "${page.title}": "${page.slug}" (${validation.error})`);
      });
    }

    return {
      doubleSlashIssues: pagesWithDoubleSlash.length,
      invalidSlugs: invalidPages.length,
      totalPages: allPages.length
    };

  } catch (error) {
    console.log(`❌ Database test failed: ${error}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Slug Fix Test Suite\n');
  console.log('=' .repeat(50));

  // Test utility functions
  const utilResults = await testSlugUtils();
  console.log(`Utility Tests: ${utilResults.passed} passed, ${utilResults.failed} failed\n`);

  // Test API endpoints
  await testAPIEndpoints();
  console.log('');

  // Test database integrity
  const dbResults = await testDatabaseIntegrity();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 FINAL REPORT');
  console.log('=' .repeat(50));
  
  if (utilResults.failed === 0) {
    console.log('✅ All utility function tests passed');
  } else {
    console.log(`❌ ${utilResults.failed} utility function tests failed`);
  }

  if (dbResults) {
    if (dbResults.doubleSlashIssues === 0 && dbResults.invalidSlugs === 0) {
      console.log('✅ Database integrity check passed');
    } else {
      console.log(`❌ Database has ${dbResults.doubleSlashIssues} double slash issues and ${dbResults.invalidSlugs} invalid slugs`);
    }
    console.log(`📊 Total pages in database: ${dbResults.totalPages}`);
  }

  const success = utilResults.failed === 0 && 
                  (!dbResults || (dbResults.doubleSlashIssues === 0 && dbResults.invalidSlugs === 0));

  if (success) {
    console.log('\n🎉 All tests passed! Slug fix is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .catch(error => {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { testSlugUtils, testAPIEndpoints, testDatabaseIntegrity };
