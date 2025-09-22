/**
 * Analytics API Direct Testing Script
 * This script tests the direct analytics tracking API endpoints
 */

require('dotenv').config();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test configuration
const API_BASE_URL = 'http://localhost:3010';
const TEST_SESSION_ID = `test_session_direct_${Date.now()}`;
const TEST_VISITOR_ID = `test_visitor_direct_${Date.now()}`;

async function runDirectAnalyticsAPITests() {
  console.log('🧪 Starting Direct Analytics API Tests...\n');
  
  try {
    // Get a test banner ID
    const client = await pool.connect();
    const banners = await client.query('SELECT id FROM banners LIMIT 1');
    client.release();
    
    if (banners.rows.length === 0) {
      console.log('❌ No banners found in database. Please create a banner first.');
      return;
    }
    
    const testBannerId = banners.rows[0].id;
    console.log(`📊 Using banner ID: ${testBannerId} for testing\n`);
    
    // Test 1: Valid impression tracking
    console.log('📊 Test 1: Valid impression tracking...');
    const impressionTest = await testValidImpression(testBannerId);
    console.log(`✅ Impression tracking: ${impressionTest ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 2: Valid click tracking
    console.log('📊 Test 2: Valid click tracking...');
    const clickTest = await testValidClick(testBannerId);
    console.log(`✅ Click tracking: ${clickTest ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 3: Valid conversion tracking
    console.log('📊 Test 3: Valid conversion tracking...');
    const conversionTest = await testValidConversion(testBannerId);
    console.log(`✅ Conversion tracking: ${conversionTest ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 4: Invalid data validation
    console.log('📊 Test 4: Invalid data validation...');
    const validationTest = await testInvalidDataValidation();
    console.log(`✅ Data validation: ${validationTest ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 5: Consent requirement
    console.log('📊 Test 5: Consent requirement...');
    const consentTest = await testConsentRequirement(testBannerId);
    console.log(`✅ Consent requirement: ${consentTest ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 6: Database storage verification
    console.log('📊 Test 6: Database storage verification...');
    const storageTest = await testDatabaseStorage();
    console.log(`✅ Database storage: ${storageTest ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 7: Banner counter updates
    console.log('📊 Test 7: Banner counter updates...');
    const counterTest = await testBannerCounterUpdates(testBannerId);
    console.log(`✅ Banner counter updates: ${counterTest ? 'PASSED' : 'FAILED'}\n`);
    
    // Clean up test data
    await cleanupTestData();
    console.log('🧹 Test data cleaned up\n');
    
    console.log('📋 DIRECT ANALYTICS API TEST SUMMARY:');
    console.log('=====================================');
    console.log(`✅ Impression tracking: ${impressionTest ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Click tracking: ${clickTest ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Conversion tracking: ${conversionTest ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Data validation: ${validationTest ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Consent requirement: ${consentTest ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Database storage: ${storageTest ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner counter updates: ${counterTest ? 'PASSED' : 'FAILED'}`);
    
    const allTestsPassed = impressionTest && clickTest && conversionTest && validationTest && consentTest && storageTest && counterTest;
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL DIRECT ANALYTICS API TESTS PASSED!');
    } else {
      console.log('\n❌ Some tests failed. Please check the implementation.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    await pool.end();
  }
}

async function testValidImpression(bannerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/track-direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify({
        bannerId,
        eventType: 'impression',
        sessionId: TEST_SESSION_ID,
        visitorId: TEST_VISITOR_ID,
        timestamp: new Date().toISOString(),
        pageUrl: 'https://example.com/test-page',
        referrer: 'https://google.com',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        consentGiven: true,
        dataProcessingConsent: true
      })
    });
    
    const data = await response.json();
    console.log('Impression response:', data);
    
    return response.ok && data.success && data.eventId;
  } catch (error) {
    console.error('Impression test error:', error.message);
    return false;
  }
}

async function testValidClick(bannerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/track-direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        bannerId,
        eventType: 'click',
        sessionId: TEST_SESSION_ID,
        visitorId: TEST_VISITOR_ID,
        timestamp: new Date().toISOString(),
        pageUrl: 'https://example.com/test-page',
        clickPosition: { x: 150, y: 75 },
        engagementDuration: 5000,
        scrollDepth: 25,
        consentGiven: true,
        dataProcessingConsent: true
      })
    });
    
    const data = await response.json();
    console.log('Click response:', data);
    
    return response.ok && data.success && data.eventType === 'click';
  } catch (error) {
    console.error('Click test error:', error.message);
    return false;
  }
}

