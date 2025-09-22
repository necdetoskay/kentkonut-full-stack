const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class TestSuite {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
    this.testResults = [];
    this.createdResources = [];
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📋';
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    this.testResults.push({
      timestamp,
      type,
      message
    });
  }

  async checkServer() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async cleanup() {
    this.log('🧹 Starting cleanup process...');
    
    // Delete created quick access links
    for (const resource of this.createdResources) {
      if (resource.type === 'quickAccessLink') {
        try {
          await fetch(`${this.baseUrl}/api/quick-access-links/${resource.id}`, {
            method: 'DELETE'
          });
          this.log(`Deleted quick access link: ${resource.title}`, 'info');
        } catch (error) {
          this.log(`Failed to delete quick access link: ${resource.title}`, 'warning');
        }
      }
    }

    // Delete created pages
    for (const resource of this.createdResources) {
      if (resource.type === 'page') {
        try {
          await fetch(`${this.baseUrl}/api/pages/${resource.id}`, {
            method: 'DELETE'
          });
          this.log(`Deleted page: ${resource.title}`, 'info');
        } catch (error) {
          this.log(`Failed to delete page: ${resource.title}`, 'warning');
        }
      }
    }

    // Delete created projects
    for (const resource of this.createdResources) {
      if (resource.type === 'project') {
        try {
          await fetch(`${this.baseUrl}/api/projects/${resource.id}`, {
            method: 'DELETE'
          });
          this.log(`Deleted project: ${resource.title}`, 'info');
        } catch (error) {
          this.log(`Failed to delete project: ${resource.title}`, 'warning');
        }
      }
    }

    this.log('🧹 Cleanup completed');
  }

  async testDatabaseSchema() {
    this.log('Testing Database Schema...', 'info');
    
    try {
      // Test QuickAccessLink model
      const linkCount = await prisma.quickAccessLink.count();
      this.log(`QuickAccessLink table accessible, current count: ${linkCount}`, 'success');

      // Test hasQuickAccess fields
      const pageWithQuickAccess = await prisma.page.findFirst({
        where: { hasQuickAccess: true }
      });
      
      if (pageWithQuickAccess) {
        this.log('hasQuickAccess field working on Page model', 'success');
      } else {
        this.log('No pages with hasQuickAccess found (this is normal)', 'info');
      }

      return true;
    } catch (error) {
      this.log(`Database schema test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testQuickAccessAPI() {
    this.log('Testing Quick Access API...', 'info');
    
    try {
      // Test 1: Create a test page
      const pageData = {
        title: 'Comprehensive Test Page',
        slug: 'comprehensive-test-page',
        content: 'Test content for comprehensive testing',
        hasQuickAccess: true,
        isActive: true
      };

      const pageResponse = await fetch(`${this.baseUrl}/api/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData)
      });

      if (!pageResponse.ok) {
        throw new Error('Failed to create test page');
      }

      const createdPage = await pageResponse.json();
      this.createdResources.push({
        type: 'page',
        id: createdPage.data.id,
        title: createdPage.data.title
      });
      this.log(`Created test page: ${createdPage.data.title}`, 'success');

      // Test 2: Create quick access links
      const linksData = [
        {
          title: 'Test Link 1',
          url: '/test-1',
          icon: 'test1',
          moduleType: 'page',
          pageId: createdPage.data.id,
          sortOrder: 0
        },
        {
          title: 'Test Link 2',
          url: '/test-2',
          icon: 'test2',
          moduleType: 'page',
          pageId: createdPage.data.id,
          sortOrder: 1
        }
      ];

      for (const linkData of linksData) {
        const linkResponse = await fetch(`${this.baseUrl}/api/quick-access-links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linkData)
        });

        if (linkResponse.ok) {
          const createdLink = await linkResponse.json();
          this.createdResources.push({
            type: 'quickAccessLink',
            id: createdLink.data.id,
            title: createdLink.data.title
          });
          this.log(`Created quick access link: ${createdLink.data.title}`, 'success');
        } else {
          throw new Error(`Failed to create link: ${linkData.title}`);
        }
      }

      // Test 3: Get links by module
      const getLinksResponse = await fetch(
        `${this.baseUrl}/api/quick-access-links/module/page/${createdPage.data.id}`
      );
      
      if (getLinksResponse.ok) {
        const links = await getLinksResponse.json();
        this.log(`Retrieved ${links.length} links for page`, 'success');
      } else {
        throw new Error('Failed to retrieve links by module');
      }

      // Test 4: Update link
      const firstLink = this.createdResources.find(r => r.type === 'quickAccessLink');
      if (firstLink) {
        const updateResponse = await fetch(`${this.baseUrl}/api/quick-access-links/${firstLink.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Test Link' })
        });

        if (updateResponse.ok) {
          this.log('Quick access link update successful', 'success');
        } else {
          throw new Error('Failed to update quick access link');
        }
      }

      // Test 5: Reorder links
      const reorderData = {
        items: this.createdResources
          .filter(r => r.type === 'quickAccessLink')
          .map((link, index) => ({
            id: link.id,
            sortOrder: index
          }))
      };

      const reorderResponse = await fetch(`${this.baseUrl}/api/quick-access-links/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderData)
      });

      if (reorderResponse.ok) {
        this.log('Quick access links reorder successful', 'success');
      } else {
        throw new Error('Failed to reorder quick access links');
      }

      return true;
    } catch (error) {
      this.log(`Quick Access API test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testValidation() {
    this.log('Testing Validation...', 'info');
    
    try {
      // Test invalid data
      const invalidData = {
        title: '', // Empty title should fail
        url: 'invalid-url', // Invalid URL should fail
        moduleType: 'invalid', // Invalid module type should fail
      };

      const response = await fetch(`${this.baseUrl}/api/quick-access-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });

      if (response.status === 400) {
        this.log('Validation correctly rejected invalid data', 'success');
        return true;
      } else {
        throw new Error('Validation should have rejected invalid data');
      }
    } catch (error) {
      this.log(`Validation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testErrorHandling() {
    this.log('Testing Error Handling...', 'info');
    
    try {
      // Test 404 for non-existent resource
      const response = await fetch(`${this.baseUrl}/api/quick-access-links/non-existent-id`);
      
      if (response.status === 404) {
        this.log('404 error handling working correctly', 'success');
        return true;
      } else {
        throw new Error('Expected 404 for non-existent resource');
      }
    } catch (error) {
      this.log(`Error handling test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testPerformance() {
    this.log('Testing Performance...', 'info');
    
    try {
      const startTime = Date.now();
      
      // Test API response time
      const response = await fetch(`${this.baseUrl}/api/quick-access-links`);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok && responseTime < 1000) {
        this.log(`API response time: ${responseTime}ms (Good)`, 'success');
        return true;
      } else if (responseTime >= 1000) {
        this.log(`API response time: ${responseTime}ms (Slow)`, 'warning');
        return true;
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      this.log(`Performance test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReport() {
    this.log('Generating Test Report...', 'info');
    
    const successCount = this.testResults.filter(r => r.type === 'success').length;
    const errorCount = this.testResults.filter(r => r.type === 'error').length;
    const warningCount = this.testResults.filter(r => r.type === 'warning').length;
    const totalTests = successCount + errorCount;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(60));
    console.log(`✅ Successful Tests: ${successCount}`);
    console.log(`❌ Failed Tests: ${errorCount}`);
    console.log(`⚠️  Warnings: ${warningCount}`);
    console.log(`📈 Success Rate: ${totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0}%`);
    console.log('='.repeat(60));
    
    if (errorCount === 0) {
      console.log('🎉 All tests passed successfully!');
    } else {
      console.log('❌ Some tests failed. Please review the errors above.');
    }
    
    console.log('='.repeat(60) + '\n');
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Test Suite...', 'info');
    
    // Check server
    const serverRunning = await this.checkServer();
    if (!serverRunning) {
      this.log(`Server is not running on ${this.baseUrl}`, 'error');
      return;
    }
    this.log('Server is running', 'success');

    try {
      // Run all tests
      await this.testDatabaseSchema();
      await this.testQuickAccessAPI();
      await this.testValidation();
      await this.testErrorHandling();
      await this.testPerformance();
      
    } finally {
      // Always cleanup
      await this.cleanup();
      await this.generateReport();
    }
  }
}

// Run the test suite
async function main() {
  const testSuite = new TestSuite();
  await testSuite.runAllTests();
  await prisma.$disconnect();
}

main();
