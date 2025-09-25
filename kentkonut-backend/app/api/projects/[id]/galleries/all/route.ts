import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Projeye ait TÜM galeri itemlarını (galeriler + medyalar) hiyerarşik olarak döndür
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    
    if (isNaN(projectId)) {
      return new NextResponse("Invalid project ID", { status: 400 });
    }

    console.log(`[API_HIERARCHICAL_GALLERIES] Getting ALL gallery items for project: ${projectId}`);

    // Tüm galerileri ve medyalarını hiyerarşik olarak getir
    const allGalleries = await prisma.projectGallery.findMany({
      where: { 
        projectId,
        isActive: true
      },
      include: {
        media: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        children: {
          where: { isActive: true },
          include: {
            media: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            },
            children: true // 2. seviye alt galeriler için
          }
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

    // BigInt serialization
    const serializeMedia = (media: any) => ({
      ...media,
      fileSize: media.fileSize.toString()
    });

    const serializedGalleries = allGalleries.map(gallery => ({
      ...gallery,
      media: gallery.media.map(serializeMedia),
      children: gallery.children.map(child => ({
        ...child,
        media: child.media.map(serializeMedia),
        children: child.children.map(subChild => ({
            ...subChild,
            media: subChild.media.map(serializeMedia)
        }))
      }))
    }));
    
    const rootGalleries = serializedGalleries.filter(g => g.parentId === null);

    console.log(`[API_HIERARCHICAL_GALLERIES] Found ${rootGalleries.length} root galleries`);
    console.log(`[API_HIERARCHICAL_GALLERIES] Total galleries found: ${allGalleries.length}`);

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        galleries: rootGalleries,
        // Eski `allGalleries` ve `allMedia` alanlarını da frontend geçişi için koru
        allGalleries: serializedGalleries,
        allMedia: serializedGalleries.flatMap(g => g.media)
      }
    });
  } catch (error) {
    console.error("[API_ERROR] All Galleries GET error:", error);
    console.error("[API_ERROR] Error details:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}