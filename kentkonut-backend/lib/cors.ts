import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS Utility for handling Cross-Origin Resource Sharing
 */

export interface CorsOptions {
  origins?: string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

const DEFAULT_CORS_OPTIONS: CorsOptions = {
  origins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

/**
 * Get allowed origins based on environment
 */
export function getAllowedOrigins(): string[] {
  if (process.env.NODE_ENV === 'development') {
    // Development: Allow common frontend ports
    return ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  }
  
  // Production: Use environment variable
  const envOrigins = process.env.CORS_ALLOWED_ORIGIN;
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  // Fallback
  return ['http://localhost:3001'];
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow requests with no origin (mobile apps, etc.)
  
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

/**
 * Create CORS headers for a response
 */
export function createCorsHeaders(request: NextRequest, options: CorsOptions = {}): Headers {
  const opts = { ...DEFAULT_CORS_OPTIONS, ...options };
  const headers = new Headers();
  
  const origin = request.headers.get('origin');
  const allowedOrigins = opts.origins || getAllowedOrigins();
  
  // Set Access-Control-Allow-Origin
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // For requests without origin (like mobile apps)
    headers.set('Access-Control-Allow-Origin', '*');
  }
  
  // Set other CORS headers
  headers.set('Access-Control-Allow-Methods', opts.methods?.join(', ') || 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', opts.allowedHeaders?.join(', ') || 'Content-Type, Authorization, X-Requested-With');
  
  if (opts.credentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Set preflight cache
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return headers;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(request: NextRequest, options: CorsOptions = {}): NextResponse {
  const headers = createCorsHeaders(request, options);
  
  return new NextResponse(null, {
    status: 204,
    headers
  });
}

/**
 * Add CORS headers to an existing response
 */
export function addCorsHeaders(response: NextResponse, request: NextRequest, options: CorsOptions = {}): NextResponse {
  const corsHeaders = createCorsHeaders(request, options);
  
  // Add CORS headers to the response
  corsHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * CORS middleware wrapper for API routes
 */
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  options: CorsOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request, options);
    }
    
    // Check if origin is allowed for non-preflight requests
    const origin = request.headers.get('origin');
    if (origin && !isOriginAllowed(origin)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Origin not allowed' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Execute the handler
    const response = await handler(request);
    
    // Add CORS headers to the response
    return addCorsHeaders(response, request, options);
  };
}
