import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Test endpoint to check media data
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get media categories
    const categories = await db.mediaCategory.findMany({
      orderBy: { order: 'asc' }
    });

    // Get media files
    const mediaFiles = await db.media.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get total counts
    const categoryCounts = await Promise.all(
      categories.map(async (cat: { id: string }) => ({
        ...cat,
        mediaCount: await db.media.count({ where: { categoryId: cat.id } })
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        categories: categoryCounts,
        mediaFiles,
        totalMediaCount: await db.media.count(),
        totalCategories: categories.length
      }
    });
  } catch (error) {
    console.error("[TEST_MEDIA]", error);
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
