import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// DELETE: Galeriden medya sil (soft delete)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; galleryId: string; mediaId: string } }
) {
  try {
    // Yetkilendirme kontrolü
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = parseInt(params.id);
    const galleryId = parseInt(params.galleryId);
    const mediaId = parseInt(params.mediaId);
    
    if (isNaN(projectId) || isNaN(galleryId) || isNaN(mediaId)) {
      return new NextResponse("Invalid project, gallery or media ID", { status: 400 });
    }

    console.log(`[API] Deleting media: project=${projectId}, gallery=${galleryId}, media=${mediaId}`);

    // Galeri var mı kontrol et
    const gallery = await db.projectGallery.findFirst({
      where: { 
        id: galleryId,
        projectId,
        isActive: true
      }
    });

    if (!gallery) {
      return new NextResponse("Gallery not found", { status: 404 });
    }

    // Medya var mı kontrol et
    const media = await db.projectGalleryMedia.findFirst({
      where: { 
        id: mediaId,
        galleryId,
        isActive: true
      }
    });

    if (!media) {
      return new NextResponse("Media not found", { status: 404 });
    }

      // Medya hard delete (tamamen sil)
      const deletedMedia = await db.projectGalleryMedia.delete({
        where: { id: mediaId }
      });
    
    console.log('✅ [API] Media hard deleted:', deletedMedia);

    return NextResponse.json({
      success: true,
      data: {
        ...deletedMedia,
        fileSize: deletedMedia.fileSize.toString()
      }
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery media DELETE error:", error);
    console.error("[API_ERROR] Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
