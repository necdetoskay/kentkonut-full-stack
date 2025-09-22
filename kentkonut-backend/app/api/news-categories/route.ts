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

// GET all news categories
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const categories = await db.newsCategory.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        _count: {
          select: {
            news: true
          }
        }
      }
    });

    // Transform the response to include newsCount
    const categoriesWithCount = categories.map((category: typeof categories[number]) => ({
      ...category,
      newsCount: category._count.news
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error("[NEWS_CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST create new news category
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = newsCategorySchema.parse(body);

    // Check if slug already exists
    const existingCategory = await db.newsCategory.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingCategory) {
      return new NextResponse("Slug already exists", { status: 400 });
    }

    const category = await db.newsCategory.create({
      data: validatedData,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    console.error("[NEWS_CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
