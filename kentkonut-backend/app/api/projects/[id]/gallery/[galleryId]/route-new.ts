import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// Yeni şemaya uygun olarak güncellenmiş API

// GET: Belirli bir galerinin medya öğelerini getir (pagination ile)
export async function GET(
  req: Request,
  { params }: { params: { id: string; galleryId: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const galleryId = parseInt(params.galleryId);
    
    if (isNaN(projectId) || isNaN(galleryId)) {
      return new NextResponse("Invalid ID format", { status: 400 });
    }

    // URL parametrelerini al
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    console.log(`[API] Getting media for gallery ${galleryId} in project ${projectId}. Page: ${page}, Limit: ${limit}`);

    // Önce galeriyi kontrol et
    const gallery = await db.projectGallery.findUnique({
      where: {
        id: galleryId,
        projectId
      }
    });

    if (!gallery) {
      return new NextResponse("Gallery not found", { status: 404 });
    }

    // Galerinin medya öğelerini getir
    const mediaItems = await db.projectGalleryItem.findMany({
      where: {
        galleryId,
        isActive: true
      },
      include: {
        media: true
      },
      orderBy: {
        order: 'asc'
      },
      skip,
      take: limit
    });

    // Toplam medya sayısını getir
    const totalCount = await db.projectGalleryItem.count({
      where: {
        galleryId,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        items: mediaItems,
        pagination: {
          page,
          limit,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + mediaItems.length < totalCount
        }
      }
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery media GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT: Galeriyi güncelle
export async function PUT(
  req: Request,
  { params }: { params: { id: string; galleryId: string } }
) {
  try {
    // Yetkilendirme kontrolü
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = parseInt(params.id);
    const galleryId = parseInt(params.galleryId);
    
    if (isNaN(projectId) || isNaN(galleryId)) {
      return new NextResponse("Invalid ID format", { status: 400 });
    }

    // Güncellenecek galeriyi kontrol et
    const gallery = await db.projectGallery.findUnique({
      where: {
        id: galleryId,
        projectId
      }
    });

    if (!gallery) {
      return new NextResponse("Gallery not found", { status: 404 });
    }

    // Request body'den verileri al
    const body = await req.json();
    const { title, description, order } = body;

    // Validasyon
    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Güncelleme işlemi
    const updatedGallery = await db.projectGallery.update({
      where: {
        id: galleryId
      },
      data: {
        title,
        description: description || gallery.description,
        order: order !== undefined ? order : gallery.order
      },
      include: {
        children: true,
        items: {
          include: {
            media: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedGallery
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery PUT error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: Galeriyi sil
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; galleryId: string } }
) {
  try {
    // Yetkilendirme kontrolü
    const session = await auth();
    if (!session || !session.user) {
      console.log("[API] Unauthorized delete attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = parseInt(params.id);
    const galleryId = parseInt(params.galleryId);
    
    if (isNaN(projectId) || isNaN(galleryId)) {
      console.log(`[API] Invalid ID format: projectId=${params.id}, galleryId=${params.galleryId}`);
      return new NextResponse("Invalid ID format", { status: 400 });
    }

    // Silinecek galeriyi kontrol et
    const gallery = await db.projectGallery.findUnique({
      where: {
        id: galleryId
      },
      include: {
        children: true,
        items: true
      }
    });

    if (!gallery) {
      console.log(`[API] Gallery not found: galleryId=${galleryId}`);
      return new NextResponse("Gallery not found", { status: 404 });
    }

    if (gallery.projectId !== projectId) {
      console.log(`[API] Gallery does not belong to project: galleryId=${galleryId}, projectId=${projectId}, gallery.projectId=${gallery.projectId}`);
      return new NextResponse("Gallery does not belong to this project", { status: 403 });
    }

    // Alt galerileri veya medya öğeleri varsa silmeyi reddet
    if (gallery.children.length > 0) {
      console.log(`[API] Cannot delete gallery with sub-galleries: galleryId=${galleryId}, childCount=${gallery.children.length}`);
      return new NextResponse("Cannot delete a gallery that contains sub-galleries. Delete the sub-galleries first.", { status: 400 });
    }

    if (gallery.items.length > 0) {
      console.log(`[API] Cannot delete gallery with media items: galleryId=${galleryId}, itemCount=${gallery.items.length}`);
      return new NextResponse("Cannot delete a gallery that contains media items. Delete the media items first.", { status: 400 });
    }

    // Silme işlemi
    await db.projectGallery.delete({
      where: {
        id: galleryId
      }
    });

    console.log(`[API] Successfully deleted gallery: galleryId=${galleryId}`);
    return NextResponse.json({
      success: true,
      message: "Gallery deleted successfully"
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery DELETE error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
