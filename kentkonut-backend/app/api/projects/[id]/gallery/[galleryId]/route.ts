import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: Belirli bir tab'ın medya içeriğini getir (pagination ile)
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

    console.log(`[API] Getting media for tab ${galleryId} in project ${projectId}. Page: ${page}, Limit: ${limit}`);

    // Önce tab'ın kendisini kontrol et
    const tab = await db.projectGalleryItem.findUnique({
      where: {
        id: galleryId,
        projectId
      }
    });

    if (!tab) {
      return new NextResponse("Tab not found", { status: 404 });
    }

    // Tab'ın altındaki medya öğelerini getir
    const mediaItems = await db.projectGalleryItem.findMany({
      where: {
        parentId: galleryId,
        projectId,
        isActive: true,
        mediaId: { not: null } // Sadece medya öğelerini getir
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
        parentId: galleryId,
        projectId,
        isActive: true,
        mediaId: { not: null }
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
    console.error("[API_ERROR] Gallery tab media GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT: Galeri öğesini güncelle
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

    // Güncellenecek galeri öğesini kontrol et
    const galleryItem = await db.projectGalleryItem.findUnique({
      where: {
        id: galleryId,
        projectId
      }
    });

    if (!galleryItem) {
      return new NextResponse("Gallery item not found", { status: 404 });
    }

    // Request body'den verileri al
    const body = await req.json();
    const { title, description, order, isFolder, mediaId, category } = body;

    // Validasyon
    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    if (!isFolder && !mediaId && !galleryItem.mediaId) {
      return new NextResponse("Media ID is required for non-folder items", { status: 400 });
    }

    // Güncelleme işlemi
    const updatedItem = await db.projectGalleryItem.update({
      where: {
        id: galleryId
      },
      data: {
        title,
        description: description || galleryItem.description,
        order: order !== undefined ? order : galleryItem.order,
        isFolder: isFolder !== undefined ? isFolder : galleryItem.isFolder,
        mediaId: isFolder ? null : (mediaId || galleryItem.mediaId),
        category: category || galleryItem.category
      },
      include: {
        media: true,
        parent: true,
        children: true
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

// DELETE: Galeri öğesini sil
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

    // Silinecek galeri öğesini kontrol et
    const galleryItem = await db.projectGalleryItem.findUnique({
      where: {
        id: galleryId
      },
      include: {
        children: true
      }
    });

    if (!galleryItem) {
      console.log(`[API] Gallery item not found: galleryId=${galleryId}`);
      return new NextResponse("Gallery item not found", { status: 404 });
    }

    if (galleryItem.projectId !== projectId) {
      console.log(`[API] Gallery item does not belong to project: galleryId=${galleryId}, projectId=${projectId}, item.projectId=${galleryItem.projectId}`);
      return new NextResponse("Gallery item does not belong to this project", { status: 403 });
    }

    // Klasör ise ve içinde öğeler varsa silmeyi reddet
    if (galleryItem.isFolder && galleryItem.children.length > 0) {
      console.log(`[API] Cannot delete folder with children: galleryId=${galleryId}, childCount=${galleryItem.children.length}`);
      return new NextResponse("Cannot delete a folder that contains items. Delete the items first.", { status: 400 });
    }

    // Silme işlemi
    await db.projectGalleryItem.delete({
      where: {
        id: galleryId
      }
    });

    console.log(`[API] Successfully deleted gallery item: galleryId=${galleryId}`);
    return NextResponse.json({
      success: true,
      message: "Gallery item deleted successfully"
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery item DELETE error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}