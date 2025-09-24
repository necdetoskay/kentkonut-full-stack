import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Galeri arama API'si

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    
    if (isNaN(projectId)) {
      return new NextResponse("Invalid project ID", { status: 400 });
    }

    // URL parametrelerini al
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    console.log(`[API] Searching galleries and items for project ${projectId}. Query: "${query}", Page: ${page}, Limit: ${limit}`);

    if (!query) {
      return NextResponse.json({
        success: true,
        data: {
          galleries: [],
          items: [],
          pagination: {
            page,
            limit,
            totalItems: 0,
            totalPages: 0,
            hasMore: false
          }
        }
      });
    }

    // Galerilerde ara
    const galleries = await db.projectGallery.findMany({
      where: {
        projectId,
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        items: {
          take: 3,
          include: {
            media: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });

    // Medya öğelerinde ara
    const items = await db.projectGalleryItem.findMany({
      where: {
        gallery: {
          projectId
        },
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { media: { 
            OR: [
              { originalName: { contains: query, mode: 'insensitive' } },
              { alt: { contains: query, mode: 'insensitive' } },
              { caption: { contains: query, mode: 'insensitive' } }
            ]
          }}
        ]
      },
      include: {
        media: true,
        gallery: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: limit
    });

    // Toplam medya öğesi sayısını getir
    const totalCount = await db.projectGalleryItem.count({
      where: {
        gallery: {
          projectId
        },
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { media: { 
            OR: [
              { originalName: { contains: query, mode: 'insensitive' } },
              { alt: { contains: query, mode: 'insensitive' } },
              { caption: { contains: query, mode: 'insensitive' } }
            ]
          }}
        ]
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        galleries,
        items,
        pagination: {
          page,
          limit,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + items.length < totalCount
        }
      }
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery search error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}