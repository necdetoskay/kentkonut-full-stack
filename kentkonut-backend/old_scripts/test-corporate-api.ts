#!/usr/bin/env tsx

/**
 * Corporate Cards API Testing Script
 * 
 * This script tests all the corporate cards API endpoints to ensure they work correctly
 * Tests both public and admin endpoints with various scenarios
 * 
 * Usage:
 *   npm run test:corporate-api
 *   or
 *   npx tsx scripts/test-corporate-api.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test configuration
const BASE_URL = 'http://localhost:3010';
const TEST_ADMIN_EMAIL = 'admin@test.com'; // You'll need to create this user
const TEST_ADMIN_PASSWORD = 'password123';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

class ApiTester {
  private results: TestResult[] = [];
  private authToken: string | null = null;

  async runAllTests() {
    console.log('🧪 Starting Corporate Cards API Tests...\n');

    try {
      // Test public endpoints first (no auth required)
      await this.testPublicEndpoints();
      
      // Test admin endpoints (auth required)
      await this.testAdminEndpoints();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  async testPublicEndpoints() {
    console.log('📋 Testing Public Endpoints...\n');

    // Test GET /api/public/kurumsal/kartlar
    await this.testEndpoint(
      'GET',
      '/api/public/kurumsal/kartlar',
      null,
      'Fetch public corporate cards'
    );

    // Test GET /api/public/kurumsal/kartlar with query params
    await this.testEndpoint(
      'GET',
      '/api/public/kurumsal/kartlar?active=true&limit=3&orderBy=displayOrder',
      null,
      'Fetch public cards with filters'
    );

    // Test HEAD /api/public/kurumsal/kartlar
    await this.testEndpoint(
      'HEAD',
      '/api/public/kurumsal/kartlar',
      null,
      'Get cards metadata'
    );

    // Test GET /api/public/kurumsal/sayfa
    await this.testEndpoint(
      'GET',
      '/api/public/kurumsal/sayfa',
      null,
      'Fetch public corporate page'
    );

    // Test HEAD /api/public/kurumsal/sayfa
    await this.testEndpoint(
      'HEAD',
      '/api/public/kurumsal/sayfa',
      null,
      'Get page metadata'
    );
  }

  async testAdminEndpoints() {
    console.log('🔐 Testing Admin Endpoints...\n');

    // Note: These tests require authentication
    // In a real scenario, you'd need to implement login or use a test token
    console.log('⚠️  Admin endpoint tests require authentication');
    console.log('   Please implement authentication in the test script');
    console.log('   or test manually with a logged-in admin user\n');

    // Test GET /api/admin/kurumsal/kartlar
    await this.testEndpoint(
      'GET',
      '/api/admin/kurumsal/kartlar',
      null,
      'Fetch admin corporate cards (requires auth)',
      true
    );

    // Test GET /api/admin/kurumsal/sayfa
    await this.testEndpoint(
      'GET',
      '/api/admin/kurumsal/sayfa',
      null,
      'Fetch admin corporate page (requires auth)',
      true
    );

    // Test sorting endpoint
    await this.testEndpoint(
      'GET',
      '/api/admin/kurumsal/kartlar/siralama',
      null,
      'Get card order (requires auth)',
      true
    );
  }

  async testEndpoint(
    method: string,
    endpoint: string,
    body: any,
    description: string,
    requiresAuth: boolean = false
  ) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(requiresAuth && this.authToken ? {
            'Authorization': `Bearer ${this.authToken}`
          } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      };

      console.log(`🔍 Testing: ${method} ${endpoint}`);
      console.log(`   Description: ${description}`);

      const response = await fetch(url, options);
      const status = response.status;
      
      let data = null;
      let error = null;

      try {
        if (method !== 'HEAD' && response.headers.get('content-type')?.includes('application/json')) {
          data = await response.json();
        }
      } catch (parseError) {
        error = 'Failed to parse JSON response';
      }

      const success = status >= 200 && status < 300;
      const result: TestResult = {
        endpoint,
        method,
        status,
        success,
        message: description,
        data: success ? data : undefined,
        error: success ? undefined : (data?.error || error || `HTTP ${status}`)
      };

      this.results.push(result);

      // Log result
      const statusIcon = success ? '✅' : '❌';
      console.log(`   ${statusIcon} Status: ${status} ${success ? 'SUCCESS' : 'FAILED'}`);
      
      if (success && data) {
        if (data.meta) {
          console.log(`   📊 Meta: ${JSON.stringify(data.meta)}`);
        }
        if (data.data && Array.isArray(data.data)) {
          console.log(`   📦 Data: ${data.data.length} items`);
        }
      } else if (!success) {
        console.log(`   ❌ Error: ${result.error}`);
      }

      // Log response headers for HEAD requests
      if (method === 'HEAD') {
        const headers = {};
        response.headers.forEach((value, key) => {
          if (key.startsWith('x-')) {
            headers[key] = value;
          }
        });
        if (Object.keys(headers).length > 0) {
          console.log(`   📋 Headers: ${JSON.stringify(headers)}`);
        }
      }

      console.log('');

    } catch (error) {
      const result: TestResult = {
        endpoint,
        method,
        status: 0,
        success: false,
        message: description,
        error: error.message
      };

      this.results.push(result);
      console.log(`   ❌ Network Error: ${error.message}\n`);
    }
  }

  printResults() {
    console.log('📊 Test Results Summary\n');
    console.log('=' .repeat(80));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

    // Group results by success/failure
    const passed = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    if (passed.length > 0) {
      console.log('✅ Passed Tests:');
      passed.forEach(result => {
        console.log(`   ${result.method} ${result.endpoint} (${result.status})`);
      });
      console.log('');
    }

    if (failed.length > 0) {
      console.log('❌ Failed Tests:');
      failed.forEach(result => {
        console.log(`   ${result.method} ${result.endpoint} (${result.status}) - ${result.error}`);
      });
      console.log('');
    }

    // Recommendations
    console.log('💡 Recommendations:');
    if (failedTests === 0) {
      console.log('   🎉 All tests passed! API is working correctly.');
    } else {
      console.log('   🔧 Some tests failed. Check the following:');
      console.log('   - Ensure the development server is running on port 3010');
      console.log('   - Verify database connection and seeded data');
      console.log('   - Check authentication setup for admin endpoints');
      console.log('   - Review API endpoint implementations');
    }

    console.log('\n' + '=' .repeat(80));
  }
}

// Database verification
async function verifyDatabase() {
  console.log('🔍 Verifying database state...\n');

  try {
    const cardCount = await prisma.corporateCard.count();
    const pageExists = await prisma.corporatePage.findUnique({
      where: { slug: 'kurumsal' }
    });

    console.log(`📊 Corporate cards in database: ${cardCount}`);
    console.log(`📄 Corporate page exists: ${pageExists ? 'Yes' : 'No'}`);

    if (cardCount === 0) {
      console.log('⚠️  No corporate cards found. Run: npm run seed:corporate-cards');
    }

    if (!pageExists) {
      console.log('⚠️  Corporate page not found. Run: npm run seed:corporate-cards');
    }

    console.log('');
    return cardCount > 0 && pageExists;

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Corporate Cards API Test Suite\n');

  // Verify database state
  const dbReady = await verifyDatabase();
  
  if (!dbReady) {
    console.log('❌ Database not ready. Please seed the data first.');
    process.exit(1);
  }

  // Run API tests
  const tester = new ApiTester();
  await tester.runAllTests();
}

// Run the tests
main().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});
