import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: Belirli galerinin detaylarını getir (alt galeriler ve medyalar dahil)
export async function GET(
  req: Request,
  { params }: { params: { id: string; galleryId: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const galleryId = parseInt(params.galleryId);
    
    if (isNaN(projectId) || isNaN(galleryId)) {
      return new NextResponse("Invalid project or gallery ID", { status: 400 });
    }

    console.log(`[API] Getting gallery details: project=${projectId}, gallery=${galleryId}`);

    // Galeri detaylarını getir
    const gallery = await db.projectGallery.findFirst({
      where: { 
        id: galleryId,
        projectId,
        isActive: true
      },
      include: {
        project: true,
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                children: true,
                media: true
              }
            }
          }
        },
        media: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            children: true,
            media: true
          }
        }
      }
    });

    if (!gallery) {
      return new NextResponse("Gallery not found", { status: 404 });
    }

    console.log(`[API] Found gallery: ${gallery.title} with ${gallery.children.length} children and ${gallery.media.length} media`);

    // BigInt serialization için media'ları düzelt
    const serializedGallery = {
      ...gallery,
      media: gallery.media.map(media => ({
        ...media,
        fileSize: media.fileSize.toString()
      })),
      children: gallery.children.map(child => ({
        ...child,
        media: child.media ? child.media.map(media => ({
          ...media,
          fileSize: media.fileSize.toString()
        })) : []
      }))
    };

    return NextResponse.json({
      success: true,
      data: serializedGallery
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery detail GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT: Galeri güncelle
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
      return new NextResponse("Invalid project or gallery ID", { status: 400 });
    }

    // Galeri var mı kontrol et
    const existingGallery = await db.projectGallery.findFirst({
      where: { 
        id: galleryId,
        projectId,
        isActive: true
      }
    });

    if (!existingGallery) {
      return new NextResponse("Gallery not found", { status: 404 });
    }

    // Request body'den verileri al
    const body = await req.json();
    const { title, description, parentId, order, coverImage } = body;

    // Validasyon
    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Parent ID varsa, parent'ın varlığını kontrol et
    if (parentId) {
      const parent = await db.projectGallery.findUnique({
        where: { id: parentId }
      });

      if (!parent) {
        return new NextResponse("Parent gallery not found", { status: 404 });
      }

      if (parent.projectId !== projectId) {
        return new NextResponse("Parent gallery does not belong to this project", { status: 400 });
      }

      // Kendisini parent olarak seçemez
      if (parentId === galleryId) {
        return new NextResponse("Gallery cannot be its own parent", { status: 400 });
      }
    }

    // Güncellenecek veri
    const updateData = {
      title,
      description: description || "",
      parentId: parentId || null,
      order: order !== undefined ? order : existingGallery.order,
      coverImage: coverImage || null
    };

    console.log(`[API] Updating gallery ${galleryId} with data:`, updateData);

    // Galeri güncelle
    const updatedGallery = await db.projectGallery.update({
      where: { id: galleryId },
      data: updateData,
      include: {
        project: true,
        parent: true,
        children: true,
        media: true
      }
    });
    
    console.log('✅ [API] Gallery updated:', updatedGallery);

    return NextResponse.json({
      success: true,
      data: {
        ...updatedGallery,
        media: updatedGallery.media.map(media => ({
          ...media,
          fileSize: media.fileSize.toString()
        }))
      }
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery PUT error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: Galeri sil (soft delete)
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
      return new NextResponse("Invalid project or gallery ID", { status: 400 });
    }

    // Galeri var mı kontrol et
    const existingGallery = await db.projectGallery.findFirst({
      where: { 
        id: galleryId,
        projectId,
        isActive: true
      }
    });

    if (!existingGallery) {
      return new NextResponse("Gallery not found", { status: 404 });
    }

      console.log(`[API] Hard deleting gallery ${galleryId}`);

      // Galeri hard delete (tamamen sil)
      const deletedGallery = await db.projectGallery.delete({
        where: { id: galleryId }
      });
    
    console.log('✅ [API] Gallery hard deleted:', deletedGallery);

    return NextResponse.json({
      success: true,
      data: {
        ...deletedGallery,
        fileSize: deletedGallery.fileSize ? deletedGallery.fileSize.toString() : "0"
      }
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery DELETE error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
