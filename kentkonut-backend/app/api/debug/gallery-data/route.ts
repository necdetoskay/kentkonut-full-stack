
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // Query project_galleries table
    const galleries = await db.projectGallery.findMany({
      orderBy: { id: 'asc' },
    });

    // Query project_gallery_items table
    const items = await db.projectGalleryMedia.findMany({
      orderBy: { id: 'asc' },
    });

    // Serialize BigInt fields in items
    const serializedItems = items.map(item => ({
      ...item,
      fileSize: item.fileSize.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        galleries,
        items: serializedItems,
      },
    });
  } catch (error) {
    console.error("[API_ERROR] Debug Gallery Data GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
