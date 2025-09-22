import { NextRequest, NextResponse } from 'next/server';
import { ENV_CONFIG } from '../config/environment';

// CORS için izin verilen origin'ler
function getAllowedOrigins(): string[] {
  return ENV_CONFIG.CORS.ALLOWED_ORIGINS;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Bu dinamik olarak ayarlanacak
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 saat
};

export function addCorsHeaders(headers: Headers, origin?: string | null): void {
  const allowedOrigins = getAllowedOrigins();
  
  // Origin kontrolü
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else if (ENV_CONFIG.isDevelopment) {
    // Development'ta tüm origin'lere izin ver
    headers.set('Access-Control-Allow-Origin', '*');
  } else {
    // Production'da sadece izin verilen origin'ler
    headers.set('Access-Control-Allow-Origin', allowedOrigins[0] || 'null');
  }
  
  // Diğer CORS headers'ları ekle
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (key !== 'Access-Control-Allow-Origin') {
      headers.set(key, value);
    }
  });
}

export function createCorsResponse(data?: any, status: number = 200, origin?: string | null): Response {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  
  addCorsHeaders(headers, origin);
  
  return new Response(
    data ? JSON.stringify(data) : null,
    {
      status,
      headers,
    }
  );
}

export function handleCorsPreflightRequest(request: Request): Response {
  const origin = request.headers.get('Origin');
  
  // Preflight request için boş response döndür
  const headers = new Headers();
  addCorsHeaders(headers, origin);
  
  return new Response(null, {
    status: 200,
    headers,
  });
}

// Higher-order function for API routes with CORS support
export function withCors(handler: (req: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    const origin = req.headers.get('origin');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return handleCorsPreflightRequest(req);
    }
    
    // Handle actual requests
    const response = await handler(req, context);
    
    // Add CORS headers to response
    const headers = new Headers(response.headers);
    addCorsHeaders(headers, origin);
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
