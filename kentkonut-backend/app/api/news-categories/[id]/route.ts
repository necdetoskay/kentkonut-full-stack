import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const newsCategorySchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir"),
  slug: z.string().min(1, "Slug gereklidir"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number().default(0),
  active: z.boolean().default(true),
});

// GET a specific news category
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

    const category = await db.newsCategory.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        _count: {
          select: {
            news: true
          }
        }
      }
    });

    if (!category) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json({
      ...category,
      newsCount: category._count.news
    });
  } catch (error) {
    console.error("[NEWS_CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT update news category
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
    const validatedData = newsCategorySchema.parse(body);

    // Check if slug already exists (excluding current category)
    const existingCategory = await db.newsCategory.findFirst({
      where: { 
        slug: validatedData.slug,
        NOT: { id: parseInt(id) }
      }
    });

    if (existingCategory) {
      return new NextResponse("Slug already exists", { status: 400 });
    }

    const category = await db.newsCategory.update({
      where: {
        id: parseInt(id)
      },
      data: validatedData,
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    console.error("[NEWS_CATEGORY_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE news category
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

    // Check if category has news
    const newsCount = await db.news.count({
      where: { categoryId: parseInt(id) }
    });

    if (newsCount > 0) {
      return new NextResponse("Cannot delete category with news", { status: 400 });
    }

    await db.newsCategory.delete({
      where: {
        id: parseInt(id)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[NEWS_CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
