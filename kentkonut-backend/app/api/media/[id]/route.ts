import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteMediaFile } from "@/lib/media-utils";

// GET - Get specific media file details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const media = await db.media.findUnique({
      where: {
        id: id,
      },
      include: {
        category: true,
      },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Medya dosyası bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(media);

  } catch (error) {
    console.error("[MEDIA_GET_BY_ID]", error);
    return NextResponse.json(
      { error: "Medya dosyası yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Update media metadata
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { alt, caption, categoryId } = json;

    // Check if media exists
    const existingMedia = await db.media.findUnique({
      where: { id: id },
      include: { category: true },
    });

    if (!existingMedia) {
      return NextResponse.json(
        { error: "Medya dosyası bulunamadı" },
        { status: 404 }
      );
    }

    // If category is being changed, validate new category
    if (categoryId && categoryId !== existingMedia.categoryId) {
      const newCategory = await db.mediaCategory.findUnique({
        where: { id: categoryId },
      });

      if (!newCategory) {
        return NextResponse.json(
          { error: "Geçersiz kategori" },
          { status: 400 }
        );
      }
    }

    // Update media
    const updatedMedia = await db.media.update({
      where: {
        id: id,
      },
      data: {
        alt: alt !== undefined ? alt : existingMedia.alt,
        caption: caption !== undefined ? caption : existingMedia.caption,
        categoryId: categoryId || existingMedia.categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedMedia);

  } catch (error) {
    console.error("[MEDIA_PUT]", error);
    return NextResponse.json(
      { error: "Medya dosyası güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE - Delete media file
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if media exists
    const media = await db.media.findUnique({
      where: { id: id },
      include: { category: true },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Medya dosyası bulunamadı" },
        { status: 404 }
      );
    }

    // Delete file from disk
    try {
      await deleteMediaFile(media.filename, media.category?.name);
    } catch (fileError) {
      console.warn("[MEDIA_DELETE] File deletion warning:", fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await db.media.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("[MEDIA_DELETE]", error);
    return NextResponse.json(
      { error: "Medya dosyası silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
