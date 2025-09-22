import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCors, handleCorsPreflightRequest } from "@/lib/cors";

// OPTIONS /api/public/news - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// GET /api/public/news - Public endpoint for published news
export const GET = withCors(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause - only published news for public endpoint
    const where: any = {
      published: true // Only show published news
    };
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [news, total] = await Promise.all([
      db.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          publishedAt: 'desc'
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          author: {
            select: {
              id: true,
              name: true
            }
          },
          media: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              altText: true
            }
          },
          quickAccessLinks: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              title: true,
              url: true,
              icon: true,
              sortOrder: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
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

    // Transform the data to include flattened tags
    const transformedNews = news.map(item => ({
      ...item,
      tags: item.tags.map(tagRelation => tagRelation.tag)
    }));

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Public news API: Found ${news.length} published news items (page ${page}/${totalPages})`);

    return NextResponse.json({
      success: true,
      data: transformedNews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': process.env.NODE_ENV === 'development'
          ? 'no-cache, no-store, must-revalidate' // No cache in development
          : 'public, max-age=300' // 5 minutes cache in production
      }
    });

  } catch (error) {
    console.error('❌ Error fetching public news:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch news',
      data: []
    }, { status: 500 });
  }
});