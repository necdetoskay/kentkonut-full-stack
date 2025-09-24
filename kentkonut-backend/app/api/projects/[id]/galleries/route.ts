import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: Projeye ait galerileri listele
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    
    if (isNaN(projectId)) {
      return new NextResponse("Invalid project ID", { status: 400 });
    }

    console.log(`[API] Getting galleries for project: ${projectId}`);

    // Root level galerileri getir (parentId null olanlar)
    const galleries = await db.projectGallery.findMany({
      where: { 
        projectId,
        parentId: null, // Root level galeriler
        isActive: true
      },
      include: {
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
      },
      orderBy: { order: 'asc' }
    });

    console.log(`[API] Found ${galleries.length} root galleries`);

    // BigInt serialization için media'ları düzelt
    const serializedGalleries = galleries.map(gallery => ({
      ...gallery,
      media: gallery.media.map(media => ({
        ...media,
        fileSize: media.fileSize.toString()
      }))
    }));

    return NextResponse.json({
      success: true,
      data: serializedGalleries
    });
  } catch (error) {
    console.error("[API_ERROR] Galleries GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Projeye yeni galeri ekle
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Yetkilendirme kontrolü
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = parseInt(params.id);
    if (isNaN(projectId)) {
      return new NextResponse("Invalid project ID", { status: 400 });
    }

    // Proje var mı kontrol et
    const project = await db.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
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
    }

    // Oluşturulacak veri
    const createData = {
      projectId,
      title,
      description: description || "",
      parentId: parentId || null,
      order: order || 0,
      coverImage: coverImage || null,
      isActive: true
    };

    console.log(`[API] Creating gallery with data:`, createData);

    // Galeri oluştur
    const gallery = await db.projectGallery.create({
      data: createData,
      include: {
        project: true,
        parent: true,
        children: true,
        media: true
      }
    });
    
    console.log('✅ [API] Gallery created:', gallery);

    return NextResponse.json({
      success: true,
      data: {
        ...gallery,
        media: gallery.media.map(media => ({
          ...media,
          fileSize: media.fileSize.toString()
        }))
      }
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery POST error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
