import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { auth } from '@/lib/auth';
import { ApiError, ValidationError, AuthenticatedUser } from '@/types/corporate-cards';
import { logger } from '@/lib/logger';

/**
 * Server-side error handler for corporate cards API
 */
export function handleServerError(error: unknown, context: string): NextResponse {
  console.error(`${context}:`, error);
  
  if (error instanceof ZodError) {
    const validationErrors: ValidationError[] = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    return NextResponse.json({
      success: false,
      error: 'Doğrulama hatası',
      details: validationErrors
    } as ApiError, { status: 400 });
  }
  
  if (error instanceof Error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    } as ApiError, { status: 500 });
  }
  
  return NextResponse.json({
    success: false,
    error: 'Sunucu hatası',
    details: process.env.NODE_ENV === 'development' ? error : undefined
  } as ApiError, { status: 500 });
}

/**
 * Check if user is authenticated and has admin privileges
 */
export async function checkAdminAuth(): Promise<{ 
  success: boolean; 
  user?: AuthenticatedUser; 
  response?: NextResponse 
}> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return {
        success: false,
        response: NextResponse.json({
          success: false,
          error: 'Yetkilendirme gerekli'
        } as ApiError, { status: 401 })
      };
    }

    // Check if user has admin role
    const userRole = session.user.role?.toUpperCase();
    if (userRole !== 'ADMIN') {
      return {
        success: false,
        response: NextResponse.json({
          success: false,
          error: 'Admin yetkisi gerekli'
        } as ApiError, { status: 403 })
      };
    }

    return {
      success: true,
      user: {
        id: session.user.id as string,
        email: session.user.email as string,
        name: session.user.name,
        role: session.user.role as string,
        image: session.user.image
      }
    };

  } catch (error) {
    console.error('Auth check error:', error);
    return {
      success: false,
      response: NextResponse.json({
        success: false,
        error: 'Yetkilendirme kontrolü başarısız'
      } as ApiError, { status: 500 })
    };
  }
}

/**
 * Validate and parse query parameters for corporate cards
 */
export function parseCardsQuery(searchParams: URLSearchParams) {
  const active = searchParams.get('active');
  const limit = searchParams.get('limit');
  const orderBy = searchParams.get('orderBy');
  const orderDirection = searchParams.get('orderDirection');

  return {
    active: active === null ? undefined : active === 'true',
    limit: limit ? Math.min(parseInt(limit, 10), 100) : undefined, // Max 100 items
    orderBy: orderBy && ['displayOrder', 'title', 'createdAt'].includes(orderBy) 
      ? orderBy as 'displayOrder' | 'title' | 'createdAt' 
      : 'displayOrder',
    orderDirection: orderDirection === 'desc' ? 'desc' : 'asc'
  };
}

/**
 * Generate success response
 */
export function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  meta?: any,
  status: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
    meta
  }, { status });
}

/**
 * Generate error response
 */
export function createErrorResponse(
  error: string, 
  details?: any, 
  status: number = 400
): NextResponse {
  return NextResponse.json({
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  } as ApiError, { status });
}

/**
 * Validate display order uniqueness
 */
export function validateDisplayOrder(cards: Array<{ id: string; displayOrder: number }>) {
  const orderCounts = cards.reduce((acc, card) => {
    acc[card.displayOrder] = (acc[card.displayOrder] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const duplicates = Object.entries(orderCounts)
    .filter(([order, count]) => count > 1)
    .map(([order]) => parseInt(order, 10));

  if (duplicates.length > 0) {
    throw new Error(`Duplicate display order values found: ${duplicates.join(', ')}`);
  }

  return true;
}

/**
 * Generate next available display order
 */
export function getNextDisplayOrder(existingCards: Array<{ displayOrder: number }>): number {
  if (existingCards.length === 0) return 1;
  
  const maxOrder = Math.max(...existingCards.map(card => card.displayOrder));
  return maxOrder + 1;
}

/**
 * Sanitize and validate URL
 */
export function sanitizeUrl(url?: string | null): string | null {
  if (!url || url.trim() === '') return null;
  
  const trimmed = url.trim();
  
  // If it's already a full URL, return as is
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Ensure it starts with a single leading slash for relative paths
  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`;
  }
  
  return trimmed;
}

/**
 * Sanitize color code
 */
export function sanitizeColorCode(color: string): string {
  const cleaned = color.trim().toUpperCase();
  
  // Add # if missing
  if (!cleaned.startsWith('#')) {
    return `#${cleaned}`;
  }
  
  return cleaned;
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Log API activity
 */
export function logApiActivity(
  action: string, 
  userId?: string, 
  details?: any
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    userId,
    details: process.env.NODE_ENV === 'development' ? details : undefined
  };
  
  logger.info(action, { context: 'Corporate Cards API', details: logEntry });
}

/**
 * Rate limiting helper (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userRequests.count >= maxRequests) {
    return false;
  }
  
  userRequests.count++;
  return true;
}

/**
 * Clean up old rate limit entries
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Clean up rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimit, 5 * 60 * 1000);
}
