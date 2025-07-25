import { NextRequest, NextResponse } from "next/server";
import { withCors, handleCorsPreflightRequest } from "@/lib/cors";

// OPTIONS /api/health - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// Health check endpoint - backend'in çalışıp çalışmadığını kontrol eder (CORS enabled v2)
export const GET = withCors(async () => {
  try {
    return NextResponse.json({
      status: "OK",
      message: "Backend is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  } catch (error) {
    return new NextResponse("Health check failed", { status: 500 });
  }
});
