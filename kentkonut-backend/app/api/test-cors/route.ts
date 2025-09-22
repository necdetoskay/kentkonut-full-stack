import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🧪 CORS test endpoint called');
  console.log('🔍 Origin:', request.headers.get('origin'));
  console.log('🔍 Method:', request.method);

  const response = NextResponse.json({
    success: true,
    message: 'CORS test successful',
    data: {
      timestamp: new Date().toISOString(),
      origin: request.headers.get('origin'),
      method: request.method
    }
  });

  // Add CORS headers manually
  response.headers.set('Access-Control-Allow-Origin', 'http://172.41.42.51:3020');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

export async function OPTIONS(request: NextRequest) {
  console.log('🧪 CORS preflight request');
  
  const response = new NextResponse(null, { status: 204 });
  
  // Add CORS headers for preflight
  response.headers.set('Access-Control-Allow-Origin', 'http://172.41.42.51:3020');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}
