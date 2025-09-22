import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCache, setCache, buildCacheKey, delByPattern } from "@/lib/cache";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { withCors, handleCorsPreflightRequest } from "@/lib/cors";

const projectSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  slug: z.string().min(1, "Slug gereklidir"),
  summary: z.string().optional(),
  content: z.string().min(1, "İçerik gereklidir"),
  status: z.enum(["ONGOING", "COMPLETED"]).default("ONGOING"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationName: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  mediaId: z.string().optional(),
  published: z.boolean().default(false),
  publishedAt: z.string().optional(),
  readingTime: z.number().default(3),
  tags: z.array(z.string()).optional(),
  galleryItems: z.array(z.string()).optional(),
  hasQuickAccess: z.boolean().default(false), // Hızlı erişim aktif mi?
});

// OPTIONS /api/projects - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// GET all projects (CORS enabled)
export const GET = withCors(async (req: NextRequest) => {
  try {
    // AUTH KALDIRILDI: Proje listesi public
    // const session = await auth();
    // if (!session) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const published = searchParams.get('published');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (published !== null) {
      where.published = published === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { locationName: { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    const cacheKey = buildCacheKey('project:list', { page, limit, status: status || 'all', published, search });
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
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
          },
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              comments: true,
              galleryItems: true,
              quickAccessLinks: true
            }
          }
        }
      }),
      db.project.count({ where })
    ]);

    const payload = {
      projects,
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
    console.error("[PROJECTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
});

// POST create new project
export const POST = withCors(async (req: NextRequest) => {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = projectSchema.parse(body);

    // Check if slug already exists
    const existingProject = await db.project.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingProject) {
      return new NextResponse("Slug already exists", { status: 400 });
    }

    // Create project
    const projectData: any = {
      title: validatedData.title,
      slug: validatedData.slug,
      summary: validatedData.summary,
      content: validatedData.content,
      status: validatedData.status,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      locationName: validatedData.locationName,
      province: validatedData.province,
      district: validatedData.district,
      address: validatedData.address,
      mediaId: validatedData.mediaId,
      published: validatedData.published,
      readingTime: validatedData.readingTime,
      hasQuickAccess: validatedData.hasQuickAccess, // Hızlı erişim aktif mi?
      authorId: session.user.id,
    };

    if (validatedData.published && validatedData.publishedAt) {
      projectData.publishedAt = new Date(validatedData.publishedAt);
    } else if (validatedData.published) {
      projectData.publishedAt = new Date();
    }

    const project = await db.project.create({
      data: projectData,
      include: {
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

        // Create project-tag relation
        await db.projectTag.create({
          data: {
            projectId: project.id,
            tagId: tag.id
          }
        });
      }
    }

    // Handle gallery items if provided
    if (validatedData.galleryItems && validatedData.galleryItems.length > 0) {
      for (let i = 0; i < validatedData.galleryItems.length; i++) {
        await db.projectGalleryItem.create({
          data: {
            projectId: project.id,
            mediaId: validatedData.galleryItems[i],
            order: i
          }
        });
      }
    }

    // Invalidate cached lists and detail for this slug
    try {
      await delByPattern('project:list:*');
      // detail cache key pattern
      await delByPattern(`project:detail:slug=${project.slug}*`);
    } catch {}

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return new NextResponse("Internal error", { status: 500 });
  }
});
