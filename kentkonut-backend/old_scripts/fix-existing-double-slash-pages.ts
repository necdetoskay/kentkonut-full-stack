/**
 * Script to fix existing pages with double slash issues
 * Removes extra leading slashes from page slugs
 */

import prisma from '../lib/prisma';

interface FixResult {
  pageId: string;
  title: string;
  oldSlug: string;
  newSlug: string;
  fixed: boolean;
  error?: string;
}

async function fixExistingDoubleSlashPages(): Promise<{
  totalPages: number;
  pagesWithIssues: number;
  pagesFixed: number;
  pagesFailed: number;
  results: FixResult[];
}> {
  console.log('🔍 Starting double slash fix for existing pages...\n');

  const results: FixResult[] = [];
  let pagesFixed = 0;
  let pagesFailed = 0;

  try {
    // Get all pages
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Found ${pages.length} total pages`);

    // Find pages with double slash issues
    const pagesWithIssues = pages.filter(page => {
      return page.slug.startsWith('//') || page.slug.includes('//');
    });

    console.log(`⚠️  Found ${pagesWithIssues.length} pages with double slash issues\n`);

    if (pagesWithIssues.length === 0) {
      console.log('✅ No pages with double slash issues found!');
      return {
        totalPages: pages.length,
        pagesWithIssues: 0,
        pagesFixed: 0,
        pagesFailed: 0,
        results: []
      };
    }

    // Fix each page with issues
    for (const page of pagesWithIssues) {
      const oldSlug = page.slug;
      // Remove multiple leading slashes and keep only one
      const newSlug = '/' + page.slug.replace(/^\/+/, '').replace(/\/+/g, '/');

      console.log(`🔧 Fixing page: "${page.title}"`);
      console.log(`   Old slug: "${oldSlug}"`);
      console.log(`   New slug: "${newSlug}"`);

      const result: FixResult = {
        pageId: page.id,
        title: page.title,
        oldSlug,
        newSlug,
        fixed: false
      };

      try {
        // Check if the new slug would conflict with existing pages
        const conflictingPage = await prisma.page.findFirst({
          where: {
            slug: newSlug,
            id: { not: page.id }
          }
        });

        if (conflictingPage) {
          const error = `Slug conflict: "${newSlug}" already exists for page "${conflictingPage.title}"`;
          console.log(`   ❌ ${error}`);
          result.error = error;
          pagesFailed++;
        } else {
          // Update the page slug
          await prisma.page.update({
            where: { id: page.id },
            data: { slug: newSlug }
          });

          console.log(`   ✅ Fixed successfully`);
          result.fixed = true;
          pagesFixed++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`   ❌ Failed: ${errorMessage}`);
        result.error = errorMessage;
        pagesFailed++;
      }

      results.push(result);
      console.log(''); // Empty line for readability
    }

    return {
      totalPages: pages.length,
      pagesWithIssues: pagesWithIssues.length,
      pagesFixed,
      pagesFailed,
      results
    };

  } catch (error) {
    console.error('❌ Script failed with error:', error);
    throw error;
  }
}

async function generateReport(results: {
  totalPages: number;
  pagesWithIssues: number;
  pagesFixed: number;
  pagesFailed: number;
  results: FixResult[];
}) {
  console.log('📋 DOUBLE SLASH FIX REPORT');
  console.log('=' .repeat(50));
  console.log(`📊 Total pages: ${results.totalPages}`);
  console.log(`⚠️  Pages with double slash issues: ${results.pagesWithIssues}`);
  console.log(`✅ Pages fixed: ${results.pagesFixed}`);
  console.log(`❌ Pages failed: ${results.pagesFailed}`);
  console.log('');

  if (results.pagesFixed > 0) {
    console.log('✅ SUCCESSFULLY FIXED:');
    results.results
      .filter(r => r.fixed)
      .forEach(result => {
        console.log(`   - "${result.title}": "${result.oldSlug}" → "${result.newSlug}"`);
      });
    console.log('');
  }

  if (results.pagesFailed > 0) {
    console.log('❌ FAILED TO FIX:');
    results.results
      .filter(r => !r.fixed)
      .forEach(result => {
        console.log(`   - "${result.title}": ${result.error}`);
      });
    console.log('');
  }

  // Generate SQL for manual fixes if needed
  const failedResults = results.results.filter(r => !r.fixed && !r.error?.includes('conflict'));
  if (failedResults.length > 0) {
    console.log('🔧 MANUAL SQL FIXES (if needed):');
    failedResults.forEach(result => {
      console.log(`UPDATE pages SET slug = '${result.newSlug}' WHERE id = '${result.pageId}';`);
    });
    console.log('');
  }

  return results.pagesFixed > 0 || results.pagesFailed === 0;
}

// Main execution
async function main() {
  console.log('🚀 Double Slash Fix Script for Existing Pages\n');

  try {
    const results = await fixExistingDoubleSlashPages();
    const success = await generateReport(results);

    if (success) {
      console.log('🎉 Script completed successfully!');
      console.log('\n📝 NEXT STEPS:');
      console.log('   1. Test the fixed pages in the frontend');
      console.log('   2. Verify that URLs work correctly');
      console.log('   3. Check that no new double slashes are created');
      process.exit(0);
    } else {
      console.log('⚠️  Script completed with some issues. Please review the report above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export { fixExistingDoubleSlashPages, generateReport };

// Run if called directly
if (require.main === module) {
  main();
}
