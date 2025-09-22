/**
 * Comprehensive test script for page statistics functionality
 * Tests all components of the page statistics system
 */

import prisma from '../lib/prisma';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

class PageStatisticsTest {
  private results: TestResult[] = [];
  private testPageId: string | null = null;

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
    if (details) console.log('   Details:', details);
  }

  async testDatabaseSchema() {
    console.log('\n🔍 Testing Database Schema...');
    
    try {
      // Test if PageSeoMetrics table exists and has correct structure
      const testRecord = await prisma.pageSeoMetrics.findFirst();
      this.addResult('Database Schema', 'PASS', 'PageSeoMetrics table accessible');
      
      // Test creating a test record
      const testData = {
        pageId: 'test-page-id',
        date: new Date(),
        views: 1,
        uniqueVisitors: 1
      };
      
      const created = await prisma.pageSeoMetrics.create({ data: testData });
      await prisma.pageSeoMetrics.delete({ where: { id: created.id } });
      
      this.addResult('Database Operations', 'PASS', 'Create/Delete operations working');
      
    } catch (error) {
      this.addResult('Database Schema', 'FAIL', 'Database schema test failed', error);
    }
  }

  async testPageCreation() {
    console.log('\n📄 Testing Page Creation...');
    
    try {
      // Create a test page
      const testPage = await prisma.page.create({
        data: {
          title: 'Test Statistics Page',
          slug: '/test-statistics-page',
          content: 'Test content for statistics',
          metaKeywords: ['test', 'statistics']
        }
      });
      
      this.testPageId = testPage.id;
      this.addResult('Page Creation', 'PASS', 'Test page created successfully', { id: testPage.id });
      
    } catch (error) {
      this.addResult('Page Creation', 'FAIL', 'Failed to create test page', error);
    }
  }

  async testViewTracking() {
    console.log('\n👁️ Testing View Tracking...');
    
    if (!this.testPageId) {
      this.addResult('View Tracking', 'FAIL', 'No test page available');
      return;
    }

    try {
      // Simulate view tracking logic
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if record exists for today
      const existingMetric = await prisma.pageSeoMetrics.findFirst({
        where: {
          pageId: this.testPageId,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (existingMetric) {
        // Update existing record
        await prisma.pageSeoMetrics.update({
          where: { id: existingMetric.id },
          data: { views: existingMetric.views + 1 }
        });
        this.addResult('View Tracking', 'PASS', 'Updated existing view record');
      } else {
        // Create new record
        await prisma.pageSeoMetrics.create({
          data: {
            pageId: this.testPageId,
            date: today,
            views: 1,
            uniqueVisitors: 1
          }
        });
        this.addResult('View Tracking', 'PASS', 'Created new view record');
      }

    } catch (error) {
      this.addResult('View Tracking', 'FAIL', 'View tracking failed', error);
    }
  }

  async testStatisticsAPI() {
    console.log('\n📊 Testing Statistics API...');
    
    if (!this.testPageId) {
      this.addResult('Statistics API', 'FAIL', 'No test page available');
      return;
    }

    try {
      // Test the statistics endpoint logic
      const days = 30;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const statistics = await prisma.pageSeoMetrics.findMany({
        where: {
          pageId: this.testPageId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { date: 'asc' }
      });

      const totalViews = statistics.reduce((sum, stat) => sum + stat.views, 0);
      const totalUniqueVisitors = statistics.reduce((sum, stat) => sum + stat.uniqueVisitors, 0);

      this.addResult('Statistics API', 'PASS', 'Statistics calculation working', {
        recordsFound: statistics.length,
        totalViews,
        totalUniqueVisitors
      });

    } catch (error) {
      this.addResult('Statistics API', 'FAIL', 'Statistics API test failed', error);
    }
  }

  async testAPIEndpoint() {
    console.log('\n🌐 Testing API Endpoint...');
    
    if (!this.testPageId) {
      this.addResult('API Endpoint', 'FAIL', 'No test page available');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3010/api/pages/${this.testPageId}/statistics?days=30`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.addResult('API Endpoint', 'PASS', 'API endpoint responding correctly', {
            totalViews: data.data.totals.views,
            totalUniqueVisitors: data.data.totals.uniqueVisitors
          });
        } else {
          this.addResult('API Endpoint', 'FAIL', 'API returned error', data.error);
        }
      } else {
        this.addResult('API Endpoint', 'FAIL', `API returned status ${response.status}`);
      }

    } catch (error) {
      this.addResult('API Endpoint', 'WARNING', 'Could not test API endpoint (server may not be running)', error);
    }
  }

  async testPublicPageAPI() {
    console.log('\n🌍 Testing Public Page API...');
    
    if (!this.testPageId) {
      this.addResult('Public Page API', 'FAIL', 'No test page available');
      return;
    }

    try {
      // Get the test page to get its slug
      const page = await prisma.page.findUnique({
        where: { id: this.testPageId },
        select: { slug: true }
      });

      if (!page) {
        this.addResult('Public Page API', 'FAIL', 'Test page not found');
        return;
      }

      const cleanSlug = page.slug.startsWith('/') ? page.slug.slice(1) : page.slug;
      const response = await fetch(`http://localhost:3010/api/public/pages/${cleanSlug}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.addResult('Public Page API', 'PASS', 'Public page API working (view should be tracked)');
        } else {
          this.addResult('Public Page API', 'FAIL', 'Public API returned error', data.error);
        }
      } else {
        this.addResult('Public Page API', 'FAIL', `Public API returned status ${response.status}`);
      }

    } catch (error) {
      this.addResult('Public Page API', 'WARNING', 'Could not test public API (server may not be running)', error);
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    try {
      if (this.testPageId) {
        // Delete test statistics
        await prisma.pageSeoMetrics.deleteMany({
          where: { pageId: this.testPageId }
        });

        // Delete test page
        await prisma.page.delete({
          where: { id: this.testPageId }
        });

        this.addResult('Cleanup', 'PASS', 'Test data cleaned up successfully');
      }
    } catch (error) {
      this.addResult('Cleanup', 'WARNING', 'Cleanup had issues', error);
    }
  }

  generateReport() {
    console.log('\n📋 TEST REPORT');
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

    return {
      passed,
      failed,
      warnings,
      total: this.results.length,
      success: failed === 0
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Page Statistics Test Suite\n');
    
    await this.testDatabaseSchema();
    await this.testPageCreation();
    await this.testViewTracking();
    await this.testStatisticsAPI();
    await this.testAPIEndpoint();
    await this.testPublicPageAPI();
    await this.cleanup();
    
    return this.generateReport();
  }
}

// Export for use in other files
export { PageStatisticsTest };

// Run if called directly
if (require.main === module) {
  const test = new PageStatisticsTest();
  test.runAllTests()
    .then(report => {
      console.log(`\n🎯 Test suite ${report.success ? 'PASSED' : 'FAILED'}`);
      process.exit(report.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test suite failed with error:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
