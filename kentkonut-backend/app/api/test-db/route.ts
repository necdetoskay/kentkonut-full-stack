import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Test database connection and table existence
 */
export async function GET() {
  try {
    console.log('🧪 Testing database connection...');

    // Test basic connection
    await db.$connect();
    console.log('✅ Database connected');

    // Test if CorporateLayoutSettings table exists
    try {
      const count = await db.corporateLayoutSettings.count();
      console.log('✅ CorporateLayoutSettings table exists, count:', count);
      
      return NextResponse.json({
        success: true,
        message: 'Database and table working correctly',
        data: {
          tableExists: true,
          recordCount: count
        }
      });
    } catch (tableError: unknown) {
      console.error('❌ CorporateLayoutSettings table error:', tableError);
      
      return NextResponse.json({
        success: false,
        message: 'Table does not exist or has issues',
        error: tableError instanceof Error ? tableError.message : String(tableError),
        data: {
          tableExists: false,
          recordCount: 0
        }
      });
    }

  } catch (error: unknown) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
