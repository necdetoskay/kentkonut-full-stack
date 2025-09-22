/**
 * Banner Click Functionality Test
 * Tests the banner click functionality, tracking, and navigation
 */

const API_BASE_URL = 'http://localhost:3010';

async function testBannerClickFunctionality() {
  console.log('🧪 Starting Banner Click Functionality Tests...\n');
  
  try {
    // Test 1: Test analytics tracking endpoint
    console.log('📊 Test 1: Testing analytics tracking endpoint...');
    const trackingResult = await testAnalyticsTracking();
    console.log(`✅ Analytics tracking: ${trackingResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 2: Test banner click tracking
    console.log('📊 Test 2: Testing banner click tracking...');
    const clickTrackingResult = await testBannerClickTracking();
    console.log(`✅ Banner click tracking: ${clickTrackingResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 3: Test banner view tracking
    console.log('📊 Test 3: Testing banner view tracking...');
    const viewTrackingResult = await testBannerViewTracking();
    console.log(`✅ Banner view tracking: ${viewTrackingResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 4: Test banner impression tracking
    console.log('📊 Test 4: Testing banner impression tracking...');
    const impressionTrackingResult = await testBannerImpressionTracking();
    console.log(`✅ Banner impression tracking: ${impressionTrackingResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 5: Test banner data with target URLs
    console.log('📊 Test 5: Testing banner data with target URLs...');
    const bannerDataResult = await testBannerDataWithTargetUrls();
    console.log(`✅ Banner data with target URLs: ${bannerDataResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 6: Test public banner endpoints
    console.log('📊 Test 6: Testing public banner endpoints...');
    const publicBannerResult = await testPublicBannerEndpoints();
    console.log(`✅ Public banner endpoints: ${publicBannerResult ? 'PASSED' : 'FAILED'}\n`);
    
    console.log('📋 BANNER CLICK FUNCTIONALITY TEST SUMMARY:');
    console.log('==========================================');
    console.log(`✅ Analytics tracking: ${trackingResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner click tracking: ${clickTrackingResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner view tracking: ${viewTrackingResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner impression tracking: ${impressionTrackingResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner data with target URLs: ${bannerDataResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Public banner endpoints: ${publicBannerResult ? 'PASSED' : 'FAILED'}`);
    
    const allTestsPassed = trackingResult && clickTrackingResult && viewTrackingResult && 
                          impressionTrackingResult && bannerDataResult && publicBannerResult;
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL BANNER CLICK FUNCTIONALITY TESTS PASSED!');
      console.log('Banner click functionality is working correctly.');
    } else {
      console.log('\n❌ Some tests failed. Please check the implementation.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

async function testAnalyticsTracking() {
  try {
    const trackingData = {
      bannerId: 1,
      eventType: 'click',
      sessionId: 'test_session_' + Date.now(),
      visitorId: 'test_visitor_' + Date.now(),
      timestamp: new Date().toISOString(),
      pageUrl: 'http://localhost:3000/test',
      referrer: 'http://localhost:3000',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      clickPosition: { x: 100, y: 200 },
      consentGiven: true,
      dataProcessingConsent: true
    };
    
    const response = await fetch(`${API_BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    });
    
    const result = await response.json();
    
    console.log('Analytics tracking response:', {
      status: response.status,
      success: result.success,
      eventId: result.eventId,
      eventType: result.eventType
    });
    
    return response.ok && result.success && result.eventId;
  } catch (error) {
    console.error('Analytics tracking test error:', error.message);
    return false;
  }
}

async function testBannerClickTracking() {
  try {
    const trackingData = {
      bannerId: 1,
      eventType: 'click',
      sessionId: 'test_session_click_' + Date.now(),
      visitorId: 'test_visitor_click_' + Date.now(),
      timestamp: new Date().toISOString(),
      pageUrl: 'http://localhost:3000/test-click',
      referrer: 'http://localhost:3000',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      clickPosition: { x: 150, y: 250 },
      consentGiven: true,
      dataProcessingConsent: true
    };
    
    const response = await fetch(`${API_BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    });
    
    const result = await response.json();
    
    console.log('Click tracking response:', {
      status: response.status,
      success: result.success,
      eventType: result.eventType,
      processed: result.processed
    });
    
    return response.ok && result.success && result.eventType === 'click';
  } catch (error) {
    console.error('Click tracking test error:', error.message);
    return false;
  }
}

async function testBannerViewTracking() {
  try {
    const trackingData = {
      bannerId: 1,
      eventType: 'view',
      sessionId: 'test_session_view_' + Date.now(),
      visitorId: 'test_visitor_view_' + Date.now(),
      timestamp: new Date().toISOString(),
      pageUrl: 'http://localhost:3000/test-view',
      referrer: 'http://localhost:3000',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      engagementDuration: 5000,
      scrollDepth: 75,
      consentGiven: true,
      dataProcessingConsent: true
    };
    
    const response = await fetch(`${API_BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    });
    
    const result = await response.json();
    
    console.log('View tracking response:', {
      status: response.status,
      success: result.success,
      eventType: result.eventType
    });
    
    return response.ok && result.success && result.eventType === 'view';
  } catch (error) {
    console.error('View tracking test error:', error.message);
    return false;
  }
}

async function testBannerImpressionTracking() {
  try {
    const trackingData = {
      bannerId: 1,
      eventType: 'impression',
      sessionId: 'test_session_impression_' + Date.now(),
      visitorId: 'test_visitor_impression_' + Date.now(),
      timestamp: new Date().toISOString(),
      pageUrl: 'http://localhost:3000/test-impression',
      referrer: 'http://localhost:3000',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      consentGiven: true,
      dataProcessingConsent: true
    };
    
    const response = await fetch(`${API_BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    });
    
    const result = await response.json();
    
    console.log('Impression tracking response:', {
      status: response.status,
      success: result.success,
      eventType: result.eventType
    });
    
    return response.ok && result.success && result.eventType === 'impression';
  } catch (error) {
    console.error('Impression tracking test error:', error.message);
    return false;
  }
}

async function testBannerDataWithTargetUrls() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/banners?bannerGroupId=1`);
    const result = await response.json();
    
    console.log('Banner data response:', {
      status: response.status,
      success: result.success,
      hasData: !!result.data,
      bannerCount: result.data?.length || 0,
      sampleBanner: result.data?.[0] ? {
        id: result.data[0].id,
        title: result.data[0].title,
        hasLink: !!result.data[0].link,
        link: result.data[0].link,
        hasTargetUrl: !!result.data[0].targetUrl,
        targetUrl: result.data[0].targetUrl
      } : 'no banners'
    });
    
    if (result.success && result.data && result.data.length > 0) {
      const banner = result.data[0];
      return !!(banner.link || banner.targetUrl || banner.linkUrl);
    }
    
    return false;
  } catch (error) {
    console.error('Banner data test error:', error.message);
    return false;
  }
}

async function testPublicBannerEndpoints() {
  try {
    // Test hero banner position
    const heroResponse = await fetch(`${API_BASE_URL}/api/public/banners/position/550e8400-e29b-41d4-a716-446655440001`);
    const heroResult = await heroResponse.json();
    
    console.log('Public hero banner response:', {
      status: heroResponse.status,
      hasData: !!heroResult.banners,
      bannerCount: heroResult.banners?.length || 0,
      sampleBanner: heroResult.banners?.[0] ? {
        id: heroResult.banners[0].id,
        title: heroResult.banners[0].title,
        hasLink: !!heroResult.banners[0].link,
        link: heroResult.banners[0].link
      } : 'no banners'
    });
    
    return heroResponse.ok && heroResult.banners;
  } catch (error) {
    console.error('Public banner endpoints test error:', error.message);
    return false;
  }
}

// Run the tests
testBannerClickFunctionality().catch(console.error);
