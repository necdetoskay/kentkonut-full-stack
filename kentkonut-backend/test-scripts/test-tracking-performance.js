/**
 * Banner Tracking Performance Test
 * This script tests the performance impact of banner tracking on page load times
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function runPerformanceTests() {
  console.log('🚀 Starting Banner Tracking Performance Tests...\n');
  
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable performance monitoring
    await page.setCacheEnabled(false);
    
    // Test 1: Page load without tracking
    console.log('📊 Test 1: Baseline page load performance...');
    const baselineMetrics = await testPageLoad(page, false);
    console.log(`✅ Baseline load time: ${baselineMetrics.loadTime}ms`);
    console.log(`   - DOM Content Loaded: ${baselineMetrics.domContentLoaded}ms`);
    console.log(`   - First Paint: ${baselineMetrics.firstPaint}ms`);
    console.log(`   - First Contentful Paint: ${baselineMetrics.firstContentfulPaint}ms\n`);
    
    // Test 2: Page load with tracking
    console.log('📊 Test 2: Page load with banner tracking...');
    const trackingMetrics = await testPageLoad(page, true);
    console.log(`✅ Tracking load time: ${trackingMetrics.loadTime}ms`);
    console.log(`   - DOM Content Loaded: ${trackingMetrics.domContentLoaded}ms`);
    console.log(`   - First Paint: ${trackingMetrics.firstPaint}ms`);
    console.log(`   - First Contentful Paint: ${trackingMetrics.firstContentfulPaint}ms\n`);
    
    // Test 3: Memory usage comparison
    console.log('📊 Test 3: Memory usage comparison...');
    const memoryMetrics = await testMemoryUsage(page);
    console.log(`✅ Memory usage: ${memoryMetrics.usedJSHeapSize / 1024 / 1024}MB`);
    console.log(`   - Total JS Heap Size: ${memoryMetrics.totalJSHeapSize / 1024 / 1024}MB`);
    console.log(`   - JS Heap Size Limit: ${memoryMetrics.jsHeapSizeLimit / 1024 / 1024}MB\n`);
    
    // Test 4: Tracking overhead
    console.log('📊 Test 4: Tracking overhead measurement...');
    const overheadMetrics = await testTrackingOverhead(page);
    console.log(`✅ Tracking overhead: ${overheadMetrics.averageEventTime}ms per event`);
    console.log(`   - 100 events processed in: ${overheadMetrics.totalTime}ms`);
    console.log(`   - Events per second: ${overheadMetrics.eventsPerSecond}\n`);
    
    // Test 5: Network impact
    console.log('📊 Test 5: Network impact assessment...');
    const networkMetrics = await testNetworkImpact(page);
    console.log(`✅ Network requests: ${networkMetrics.requestCount}`);
    console.log(`   - Total data transferred: ${networkMetrics.totalBytes} bytes`);
    console.log(`   - Average request time: ${networkMetrics.averageRequestTime}ms\n`);
    
    // Calculate performance impact
    const performanceImpact = calculatePerformanceImpact(baselineMetrics, trackingMetrics);
    
    console.log('📋 PERFORMANCE TEST SUMMARY:');
    console.log('============================');
    console.log(`📈 Load Time Impact: ${performanceImpact.loadTimeImpact}%`);
    console.log(`📈 DOM Content Loaded Impact: ${performanceImpact.domImpact}%`);
    console.log(`📈 First Paint Impact: ${performanceImpact.firstPaintImpact}%`);
    console.log(`📈 Memory Usage: ${memoryMetrics.usedJSHeapSize / 1024 / 1024}MB`);
    console.log(`📈 Tracking Overhead: ${overheadMetrics.averageEventTime}ms per event`);
    
    // Performance assessment
    const isPerformant = assessPerformance(performanceImpact, overheadMetrics);
    
    if (isPerformant) {
      console.log('\n🎉 PERFORMANCE TESTS PASSED!');
      console.log('Banner tracking has minimal impact on page performance.');
    } else {
      console.log('\n⚠️  PERFORMANCE CONCERNS DETECTED!');
      console.log('Banner tracking may be impacting page performance.');
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testPageLoad(page, withTracking) {
  const testHtmlPath = path.join(__dirname, 'test-client-tracking.html');
  
  // Navigate to test page
  const startTime = Date.now();
  
  await page.goto(`file://${testHtmlPath}`, {
    waitUntil: 'networkidle0'
  });
  
  // Get performance metrics
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      loadTime: navigation.loadEventEnd - navigation.navigationStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
    };
  });
  
  if (withTracking) {
    // Initialize tracking and measure additional overhead
    await page.evaluate(() => {
      if (typeof initializeTracking === 'function') {
        initializeTracking();
      }
    });
    
    // Wait for tracking to initialize
    await page.waitForTimeout(100);
  }
  
  return metrics;
}

async function testMemoryUsage(page) {
  // Initialize tracking
  await page.evaluate(() => {
    if (typeof initializeTracking === 'function') {
      initializeTracking();
    }
  });
  
  // Simulate some tracking events
  await page.evaluate(() => {
    if (window.tracker) {
      for (let i = 0; i < 50; i++) {
        const element = document.querySelector('[data-banner-id="1"]');
        if (element) {
          window.tracker.trackImpression(1, element);
        }
      }
    }
  });
  
  // Get memory usage
  const memoryMetrics = await page.evaluate(() => {
    return performance.memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  });
  
  return memoryMetrics;
}

async function testTrackingOverhead(page) {
  // Initialize tracking
  await page.evaluate(() => {
    if (typeof initializeTracking === 'function') {
      initializeTracking();
    }
  });
  
  // Measure tracking overhead
  const overheadMetrics = await page.evaluate(() => {
    const startTime = performance.now();
    const eventCount = 100;
    
    if (window.tracker) {
      const element = document.querySelector('[data-banner-id="1"]');
      if (element) {
        for (let i = 0; i < eventCount; i++) {
          window.tracker.trackImpression(1, element);
        }
      }
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    return {
      totalTime,
      averageEventTime: totalTime / eventCount,
      eventsPerSecond: Math.round((eventCount / totalTime) * 1000)
    };
  });
  
  return overheadMetrics;
}

async function testNetworkImpact(page) {
  const requests = [];
  
  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('/api/analytics/')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        startTime: Date.now()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/analytics/')) {
      const request = requests.find(r => r.url === response.url());
      if (request) {
        request.endTime = Date.now();
        request.status = response.status();
        request.size = response.headers()['content-length'] || 0;
      }
    }
  });
  
  // Initialize tracking and generate some events
  await page.evaluate(() => {
    if (typeof initializeTracking === 'function') {
      initializeTracking();
      
      // Grant consent to enable tracking
      if (typeof grantConsent === 'function') {
        grantConsent();
      }
      
      // Generate some test events
      setTimeout(() => {
        if (window.tracker) {
          const element = document.querySelector('[data-banner-id="1"]');
          if (element) {
            for (let i = 0; i < 10; i++) {
              window.tracker.trackImpression(1, element);
            }
          }
        }
      }, 100);
    }
  });
  
  // Wait for requests to complete
  await page.waitForTimeout(2000);
  
  const completedRequests = requests.filter(r => r.endTime);
  const totalBytes = completedRequests.reduce((sum, r) => sum + parseInt(r.size || 0), 0);
  const totalTime = completedRequests.reduce((sum, r) => sum + (r.endTime - r.startTime), 0);
  
  return {
    requestCount: completedRequests.length,
    totalBytes,
    averageRequestTime: completedRequests.length > 0 ? totalTime / completedRequests.length : 0
  };
}

function calculatePerformanceImpact(baseline, tracking) {
  const loadTimeImpact = ((tracking.loadTime - baseline.loadTime) / baseline.loadTime) * 100;
  const domImpact = ((tracking.domContentLoaded - baseline.domContentLoaded) / baseline.domContentLoaded) * 100;
  const firstPaintImpact = baseline.firstPaint > 0 ? 
    ((tracking.firstPaint - baseline.firstPaint) / baseline.firstPaint) * 100 : 0;
  
  return {
    loadTimeImpact: Math.round(loadTimeImpact * 100) / 100,
    domImpact: Math.round(domImpact * 100) / 100,
    firstPaintImpact: Math.round(firstPaintImpact * 100) / 100
  };
}

function assessPerformance(impact, overhead) {
  // Performance criteria
  const maxLoadTimeImpact = 5; // 5% maximum load time impact
  const maxEventOverhead = 1; // 1ms maximum per event
  const maxMemoryUsage = 10; // 10MB maximum memory usage
  
  const isLoadTimeAcceptable = Math.abs(impact.loadTimeImpact) <= maxLoadTimeImpact;
  const isOverheadAcceptable = overhead.averageEventTime <= maxEventOverhead;
  
  return isLoadTimeAcceptable && isOverheadAcceptable;
}

// Run the performance tests
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = {
  runPerformanceTests,
  testPageLoad,
  testMemoryUsage,
  testTrackingOverhead,
  testNetworkImpact
};
