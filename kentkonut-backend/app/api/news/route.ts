import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildCacheKey, getCache, setCache, delByPattern } from "@/lib/cache";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { withCors, handleCorsPreflightRequest } from "@/lib/cors";

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
  hasQuickAccess: z.boolean().default(false), // Hızlı erişim aktif mi?
});

// Haber medyaları için özel klasör
const NEWS_MEDIA_FOLDER = 'uploads/haberler';

// OPTIONS /api/news - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// GET all news (CORS enabled)
export const GET = withCors(async (req: NextRequest) => {
  try {
    // AUTH KALDIRILDI: Haberler public
    // const session = await auth();
    // if (!session) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId');
    const published = searchParams.get('published');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    
    if (published !== null) {
      where.published = published === 'true';
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const cacheKey = buildCacheKey('news:list', { page, limit, categoryId: categoryId || 'all', published, search });
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const [news, total] = await Promise.all([
      db.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
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
          _count: {
            select: {
              comments: true,
              galleryItems: true
            }
          }
        }
      }),
      db.news.count({ where })
    ]);

    const payload = {
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
    await setCache(cacheKey, payload);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[NEWS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
});

// POST create new news
export const POST = withCors(async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = newsSchema.parse(body);

    // Check if slug already exists
    const existingNews = await db.news.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingNews) {
      return new NextResponse("Slug already exists", { status: 400 });
    }

    // Create news
    const newsData: any = {
      title: validatedData.title,
      slug: validatedData.slug,
      summary: validatedData.summary,
      content: validatedData.content,
      mediaId: validatedData.mediaId,
      categoryId: validatedData.categoryId,
      published: validatedData.published,
      readingTime: validatedData.readingTime,
      authorId: session.user.id,
      shareCount: validatedData.shareCount ?? 0,
      downloadCount: validatedData.downloadCount ?? 0,
      likeCount: validatedData.likeCount ?? 0,
    };

    if (validatedData.published && validatedData.publishedAt) {
      newsData.publishedAt = new Date(validatedData.publishedAt);
    } else if (validatedData.published) {
      newsData.publishedAt = new Date();
    }

    const news = await db.news.create({
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
        media: true,
        quickAccessLinks: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    // Handle tags if provided
    if (validatedData.tags && validatedData.tags.length > 0) {
      for (const tagName of validatedData.tags) {
        // Create or find tag
        const tag = await db.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-')
          }
        });

        // Create news-tag relation
        await db.newsTag.create({
          data: {
            newsId: news.id,
            tagId: tag.id
          }
        });
      }
    }

    // Handle gallery items if provided
    if (validatedData.galleryItems && validatedData.galleryItems.length > 0) {
      for (let i = 0; i < validatedData.galleryItems.length; i++) {
        await db.newsGalleryItem.create({
          data: {
            newsId: news.id,
            mediaId: validatedData.galleryItems[i],
            order: i
          }
        });
      }
    }

    // Invalidate cached lists and detail for this news slug
    try {
      await delByPattern('news:list:*');
      await delByPattern(`news:detail:slug=${news.slug}*`);
    } catch {}

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    console.error("[NEWS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
});