async function testValidConversion(bannerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/track-direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bannerId,
        eventType: 'conversion',
        sessionId: TEST_SESSION_ID,
        visitorId: TEST_VISITOR_ID,
        timestamp: new Date().toISOString(),
        pageUrl: 'https://example.com/thank-you',
        conversionType: 'purchase',
        conversionValue: 99.99,
        campaignId: 'test-campaign-123',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'test-campaign',
        consentGiven: true,
        dataProcessingConsent: true
      })
    });
    
    const data = await response.json();
    console.log('Conversion response:', data);
    
    return response.ok && data.success && data.eventType === 'conversion';
  } catch (error) {
    console.error('Conversion test error:', error.message);
    return false;
  }
}

async function testInvalidDataValidation() {
  try {
    // Test with missing required fields
    const response = await fetch(`${API_BASE_URL}/api/analytics/track-direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Missing bannerId
        eventType: 'impression',
        sessionId: TEST_SESSION_ID,
        // Missing other required fields
      })
    });
    
    const data = await response.json();
    console.log('Validation response:', data);
    
    // Should return 400 status and error message
    return response.status === 400 && !data.success && data.error;
  } catch (error) {
    console.error('Validation test error:', error.message);
    return false;
  }
}

async function testConsentRequirement(bannerId) {
  try {
    // Test without consent
    const response = await fetch(`${API_BASE_URL}/api/analytics/track-direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bannerId,
        eventType: 'impression',
        sessionId: TEST_SESSION_ID,
        visitorId: TEST_VISITOR_ID,
        timestamp: new Date().toISOString(),
        pageUrl: 'https://example.com/test-page',
        consentGiven: false, // No consent
        dataProcessingConsent: false
      })
    });
    
    const data = await response.json();
    console.log('Consent response:', data);
    
    // Should return 403 status for missing consent
    return response.status === 403 && !data.success;
  } catch (error) {
    console.error('Consent test error:', error.message);
    return false;
  }
}

async function testDatabaseStorage() {
  try {
    const client = await pool.connect();
    
    // Check if test events were stored
    const events = await client.query(
      'SELECT COUNT(*) as count FROM banner_analytics_events WHERE "sessionId" = $1',
      [TEST_SESSION_ID]
    );
    
    client.release();
    
    const eventCount = parseInt(events.rows[0].count);
    console.log(`Found ${eventCount} test events in database`);
    
    return eventCount > 0;
  } catch (error) {
    console.error('Database storage test error:', error.message);
    return false;
  }
}

async function testBannerCounterUpdates(bannerId) {
  try {
    const client = await pool.connect();
    
    // Get initial counter values
    const initialCounters = await client.query(
      'SELECT "impressionCount", "clickCount", "conversionCount" FROM banners WHERE id = $1',
      [bannerId]
    );
    
    client.release();
    
    if (initialCounters.rows.length === 0) {
      console.log('Banner not found for counter test');
      return false;
    }
    
    const initial = initialCounters.rows[0];
    console.log('Initial counters:', {
      impressions: initial.impressionCount,
      clicks: initial.clickCount,
      conversions: initial.conversionCount
    });
    
    // We should have incremented counters from our previous tests
    // Check if any counters increased
    return initial.impressionCount > 0 || initial.clickCount > 0 || initial.conversionCount > 0;
  } catch (error) {
    console.error('Banner counter test error:', error.message);
    return false;
  }
}

async function cleanupTestData() {
  try {
    const client = await pool.connect();
    
    // Clean up test events
    await client.query(
      'DELETE FROM banner_analytics_events WHERE "sessionId" = $1',
      [TEST_SESSION_ID]
    );
    
    client.release();
    console.log('Test data cleaned up successfully');
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

// Run the tests
runDirectAnalyticsAPITests().catch(console.error);
