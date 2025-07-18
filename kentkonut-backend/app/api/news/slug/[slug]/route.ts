import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: { slug: string } }
) {
  if (!context.params?.slug) {
    return new NextResponse("Slug is required", { status: 400 });
  }

  const { slug } = context.params;
  
  try {
    // Önce viewCount'u bir artır
    await db.news.update({
      where: { slug },
      data: { viewCount: { increment: 1 } }
    });

    // Sonra güncellenmiş haberi tekrar çek
    const news = await db.news.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true } },
        media: true,
        tags: { include: { tag: true } },
        galleryItems: { 
          include: { 
            media: {
              select: {
                id: true,
                url: true,
                filename: true,
                alt: true,
                type: true,
                embedUrl: true,
                mimeType: true
              }
            } 
          }, 
          orderBy: { order: 'asc' } 
        },
        comments: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { comments: true, galleryItems: true } }
      }
    });

    if (!news || !news.published) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Debug için galeri öğelerini kontrol et
    console.log('📸 [DEBUG] Gallery Items:', JSON.stringify(news.galleryItems, null, 2));

    return NextResponse.json(news);
  } catch (error) {
    console.error("[NEWS_GET_BY_SLUG]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 