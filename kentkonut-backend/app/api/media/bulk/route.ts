import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteMediaFile } from "@/lib/media-utils";
import { z } from "zod";

// Schema for bulk operations
const bulkDeleteSchema = z.object({
  mediaIds: z.array(z.string()).min(1, "En az bir medya seçilmelidir"),
});

const bulkCategorizeSchema = z.object({
  mediaIds: z.array(z.string()).min(1, "En az bir medya seçilmelidir"),
  categoryId: z.number(),
});

const bulkUpdateMetadataSchema = z.object({
  mediaIds: z.array(z.string()).min(1, "En az bir medya seçilmelidir"),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

const bulkExportSchema = z.object({
  mediaIds: z.array(z.string()).min(1, "En az bir medya seçilmelidir"),
  format: z.enum(["zip", "json"]).default("zip"),
});

// POST - Bulk operations (delete, categorize)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { action } = json;

    switch (action) {
      case "delete":
        return await handleBulkDelete(json);
      case "categorize":
        return await handleBulkCategorize(json);
      case "updateMetadata":
        return await handleBulkUpdateMetadata(json);
      case "export":
        return await handleBulkExport(json);
      default:
        return NextResponse.json(
          { error: "Geçersiz işlem" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("[MEDIA_BULK]", error);
    return NextResponse.json(
      { error: "Toplu işlem sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Handle bulk delete operation
async function handleBulkDelete(data: any) {
  try {
    const { mediaIds } = bulkDeleteSchema.parse(data);

    // Get media files to delete
    const mediaFiles = await db.media.findMany({
      where: {
        id: { in: mediaIds },
      },
      include: {
        category: true,
      },
    });

    if (mediaFiles.length === 0) {
      return NextResponse.json(
        { error: "Silinecek medya dosyası bulunamadı" },
        { status: 404 }
      );
    }

    // Delete files from disk
    const fileDeletePromises = mediaFiles.map(async (media) => {
      try {
        await deleteMediaFile(media.filename, media.category?.name || 'uncategorized');
      } catch (error) {
        console.warn(`Failed to delete file ${media.filename}:`, error);
        // Continue with database deletion even if file deletion fails
      }
    });

    await Promise.allSettled(fileDeletePromises);

    // Delete from database
    const result = await db.media.deleteMany({
      where: {
        id: { in: mediaIds },
      },
    });

    return NextResponse.json({
      message: `${result.count} medya dosyası başarıyla silindi`,
      deletedCount: result.count,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    throw error;
  }
}

// Handle bulk categorize operation
async function handleBulkCategorize(data: any) {
  try {
    const { mediaIds, categoryId } = bulkCategorizeSchema.parse(data);

    // Validate category exists
    const category = await db.mediaCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Geçersiz kategori" },
        { status: 400 }
      );
    }

    // Update media files
    const result = await db.media.updateMany({
      where: {
        id: { in: mediaIds },
      },
      data: {
        categoryId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Güncellenecek medya dosyası bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `${result.count} medya dosyası ${category.name} kategorisine taşındı`,
      updatedCount: result.count,
      category,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    throw error;
  }
}

// Handle bulk metadata update operation
async function handleBulkUpdateMetadata(data: any) {
  try {
    const { mediaIds, alt, caption } = bulkUpdateMetadataSchema.parse(data);

    // Prepare update data
    const updateData: any = {};
    if (alt !== undefined) updateData.alt = alt || null;
    if (caption !== undefined) updateData.caption = caption || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Güncellenecek metadata bulunamadı" },
        { status: 400 }
      );
    }

    // Update media files
    const result = await db.media.updateMany({
      where: {
        id: { in: mediaIds },
      },
      data: updateData,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Güncellenecek medya dosyası bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `${result.count} medya dosyasının metadata'sı güncellendi`,
      updatedCount: result.count,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    throw error;
  }
}

// Handle bulk export operation
async function handleBulkExport(data: any) {
  try {
    const { mediaIds, format } = bulkExportSchema.parse(data);

    // Get media files
    const mediaFiles = await db.media.findMany({
      where: {
        id: { in: mediaIds },
      },
      include: {
        category: true,
      },
    });

    if (mediaFiles.length === 0) {
      return NextResponse.json(
        { error: "Export edilecek medya dosyası bulunamadı" },
        { status: 404 }
      );
    }

    if (format === "json") {
      // Return JSON export
      const exportData = {
        exportDate: new Date().toISOString(),
        totalFiles: mediaFiles.length,
        files: mediaFiles.map(file => ({
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url: file.url,
          alt: file.alt,
          caption: file.caption,
          category: file.category?.name || 'uncategorized',
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
        })),
      };

      return NextResponse.json(exportData);
    }

    // For ZIP format, return file URLs for client-side download
    return NextResponse.json({
      message: `${mediaFiles.length} dosya export için hazırlandı`,
      files: mediaFiles.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        size: file.size,
      })),
      totalSize: mediaFiles.reduce((sum: number, file: { size: number }) => sum + file.size, 0),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    throw error;
  }
}