import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import * as z from "zod";

const projectSchema = z.object({
  title: z.string().min(2, "Proje adı en az 2 karakter olmalıdır"),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
  location: z.string().optional(),
  mainImage: z.string().optional(),
  features: z.record(z.string()).optional(),
  details: z.record(z.string()).optional(),
  status: z.enum(["ONGOING", "COMPLETED"]).optional(),
  completionDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  coverImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional()
});

type ProjectInput = z.infer<typeof projectSchema>;

// GET all projects
export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: true,
        videos: true,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST a new project
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ message: "Oturum açmanız gerekiyor" }),
        { status: 401 }
      );
    }
    
    const json = await req.json();
    const body = projectSchema.parse(json) as ProjectInput;
    
    const project = await db.project.create({
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        mainImage: body.mainImage || "",
        features: body.features || {},
        details: body.details || {},
        status: body.status || "ONGOING",
        completionDate: body.completionDate ? new Date(body.completionDate) : null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        coverImage: body.coverImage || "",
        images: {
          create: body.images ? body.images.map((image: string) => ({
            url: image
          })) : []
        },
        videos: {
          create: body.videos ? body.videos.map((video: string) => ({
            url: video
          })) : []
        }
      },
      include: {
        images: true,
        videos: true
      }
    });
    
    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    
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