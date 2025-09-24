import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// Belirli bir galeri medya öğesi için API

// GET: Belirli bir medya öğesinin detaylarını getir
export async function GET(
  req: Request,
  { params }: { params: { id: string; galleryId: string; itemId: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const galleryId = parseInt(params.galleryId);
    const itemId = parseInt(params.itemId);
    
    if (isNaN(projectId) || isNaN(galleryId) || isNaN(itemId)) {
      return new NextResponse("Invalid ID format", { status: 400 });
    }

    console.log(`[API] Getting gallery item: projectId=${projectId}, galleryId=${galleryId}, itemId=${itemId}`);

    // Galeriyi kontrol et
    const gallery = await db.projectGallery.findUnique({
      where: {
        id: galleryId,
        projectId
      }
    });

    if (!gallery) {
      return new NextResponse("Gallery not found", { status: 404 });
    }

    // Medya öğesini getir
    const galleryItem = await db.projectGalleryItem.findUnique({
      where: {
        id: itemId,
        galleryId
      },
      include: {
        media: true,
        gallery: true
      }
    });

    if (!galleryItem) {
      return new NextResponse("Gallery item not found", { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery item GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT: Medya öğesini güncelle
export async function PUT(
  req: Request,
  { params }: { params: { id: string; galleryId: string; itemId: string } }
) {
  try {
    // Yetkilendirme kontrolü
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = parseInt(params.id);
    const galleryId = parseInt(params.galleryId);
    const itemId = parseInt(params.itemId);
    
    if (isNaN(projectId) || isNaN(galleryId) || isNaN(itemId)) {
      return new NextResponse("Invalid ID format", { status: 400 });
    }

    // Galeriyi kontrol et
    const gallery = await db.projectGallery.findUnique({
      where: {
        id: galleryId,
        projectId
      }
    });

    if (!gallery) {
      return new NextResponse("Gallery not found", { status: 404 });
    }

    // Medya öğesini kontrol et
    const galleryItem = await db.projectGalleryItem.findUnique({
      where: {
        id: itemId,
        galleryId
      }
    });

    if (!galleryItem) {
      return new NextResponse("Gallery item not found", { status: 404 });
    }

    // Request body'den verileri al
    const body = await req.json();
    const { title, description, order, mediaId } = body;

    // Eğer mediaId değişiyorsa, yeni medyanın varlığını kontrol et
    if (mediaId && mediaId !== galleryItem.mediaId) {
      const media = await db.media.findUnique({
        where: { id: mediaId }
      });

      if (!media) {
        return new NextResponse("Media not found", { status: 404 });
      }
    }

    // Güncelleme işlemi
    const updatedItem = await db.projectGalleryItem.update({
      where: {
        id: itemId
      },
      data: {
        title: title || galleryItem.title,
        description: description !== undefined ? description : galleryItem.description,
        order: order !== undefined ? order : galleryItem.order,
        mediaId: mediaId || galleryItem.mediaId
      },
      include: {
        media: true,
        gallery: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery item PUT error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: Medya öğesini sil
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; galleryId: string; itemId: string } }
) {
  try {
    // Yetkilendirme kontrolü
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = parseInt(params.id);
    const galleryId = parseInt(params.galleryId);
    const itemId = parseInt(params.itemId);
    
    if (isNaN(projectId) || isNaN(galleryId) || isNaN(itemId)) {
      return new NextResponse("Invalid ID format", { status: 400 });
    }

    // Galeriyi kontrol et
    const gallery = await db.projectGallery.findUnique({
      where: {
        id: galleryId,
        projectId
      }
    });

    if (!gallery) {
      return new NextResponse("Gallery not found", { status: 404 });
    }

    // Medya öğesini kontrol et
    const galleryItem = await db.projectGalleryItem.findUnique({
      where: {
        id: itemId,
        galleryId
      }
    });

    if (!galleryItem) {
      return new NextResponse("Gallery item not found", { status: 404 });
    }

    // Silme işlemi
    await db.projectGalleryItem.delete({
      where: {
        id: itemId
      }
    });

    return NextResponse.json({
      success: true,
      message: "Gallery item deleted successfully"
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery item DELETE error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
