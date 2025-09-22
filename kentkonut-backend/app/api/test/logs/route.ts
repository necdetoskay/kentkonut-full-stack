import { NextRequest, NextResponse } from 'next/server';

// GET /api/test/logs - Test endpoint to check system status
export async function GET(request: NextRequest) {
  const now = new Date();
  
  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    server: 'healthy',
    encoding: 'UTF-8',
    test: {
      turkish: 'Türkçe karakterler: ğüşiöç ĞÜŞIÖÇ',
      numbers: '123456',
      special: '!@#$%^&*()',
    },
    api_status: {
      pages: 'active',
      contents: 'active',
      dashboard: 'active'
    }
  }, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}
