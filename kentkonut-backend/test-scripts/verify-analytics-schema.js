/**
 * Database Schema Verification Test
 * This script verifies that the enhanced banner analytics schema has been applied correctly
 */

const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:P@ssw0rd@localhost:5432/kentkonutdb',
});

async function verifySchema() {
  console.log('🔍 Starting database schema verification...\n');
  
  try {
    const client = await pool.connect();
    
    // Test 1: Verify new columns in banners table
    console.log('📊 Test 1: Verifying enhanced banners table...');
    const bannerColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'banners' 
      AND column_name IN ('impressionCount', 'uniqueViewCount', 'conversionCount', 'bounceCount', 'avgEngagementTime')
      ORDER BY column_name;
    `);
    
    const expectedBannerColumns = ['avgEngagementTime', 'bounceCount', 'conversionCount', 'impressionCount', 'uniqueViewCount'];
    const actualBannerColumns = bannerColumns.rows.map(row => row.column_name);
    
    console.log('Expected columns:', expectedBannerColumns);
    console.log('Actual columns:', actualBannerColumns);
    
    const bannerColumnsMatch = expectedBannerColumns.every(col => actualBannerColumns.includes(col));
    console.log(`✅ Banner columns verification: ${bannerColumnsMatch ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 2: Verify banner_analytics_events table
    console.log('📊 Test 2: Verifying banner_analytics_events table...');
    const analyticsTable = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_name = 'banner_analytics_events';
    `);
    
    const analyticsTableExists = analyticsTable.rows.length > 0;
    console.log(`Analytics events table exists: ${analyticsTableExists}`);
    
    if (analyticsTableExists) {
      const analyticsColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'banner_analytics_events'
        ORDER BY ordinal_position;
      `);
      
      console.log('Analytics events table columns:');
      analyticsColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }
    
    console.log(`✅ Analytics events table verification: ${analyticsTableExists ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 3: Verify banner_performance_summaries table
    console.log('📊 Test 3: Verifying banner_performance_summaries table...');
    const summariesTable = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_name = 'banner_performance_summaries';
    `);
    
    const summariesTableExists = summariesTable.rows.length > 0;
    console.log(`Performance summaries table exists: ${summariesTableExists}`);
    console.log(`✅ Performance summaries table verification: ${summariesTableExists ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 4: Verify banner_user_sessions table
    console.log('📊 Test 4: Verifying banner_user_sessions table...');
    const sessionsTable = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_name = 'banner_user_sessions';
    `);
    
    const sessionsTableExists = sessionsTable.rows.length > 0;
    console.log(`User sessions table exists: ${sessionsTableExists}`);
    console.log(`✅ User sessions table verification: ${sessionsTableExists ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 5: Verify indexes
    console.log('📊 Test 5: Verifying indexes...');
    const indexes = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename IN ('banner_analytics_events', 'banner_performance_summaries', 'banner_user_sessions')
      ORDER BY tablename, indexname;
    `);
    
    console.log('Created indexes:');
    indexes.rows.forEach(row => {
      console.log(`  - ${row.tablename}.${row.indexname}`);
    });
    
    const hasIndexes = indexes.rows.length > 0;
    console.log(`✅ Indexes verification: ${hasIndexes ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 6: Verify foreign key constraints
    console.log('📊 Test 6: Verifying foreign key constraints...');
    const foreignKeys = await client.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name IN ('banner_analytics_events', 'banner_performance_summaries')
      ORDER BY tc.table_name;
    `);
    
    console.log('Foreign key constraints:');
    foreignKeys.rows.forEach(row => {
      console.log(`  - ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
    
    const hasForeignKeys = foreignKeys.rows.length > 0;
    console.log(`✅ Foreign keys verification: ${hasForeignKeys ? 'PASSED' : 'FAILED'}\n`);
    
    // Test 7: Test sample data insertion
    console.log('📊 Test 7: Testing sample data insertion...');
    
    // First, get a banner ID to test with
    const banners = await client.query('SELECT id FROM banners LIMIT 1');
    
    if (banners.rows.length > 0) {
      const bannerId = banners.rows[0].id;
      
      try {
        // Insert sample analytics event
        const sampleEvent = await client.query(`
          INSERT INTO banner_analytics_events (
            "bannerId", "sessionId", "visitorId", "eventType", "pageUrl", 
            "deviceType", "browserName", "countryCode", "consentGiven"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id;
        `, [
          bannerId,
          'test_session_123',
          'test_visitor_456',
          'impression',
          'https://example.com/test',
          'desktop',
          'Chrome',
          'TR',
          true
        ]);
        
        console.log(`Sample analytics event inserted with ID: ${sampleEvent.rows[0].id}`);
        
        // Insert sample performance summary
        const sampleSummary = await client.query(`
          INSERT INTO banner_performance_summaries (
            "bannerId", "date", "impressions", "views", "clicks", "conversions"
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id;
        `, [
          bannerId,
          new Date().toISOString().split('T')[0], // Today's date
          100,
          80,
          10,
          2
        ]);
        
        console.log(`Sample performance summary inserted with ID: ${sampleSummary.rows[0].id}`);
        
        // Insert sample user session
        const sampleSession = await client.query(`
          INSERT INTO banner_user_sessions (
            "sessionId", "visitorId", "pageViews", "bannerInteractions", "countryCode"
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id;
        `, [
          'test_session_123',
          'test_visitor_456',
          5,
          3,
          'TR'
        ]);
        
        console.log(`Sample user session inserted with ID: ${sampleSession.rows[0].id}`);
        
        console.log('✅ Sample data insertion: PASSED\n');
        
        // Clean up test data
        await client.query('DELETE FROM banner_analytics_events WHERE "sessionId" = $1', ['test_session_123']);
        await client.query('DELETE FROM banner_performance_summaries WHERE "bannerId" = $1 AND "date" = $2', [bannerId, new Date().toISOString().split('T')[0]]);
        await client.query('DELETE FROM banner_user_sessions WHERE "sessionId" = $1', ['test_session_123']);
        
        console.log('🧹 Test data cleaned up');
        
      } catch (error) {
        console.log(`❌ Sample data insertion: FAILED - ${error.message}`);
      }
    } else {
      console.log('⚠️  No banners found in database, skipping sample data test');
    }
    
    client.release();
    
    // Summary
    console.log('\n📋 SCHEMA VERIFICATION SUMMARY:');
    console.log('================================');
    console.log(`✅ Enhanced banners table: ${bannerColumnsMatch ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Analytics events table: ${analyticsTableExists ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Performance summaries table: ${summariesTableExists ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ User sessions table: ${sessionsTableExists ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Database indexes: ${hasIndexes ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Foreign key constraints: ${hasForeignKeys ? 'PASSED' : 'FAILED'}`);
    
    const allTestsPassed = bannerColumnsMatch && analyticsTableExists && summariesTableExists && sessionsTableExists && hasIndexes && hasForeignKeys;
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL TESTS PASSED! Database schema is ready for analytics.');
    } else {
      console.log('\n❌ Some tests failed. Please check the database migration.');
    }
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Run the verification
verifySchema().catch(console.error);
