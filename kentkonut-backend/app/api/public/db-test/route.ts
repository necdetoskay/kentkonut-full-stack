import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { addCorsHeaders, handleCorsPreflightRequest } from '@/lib/cors';

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    // Test database connection
    const startTime = Date.now();
    
    // Simple query to test connection
    const result = await db.$queryRaw`SELECT 1 as test`;
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Get database info
    const dbInfo = await db.$queryRaw`
      SELECT 
        version() as version,
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `;
    
    // Count some tables to verify schema
    const tablesCounts = await Promise.all([
      db.user.count(),
      db.news.count(),
      db.project.count(),
      db.banner.count(),
      db.media.count()
    ]);
    
    const testResult = {
      status: 'success',
      message: 'Veritabanı bağlantısı başarılı',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        info: dbInfo[0],
        tables: {
          users: tablesCounts[0],
          news: tablesCounts[1],
          projects: tablesCounts[2],
          banners: tablesCounts[3],
          media: tablesCounts[4]
        }
      },
      connection: {
        status: 'connected',
        testQuery: result
      }
    };
    
    const response = NextResponse.json(testResult, {
      status: 200,
    });
    return addCorsHeaders(response, origin);
    
  } catch (error) {
    console.error('Database test error:', error);
    
    const errorResult = {
      status: 'error',
      message: 'Veritabanı bağlantısı başarısız',
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
        code: (error as any)?.code || 'UNKNOWN',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      connection: {
        status: 'failed'
      }
    };
    
    const errorResponse = NextResponse.json(errorResult, {
      status: 500,
    });
    return addCorsHeaders(errorResponse, origin);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}
