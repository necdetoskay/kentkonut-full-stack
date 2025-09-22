import { NextRequest, NextResponse } from "next/server";
import { withCors, handleCorsPreflightRequest } from "@/lib/cors";
import prisma from "@/lib/prisma";

// OPTIONS /api/health - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// Health check endpoint - backend'in çalışıp çalışmadığını kontrol eder (CORS enabled v2)
export const GET = withCors(async () => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true }
    });

    const healthStatus = {
      status: "OK",
      message: "Backend is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: 'connected',
        adminUser: adminUser ? 'exists' : 'missing',
        application: 'running'
      },
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json(healthStatus);

  } catch (error) {
    console.error('Health check failed:', error);

    const errorStatus = {
      status: "ERROR",
      message: "Health check failed",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: 'disconnected',
        adminUser: 'unknown',
        application: 'running'
      }
    };

    return NextResponse.json(errorStatus, { status: 503 });
  }
});
