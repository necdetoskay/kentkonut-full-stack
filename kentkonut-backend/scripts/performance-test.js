const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class PerformanceTest {
  constructor() {
    this.baseUrl = 'http://localhost:3010';
    this.results = [];
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📋';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async measureTime(name, fn) {
    const startTime = Date.now();
    try {
      const result = await fn();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.results.push({
        name,
        duration,
        success: true
      });
      
      this.log(`${name}: ${duration}ms`, duration < 500 ? 'success' : duration < 1000 ? 'warning' : 'error');
      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.results.push({
        name,
        duration,
        success: false,
        error: error.message
      });
      
      this.log(`${name}: FAILED after ${duration}ms - ${error.message}`, 'error');
      throw error;
    }
  }

  async testCachePerformance() {
    this.log('Testing Cache Performance...', 'info');
    
    // Create test data
    const pageData = {
      title: 'Performance Test Page',
      slug: 'performance-test-page',
      content: 'Test content for performance testing',
      hasQuickAccess: true,
      isActive: true
    };

    const page = await this.measureTime('Create Test Page', async () => {
      const response = await fetch(`${this.baseUrl}/api/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData)
      });
      return response.json();
    });

    const pageId = page.data.id;

    // Create multiple links
    const links = [];
    for (let i = 0; i < 10; i++) {
      const linkData = {
        title: `Performance Link ${i + 1}`,
        url: `/performance-link-${i + 1}`,
        icon: 'test',
        moduleType: 'page',
        pageId: pageId,
        sortOrder: i
      };

      const link = await this.measureTime(`Create Link ${i + 1}`, async () => {
        const response = await fetch(`${this.baseUrl}/api/quick-access-links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linkData)
        });
        return response.json();
      });
      
      links.push(link.data);
    }

    // Test first request (cache miss)
    await this.measureTime('First Request (Cache Miss)', async () => {
      const response = await fetch(`${this.baseUrl}/api/quick-access-links/module/page/${pageId}`);
      return response.json();
    });

    // Test second request (cache hit)
    await this.measureTime('Second Request (Cache Hit)', async () => {
      const response = await fetch(`${this.baseUrl}/api/quick-access-links/module/page/${pageId}`);
      return response.json();
    });

    // Test multiple concurrent requests
    await this.measureTime('10 Concurrent Requests', async () => {
      const promises = Array(10).fill().map(() => 
        fetch(`${this.baseUrl}/api/quick-access-links/module/page/${pageId}`)
          .then(r => r.json())
      );
      return Promise.all(promises);
    });

    // Cleanup
    for (const link of links) {
      await fetch(`${this.baseUrl}/api/quick-access-links/${link.id}`, {
        method: 'DELETE'
      });
    }

    await fetch(`${this.baseUrl}/api/pages/${pageId}`, {
      method: 'DELETE'
    });
  }

  async testDatabasePerformance() {
    this.log('Testing Database Performance...', 'info');

    // Test direct database queries
    await this.measureTime('Direct DB Query - Count Links', async () => {
      return await prisma.quickAccessLink.count();
    });

    await this.measureTime('Direct DB Query - Find Many with Include', async () => {
      return await prisma.quickAccessLink.findMany({
        take: 10,
        include: {
          page: { select: { id: true, title: true } },
          project: { select: { id: true, title: true } },
          department: { select: { id: true, name: true } }
        }
      });
    });

    await this.measureTime('Direct DB Query - Complex Filter', async () => {
      return await prisma.quickAccessLink.findMany({
        where: {
          isActive: true,
          OR: [
            { moduleType: 'page' },
            { moduleType: 'project' }
          ]
        },
        orderBy: { sortOrder: 'asc' },
        take: 5
      });
    });
  }

  async testAPIEndpointPerformance() {
    this.log('Testing API Endpoint Performance...', 'info');

    // Test health endpoint
    await this.measureTime('Health Check', async () => {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.json();
    });

    // Test pages endpoint
    await this.measureTime('Pages List', async () => {
      const response = await fetch(`${this.baseUrl}/api/pages`);
      return response.json();
    });

    // Test projects endpoint
    await this.measureTime('Projects List', async () => {
      const response = await fetch(`${this.baseUrl}/api/projects`);
      return response.json();
    });
  }

  async testMemoryUsage() {
    this.log('Testing Memory Usage...', 'info');

    const initialMemory = process.memoryUsage();
    this.log(`Initial Memory: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`);

    // Create many objects to test memory
    const testData = [];
    for (let i = 0; i < 10000; i++) {
      testData.push({
        id: `test-${i}`,
        title: `Test Item ${i}`,
        data: new Array(100).fill(`data-${i}`)
      });
    }

    const afterCreationMemory = process.memoryUsage();
    this.log(`After Creation: ${Math.round(afterCreationMemory.heapUsed / 1024 / 1024)}MB`);

    // Clear data
    testData.length = 0;
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const afterCleanupMemory = process.memoryUsage();
    this.log(`After Cleanup: ${Math.round(afterCleanupMemory.heapUsed / 1024 / 1024)}MB`);
  }

  generateReport() {
    this.log('Generating Performance Report...', 'info');
    
    const successfulTests = this.results.filter(r => r.success);
    const failedTests = this.results.filter(r => !r.success);
    
    const avgDuration = successfulTests.length > 0 
      ? successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length 
      : 0;
    
    const fastTests = successfulTests.filter(r => r.duration < 500);
    const slowTests = successfulTests.filter(r => r.duration >= 1000);

    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE TEST REPORT');
    console.log('='.repeat(60));
    console.log(`✅ Successful Tests: ${successfulTests.length}`);
    console.log(`❌ Failed Tests: ${failedTests.length}`);
    console.log(`⚡ Fast Tests (<500ms): ${fastTests.length}`);
    console.log(`🐌 Slow Tests (≥1000ms): ${slowTests.length}`);
    console.log(`📈 Average Duration: ${Math.round(avgDuration)}ms`);
    console.log('='.repeat(60));
    
    if (slowTests.length > 0) {
      console.log('🐌 Slow Tests:');
      slowTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.duration}ms`);
      });
      console.log('');
    }
    
    if (failedTests.length > 0) {
      console.log('❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
      console.log('');
    }
    
    const performanceGrade = avgDuration < 300 ? 'A' : 
                           avgDuration < 500 ? 'B' : 
                           avgDuration < 1000 ? 'C' : 'D';
    
    console.log(`🎯 Performance Grade: ${performanceGrade}`);
    console.log('='.repeat(60) + '\n');
  }

  async checkServer() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Performance Tests...', 'info');
    
    // Check server
    const serverRunning = await this.checkServer();
    if (!serverRunning) {
      this.log('Server is not running on http://localhost:3010', 'error');
      return;
    }
    this.log('Server is running', 'success');

    try {
      await this.testAPIEndpointPerformance();
      await this.testDatabasePerformance();
      await this.testCachePerformance();
      await this.testMemoryUsage();
    } catch (error) {
      this.log(`Performance test failed: ${error.message}`, 'error');
    } finally {
      this.generateReport();
    }
  }
}

// Run the performance tests
async function main() {
  const performanceTest = new PerformanceTest();
  await performanceTest.runAllTests();
  await prisma.$disconnect();
}

main();
