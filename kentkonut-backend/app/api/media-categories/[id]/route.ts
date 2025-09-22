import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Schema for media category validation
const mediaCategorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır"),
  icon: z.string().min(1, "Bir ikon seçmelisiniz"),
  order: z.number().int().nonnegative(),
});

// GET a specific media category
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

    const category = await db.mediaCategory.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!category) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[MEDIA_CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// UPDATE a media category
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

    const json = await req.json();

    try {
      const body = mediaCategorySchema.parse(json);

      const category = await db.mediaCategory.update({
        where: {
          id: parseInt(id)
        },
        data: {
          name: body.name,
          icon: body.icon,
          order: body.order,
        }
      });

      return NextResponse.json(category);
    } catch (validationError) {
      console.error("[MEDIA_CATEGORY_PUT] Validation error:", validationError);
      return new NextResponse(
        JSON.stringify({
          error: "Doğrulama hatası",
          details: validationError instanceof Error ? validationError.message : "Bilinmeyen hata"
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[MEDIA_CATEGORY_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE a media category
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

    // Check if category exists and get media count
    const category = await db.mediaCategory.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        _count: {
          select: {
            media: true
          }
        }
      }
    });

    if (!category) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Prevent deletion of built-in categories
    if (category.isBuiltIn) {
      return new NextResponse(
        JSON.stringify({
          error: "Bu kategori silinemez",
          details: "Bannerlar ve Haberler kategorileri sistem tarafından oluşturulmuş kategorilerdir ve silinemezler."
        }),
        { status: 403 }
      );
    }

    // Prevent deletion of categories with media files
    if (category._count.media > 0) {
      return new NextResponse(
        JSON.stringify({
          error: "Bu kategori silinemez",
          details: `Bu kategoride ${category._count.media} medya dosyası bulunmaktadır. Önce bu dosyaları başka bir kategoriye taşıyın veya silin.`,
          mediaCount: category._count.media
        }),
        { status: 409 }
      );
    }

    // Delete the category
    await db.mediaCategory.delete({
      where: {
        id: parseInt(id)
      }
    });

    // Reorder remaining categories
    const remainingCategories = await db.mediaCategory.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    // Update order for remaining categories
    for (let i = 0; i < remainingCategories.length; i++) {
      await db.mediaCategory.update({
        where: {
          id: remainingCategories[i].id
        },
        data: {
          order: i
        }
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MEDIA_CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
