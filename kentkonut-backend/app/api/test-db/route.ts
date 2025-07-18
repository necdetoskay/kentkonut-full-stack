import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log("[TEST_DB] Testing database connection...");
    
    // Test basic database connection
    const bannerGroups = await db.bannerGroup.findMany({
      take: 1,
      select: {
        id: true,
        name: true
      }
    });
    
    console.log("[TEST_DB] Banner groups found:", bannerGroups);
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: bannerGroups
    });
  } catch (error) {
    console.error("[TEST_DB] Database connection failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
