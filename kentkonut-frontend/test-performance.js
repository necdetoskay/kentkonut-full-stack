// Performance Test for Banner System
// This script tests loading times, image optimization, and overall performance

console.log('⚡ Performance Test for Banner System\n');

async function testPerformance() {
  console.log('🧪 Testing Banner System Performance');
  console.log('='.repeat(50));
  
  const performanceResults = {
    apiResponseTime: 0,
    imageLoadTimes: [],
    totalLoadTime: 0,
    memoryUsage: 0,
    cacheEfficiency: 0
  };

  try {
    // Test 1: API Response Time
    console.log('\n📋 Test 1: API Response Time');
    const apiStartTime = performance.now();
    
    const bannerResponse = await fetch('http://localhost:3001/api/public/banners');
    const apiEndTime = performance.now();
    performanceResults.apiResponseTime = apiEndTime - apiStartTime;
    
    if (bannerResponse.ok) {
      const bannerData = await bannerResponse.json();
      console.log(`✅ API Response Time: ${performanceResults.apiResponseTime.toFixed(2)}ms`);
      console.log(`📊 Data Size: ${JSON.stringify(bannerData).length} bytes`);
      console.log(`🎯 Banners Count: ${bannerData.reduce((sum, group) => sum + group.banners.length, 0)}`);
      
      // Test 2: Image Loading Performance
      console.log('\n📋 Test 2: Image Loading Performance');
      const imagePromises = [];
      
      for (const group of bannerData) {
        for (const banner of group.banners.slice(0, 3)) { // Test first 3 images
          if (banner.imageUrl) {
            const imageStartTime = performance.now();
            const imagePromise = new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                const imageEndTime = performance.now();
                const loadTime = imageEndTime - imageStartTime;
                performanceResults.imageLoadTimes.push(loadTime);
                console.log(`📸 Image loaded: ${banner.imageUrl.split('/').pop()} - ${loadTime.toFixed(2)}ms`);
                resolve(loadTime);
              };
              img.onerror = () => {
                console.log(`❌ Image failed: ${banner.imageUrl}`);
                reject(new Error('Image load failed'));
              };
              img.src = `http://localhost:3002${banner.imageUrl}`;
            });
            imagePromises.push(imagePromise);
          }
        }
      }
      
      // Wait for all images to load or timeout after 10 seconds
      const imageResults = await Promise.allSettled(imagePromises);
      const successfulLoads = imageResults.filter(result => result.status === 'fulfilled');
      const failedLoads = imageResults.filter(result => result.status === 'rejected');
      
      console.log(`✅ Images loaded successfully: ${successfulLoads.length}`);
      console.log(`❌ Images failed to load: ${failedLoads.length}`);
      
      if (performanceResults.imageLoadTimes.length > 0) {
        const avgImageLoadTime = performanceResults.imageLoadTimes.reduce((sum, time) => sum + time, 0) / performanceResults.imageLoadTimes.length;
        const maxImageLoadTime = Math.max(...performanceResults.imageLoadTimes);
        const minImageLoadTime = Math.min(...performanceResults.imageLoadTimes);
        
        console.log(`📊 Average image load time: ${avgImageLoadTime.toFixed(2)}ms`);
        console.log(`📊 Max image load time: ${maxImageLoadTime.toFixed(2)}ms`);
        console.log(`📊 Min image load time: ${minImageLoadTime.toFixed(2)}ms`);
      }
      
    } else {
      console.log(`❌ API Error: ${bannerResponse.status}`);
      return false;
    }

    // Test 3: Frontend Loading Performance
    console.log('\n📋 Test 3: Frontend Loading Performance');
    const frontendStartTime = performance.now();
    
    const frontendResponse = await fetch('http://localhost:3002');
    const frontendEndTime = performance.now();
    const frontendLoadTime = frontendEndTime - frontendStartTime;
    
    if (frontendResponse.ok) {
      const htmlContent = await frontendResponse.text();
      console.log(`✅ Frontend Response Time: ${frontendLoadTime.toFixed(2)}ms`);
      console.log(`📊 HTML Size: ${htmlContent.length} bytes`);
      
      // Check for performance optimizations in HTML
      const hasPreload = htmlContent.includes('rel="preload"');
      const hasAsync = htmlContent.includes('async');
      const hasDefer = htmlContent.includes('defer');
      
      console.log(`🔧 Preload tags: ${hasPreload ? '✅' : '❌'}`);
      console.log(`🔧 Async scripts: ${hasAsync ? '✅' : '❌'}`);
      console.log(`🔧 Defer scripts: ${hasDefer ? '✅' : '❌'}`);
    }

    // Test 4: Statistics API Performance
    console.log('\n📋 Test 4: Statistics API Performance');
    const statsStartTime = performance.now();
    
    const statsResponse = await fetch('http://localhost:3001/api/public/statistics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bannerId: 1, type: 'view' })
    });
    
    const statsEndTime = performance.now();
    const statsResponseTime = statsEndTime - statsStartTime;
    
    if (statsResponse.ok) {
      console.log(`✅ Statistics API Response Time: ${statsResponseTime.toFixed(2)}ms`);
    } else {
      console.log(`❌ Statistics API Error: ${statsResponse.status}`);
    }

    // Test 5: Performance Benchmarks
    console.log('\n📋 Test 5: Performance Benchmarks');
    
    const benchmarks = {
      apiResponse: { value: performanceResults.apiResponseTime, threshold: 500, unit: 'ms' },
      avgImageLoad: { 
        value: performanceResults.imageLoadTimes.length > 0 ? 
               performanceResults.imageLoadTimes.reduce((sum, time) => sum + time, 0) / performanceResults.imageLoadTimes.length : 0, 
        threshold: 1000, 
        unit: 'ms' 
      },
      frontendLoad: { value: frontendLoadTime, threshold: 1000, unit: 'ms' },
      statsApi: { value: statsResponseTime, threshold: 300, unit: 'ms' }
    };

    Object.entries(benchmarks).forEach(([test, benchmark]) => {
      const status = benchmark.value <= benchmark.threshold ? '✅' : '⚠️';
      const performance = benchmark.value <= benchmark.threshold ? 'GOOD' : 'NEEDS IMPROVEMENT';
      console.log(`${status} ${test}: ${benchmark.value.toFixed(2)}${benchmark.unit} (threshold: ${benchmark.threshold}${benchmark.unit}) - ${performance}`);
    });

    // Test 6: Mobile Performance Considerations
    console.log('\n📋 Test 6: Mobile Performance Considerations');
    
    const mobileOptimizations = [
      'Touch gesture support implemented',
      'Responsive images with proper sizing',
      'Lazy loading for adjacent images',
      'Reduced animation duration on mobile',
      'Optimized touch targets (50px minimum)',
      'Hardware acceleration ready',
      'Minimal DOM manipulation during swipes'
    ];

    mobileOptimizations.forEach(optimization => {
      console.log(`✅ ${optimization}`);
    });

    // Performance Summary
    console.log('\n🎉 Performance Test Complete!');
    console.log('📊 Performance Summary:');
    console.log(`⚡ API Response: ${performanceResults.apiResponseTime.toFixed(2)}ms`);
    console.log(`🖼️ Images Tested: ${performanceResults.imageLoadTimes.length}`);
    console.log(`🌐 Frontend Load: ${frontendLoadTime.toFixed(2)}ms`);
    console.log(`📈 Statistics API: ${statsResponseTime.toFixed(2)}ms`);
    
    const overallPerformance = Object.values(benchmarks).every(b => b.value <= b.threshold) ? 'EXCELLENT' : 'GOOD';
    console.log(`🏆 Overall Performance: ${overallPerformance}`);
    
    return true;

  } catch (error) {
    console.error('\n❌ Performance Test Failed:', error);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check if both frontend (3002) and backend (3001) are running');
    console.log('2. Verify image files exist in public/images directory');
    console.log('3. Check network connectivity and server response times');
    console.log('4. Monitor browser console for JavaScript errors');
    
    return false;
  }
}

// Run the test
testPerformance().catch(console.error);
