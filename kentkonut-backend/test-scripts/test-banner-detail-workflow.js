/**
 * Banner Detail Workflow Testing Script
 * This script tests the complete banner management workflow including the detail page
 */

require('dotenv').config();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test configuration
const API_BASE_URL = 'http://localhost:3010';

async function runBannerDetailWorkflowTests() {
  console.log('🧪 Starting Banner Detail Workflow Tests...\n');
  
  try {
    // Test 1: Create test banner group and banner
    console.log('📊 Test 1: Creating test banner group and banner...');
    const testDataResult = await createTestBannerData();
    console.log(`✅ Test data creation: ${testDataResult.success ? 'PASSED' : 'FAILED'}\n`);
    
    if (!testDataResult.success) {
      console.log('❌ Cannot proceed without test data');
      return;
    }
    
    const { groupId, bannerId } = testDataResult;
    
    // Test 2: Test banner list API
    console.log('📊 Test 2: Testing banner list API...');
    const bannerListResult = await testBannerListAPI(groupId);
    console.log(`✅ Banner list API: ${bannerListResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 3: Test banner detail API
    console.log('📊 Test 3: Testing banner detail API...');
    const bannerDetailResult = await testBannerDetailAPI(groupId, bannerId);
    console.log(`✅ Banner detail API: ${bannerDetailResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 4: Test analytics integration
    console.log('📊 Test 4: Testing analytics integration...');
    const analyticsResult = await testAnalyticsIntegration(bannerId);
    console.log(`✅ Analytics integration: ${analyticsResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 5: Test banner statistics calculation
    console.log('📊 Test 5: Testing banner statistics calculation...');
    const statisticsResult = await testBannerStatistics(bannerId);
    console.log(`✅ Banner statistics: ${statisticsResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 6: Test banner update functionality
    console.log('📊 Test 6: Testing banner update functionality...');
    const updateResult = await testBannerUpdate(groupId, bannerId);
    console.log(`✅ Banner update: ${updateResult ? 'PASSED' : 'FAILED'}\n`);
    
    // Clean up test data
    await cleanupTestData(groupId, bannerId);
    console.log('🧹 Test data cleaned up\n');
    
    console.log('📋 BANNER DETAIL WORKFLOW TEST SUMMARY:');
    console.log('=======================================');
    console.log(`✅ Test data creation: ${testDataResult.success ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner list API: ${bannerListResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner detail API: ${bannerDetailResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Analytics integration: ${analyticsResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner statistics: ${statisticsResult ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Banner update: ${updateResult ? 'PASSED' : 'FAILED'}`);
    
    const allTestsPassed = testDataResult.success && bannerListResult && bannerDetailResult && 
                          analyticsResult && statisticsResult && updateResult;
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL BANNER DETAIL WORKFLOW TESTS PASSED!');
    } else {
      console.log('\n❌ Some tests failed. Please check the implementation.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    await pool.end();
  }
}

async function createTestBannerData() {
  try {
    const client = await pool.connect();
    
    // Create test banner group
    const groupResult = await client.query(`
      INSERT INTO banner_groups (name, description, "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `, [
      'Test Banner Group for Workflow',
      'Test group for banner detail workflow testing',
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
      'Test Banner for Detail Workflow',
      'This is a test banner for testing the detail workflow',
      'https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Test+Banner',
      'https://example.com/test-link',
      'Test banner alt text',
      1,
      true,
      true,
      groupId,
      1250,
      89,
      new Date(),
      new Date()
    ]);
    
    const bannerId = bannerResult.rows[0].id;
    
    // Create some test analytics data
    const sessionId = `test_workflow_session_${Date.now()}`;
    const visitorId = `test_workflow_visitor_${Date.now()}`;
    
    const analyticsEvents = [
      {
        eventType: 'impression',
        count: 50
      },
      {
        eventType: 'view',
        count: 35
      },
      {
        eventType: 'click',
        count: 8
      },
      {
        eventType: 'conversion',
        count: 2
      }
    ];
    
    for (const event of analyticsEvents) {
      for (let i = 0; i < event.count; i++) {
        await client.query(`
          INSERT INTO banner_analytics_events (
            "bannerId", "sessionId", "visitorId", "eventType", "eventTimestamp",
            "pageUrl", "deviceType", "browserName", "countryCode", "countryName",
            "consentGiven", "dataProcessingConsent"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          bannerId,
          `${sessionId}_${i}`,
          `${visitorId}_${i}`,
          event.eventType,
          new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
          'https://example.com/test-page',
          ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          ['Chrome', 'Firefox', 'Safari'][Math.floor(Math.random() * 3)],
          'TR',
          'Turkey',
          true,
          true
        ]);
      }
    }
    
    client.release();
    
    console.log(`Created test banner group (ID: ${groupId}) and banner (ID: ${bannerId})`);
    console.log(`Created ${analyticsEvents.reduce((sum, e) => sum + e.count, 0)} analytics events`);
    
    return { success: true, groupId, bannerId };
    
  } catch (error) {
    console.error('Error creating test data:', error.message);
    return { success: false };
  }
}

async function testBannerListAPI(groupId) {
  try {
    // Test the banner list endpoint (this would be a real API call in production)
    // For now, we'll test the database query directly
    const client = await pool.connect();
    
    const banners = await client.query(`
      SELECT
        id, title, description, "imageUrl", link, "altText", "order",
        "isActive", deletable, "viewCount", "clickCount", "createdAt", "updatedAt"
      FROM banners
      WHERE "bannerGroupId" = $1
      ORDER BY "order" ASC, "createdAt" DESC
    `, [groupId]);
    
    client.release();
    
    console.log(`Found ${banners.rows.length} banners in group ${groupId}`);
    
    // Verify banner data structure
    if (banners.rows.length > 0) {
      const banner = banners.rows[0];
      const hasRequiredFields = banner.id && banner.title && banner.imageUrl && 
                               typeof banner.viewCount === 'number' && 
                               typeof banner.clickCount === 'number';
      
      console.log('Banner data structure validation:', {
        hasId: !!banner.id,
        hasTitle: !!banner.title,
        hasImageUrl: !!banner.imageUrl,
        hasViewCount: typeof banner.viewCount === 'number',
        hasClickCount: typeof banner.clickCount === 'number',
        ctr: banner.viewCount > 0 ? ((banner.clickCount / banner.viewCount) * 100).toFixed(2) + '%' : '0%'
      });
      
      return hasRequiredFields;
    }
    
    return false;
    
  } catch (error) {
    console.error('Banner list API test error:', error.message);
    return false;
  }
}

async function testBannerDetailAPI(groupId, bannerId) {
  try {
    const client = await pool.connect();
    
    // Test banner detail query
    const bannerResult = await client.query(`
      SELECT
        b.*, bg.name as "groupName"
      FROM banners b
      JOIN banner_groups bg ON b."bannerGroupId" = bg.id
      WHERE b.id = $1 AND b."bannerGroupId" = $2
    `, [bannerId, groupId]);
    
    client.release();
    
    if (bannerResult.rows.length === 0) {
      console.log('Banner not found');
      return false;
    }
    
    const banner = bannerResult.rows[0];
    
    console.log('Banner detail data:', {
      id: banner.id,
      title: banner.title,
      groupName: banner.groupName,
      isActive: banner.isActive,
      viewCount: banner.viewCount,
      clickCount: banner.clickCount,
      ctr: banner.viewCount > 0 ? ((banner.clickCount / banner.viewCount) * 100).toFixed(2) + '%' : '0%'
    });
    
    // Verify all required fields are present
    return banner.id && banner.title && banner.groupName && 
           typeof banner.isActive === 'boolean' &&
           typeof banner.viewCount === 'number' &&
           typeof banner.clickCount === 'number';
    
  } catch (error) {
    console.error('Banner detail API test error:', error.message);
    return false;
  }
}

async function testAnalyticsIntegration(bannerId) {
  try {
    // Test analytics API endpoint
    const response = await fetch(`${API_BASE_URL}/api/analytics/banners/${bannerId}/performance?period=7d`);
    
    if (!response.ok) {
      console.log(`Analytics API returned status: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    
    console.log('Analytics API response:', {
      success: data.success,
      hasData: !!data.data,
      hasSummary: !!data.data?.summary,
      totalImpressions: data.data?.summary?.totalImpressions || 0,
      totalViews: data.data?.summary?.totalViews || 0,
      totalClicks: data.data?.summary?.totalClicks || 0,
      ctr: data.data?.summary?.clickThroughRate || 0
    });
    
    return data.success && data.data && data.data.summary;
    
  } catch (error) {
    console.error('Analytics integration test error:', error.message);
    return false;
  }
}

async function testBannerStatistics(bannerId) {
  try {
    const client = await pool.connect();
    
    // Test statistics calculation
    const statsResult = await client.query(`
      SELECT 
        COUNT(CASE WHEN "eventType" = 'impression' THEN 1 END) as impressions,
        COUNT(CASE WHEN "eventType" = 'view' THEN 1 END) as views,
        COUNT(CASE WHEN "eventType" = 'click' THEN 1 END) as clicks,
        COUNT(CASE WHEN "eventType" = 'conversion' THEN 1 END) as conversions
      FROM banner_analytics_events
      WHERE "bannerId" = $1
      AND "eventTimestamp" >= NOW() - INTERVAL '7 days'
    `, [bannerId]);
    
    client.release();
    
    const stats = statsResult.rows[0];
    const impressions = parseInt(stats.impressions);
    const views = parseInt(stats.views);
    const clicks = parseInt(stats.clicks);
    const conversions = parseInt(stats.conversions);
    
    const ctr = views > 0 ? (clicks / views) * 100 : 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    
    console.log('Banner statistics:', {
      impressions,
      views,
      clicks,
      conversions,
      ctr: ctr.toFixed(2) + '%',
      conversionRate: conversionRate.toFixed(2) + '%'
    });
    
    // Verify statistics are reasonable
    return impressions >= views && views >= clicks && clicks >= conversions;
    
  } catch (error) {
    console.error('Banner statistics test error:', error.message);
    return false;
  }
}

async function testBannerUpdate(groupId, bannerId) {
  try {
    const client = await pool.connect();
    
    // Test banner update
    const updateResult = await client.query(`
      UPDATE banners
      SET title = $1, description = $2, "updatedAt" = $3
      WHERE id = $4 AND "bannerGroupId" = $5
      RETURNING id, title, description, "updatedAt"
    `, [
      'Updated Test Banner Title',
      'Updated test banner description',
      new Date(),
      bannerId,
      groupId
    ]);
    
    client.release();
    
    if (updateResult.rows.length === 0) {
      console.log('Banner update failed - no rows affected');
      return false;
    }
    
    const updatedBanner = updateResult.rows[0];
    
    console.log('Banner update result:', {
      id: updatedBanner.id,
      title: updatedBanner.title,
      description: updatedBanner.description,
      updatedAt: updatedBanner.updatedAt
    });
    
    return updatedBanner.title === 'Updated Test Banner Title' &&
           updatedBanner.description === 'Updated test banner description';
    
  } catch (error) {
    console.error('Banner update test error:', error.message);
    return false;
  }
}

async function cleanupTestData(groupId, bannerId) {
  try {
    const client = await pool.connect();
    
    // Clean up analytics events
    await client.query(`
      DELETE FROM banner_analytics_events 
      WHERE "bannerId" = $1
    `, [bannerId]);
    
    // Clean up banner
    await client.query(`
      DELETE FROM banners 
      WHERE id = $1
    `, [bannerId]);
    
    // Clean up banner group
    await client.query(`
      DELETE FROM banner_groups 
      WHERE id = $1
    `, [groupId]);
    
    client.release();
    console.log('Test data cleaned up successfully');
    
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

// Run the tests
runBannerDetailWorkflowTests().catch(console.error);
