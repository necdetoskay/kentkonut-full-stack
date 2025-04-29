import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import * as z from "zod";

const projectUpdateSchema = z.object({
  title: z.string().min(2, "Proje adı en az 2 karakter olmalıdır").optional(),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır").optional(),
  location: z.string().optional(),
  mainImage: z.string().optional(),
  features: z.record(z.string()).optional(),
  details: z.record(z.string()).optional(),
  status: z.enum(["PLANNING", "ONGOING", "COMPLETED"]).optional(),
  completionDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  coverImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional()
});

type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

// GET a single project by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await db.project.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        images: true,
        videos: true,
      },
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ message: "Proje bulunamadı" }),
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new NextResponse(
      JSON.stringify({ message: "Proje alınırken bir hata oluştu" }),
      { status: 500 }
    );
  }
}

// PATCH (update) a project
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ message: "Oturum açmanız gerekiyor" }),
        { status: 401 }
      );
    }
    
    const json = await req.json();
    const body = projectUpdateSchema.parse(json) as ProjectUpdateInput;
    
    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: {
        id: parseInt(params.id)
      }
    });
    
    if (!existingProject) {
      return new NextResponse(
        JSON.stringify({ message: "Proje bulunamadı" }),
        { status: 404 }
      );
    }
    
    // Update project
    const updatedProject = await db.project.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        mainImage: body.mainImage,
        features: body.features,
        details: body.details,
        status: body.status,
        completionDate: body.completionDate ? new Date(body.completionDate) : null,
        isActive: body.isActive,
        coverImage: body.coverImage,
      },
      include: {
        images: true,
        videos: true
      }
    });
    
    // Handle images update if needed
    if (json.hasOwnProperty('images')) {
      await db.projectImage.deleteMany({
        where: {
          projectId: parseInt(params.id)
        }
      });
      if (body.images && body.images.length > 0) {
        await db.projectImage.createMany({
          data: body.images.map((image: string) => ({
            url: image,
            projectId: parseInt(params.id)
          }))
        });
      }
    }
    
    // Handle videos update if needed
    if (json.hasOwnProperty('videos')) {
      await db.projectVideo.deleteMany({
        where: {
          projectId: parseInt(params.id)
        }
      });
      if (body.videos && body.videos.length > 0) {
        await db.projectVideo.createMany({
          data: body.videos.map((video: string) => ({
            url: video,
            projectId: parseInt(params.id)
          }))
        });
      }
    }
    
    // Re-fetch project with updated media
    const projectWithMedia = await db.project.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        images: true,
        videos: true
      }
    });
    
    return NextResponse.json(projectWithMedia);
  } catch (error) {
    console.error("[PROJECT_PATCH]", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({
          message: "Geçersiz form verileri",
          errors: error.errors
        }),
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({ message: error.message }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "Beklenmeyen bir hata oluştu" }),
      { status: 500 }
    );
  }
}

// DELETE a project
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ message: "Oturum açmanız gerekiyor" }),
        { status: 401 }
      );
    }
    
    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: {
        id: parseInt(params.id)
      }
    });
    
    if (!existingProject) {
      return new NextResponse(
        JSON.stringify({ message: "Proje bulunamadı" }),
        { status: 404 }
      );
    }
    
    // Delete project images and videos first
    await db.projectImage.deleteMany({
      where: {
        projectId: parseInt(params.id)
      }
    });
    
    await db.projectVideo.deleteMany({
      where: {
        projectId: parseInt(params.id)
      }
    });
    
    // Delete the project
    await db.project.delete({
      where: {
        id: parseInt(params.id)
      }
    });
    
    return NextResponse.json(
      { message: "Proje başarıyla silindi" }
    );
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({ message: error.message }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "Beklenmeyen bir hata oluştu" }),
      { status: 500 }
    );
  }
} 