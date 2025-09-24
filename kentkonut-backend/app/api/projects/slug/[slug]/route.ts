import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { withCors } from '@/lib/cors';
import { getCache, setCache } from '@/lib/cache';

async function handler(req: NextRequest, context: { params: { slug: string } }) {
  console.log('🚀 [API] Project slug API called with slug:', context.params?.slug);
  
  if (!context.params?.slug) {
    return new NextResponse("Slug is required", { status: 400 });
  }
  
  const { slug } = context.params;
  
  try {
    // Önce projeyi bul
    const cacheKey = `project:detail:slug=${slug}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      // Yine de view count'u artırmaya çalış (async, hataya düşse bile yanıtı hızlı döndür)
      db.project.update({ where: { slug }, data: { viewCount: { increment: 1 } } }).catch(() => {});
      return NextResponse.json({ success: true, data: cached });
    }

    const project = await db.project.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, email: true } },
        media: true,
        tags: { include: { tag: true } },
        comments: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        },
        relatedProjects: {
          include: {
            relatedProject: {
              include: {
                media: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: { select: { comments: true } }
      }
    });

    if (!project || !project.published) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Proje bulunduysa viewCount'u artır
    await db.project.update({
      where: { slug },
      data: { viewCount: { increment: 1 } }
    });

    // Debug için galeri öğelerini kontrol et
    console.log('📸 [DEBUG] Gallery Items:', JSON.stringify(project.galleryItems, null, 2));

    // Cache'e kısa TTL ile koy (ör. 60 sn)
    await setCache(cacheKey, project, 60);

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('❌ [ERROR] Project slug API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withCors(handler);
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 200 }));