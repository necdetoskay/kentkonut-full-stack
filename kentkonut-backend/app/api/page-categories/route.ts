import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const pageCategorySchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir"),
  slug: z.string().min(1, "Slug gereklidir"),
  description: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

// GET all page categories
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const categories = await db.pageCategory.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        _count: {
          select: {
            pages: true
          }
        }
      }
    });

    // Transform the response to include pageCount
    const categoriesWithCount = categories.map((category: typeof categories[number]) => ({
      ...category,
      pageCount: category._count.pages
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error("[PAGE_CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST create new page category
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = pageCategorySchema.parse(body);

    // Check if slug already exists
    const existingCategory = await db.pageCategory.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingCategory) {
      return new NextResponse("Slug already exists", { status: 400 });
    }

    const category = await db.pageCategory.create({
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: category
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    console.error("[PAGE_CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
