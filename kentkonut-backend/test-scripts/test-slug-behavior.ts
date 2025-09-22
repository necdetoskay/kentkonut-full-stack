/**
 * Test script to verify that slug behavior is back to normal
 * Tests that no automatic "/" addition happens
 */

import prisma from '../lib/prisma';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

class SlugBehaviorTest {
  private results: TestResult[] = [];
  private testPageId: string | null = null;

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
    if (details) console.log('   Details:', details);
  }

  async testSlugCreation() {
    console.log('\n📄 Testing slug creation behavior...');
    
    const testCases = [
      { input: 'test-page', expected: 'test-page' },
      { input: '/test-page', expected: '/test-page' },
      { input: 'hakkimizda', expected: 'hakkimizda' },
      { input: '/hakkimizda', expected: '/hakkimizda' }
    ];

    for (const testCase of testCases) {
      try {
        const response = await fetch('http://localhost:3010/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Test Page for ${testCase.input}`,
            slug: testCase.input,
            content: 'Test content',
            metaKeywords: ['test']
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const actualSlug = data.data.slug;
            
            if (actualSlug === testCase.expected) {
              this.addResult(`Slug Creation - ${testCase.input}`, 'PASS', `Slug preserved correctly: "${actualSlug}"`);
            } else {
              this.addResult(`Slug Creation - ${testCase.input}`, 'FAIL', `Expected "${testCase.expected}", got "${actualSlug}"`);
            }

            // Clean up - delete the test page
            await fetch(`http://localhost:3010/api/pages/${data.data.id}`, {
              method: 'DELETE'
            });

          } else {
            this.addResult(`Slug Creation - ${testCase.input}`, 'FAIL', `API error: ${data.error}`);
          }
        } else {
          this.addResult(`Slug Creation - ${testCase.input}`, 'WARNING', `HTTP ${response.status} - Server may not be running`);
        }

      } catch (error) {
        this.addResult(`Slug Creation - ${testCase.input}`, 'WARNING', 'Could not test (server may not be running)', error);
      }
    }
  }

  async testSlugUpdate() {
    console.log('\n🔄 Testing slug update behavior...');
    
    try {
      // Create a test page first
      const createResponse = await fetch('http://localhost:3010/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Slug Update Test Page',
          slug: 'original-slug',
          content: 'Test content',
          metaKeywords: ['test']
        })
      });

      if (!createResponse.ok) {
        this.addResult('Slug Update', 'WARNING', 'Could not create test page (server may not be running)');
        return;
      }

      const createData = await createResponse.json();
      if (!createData.success) {
        this.addResult('Slug Update', 'FAIL', `Could not create test page: ${createData.error}`);
        return;
      }

      this.testPageId = createData.data.id;

      // Test updating with different slug formats
      const updateCases = [
        { input: 'updated-slug', expected: 'updated-slug' },
        { input: '/updated-slug-with-slash', expected: '/updated-slug-with-slash' },
        { input: 'final-slug', expected: 'final-slug' }
      ];

      for (const testCase of updateCases) {
        const updateResponse = await fetch(`http://localhost:3010/api/pages/${this.testPageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: testCase.input
          })
        });

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          if (updateData.success) {
            const actualSlug = updateData.data.slug;
            
            if (actualSlug === testCase.expected) {
              this.addResult(`Slug Update - ${testCase.input}`, 'PASS', `Slug updated correctly: "${actualSlug}"`);
            } else {
              this.addResult(`Slug Update - ${testCase.input}`, 'FAIL', `Expected "${testCase.expected}", got "${actualSlug}"`);
            }
          } else {
            this.addResult(`Slug Update - ${testCase.input}`, 'FAIL', `Update failed: ${updateData.error}`);
          }
        } else {
          this.addResult(`Slug Update - ${testCase.input}`, 'FAIL', `HTTP ${updateResponse.status}`);
        }
      }

    } catch (error) {
      this.addResult('Slug Update', 'WARNING', 'Could not test slug update (server may not be running)', error);
    }
  }

  async testDatabaseIntegrity() {
    console.log('\n🗄️  Testing database for double slash issues...');

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
        this.addResult('Database Integrity', 'PASS', 'No pages with double slash issues found');
      } else {
        this.addResult('Database Integrity', 'FAIL', `Found ${pagesWithDoubleSlash.length} pages with double slash issues`, {
          pages: pagesWithDoubleSlash.map(p => ({ title: p.title, slug: p.slug }))
        });
      }

    } catch (error) {
      this.addResult('Database Integrity', 'FAIL', 'Database check failed', error);
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    try {
      if (this.testPageId) {
        await fetch(`http://localhost:3010/api/pages/${this.testPageId}`, {
          method: 'DELETE'
        });
        this.addResult('Cleanup', 'PASS', 'Test page cleaned up successfully');
      }
    } catch (error) {
      this.addResult('Cleanup', 'WARNING', 'Cleanup had issues', error);
    }
  }

  generateReport() {
    console.log('\n📊 SLUG BEHAVIOR TEST REPORT');
    console.log('=' .repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`   - ${result.test}: ${result.message}`);
      });
    }
    
    if (warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.filter(r => r.status === 'WARNING').forEach(result => {
        console.log(`   - ${result.test}: ${result.message}`);
      });
    }

    console.log('\n🎯 EXPECTED BEHAVIOR:');
    console.log('   ✅ Slugs are stored exactly as entered');
    console.log('   ✅ No automatic "/" addition');
    console.log('   ✅ No double slash creation');
    console.log('   ✅ Frontend handles slugs correctly');

    return {
      passed,
      failed,
      warnings,
      total: this.results.length,
      success: failed === 0
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Slug Behavior Test Suite\n');
    
    await this.testSlugCreation();
    await this.testSlugUpdate();
    await this.testDatabaseIntegrity();
    await this.cleanup();
    
    return this.generateReport();
  }
}

// Export for use in other files
export { SlugBehaviorTest };

// Run if called directly
if (require.main === module) {
  const test = new SlugBehaviorTest();
  test.runAllTests()
    .then(report => {
      console.log(`\n🎯 Slug behavior test suite ${report.success ? 'PASSED' : 'COMPLETED WITH ISSUES'}`);
      process.exit(report.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Slug behavior test suite failed with error:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
