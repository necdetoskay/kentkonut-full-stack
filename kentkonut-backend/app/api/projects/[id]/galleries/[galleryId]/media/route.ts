import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: Galeri medyalarını listele
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

    // URL parametrelerini al
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;
    const includeSubGalleries = searchParams.get('includeSubGalleries') === 'true';

    console.log(`[API] Getting media for gallery: project=${projectId}, gallery=${galleryId}, page=${page}, limit=${limit}, includeSubGalleries=${includeSubGalleries}`);

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

    let media = [];
    let totalCount = 0;

    if (includeSubGalleries) {
      // Ana galeri + alt galeri medyalarını getir
      const galleryWithChildren = await db.projectGallery.findFirst({
        where: { 
          id: galleryId,
          projectId,
          isActive: true
        },
        include: {
          children: {
            where: { isActive: true },
            select: { id: true }
          }
        }
      });

      if (galleryWithChildren) {
        const galleryIds = [galleryId, ...galleryWithChildren.children.map(child => child.id)];
        
        media = await db.projectGalleryMedia.findMany({
          where: { 
            galleryId: { in: galleryIds },
            isActive: true
          },
          orderBy: { order: 'asc' },
          skip: offset,
          take: limit
        });

        totalCount = await db.projectGalleryMedia.count({
          where: { 
            galleryId: { in: galleryIds },
            isActive: true
          }
        });
      }
    } else {
      // Sadece ana galeri medyalarını getir
      media = await db.projectGalleryMedia.findMany({
        where: { 
          galleryId,
          isActive: true
        },
        orderBy: { order: 'asc' },
        skip: offset,
        take: limit
      });

      totalCount = await db.projectGalleryMedia.count({
        where: { 
          galleryId,
          isActive: true
        }
      });
    }

    const hasMore = offset + media.length < totalCount;

    console.log(`[API] Found ${media.length} media items (${totalCount} total)${includeSubGalleries ? ' (including sub-galleries)' : ''}`);

    return NextResponse.json({
      success: true,
      data: {
        media: media.map(item => ({
          ...item,
          fileSize: item.fileSize.toString()
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          hasMore,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery media GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Galeriye medya ekle
export async function POST(
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

    // Request body'den verileri al
    const body = await req.json();
    console.log('[API] Received body:', body);
    const { 
      fileName, 
      originalName, 
      fileSize, 
      mimeType, 
      fileUrl, 
      thumbnailUrl, 
      title, 
      description, 
      alt, 
      order 
    } = body;

    // Validasyon
    if (!fileName || !originalName || !mimeType || !fileUrl) {
      return new NextResponse("Required fields: fileName, originalName, mimeType, fileUrl", { status: 400 });
    }

    // Oluşturulacak veri
    const createData = {
      galleryId,
      fileName,
      originalName,
      fileSize: BigInt(fileSize || "0"),
      mimeType,
      fileUrl,
      thumbnailUrl: thumbnailUrl || null,
      title: title || null,
      description: description || null,
      alt: alt || null,
      order: order || 0,
      isActive: true
    };

    console.log(`[API] Creating media for gallery ${galleryId} with data:`, createData);

    // Medya oluştur
    const media = await db.projectGalleryMedia.create({
      data: createData
    });
    
    console.log('✅ [API] Media created:', media);

    return NextResponse.json({
      success: true,
      data: {
        ...media,
        fileSize: media.fileSize.toString()
      }
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery media POST error:", error);
    console.error("[API_ERROR] Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
