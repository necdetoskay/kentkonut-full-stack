import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testRedisConnection } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    // Redis status check is now public for system monitoring
    // Authentication removed to allow frontend health checks

    // Check if Redis URL is configured
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return NextResponse.json({
        connected: false,
        error: 'Redis URL not configured',
        timestamp: new Date().toISOString()
      });
    }

    // Test Redis connection using our enhanced test function
    const testResult = await testRedisConnection();
    
    const redisStatus = {
      connected: testResult.connected,
      error: testResult.error || null,
      timestamp: new Date().toISOString(),
      latency: testResult.latency,
      redisUrl: redisUrl.replace(/:([^:@]+)@/, ':***@') // Hide password in logs
    };

    if (testResult.connected) {
      console.log(`✅ Redis connection test successful (${testResult.latency}ms)`);
    } else {
      console.error(`❌ Redis connection test failed: ${testResult.error}`);
    }
    return NextResponse.json(redisStatus);

  } catch (error) {
    console.error('Redis status check error:', error);
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'System error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
