import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Test endpoint to verify corporate cards database connection
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing corporate cards database connection...');
    
    // Test 1: Check if db object exists
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database client not initialized',
        test: 'db_object_check'
      }, { status: 500 });
    }
    
    console.log('✅ Database client exists');
    
    // Test 2: Check if corporateCard model exists
    if (!db.corporateCard) {
      return NextResponse.json({
        success: false,
        error: 'corporateCard model not found on db object',
        availableModels: Object.keys(db).filter(key => typeof (db as any)[key] === 'object' && (db as any)[key].findMany),
        test: 'model_check'
      }, { status: 500 });
    }
    
    console.log('✅ corporateCard model exists');
    
    // Test 3: Try to connect and query
    const cards = await db.corporateCard.findMany({
      take: 5,
      orderBy: { displayOrder: 'asc' }
    });
    
    console.log('✅ Database query successful');
    
    // Test 4: Get table info
    const totalCount = await db.corporateCard.count();
    const activeCount = await db.corporateCard.count({
      where: { isActive: true }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Corporate cards database connection working!',
      data: {
        cards: cards.map(card => ({
          id: card.id,
          title: card.title,
          displayOrder: card.displayOrder,
          isActive: card.isActive
        })),
        stats: {
          total: totalCount,
          active: activeCount,
          inactive: totalCount - activeCount
        }
      },
      tests: {
        db_object_check: '✅ PASSED',
        model_check: '✅ PASSED',
        query_check: '✅ PASSED',
        count_check: '✅ PASSED'
      }
    });
    
  } catch (error: unknown) {
    console.error('❌ Corporate cards test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      test: 'database_query'
    }, { status: 500 });
  }
}
