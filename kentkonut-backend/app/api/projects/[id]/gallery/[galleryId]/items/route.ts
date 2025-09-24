import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// Galeri medya öğeleri için API

// POST: Galeriye yeni medya öğesi ekle
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

    // Request body'den verileri al
    const body = await req.json();
    const { mediaId, title, description, order } = body;

    // Validasyon
    if (!mediaId) {
      return new NextResponse("Media ID is required", { status: 400 });
    }

    // Medyanın varlığını kontrol et
    const media = await db.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return new NextResponse("Media not found", { status: 404 });
    }

    // Oluşturulacak veri
    const createData = {
      galleryId,
      mediaId,
      title: title || media.originalName || "Untitled",
      description: description || "",
      order: order || 0,
      isActive: true
    };

    console.log(`[API] Creating gallery item with data:`, createData);

    // Veritabanı işlemini bir transaction içinde yapıyoruz
    const galleryItem = await db.$transaction(async (tx) => {
      const item = await tx.projectGalleryItem.create({
        data: createData,
        include: {
          media: true,
          gallery: true
        }
      });
      
      console.log('✅ [API] Gallery item created in transaction:', item);
      return item;
    });

    return NextResponse.json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery item POST error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET: Galerinin tüm medya öğelerini getir (pagination ile)
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

    console.log(`[API] Getting media items for gallery ${galleryId} in project ${projectId}. Page: ${page}, Limit: ${limit}`);

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
    console.error("[API_ERROR] Gallery items GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
