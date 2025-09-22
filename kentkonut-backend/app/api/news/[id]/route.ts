import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { delByPattern } from "@/lib/cache";
import { auth } from "@/lib/auth";
import { z } from "zod";

const newsSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  slug: z.string().min(1, "Slug gereklidir"),
  summary: z.string().optional(),
  content: z.string().min(1, "İçerik gereklidir"),
  mediaId: z.string().optional(),
  categoryId: z.number().min(1, "Kategori gereklidir"),
  published: z.boolean().default(false),
  publishedAt: z.string().optional(),
  readingTime: z.number().default(3),
  tags: z.array(z.string()).optional(),
  galleryItems: z.array(z.string()).optional(),
  shareCount: z.number().optional(),
  downloadCount: z.number().optional(),
  likeCount: z.number().optional(),
});

// GET a specific news
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const news = await db.news.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        media: true,
        tags: {
          include: {
            tag: true
          }
        },
        galleryItems: {
          include: {
            media: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            comments: true,
            galleryItems: true
          }
        }
      }
    });

    if (!news) {
      return new NextResponse("Not found", { status: 404 });
    }

    // viewCount otomatik artır
    await db.news.update({
      where: { id: parseInt(id) },
      data: { viewCount: { increment: 1 } }
    });

    // Invalidate caches related to news
    try {
      await delByPattern('news:list:*');
      await delByPattern(`news:detail:slug=${news.slug}*`);
    } catch {}

    return NextResponse.json(news);
  } catch (error) {
    console.error("[NEWS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT update news
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = newsSchema.parse(body);

    // Check if slug already exists (excluding current news)
    const existingNews = await db.news.findFirst({
      where: { 
        slug: validatedData.slug,
        NOT: { id: parseInt(id) }
      }
    });

    if (existingNews) {
      return new NextResponse("Slug already exists", { status: 400 });
    }

    // Update news
    const newsData: any = {
      title: validatedData.title,
      slug: validatedData.slug,
      summary: validatedData.summary,
      content: validatedData.content,
      mediaId: validatedData.mediaId,
      categoryId: validatedData.categoryId,
      published: validatedData.published,
      readingTime: validatedData.readingTime,
      shareCount: validatedData.shareCount ?? 0,
      downloadCount: validatedData.downloadCount ?? 0,
      likeCount: validatedData.likeCount ?? 0,
    };

    if (validatedData.published && validatedData.publishedAt) {
      newsData.publishedAt = new Date(validatedData.publishedAt);
    } else if (validatedData.published && !validatedData.publishedAt) {
      newsData.publishedAt = new Date();
    }

    const news = await db.news.update({
      where: {
        id: parseInt(id)
      },
      data: newsData,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        media: true
      }
    });

    // Handle tags update
    if (validatedData.tags !== undefined) {
      // Remove existing tags
      await db.newsTag.deleteMany({
        where: { newsId: parseInt(id) }
      });

      // Add new tags
      if (validatedData.tags.length > 0) {
        for (const tagName of validatedData.tags) {
          const tag = await db.tag.upsert({
            where: { name: tagName },
            update: {},
            create: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-')
            }
          });

          await db.newsTag.create({
            data: {
              newsId: parseInt(id),
              tagId: tag.id
            }
          });
        }
      }
    }

    // Handle gallery items update
    if (validatedData.galleryItems !== undefined) {
      // Remove existing gallery items
      await db.newsGalleryItem.deleteMany({
        where: { newsId: parseInt(id) }
      });

      // Add new gallery items
      if (validatedData.galleryItems.length > 0) {
        for (let i = 0; i < validatedData.galleryItems.length; i++) {
          await db.newsGalleryItem.create({
            data: {
              newsId: parseInt(id),
              mediaId: validatedData.galleryItems[i],
              order: i
            }
          });
        }
      }
    }

    return NextResponse.json(news);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    console.error("[NEWS_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE news
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete related data first (cascade should handle this, but being explicit)
    await db.newsTag.deleteMany({
      where: { newsId: parseInt(id) }
    });

    await db.newsGalleryItem.deleteMany({
      where: { newsId: parseInt(id) }
    });

    await db.comment.deleteMany({
      where: { newsId: parseInt(id) }
    });

    await db.newsRelation.deleteMany({
      where: { 
        OR: [
          { newsId: parseInt(id) },
          { relatedNewsId: parseInt(id) }
        ]
      }
    });

    // Delete the news
    await db.news.delete({
      where: {
        id: parseInt(id)
      }
    });

    // Invalidate caches related to news
    try {
      await delByPattern('news:list:*');
      await delByPattern('news:detail:*');
    } catch {}

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[NEWS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
