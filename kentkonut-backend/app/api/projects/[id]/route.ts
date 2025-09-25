import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { delByPattern } from "@/lib/cache";
import { auth } from "@/lib/auth";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  slug: z.string().min(1, "Slug gereklidir"),
  summary: z.string().optional().nullable(),
  content: z.string().min(1, "İçerik gereklidir"),
  status: z.enum(["ONGOING", "COMPLETED"]).default("ONGOING"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  locationName: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  mediaId: z.string().optional().nullable(), // Media IDs are string CUIDs in the database
  bannerUrl: z.string().optional().nullable(), // Proje üst banner resmi URL'i
  published: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  readingTime: z.number().default(3),
  hasQuickAccess: z.boolean().default(false), // Hızlı erişim aktif mi?
  tags: z.array(z.string()).optional().default([]),
  yil: z.string().optional().nullable(),
  blokDaireSayisi: z.string().optional().nullable()
});

// GET single project
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // AUTH KALDIRILDI: Proje detayı public (dashboard için)
    // const session = await auth();
    // if (!session) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const { id } = await params;
    console.log("🔍 [BACKEND GET] Fetching project with ID:", id);

    const project = await db.project.findUnique({
      where: {
        id: parseInt(id)
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
        tags: {
          include: {
            tag: true
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
        // relatedProjects: {
        //   include: {
        //     relatedProject: {
        //       include: {
        //         media: true,
        //         author: {
        //           select: {
        //             id: true,
        //             name: true,
        //             email: true
        //           }
        //         }
        //       }
        //     }
        //   }
        // }
      }
    });

    if (!project) {
      console.log("🔍 [BACKEND GET] Project not found with ID:", id);
      return new NextResponse("Project not found", { status: 404 });
    }

    console.log("🔍 [BACKEND GET] Project found successfully");
    console.log("🔍 [BACKEND GET] Project hasQuickAccess from DB:", project.hasQuickAccess);
    console.log("🔍 [BACKEND GET] Type of hasQuickAccess from DB:", typeof project.hasQuickAccess);
    console.log("🔍 [BACKEND GET] Project keys from DB:", Object.keys(project));

    // Invalidate caches related to projects
    try {
      await delByPattern('project:list:*');
      await delByPattern(`project:detail:slug=${project.slug}*`);
    } catch {}

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT update project
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("🔍 [BACKEND PUT] Full request body:", JSON.stringify(body, null, 2));
    console.log("🔍 [BACKEND PUT] hasQuickAccess in request:", body.hasQuickAccess);
    console.log("🔍 [BACKEND PUT] Type of hasQuickAccess in request:", typeof body.hasQuickAccess);
    console.log("🔍 [BACKEND PUT] All keys in request body:", Object.keys(body));

    let validatedData;
    try {
      validatedData = projectSchema.parse(body);
      console.log("🔍 [BACKEND PUT] Validation successful");
      console.log("🔍 [BACKEND PUT] Validated hasQuickAccess:", validatedData.hasQuickAccess);
      console.log("🔍 [BACKEND PUT] Type of validated hasQuickAccess:", typeof validatedData.hasQuickAccess);
      console.log("🔍 [BACKEND PUT] All validated keys:", Object.keys(validatedData));
    } catch (validationError) {
      console.error("[PROJECT_PUT] Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }

    const { id } = await params;
    const projectId = parseInt(id);

    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id: projectId }
    });

    if (!existingProject) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Check if slug already exists (excluding current project)
    if (validatedData.slug !== existingProject.slug) {
      const slugExists = await db.project.findUnique({
        where: { slug: validatedData.slug }
      });

      if (slugExists) {
        return new NextResponse("Slug already exists", { status: 400 });
      }
    }

    // Update project
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
      bannerUrl: validatedData.bannerUrl,
      published: validatedData.published,
      readingTime: validatedData.readingTime,
      hasQuickAccess: validatedData.hasQuickAccess, // Hızlı erişim aktif mi?
      yil: validatedData.yil,
      blokDaireSayisi: validatedData.blokDaireSayisi,
    };

    console.log("🔍 [BACKEND PUT] Project data to update:", JSON.stringify(projectData, null, 2));
    console.log("🔍 [BACKEND PUT] hasQuickAccess value being saved:", projectData.hasQuickAccess);
    console.log("🔍 [BACKEND PUT] Type of hasQuickAccess being saved:", typeof projectData.hasQuickAccess);
    console.log("🔍 [BACKEND PUT] About to update project with ID:", projectId);

    if (validatedData.published && validatedData.publishedAt) {
      projectData.publishedAt = new Date(validatedData.publishedAt);
    } else if (validatedData.published && !existingProject.publishedAt) {
      projectData.publishedAt = new Date();
    } else if (!validatedData.published) {
      projectData.publishedAt = null;
    }

    const project = await db.project.update({
      where: { id: projectId },
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

    console.log("🔍 [BACKEND PUT] Database update completed");
    console.log("🔍 [BACKEND PUT] Updated project hasQuickAccess:", project.hasQuickAccess);
    console.log("🔍 [BACKEND PUT] Type of updated hasQuickAccess:", typeof project.hasQuickAccess);

    // Handle tags update - always update tags
    // Delete existing tags
    await db.projectTag.deleteMany({
      where: { projectId }
    });

    // Add new tags
    const tags = validatedData.tags || [];
    if (tags.length > 0) {
      try {
        for (const tagName of tags) {
          const tag = await db.tag.upsert({
            where: { name: tagName },
            update: {},
            create: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-')
            }
          });

          await db.projectTag.create({
            data: {
              projectId,
              tagId: tag.id
            }
          });
        }
      } catch (tagError) {
        console.error("[PROJECT_PUT] Error updating tags:", tagError);
        // Continue execution - don't fail the whole request because of tags
      }
    }

    // Gallery items functionality removed - ProjectGalleryItem model no longer exists
    // This section is commented out to prevent errors

    console.log("🔍 [BACKEND PUT] About to return response");
    console.log("🔍 [BACKEND PUT] Final project hasQuickAccess:", project.hasQuickAccess);
    console.log("🔍 [BACKEND PUT] Response project keys:", Object.keys(project));

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_PUT] Error:", error);
    
    if (error instanceof z.ZodError) {
      // Log the specific validation errors for debugging
      console.error("[PROJECT_PUT] Validation errors:", JSON.stringify(error.errors, null, 2));
      console.error("[PROJECT_PUT] Invalid data:", JSON.stringify(error.format(), null, 2));
      
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    // If it's a database error, handle it specifically
    if (error && typeof error === 'object' && 'code' in error && 'meta' in error) {
      const dbError = error as { code: string; meta: any; message: string };
      console.error("[PROJECT_PUT] Database error:", {
        code: dbError.code,
        meta: dbError.meta,
        message: dbError.message
      });
      
      return NextResponse.json(
        { error: `Database error: ${dbError.message}`, code: dbError.code },
        { status: 500 }
      );
    }
    
    // Generic error handler
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE project
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const projectId = parseInt(id);

    const project = await db.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Delete project (cascade will handle related records)
    await db.project.delete({
      where: { id: projectId }
    });

    // Invalidate caches related to projects
    try {
      await delByPattern('project:list:*');
      // We don't have slug here after delete; clear all detail keys to be safe
      await delByPattern('project:detail:*');
    } catch {}

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
