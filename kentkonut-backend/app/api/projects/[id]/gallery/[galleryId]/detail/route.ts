import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: Belirli bir galeri öğesinin detaylarını getir
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

    console.log(`[API] Getting gallery item detail: projectId=${projectId}, galleryId=${galleryId}`);

    // Galeri öğesini detaylarıyla birlikte getir
    const galleryItem = await db.projectGalleryItem.findUnique({
      where: {
        id: galleryId,
        projectId
      },
      include: {
        media: true,
        parent: true,
        children: {
          include: {
            media: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        project: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    if (!galleryItem) {
      console.log(`[API] Gallery item not found: galleryId=${galleryId}`);
      return new NextResponse("Gallery item not found", { status: 404 });
    }

    console.log(`[API] Gallery item detail found: ${galleryItem.title}`);
    
    return NextResponse.json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery item detail GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT: Galeri öğesini güncelle (detay sayfası için)
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
        children: {
          include: {
            media: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery item detail PUT error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: Galeri öğesini sil (detay sayfası için)
export async function DELETE(
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
      return new NextResponse("Gallery item not found", { status: 404 });
    }

    if (galleryItem.projectId !== projectId) {
      return new NextResponse("Gallery item does not belong to this project", { status: 403 });
    }

    // Klasör ise ve içinde öğeler varsa silmeyi reddet
    if (galleryItem.isFolder && galleryItem.children.length > 0) {
      return new NextResponse("Cannot delete a folder that contains items. Delete the items first.", { status: 400 });
    }

    // Silme işlemi
    await db.projectGalleryItem.delete({
      where: {
        id: galleryId
      }
    });

    return NextResponse.json({
      success: true,
      message: "Gallery item deleted successfully"
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery item detail DELETE error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}