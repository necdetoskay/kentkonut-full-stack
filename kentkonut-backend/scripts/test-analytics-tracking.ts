#!/usr/bin/env tsx

/**
 * Test Analytics Tracking
 * 
 * This script tests the analytics tracking endpoint to verify it's working correctly
 */

import fetch from 'node-fetch';

async function testAnalyticsTracking() {
  console.log('🧪 Testing Analytics Tracking...\n');
  
  const baseUrl = 'http://localhost:3010';
  
  try {
    // Test 1: OPTIONS request (CORS preflight)
    console.log('📋 Test 1: CORS Preflight Request');
    console.log('─'.repeat(50));
    
    const optionsResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3002',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`Status: ${optionsResponse.status} ${optionsResponse.statusText}`);
    console.log('CORS Headers:');
    console.log(`  Access-Control-Allow-Origin: ${optionsResponse.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`  Access-Control-Allow-Methods: ${optionsResponse.headers.get('Access-Control-Allow-Methods')}`);
    console.log(`  Access-Control-Allow-Headers: ${optionsResponse.headers.get('Access-Control-Allow-Headers')}`);
    console.log(`  Access-Control-Allow-Credentials: ${optionsResponse.headers.get('Access-Control-Allow-Credentials')}`);
    console.log('');
    
    // Test 2: POST request with valid consent
    console.log('📋 Test 2: POST Request with Valid Consent');
    console.log('─'.repeat(50));
    
    const validTrackingData = {
      bannerId: 1,
      eventType: 'click',
      sessionId: 'test_session_' + Date.now(),
      visitorId: 'test_visitor_' + Date.now(),
      timestamp: new Date().toISOString(),
      pageUrl: 'http://localhost:3002/test',
      referrer: 'http://localhost:3002',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      clickPosition: { x: 100, y: 200 },
      consentGiven: true,
      dataProcessingConsent: true
    };
    
    const validResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3002'
      },
      body: JSON.stringify(validTrackingData)
    });
    
    const validResult = await validResponse.json();
    
    console.log(`Status: ${validResponse.status} ${validResponse.statusText}`);
    console.log('Response:', JSON.stringify(validResult, null, 2));
    console.log('');
    
    // Test 3: POST request without consent (should fail with 403)
    console.log('📋 Test 3: POST Request without Consent (Expected 403)');
    console.log('─'.repeat(50));
    
    const invalidTrackingData = {
      ...validTrackingData,
      sessionId: 'test_session_no_consent_' + Date.now(),
      visitorId: 'test_visitor_no_consent_' + Date.now(),
      consentGiven: false,
      dataProcessingConsent: false
    };
    
    const invalidResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3002'
      },
      body: JSON.stringify(invalidTrackingData)
    });
    
    const invalidResult = await invalidResponse.json();
    
    console.log(`Status: ${invalidResponse.status} ${invalidResponse.statusText}`);
    console.log('Response:', JSON.stringify(invalidResult, null, 2));
    console.log('');
    
    // Test 4: POST request with invalid banner ID (should fail with 404)
    console.log('📋 Test 4: POST Request with Invalid Banner ID (Expected 404)');
    console.log('─'.repeat(50));
    
    const invalidBannerData = {
      ...validTrackingData,
      bannerId: 99999,
      sessionId: 'test_session_invalid_banner_' + Date.now(),
      visitorId: 'test_visitor_invalid_banner_' + Date.now()
    };
    
    const invalidBannerResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3002'
      },
      body: JSON.stringify(invalidBannerData)
    });
    
    const invalidBannerResult = await invalidBannerResponse.json();
    
    console.log(`Status: ${invalidBannerResponse.status} ${invalidBannerResponse.statusText}`);
    console.log('Response:', JSON.stringify(invalidBannerResult, null, 2));
    console.log('');
    
    // Test 5: POST request from disallowed origin (should fail with 403)
    console.log('📋 Test 5: POST Request from Disallowed Origin (Expected 403)');
    console.log('─'.repeat(50));
    
    const disallowedOriginResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://malicious-site.com'
      },
      body: JSON.stringify(validTrackingData)
    });
    
    const disallowedOriginResult = await disallowedOriginResponse.json();
    
    console.log(`Status: ${disallowedOriginResponse.status} ${disallowedOriginResponse.statusText}`);
    console.log('Response:', JSON.stringify(disallowedOriginResult, null, 2));
    console.log('');
    
    // Summary
    console.log('📊 Test Summary');
    console.log('─'.repeat(50));
    console.log(`✅ CORS Preflight: ${optionsResponse.status === 204 ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Valid Request: ${validResponse.status === 200 ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ No Consent (403): ${invalidResponse.status === 403 ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Invalid Banner (404): ${invalidBannerResponse.status === 404 ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Disallowed Origin (403): ${disallowedOriginResponse.status === 403 ? 'PASSED' : 'FAILED'}`);
    
    const allTestsPassed = 
      optionsResponse.status === 204 &&
      validResponse.status === 200 &&
      invalidResponse.status === 403 &&
      invalidBannerResponse.status === 404 &&
      disallowedOriginResponse.status === 403;
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL TESTS PASSED! Analytics tracking is working correctly.');
    } else {
      console.log('\n❌ Some tests failed. Please check the implementation.');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Handle script execution
if (require.main === module) {
  testAnalyticsTracking().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { testAnalyticsTracking };
