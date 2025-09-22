/**
 * Analytics Dashboard Testing Script
 * This script tests the analytics dashboard functionality and API endpoints
 */

require('dotenv').config();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test configuration
const API_BASE_URL = 'http://localhost:3010';

async function runAnalyticsDashboardTests() {
  console.log('🧪 Starting Analytics Dashboard Tests...\n');
  
  try {
    // Test 1: Create test data
    console.log('📊 Test 1: Creating test analytics data...');
    const testDataResult = await createTestAnalyticsData();
    console.log(`✅ Test data creation: ${testDataResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 2: Test performance API endpoint
    console.log('📊 Test 2: Testing performance API endpoint...');
    const performanceApiResult = await testPerformanceAPI();
    console.log(`✅ Performance API: ${performanceApiResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 3: Test different time periods
    console.log('📊 Test 3: Testing different time periods...');
    const timePeriodsResult = await testTimePeriods();
    console.log(`✅ Time periods: ${timePeriodsResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 4: Test data aggregation
    console.log('📊 Test 4: Testing data aggregation...');
    const aggregationResult = await testDataAggregation();
    console.log(`✅ Data aggregation: ${aggregationResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 5: Test error handling
    console.log('📊 Test 5: Testing error handling...');
    const errorHandlingResult = await testErrorHandling();
    console.log(`✅ Error handling: ${errorHandlingResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 6: Test performance with large dataset
    console.log('📊 Test 6: Testing performance with large dataset...');
    const performanceResult = await testPerformanceWithLargeDataset();
    console.log(`✅ Large dataset performance: ${performanceResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Clean up test data
    await cleanupTestData();
    console.log('🧹 Test data cleaned up\n');
    
    console.log('📋 ANALYTICS DASHBOARD TEST SUMMARY:');
    console.log('====================================');
    console.log(`✅ Test data creation: ${testDataResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Performance API: ${performanceApiResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Time periods: ${timePeriodsResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Data aggregation: ${aggregationResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Error handling: ${errorHandlingResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Large dataset performance: ${performanceResult ? 'PASSED' : 'FAILED'}`);
    
    const allTestsPassed = testDataResult && performanceApiResult && timePeriodsResult && 
                          aggregationResult && errorHandlingResult && performanceResult;
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL ANALYTICS DASHBOARD TESTS PASSED!');
    } else {
      console.log('\n❌ Some tests failed. Please check the implementation.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    await pool.end();
  }
}

async function createTestAnalyticsData() {
  try {
    const client = await pool.connect();
    
    // Get a test banner ID
    const banners = await client.query('SELECT id FROM banners LIMIT 1');
    if (banners.rows.length === 0) {
      console.log('No banners found, creating test banner...');
      
      // Create a test banner
      const bannerResult = await client.query(`
        INSERT INTO banners (title, "imageUrl", "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `, [
        'Test Analytics Banner',
        'https://via.placeholder.com/800x400',
        true,
        new Date(),
        new Date()
      ]);
      
      console.log(`Created test banner with ID: ${bannerResult.rows[0].id}`);
    }
    
    const bannerId = banners.rows.length > 0 ? banners.rows[0].id : bannerResult.rows[0].id;
    
    // Create test analytics events for the last 30 days
    const events = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() - i);
      
      // Create various events for each day
      const dailyEvents = [
        // Impressions
        ...Array.from({ length: Math.floor(Math.random() * 100) + 50 }, (_, j) => ({
          bannerId,
          sessionId: `test_session_${i}_${j}`,
          visitorId: `test_visitor_${i}_${j}`,
          eventType: 'impression',
          eventTimestamp: new Date(eventDate.getTime() + j * 1000),
          pageUrl: 'https://example.com/test',
          deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          browserName: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
          countryCode: 'TR',
          countryName: 'Turkey',
          consentGiven: true,
          dataProcessingConsent: true
        })),
        
        // Views (subset of impressions)
        ...Array.from({ length: Math.floor(Math.random() * 40) + 20 }, (_, j) => ({
          bannerId,
          sessionId: `test_session_${i}_${j}`,
          visitorId: `test_visitor_${i}_${j}`,
          eventType: 'view',
          eventTimestamp: new Date(eventDate.getTime() + j * 1000 + 500),
          pageUrl: 'https://example.com/test',
          deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          browserName: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
          countryCode: 'TR',
          countryName: 'Turkey',
          consentGiven: true,
          dataProcessingConsent: true
        })),
        
        // Clicks (subset of views)
        ...Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, j) => ({
          bannerId,
          sessionId: `test_session_${i}_${j}`,
          visitorId: `test_visitor_${i}_${j}`,
          eventType: 'click',
          eventTimestamp: new Date(eventDate.getTime() + j * 1000 + 1000),
          pageUrl: 'https://example.com/test',
          deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          browserName: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
          countryCode: 'TR',
          countryName: 'Turkey',
          clickPosition: JSON.stringify({ x: Math.floor(Math.random() * 800), y: Math.floor(Math.random() * 400) }),
          consentGiven: true,
          dataProcessingConsent: true
        })),
        
        // Conversions (subset of clicks)
        ...Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
          bannerId,
          sessionId: `test_session_${i}_${j}`,
          visitorId: `test_visitor_${i}_${j}`,
          eventType: 'conversion',
          eventTimestamp: new Date(eventDate.getTime() + j * 1000 + 2000),
          pageUrl: 'https://example.com/thank-you',
          deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          browserName: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
          countryCode: 'TR',
          countryName: 'Turkey',
          conversionType: 'purchase',
          conversionValue: Math.floor(Math.random() * 500) + 50,
          consentGiven: true,
          dataProcessingConsent: true
        }))
      ];
      
      events.push(...dailyEvents);
    }
    
    // Insert events in batches
    const batchSize = 100;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      
      for (const event of batch) {
        await client.query(`
          INSERT INTO banner_analytics_events (
            "bannerId", "sessionId", "visitorId", "eventType", "eventTimestamp",
            "pageUrl", "deviceType", "browserName", "countryCode", "countryName",
            "clickPosition", "conversionType", "conversionValue", "consentGiven", "dataProcessingConsent"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          event.bannerId, event.sessionId, event.visitorId, event.eventType, event.eventTimestamp,
          event.pageUrl, event.deviceType, event.browserName, event.countryCode, event.countryName,
          event.clickPosition, event.conversionType, event.conversionValue, event.consentGiven, event.dataProcessingConsent
        ]);
      }
    }
    
    client.release();
    console.log(`Created ${events.length} test analytics events for banner ${bannerId}`);
    return true;
    
  } catch (error) {
    console.error('Error creating test data:', error.message);
    return false;
  }
}

async function testPerformanceAPI() {
  try {
    const client = await pool.connect();
    const banners = await client.query('SELECT id FROM banners LIMIT 1');
    client.release();
    
    if (banners.rows.length === 0) {
      console.log('No banners found for API test');
      return false;
    }
    
    const bannerId = banners.rows[0].id;
    
    const response = await fetch(`${API_BASE_URL}/api/analytics/banners/${bannerId}/performance?period=7d`);
    const data = await response.json();
    
    console.log('Performance API response:', {
      success: data.success,
      hasData: !!data.data,
      hasSummary: !!data.data?.summary,
      hasBreakdowns: !!data.data?.breakdowns,
      hasTimeSeries: !!data.data?.timeSeries
    });
    
    return response.ok && data.success && data.data && data.data.summary;
    
  } catch (error) {
    console.error('Performance API test error:', error.message);
    return false;
  }
}

async function testTimePeriods() {
  try {
    const client = await pool.connect();
    const banners = await client.query('SELECT id FROM banners LIMIT 1');
    client.release();
    
    if (banners.rows.length === 0) return false;
    
    const bannerId = banners.rows[0].id;
    const periods = ['24h', '7d', '30d', '90d'];
    
    for (const period of periods) {
      const response = await fetch(`${API_BASE_URL}/api/analytics/banners/${bannerId}/performance?period=${period}`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.log(`Period ${period} test failed`);
        return false;
      }
      
      console.log(`Period ${period}: ${data.data.summary.totalImpressions} impressions`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Time periods test error:', error.message);
    return false;
  }
}

async function testDataAggregation() {
  try {
    const client = await pool.connect();
    
    // Test data aggregation accuracy
    const banners = await client.query('SELECT id FROM banners LIMIT 1');
    if (banners.rows.length === 0) {
      client.release();
      return false;
    }
    
    const bannerId = banners.rows[0].id;
    
    // Get raw counts from database
    const rawCounts = await client.query(`
      SELECT 
        "eventType",
        COUNT(*) as count
      FROM banner_analytics_events
      WHERE "bannerId" = $1
      AND "eventTimestamp" >= NOW() - INTERVAL '7 days'
      GROUP BY "eventType"
    `, [bannerId]);
    
    client.release();
    
    // Get aggregated data from API
    const response = await fetch(`${API_BASE_URL}/api/analytics/banners/${bannerId}/performance?period=7d`);
    const data = await response.json();
    
    if (!response.ok || !data.success) return false;
    
    const rawData = rawCounts.rows.reduce((acc, row) => {
      acc[row.eventType] = parseInt(row.count);
      return acc;
    }, {});
    
    const apiData = data.data.summary;
    
    console.log('Raw vs API data comparison:', {
      impressions: { raw: rawData.impression || 0, api: apiData.totalImpressions },
      views: { raw: rawData.view || 0, api: apiData.totalViews },
      clicks: { raw: rawData.click || 0, api: apiData.totalClicks },
      conversions: { raw: rawData.conversion || 0, api: apiData.totalConversions }
    });
    
    // Check if aggregation is accurate (allowing for small discrepancies)
    const impressionsMatch = Math.abs((rawData.impression || 0) - apiData.totalImpressions) <= 1;
    const viewsMatch = Math.abs((rawData.view || 0) - apiData.totalViews) <= 1;
    const clicksMatch = Math.abs((rawData.click || 0) - apiData.totalClicks) <= 1;
    const conversionsMatch = Math.abs((rawData.conversion || 0) - apiData.totalConversions) <= 1;
    
    return impressionsMatch && viewsMatch && clicksMatch && conversionsMatch;
    
  } catch (error) {
    console.error('Data aggregation test error:', error.message);
    return false;
  }
}

async function testErrorHandling() {
  try {
    // Test with invalid banner ID
    const response1 = await fetch(`${API_BASE_URL}/api/analytics/banners/99999/performance?period=7d`);
    const data1 = await response1.json();
    
    const invalidBannerHandled = response1.status === 404 && !data1.success;
    
    // Test with invalid period
    const response2 = await fetch(`${API_BASE_URL}/api/analytics/banners/1/performance?period=invalid`);
    const data2 = await response2.json();
    
    // Should still work with default period
    const invalidPeriodHandled = response2.ok && data2.success;
    
    console.log('Error handling results:', {
      invalidBanner: invalidBannerHandled,
      invalidPeriod: invalidPeriodHandled
    });
    
    return invalidBannerHandled && invalidPeriodHandled;
    
  } catch (error) {
    console.error('Error handling test error:', error.message);
    return false;
  }
}

async function testPerformanceWithLargeDataset() {
  try {
    const client = await pool.connect();
    const banners = await client.query('SELECT id FROM banners LIMIT 1');
    
    if (banners.rows.length === 0) {
      client.release();
      return false;
    }
    
    const bannerId = banners.rows[0].id;
    
    // Test API response time
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/analytics/banners/${bannerId}/performance?period=30d`);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    const data = await response.json();
    
    client.release();
    
    console.log(`API response time: ${responseTime}ms`);
    console.log(`Data points returned: ${data.data?.timeSeries?.length || 0}`);
    
    // Performance should be under 5 seconds
    return response.ok && data.success && responseTime < 5000;
    
  } catch (error) {
    console.error('Performance test error:', error.message);
    return false;
  }
}

async function cleanupTestData() {
  try {
    const client = await pool.connect();
    
    // Clean up test analytics events
    await client.query(`
      DELETE FROM banner_analytics_events 
      WHERE "sessionId" LIKE 'test_session_%'
    `);
    
    // Clean up test banners
    await client.query(`
      DELETE FROM banners 
      WHERE title = 'Test Analytics Banner'
    `);
    
    client.release();
    console.log('Test data cleaned up successfully');
    
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

// Run the tests
runAnalyticsDashboardTests().catch(console.error);
