import { NextResponse } from "next/server";

// Health check endpoint - backend'in çalışıp çalışmadığını kontrol eder
export async function GET() {
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
