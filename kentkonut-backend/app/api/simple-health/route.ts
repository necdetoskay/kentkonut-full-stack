import { NextRequest, NextResponse } from "next/server";

// Simple health check endpoint without CORS wrapper
export async function GET(request: NextRequest) {
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
}
