/**
 * Frontend Banner Integration Test
 * Tests the frontend banner management integration with backend API
 */

const API_BASE_URL = 'http://localhost:3010';

async function testBannerIntegration() {
  console.log('🧪 Starting Frontend Banner Integration Tests...\n');
  
  try {
    // Test 1: Test banner list API
    console.log('📊 Test 1: Testing banner list API...');
    const listResult = await testBannerList();
    console.log(`✅ Banner list API: ${listResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 2: Test banner creation with field mapping
    console.log('📊 Test 2: Testing banner creation with field mapping...');
    const createResult = await testBannerCreation();
    console.log(`✅ Banner creation: ${createResult.success ? 'PASSED' : 'FAILED'}\n`);
    
    if (createResult.success) {
      const bannerId = createResult.bannerId;
      
      // Test 3: Test banner retrieval with field mapping
      console.log('📊 Test 3: Testing banner retrieval with field mapping...');
      const retrieveResult = await testBannerRetrieval(bannerId);
      console.log(`✅ Banner retrieval: ${retrieveResult ? 'PASSED' : 'FAILED'}\n`);
      
      // Test 4: Test banner update with date fields and URL
      console.log('📊 Test 4: Testing banner update with date fields and URL...');
      const updateResult = await testBannerUpdate(bannerId);
      console.log(`✅ Banner update: ${updateResult ? 'PASSED' : 'FAILED'}\n`);
      
      // Test 5: Test date range validation
      console.log('📊 Test 5: Testing date range validation...');
      const dateValidationResult = await testDateRangeValidation();
      console.log(`✅ Date range validation: ${dateValidationResult ? 'PASSED' : 'FAILED'}\n`);
      
      // Clean up
      await cleanupTestBanner(bannerId);
    }
    
    console.log('📋 FRONTEND BANNER INTEGRATION TEST SUMMARY:');
    console.log('============================================');
    console.log(`✅ Banner list API: ${listResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner creation: ${createResult.success ? 'PASSED' : 'FAILED'}`);
    if (createResult.success) {
      console.log(`✅ Banner retrieval: ${retrieveResult ? 'PASSED' : 'FAILED'}`);
      console.log(`✅ Banner update: ${updateResult ? 'PASSED' : 'FAILED'}`);
      console.log(`✅ Date range validation: ${dateValidationResult ? 'PASSED' : 'FAILED'}`);
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

async function testBannerList() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/banners?bannerGroupId=1`);
    const result = await response.json();
    
    console.log('Banner list response format:', {
      hasSuccess: 'success' in result,
      hasData: 'data' in result,
      dataType: Array.isArray(result.data) ? 'array' : typeof result.data,
      sampleFields: result.data?.[0] ? Object.keys(result.data[0]) : 'no data'
    });
    
    return response.ok && result.success && Array.isArray(result.data);
  } catch (error) {
    console.error('Banner list test error:', error.message);
    return false;
  }
}

async function testBannerCreation() {
  try {
    // Frontend data format (what the form sends)
    const frontendData = {
      title: 'Test Frontend Banner',
      description: 'Test banner created from frontend integration test',
      imageUrl: 'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Frontend+Test',
      targetUrl: 'https://example.com/frontend-test', // Frontend field name
      displayOrder: 1, // Frontend field name
      isActive: true,
      deletable: true,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
      bannerGroupId: 1
    };
    
    // Map to backend format (what the service should send)
    const backendData = {
      ...frontendData,
      link: frontendData.targetUrl, // Map targetUrl to link
      order: frontendData.displayOrder, // Map displayOrder to order
    };
    
    // Remove frontend-specific fields
    delete backendData.targetUrl;
    delete backendData.displayOrder;
    
    console.log('Frontend data:', frontendData);
    console.log('Backend data:', backendData);
    
    const response = await fetch(`${API_BASE_URL}/api/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });
    
    const result = await response.json();
    
    console.log('Creation response:', {
      status: response.status,
      success: result.success,
      hasData: !!result.data,
      bannerId: result.data?.id,
      backendFields: result.data ? {
        hasLink: 'link' in result.data,
        hasOrder: 'order' in result.data,
        hasStartDate: 'startDate' in result.data,
        hasEndDate: 'endDate' in result.data,
        link: result.data.link,
        order: result.data.order
      } : 'no data'
    });
    
    return {
      success: response.ok && result.success && result.data?.id,
      bannerId: result.data?.id
    };
  } catch (error) {
    console.error('Banner creation test error:', error.message);
    return { success: false };
  }
}

async function testBannerRetrieval(bannerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/banners/${bannerId}`);
    const result = await response.json();
    
    console.log('Retrieval response:', {
      status: response.status,
      success: result.success,
      hasData: !!result.banner,
      backendFields: result.banner ? {
        hasLink: 'link' in result.banner,
        hasOrder: 'order' in result.banner,
        hasStartDate: 'startDate' in result.banner,
        hasEndDate: 'endDate' in result.banner,
        link: result.banner.link,
        order: result.banner.order,
        startDate: result.banner.startDate,
        endDate: result.banner.endDate
      } : 'no data'
    });
    
    // Test field mapping (what frontend service should do)
    if (result.success && result.banner) {
      const mappedBanner = {
        ...result.banner,
        targetUrl: result.banner.link || '', // Map link to targetUrl
        displayOrder: result.banner.order || 0, // Map order to displayOrder
      };
      
      console.log('Mapped frontend fields:', {
        targetUrl: mappedBanner.targetUrl,
        displayOrder: mappedBanner.displayOrder
      });
    }
    
    return response.ok && result.success && result.banner;
  } catch (error) {
    console.error('Banner retrieval test error:', error.message);
    return false;
  }
}

async function testBannerUpdate(bannerId) {
  try {
    // Frontend update data
    const frontendUpdateData = {
      title: 'Updated Frontend Banner',
      description: 'Updated from frontend integration test',
      imageUrl: 'https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=Updated+Frontend',
      targetUrl: 'https://example.com/updated-frontend-test', // Frontend field name
      displayOrder: 2, // Frontend field name
      isActive: true,
      deletable: true,
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Two weeks
    };
    
    // Map to backend format
    const backendUpdateData = {
      ...frontendUpdateData,
      link: frontendUpdateData.targetUrl, // Map targetUrl to link
      order: frontendUpdateData.displayOrder, // Map displayOrder to order
    };
    
    // Remove frontend-specific fields
    delete backendUpdateData.targetUrl;
    delete backendUpdateData.displayOrder;
    
    const response = await fetch(`${API_BASE_URL}/api/banners/${bannerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendUpdateData),
    });
    
    const result = await response.json();
    
    console.log('Update response:', {
      status: response.status,
      success: result.success,
      hasData: !!result.data,
      updatedFields: result.data ? {
        title: result.data.title,
        link: result.data.link,
        order: result.data.order,
        startDate: result.data.startDate,
        endDate: result.data.endDate
      } : 'no data'
    });
    
    return response.ok && result.success && 
           result.data?.title === frontendUpdateData.title &&
           result.data?.link === frontendUpdateData.targetUrl;
  } catch (error) {
    console.error('Banner update test error:', error.message);
    return false;
  }
}

async function testDateRangeValidation() {
  try {
    // Test invalid date range (end date before start date)
    const invalidData = {
      title: 'Invalid Date Range Banner',
      imageUrl: 'https://via.placeholder.com/800x400',
      link: 'https://example.com',
      order: 1,
      isActive: true,
      deletable: true,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow (before start)
      bannerGroupId: 1
    };
    
    const response = await fetch(`${API_BASE_URL}/api/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    });
    
    const result = await response.json();
    
    console.log('Date validation response:', {
      status: response.status,
      success: result.success,
      error: result.error
    });
    
    // Should return 400 status and error message
    return response.status === 400 && !result.success && result.error.includes('tarih');
  } catch (error) {
    console.error('Date validation test error:', error.message);
    return false;
  }
}

async function cleanupTestBanner(bannerId) {
  try {
    await fetch(`${API_BASE_URL}/api/banners/${bannerId}`, {
      method: 'DELETE',
    });
    console.log('🧹 Test banner cleaned up');
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

// Run the tests
testBannerIntegration().catch(console.error);
