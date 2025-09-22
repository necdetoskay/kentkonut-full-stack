import { NextResponse } from "next/server";
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// Enhanced error handler for Quick Access APIs
export function handleQuickAccessError(error: unknown, context: string, requestId?: string) {
  console.error(`[${context}] Error:`, error);
  
  const timestamp = new Date().toISOString();
  
  // Zod validation errors
  if (error instanceof ZodError) {
    const details = error.errors.map(err => ({
      code: err.code,
      message: err.message,
      path: err.path
    }));
    
    return NextResponse.json({
      error: "Validation error",
      details,
      timestamp,
      requestId
    }, { status: 400 });
  }
  
  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json({
          error: "Duplicate entry",
          details: [{
            code: 'DUPLICATE_ENTRY',
            message: "A record with this data already exists",
            path: error.meta?.target || []
          }],
          timestamp,
          requestId
        }, { status: 409 });
        
      case 'P2025':
        return NextResponse.json({
          error: "Record not found",
          details: [{
            code: 'NOT_FOUND',
            message: "The requested record was not found",
            path: []
          }],
          timestamp,
          requestId
        }, { status: 404 });
        
      case 'P2003':
        return NextResponse.json({
          error: "Foreign key constraint failed",
          details: [{
            code: 'FOREIGN_KEY_CONSTRAINT',
            message: "Referenced record does not exist",
            path: error.meta?.field_name ? [error.meta.field_name] : []
          }],
          timestamp,
          requestId
        }, { status: 400 });
        
      default:
        console.error(`Unhandled Prisma error code: ${error.code}`, error);
        return NextResponse.json({
          error: "Database error",
          details: [{
            code: 'DATABASE_ERROR',
            message: "An error occurred while accessing the database",
            path: []
          }],
          timestamp,
          requestId
        }, { status: 500 });
    }
  }
  
  // Network/fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return NextResponse.json({
      error: "Network error",
      details: [{
        code: 'NETWORK_ERROR',
        message: "Failed to connect to external service",
        path: []
      }],
      timestamp,
      requestId
    }, { status: 503 });
  }
  
  // Generic Error instances
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('not found')) {
      return NextResponse.json({
        error: "Resource not found",
        details: [{
          code: 'NOT_FOUND',
          message: error.message,
          path: []
        }],
        timestamp,
        requestId
      }, { status: 404 });
    }
    
    if (error.message.includes('unauthorized') || error.message.includes('permission')) {
      return NextResponse.json({
        error: "Unauthorized",
        details: [{
          code: 'UNAUTHORIZED',
          message: error.message,
          path: []
        }],
        timestamp,
        requestId
      }, { status: 401 });
    }
    
    // Generic error
    return NextResponse.json({
      error: "Internal server error",
      details: [{
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? error.message : "An unexpected error occurred",
        path: []
      }],
      timestamp,
      requestId
    }, { status: 500 });
  }
  
  // Unknown error type
  return NextResponse.json({
    error: "Unknown error",
    details: [{
      code: 'UNKNOWN_ERROR',
      message: "An unknown error occurred",
      path: []
    }],
    timestamp,
    requestId
  }, { status: 500 });
}

// Success response helper
export function createSuccessResponse(data: any, message?: string, status: number = 200) {
  return NextResponse.json({
    data,
    message,
    timestamp: new Date().toISOString()
  }, { status });
}

// Request ID generator
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validation helper for module existence
export async function validateModuleExists(
  db: any, 
  moduleType: string, 
  moduleId: string | number
): Promise<boolean> {
  try {
    switch (moduleType) {
      case 'page':
        const page = await db.page.findUnique({ where: { id: moduleId as string } });
        return !!page;
      case 'news':
        const news = await db.news.findUnique({ where: { id: moduleId as number } });
        return !!news;
      case 'project':
        const project = await db.project.findUnique({ where: { id: moduleId as number } });
        return !!project;
      case 'department':
        const department = await db.department.findUnique({ where: { id: moduleId as string } });
        return !!department;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error validating module existence:', error);
    return false;
  }
}

// Rate limiting helper (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = ip;
  
  const current = requestCounts.get(key);
  
  if (!current || now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

// Input sanitization helper
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}
