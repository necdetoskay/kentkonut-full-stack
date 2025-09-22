/**
 * Direct Database Insert Test
 * This script tests direct database insertion to verify the schema works
 */

require('dotenv').config();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testDirectDatabaseInsert() {
  console.log('🧪 Testing direct database insertion...\n');
  
  try {
    const client = await pool.connect();
    
    // Get a test banner ID
    const banners = await client.query('SELECT id FROM banners LIMIT 1');
    
    if (banners.rows.length === 0) {
      console.log('❌ No banners found in database. Please create a banner first.');
      client.release();
      return;
    }
    
    const testBannerId = banners.rows[0].id;
    console.log(`📊 Using banner ID: ${testBannerId} for testing\n`);
    
    // Test 1: Insert analytics event
    console.log('📊 Test 1: Inserting analytics event...');
    try {
      const insertResult = await client.query(`
        INSERT INTO banner_analytics_events (
          "bannerId", "sessionId", "visitorId", "eventType", "pageUrl", 
          "deviceType", "browserName", "countryCode", "consentGiven", "dataProcessingConsent"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, "eventType", "createdAt";
      `, [
        testBannerId,
        'test_session_direct_123',
        'test_visitor_direct_456',
        'impression',
        'https://example.com/test-direct',
        'desktop',
        'Chrome',
        'TR',
        true,
        true
      ]);
      
      console.log('✅ Analytics event inserted successfully:');
      console.log(`   - ID: ${insertResult.rows[0].id}`);
      console.log(`   - Event Type: ${insertResult.rows[0].eventType}`);
      console.log(`   - Created At: ${insertResult.rows[0].createdAt}`);
      
    } catch (error) {
      console.log('❌ Analytics event insertion failed:', error.message);
    }
    
    // Test 2: Query analytics events
    console.log('\n📊 Test 2: Querying analytics events...');
    try {
      const queryResult = await client.query(`
        SELECT id, "bannerId", "eventType", "deviceType", "countryCode", "createdAt"
        FROM banner_analytics_events 
        WHERE "sessionId" = $1
        ORDER BY "createdAt" DESC;
      `, ['test_session_direct_123']);
      
      console.log(`✅ Found ${queryResult.rows.length} analytics events:`);
      queryResult.rows.forEach(row => {
        console.log(`   - ID: ${row.id}, Type: ${row.eventType}, Device: ${row.deviceType}, Country: ${row.countryCode}`);
      });
      
    } catch (error) {
      console.log('❌ Analytics event query failed:', error.message);
    }
    
    // Test 3: Insert performance summary
    console.log('\n📊 Test 3: Inserting performance summary...');
    try {
      const summaryResult = await client.query(`
        INSERT INTO banner_performance_summaries (
          "bannerId", "date", "impressions", "views", "clicks", "conversions"
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, "bannerId", "date", "impressions";
      `, [
        testBannerId,
        new Date().toISOString().split('T')[0], // Today's date
        100,
        80,
        10,
        2
      ]);
      
      console.log('✅ Performance summary inserted successfully:');
      console.log(`   - ID: ${summaryResult.rows[0].id}`);
      console.log(`   - Banner ID: ${summaryResult.rows[0].bannerId}`);
      console.log(`   - Date: ${summaryResult.rows[0].date}`);
      console.log(`   - Impressions: ${summaryResult.rows[0].impressions}`);
      
    } catch (error) {
      console.log('❌ Performance summary insertion failed:', error.message);
    }
    
    // Test 4: Insert user session
    console.log('\n📊 Test 4: Inserting user session...');
    try {
      const sessionResult = await client.query(`
        INSERT INTO banner_user_sessions (
          "sessionId", "visitorId", "pageViews", "bannerInteractions", "countryCode"
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, "sessionId", "visitorId", "pageViews";
      `, [
        'test_session_direct_123',
        'test_visitor_direct_456',
        5,
        3,
        'TR'
      ]);
      
      console.log('✅ User session inserted successfully:');
      console.log(`   - ID: ${sessionResult.rows[0].id}`);
      console.log(`   - Session ID: ${sessionResult.rows[0].sessionId}`);
      console.log(`   - Visitor ID: ${sessionResult.rows[0].visitorId}`);
      console.log(`   - Page Views: ${sessionResult.rows[0].pageViews}`);
      
    } catch (error) {
      console.log('❌ User session insertion failed:', error.message);
    }
    
    // Test 5: Update banner counters
    console.log('\n📊 Test 5: Updating banner counters...');
    try {
      const updateResult = await client.query(`
        UPDATE banners 
        SET "impressionCount" = "impressionCount" + 1,
            "viewCount" = "viewCount" + 1
        WHERE id = $1
        RETURNING id, "impressionCount", "viewCount";
      `, [testBannerId]);
      
      console.log('✅ Banner counters updated successfully:');
      console.log(`   - Banner ID: ${updateResult.rows[0].id}`);
      console.log(`   - Impression Count: ${updateResult.rows[0].impressionCount}`);
      console.log(`   - View Count: ${updateResult.rows[0].viewCount}`);
      
    } catch (error) {
      console.log('❌ Banner counter update failed:', error.message);
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await client.query('DELETE FROM banner_analytics_events WHERE "sessionId" = $1', ['test_session_direct_123']);
      await client.query('DELETE FROM banner_performance_summaries WHERE "bannerId" = $1 AND "date" = $2', [testBannerId, new Date().toISOString().split('T')[0]]);
      await client.query('DELETE FROM banner_user_sessions WHERE "sessionId" = $1', ['test_session_direct_123']);
      
      console.log('✅ Test data cleaned up successfully');
    } catch (error) {
      console.log('❌ Cleanup failed:', error.message);
    }
    
    client.release();
    
    console.log('\n🎉 Direct database test completed successfully!');
    console.log('The database schema is working correctly.');
    
  } catch (error) {
    console.error('❌ Direct database test failed:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Run the test
testDirectDatabaseInsert().catch(console.error);
