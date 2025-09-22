/**
 * Banner Update Fix Testing Script
 * This script tests the banner update functionality to verify the 500 error fix
 */

require('dotenv').config();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test configuration
const API_BASE_URL = 'http://localhost:3010';

async function runBannerUpdateTests() {
  console.log('🧪 Starting Banner Update Fix Tests...\n');
  
  try {
    // Test 1: Create test banner for updating
    console.log('📊 Test 1: Creating test banner for update testing...');
    const testDataResult = await createTestBanner();
    console.log(`✅ Test banner creation: ${testDataResult.success ? 'PASSED' : 'FAILED'}\n`);
    
    if (!testDataResult.success) {
      console.log('❌ Cannot proceed without test banner');
      return;
    }
    
    const { groupId, bannerId } = testDataResult;
    
    // Test 2: Test basic banner update
    console.log('📊 Test 2: Testing basic banner update...');
    const basicUpdateResult = await testBasicBannerUpdate(bannerId);
    console.log(`✅ Basic banner update: ${basicUpdateResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 3: Test banner update with dates
    console.log('📊 Test 3: Testing banner update with date fields...');
    const dateUpdateResult = await testBannerUpdateWithDates(bannerId);
    console.log(`✅ Banner update with dates: ${dateUpdateResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 4: Test banner update with URL link
    console.log('📊 Test 4: Testing banner update with URL link...');
    const urlUpdateResult = await testBannerUpdateWithURL(bannerId);
    console.log(`✅ Banner update with URL: ${urlUpdateResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 5: Test banner update with all fields
    console.log('📊 Test 5: Testing comprehensive banner update...');
    const comprehensiveUpdateResult = await testComprehensiveBannerUpdate(bannerId);
    console.log(`✅ Comprehensive banner update: ${comprehensiveUpdateResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 6: Test invalid data handling
    console.log('📊 Test 6: Testing invalid data handling...');
    const invalidDataResult = await testInvalidDataHandling(bannerId);
    console.log(`✅ Invalid data handling: ${invalidDataResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 7: Test date validation
    console.log('📊 Test 7: Testing date validation...');
    const dateValidationResult = await testDateValidation(bannerId);
    console.log(`✅ Date validation: ${dateValidationResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Clean up test data
    await cleanupTestData(groupId, bannerId);
    console.log('🧹 Test data cleaned up\n');
    
    console.log('📋 BANNER UPDATE FIX TEST SUMMARY:');
    console.log('==================================');
    console.log(`✅ Test banner creation: ${testDataResult.success ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Basic banner update: ${basicUpdateResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner update with dates: ${dateUpdateResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner update with URL: ${urlUpdateResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Comprehensive banner update: ${comprehensiveUpdateResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Invalid data handling: ${invalidDataResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Date validation: ${dateValidationResult ? 'PASSED' : 'FAILED'}`);
    
    const allTestsPassed = testDataResult.success && basicUpdateResult && dateUpdateResult && 
                          urlUpdateResult && comprehensiveUpdateResult && invalidDataResult && dateValidationResult;
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL BANNER UPDATE FIX TESTS PASSED!');
      console.log('The 500 Internal Server Error has been resolved.');
    } else {
      console.log('\n❌ Some tests failed. Please check the implementation.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    await pool.end();
  }
}

async function createTestBanner() {
  try {
    const client = await pool.connect();
    
    // Create test banner group
    const groupResult = await client.query(`
      INSERT INTO banner_groups (name, description, "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `, [
      'Test Banner Group for Update Fix',
      'Test group for banner update fix testing',
      true,
      new Date(),
      new Date()
    ]);
    
    const groupId = groupResult.rows[0].id;
    
    // Create test banner
    const bannerResult = await client.query(`
      INSERT INTO banners (
        title, description, "imageUrl", link, "altText", "order", 
        "isActive", deletable, "bannerGroupId", "viewCount", "clickCount",
        "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id;
    `, [
      'Test Banner for Update Fix',
      'This is a test banner for testing the update fix',
      'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Test+Update+Banner',
      'https://example.com/original-link',
      'Test banner alt text',
      1,
      true,
      true,
      groupId,
      100,
      10,
      new Date(),
      new Date()
    ]);
    
    const bannerId = bannerResult.rows[0].id;
    
    client.release();
    
    console.log(`Created test banner group (ID: ${groupId}) and banner (ID: ${bannerId})`);
    
    return { success: true, groupId, bannerId };
    
  } catch (error) {
    console.error('Error creating test banner:', error.message);
    return { success: false };
  }
}

async function testBasicBannerUpdate(bannerId) {
  try {
    const updateData = {
      title: 'Updated Test Banner Title',
      description: 'Updated test banner description',
      link: 'https://example.com/updated-link',
      isActive: true,
      deletable: true,
      order: 1,
      imageUrl: 'https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=Updated+Banner',
      altText: 'Updated alt text'
    };
    
    const response = await fetch(`${API_BASE_URL}/api/banners/${bannerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    console.log('Basic update response:', {
      status: response.status,
      success: data.success,
      hasData: !!data.data,
      title: data.data?.title
    });
    
    return response.ok && data.success && data.data?.title === updateData.title;
    
  } catch (error) {
    console.error('Basic update test error:', error.message);
    return false;
  }
}

async function testBannerUpdateWithDates(bannerId) {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week
    
    const updateData = {
      title: 'Banner with Date Range',
      description: 'Banner with start and end dates',
      link: 'https://example.com/date-test',
      isActive: true,
      deletable: true,
      order: 1,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      imageUrl: 'https://via.placeholder.com/800x400/45B7D1/FFFFFF?text=Date+Banner',
      altText: 'Date test banner'
    };
    
    const response = await fetch(`${API_BASE_URL}/api/banners/${bannerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    console.log('Date update response:', {
      status: response.status,
      success: data.success,
      hasData: !!data.data,
      startDate: data.data?.startDate,
      endDate: data.data?.endDate
    });
    
    return response.ok && data.success && data.data?.startDate && data.data?.endDate;
    
  } catch (error) {
    console.error('Date update test error:', error.message);
    return false;
  }
}

async function testBannerUpdateWithURL(bannerId) {
  try {
    const updateData = {
      title: 'Banner with URL Link',
      description: 'Banner with external URL link',
      link: 'https://www.google.com/search?q=test+banner+link',
      isActive: true,
      deletable: true,
      order: 1,
      imageUrl: 'https://via.placeholder.com/800x400/96CEB4/FFFFFF?text=URL+Banner',
      altText: 'URL test banner'
    };
    
    const response = await fetch(`${API_BASE_URL}/api/banners/${bannerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    console.log('URL update response:', {
      status: response.status,
      success: data.success,
      hasData: !!data.data,
      link: data.data?.link
    });
    
    return response.ok && data.success && data.data?.link === updateData.link;
    
  } catch (error) {
    console.error('URL update test error:', error.message);
    return false;
  }
}

async function testComprehensiveBannerUpdate(bannerId) {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // Day after tomorrow
    const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // Two weeks from now
    
    const updateData = {
      title: 'Comprehensive Test Banner',
      description: 'This banner has all fields updated including dates and URL',
      link: 'https://kentkonut.com/comprehensive-test?utm_source=banner&utm_medium=test',
      isActive: false, // Change status
      deletable: false, // Change deletability
      order: 5, // Change order
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      imageUrl: 'https://via.placeholder.com/800x400/FF9F43/FFFFFF?text=Comprehensive+Test',
      altText: 'Comprehensive test banner with all fields'
    };
    
    const response = await fetch(`${API_BASE_URL}/api/banners/${bannerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    console.log('Comprehensive update response:', {
      status: response.status,
      success: data.success,
      hasData: !!data.data,
      title: data.data?.title,
      isActive: data.data?.isActive,
      deletable: data.data?.deletable,
      order: data.data?.order,
      hasStartDate: !!data.data?.startDate,
      hasEndDate: !!data.data?.endDate
    });
    
    return response.ok && data.success && 
           data.data?.title === updateData.title &&
           data.data?.isActive === updateData.isActive &&
           data.data?.deletable === updateData.deletable &&
           data.data?.order === updateData.order;
    
  } catch (error) {
    console.error('Comprehensive update test error:', error.message);
    return false;
  }
}

async function testInvalidDataHandling(bannerId) {
  try {
    // Test with missing required fields
    const invalidData = {
      title: '', // Empty title should fail
      imageUrl: '', // Empty image URL should fail
      isActive: true,
      deletable: true,
      order: 1
    };
    
    const response = await fetch(`${API_BASE_URL}/api/banners/${bannerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    const data = await response.json();
    
    console.log('Invalid data response:', {
      status: response.status,
      success: data.success,
      error: data.error
    });
    
    // Should return 400 status and error message
    return response.status === 400 && !data.success && data.error;
    
  } catch (error) {
    console.error('Invalid data test error:', error.message);
    return false;
  }
}

async function testDateValidation(bannerId) {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow (before start date)
    
    const invalidDateData = {
      title: 'Invalid Date Test Banner',
      description: 'Banner with invalid date range',
      link: 'https://example.com/invalid-date',
      isActive: true,
      deletable: true,
      order: 1,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(), // End date before start date
      imageUrl: 'https://via.placeholder.com/800x400/E74C3C/FFFFFF?text=Invalid+Date',
      altText: 'Invalid date test banner'
    };
    
    const response = await fetch(`${API_BASE_URL}/api/banners/${bannerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidDateData)
    });
    
    const data = await response.json();
    
    console.log('Date validation response:', {
      status: response.status,
      success: data.success,
      error: data.error
    });
    
    // Should return 400 status and error message about date validation
    return response.status === 400 && !data.success && data.error.includes('tarih');
    
  } catch (error) {
    console.error('Date validation test error:', error.message);
    return false;
  }
}

async function cleanupTestData(groupId, bannerId) {
  try {
    const client = await pool.connect();
    
    // Clean up banner
    await client.query('DELETE FROM banners WHERE id = $1', [bannerId]);
    
    // Clean up banner group
    await client.query('DELETE FROM banner_groups WHERE id = $1', [groupId]);
    
    client.release();
    console.log('Test data cleaned up successfully');
    
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

// Run the tests
runBannerUpdateTests().catch(console.error);
