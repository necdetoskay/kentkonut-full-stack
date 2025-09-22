import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ensureBuiltInCategories } from "./ensure-built-in";

// Ensure built-in categories exist when the application starts (skip during build)
if (!process.env.DATABASE_URL?.includes('placeholder')) {
  ensureBuiltInCategories();
}

// Schema for media category validation
const mediaCategorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır"),
  icon: z.string().min(1, "Bir ikon seçmelisiniz"),
  order: z.number().int().nonnegative(),
});

// GET all media categories
export async function GET() {
  try {
    const session = await auth();
    console.log("[API] Media categories GET request, session:", !!session, session?.user?.email);

    // Geçici olarak session kontrolünü devre dışı bırak
    // if (!session) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const categories = await db.mediaCategory.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        _count: {
          select: {
            media: true
          }
        }
      }
    });

    // Transform the response to include mediaCount
    const categoriesWithCount = categories.map(category => ({
      ...category,
      mediaCount: category._count.media
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error("[MEDIA_CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST a new media category
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();

    try {
      const body = mediaCategorySchema.parse(json);

      // Get the highest order to place the new category at the end
      const highestOrder = await db.mediaCategory.findFirst({
        orderBy: {
          order: 'desc'
        },
        select: {
          order: true
        }
      });

      const newOrder = highestOrder ? highestOrder.order + 1 : 0;

      const category = await db.mediaCategory.create({
        data: {
          name: body.name,
          icon: body.icon,
          order: body.order ?? newOrder,
        }
      });

      return NextResponse.json(category);
    } catch (validationError) {
      console.error("[MEDIA_CATEGORIES_POST] Validation error:", validationError);
      return new NextResponse(
        JSON.stringify({
          error: "Doğrulama hatası",
          details: validationError instanceof Error ? validationError.message : "Bilinmeyen hata"
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[MEDIA_CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
