import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCors } from "@/lib/cors";

// Debug endpoint to directly check database
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("[GALLERY_DEBUG] Debug endpoint called");
    
    const { id } = await params;
    const projectId = parseInt(id);
    
    // Get all gallery items for this project directly from database
    const galleryItems = await db.projectGalleryItem.findMany({
      where: { 
        projectId,
        isActive: true 
      },
      include: {
        media: true,
        parent: true,
        children: {
          include: {
            media: true
          }
        }
      }
    });
    
    console.log(`[GALLERY_DEBUG] Found ${galleryItems.length} gallery items in database`);
    
    return NextResponse.json({
      success: true,
      count: galleryItems.length,
      items: galleryItems
    });
  } catch (error) {
    console.error('[GALLERY_DEBUG] Error:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export const GET = withCors(getHandler);
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }));
