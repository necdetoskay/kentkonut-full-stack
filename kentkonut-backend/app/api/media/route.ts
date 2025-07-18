import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import {
  generateUniqueFilename,
  saveUploadedFile,
  validateFileType,
  validateFileSize,
  getMediaFileUrl,
  getCategorySubdirectory,
  getCustomFolderFileUrl
} from "@/lib/media-utils";
import {
  validateFileUpload,
  sanitizeFilename,
  generateSecureFilename,
  scanForVirus
} from "@/lib/file-security";
import { processImage } from "@/lib/image-processing";
// Optional Sentry import - only if package is available
let Sentry: any = null;
try {
  Sentry = require('@sentry/node');
} catch (e) {
  console.log('Sentry not available, continuing without error tracking');
}

// Sentry initialization - only in production or when DSN is provided
const sentryDsn = process.env.SENTRY_DSN;

if (Sentry && sentryDsn && sentryDsn !== 'YOUR_SENTRY_DSN' && process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
  });
} else {
  console.log('Sentry disabled in development mode or no valid DSN provided');
}

// POST - Upload new media file
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const categoryId = formData.get("categoryId") as string;
    const alt = formData.get("alt") as string;
    const caption = formData.get("caption") as string;
    const customFolder = formData.get("customFolder") as string; // Custom folder support
    const embedVideoUrl = formData.get("embedUrl") as string; // Embed URL için

    // Debug logging for hafriyat uploads
    console.log("🔍 [MEDIA_UPLOAD_DEBUG] Received parameters:", {
      filename: file?.name,
      categoryId,
      customFolder,
      hasFile: !!file,
      hasEmbedUrl: !!embedVideoUrl,
      referer: req.headers.get('referer')
    });

    // WORKAROUND: If customFolder is null and request comes from hafriyat page, 
    // set customFolder to "hafriyat"
    let effectiveCustomFolder = customFolder;
    const referer = req.headers.get('referer') || '';
    if (!customFolder && referer.includes('/hafriyat/')) {
      effectiveCustomFolder = 'hafriyat';
      console.log("🔧 [MEDIA_UPLOAD_DEBUG] Applied hafriyat workaround based on referer - setting customFolder to 'hafriyat'");
    } else if (!customFolder && categoryId === '1') {
      effectiveCustomFolder = 'hafriyat';
      console.log("🔧 [MEDIA_UPLOAD_DEBUG] Applied hafriyat workaround based on categoryId=1 - setting customFolder to 'hafriyat'");
    }

    // Embed video için özel işlem
    if (embedVideoUrl && embedVideoUrl.trim().length > 0) {
      // Category validation
      let category = null;
      if (categoryId) {
        category = await db.mediaCategory.findUnique({
          where: { id: parseInt(categoryId) }
        });
      }

      // Embed video için database kaydı oluştur
      const embedMedia = await db.media.create({
        data: {
          filename: alt || 'Embed Video',
          originalName: alt || 'Embed Video',
          mimeType: 'video/embed',
          size: 0,
          path: '',
          url: embedVideoUrl,
          alt: alt || null,
          caption: caption || null,
          categoryId: category?.id || null,
          type: 'EMBED' as const,
          embedUrl: embedVideoUrl,
        },
        include: {
          category: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: embedMedia,
        message: "Embed video başarıyla eklendi"
      }, { status: 201 });
    }

    // Normal dosya yükleme işlemi (embed değilse)
    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: "Dosya gereklidir" },
        { status: 400 }
      );
    }

    // Category is only required if no custom folder is specified
    if (!categoryId && !effectiveCustomFolder) {
      return NextResponse.json(
        { error: "Kategori seçimi veya özel klasör gereklidir" },
        { status: 400 }
      );
    }

    let category = null;
    
    // Validate category exists (only if categoryId is provided)
    if (categoryId) {
      category = await db.mediaCategory.findUnique({
        where: { id: parseInt(categoryId) }
      });

      if (!category) {
        return NextResponse.json(
          { error: "Geçersiz kategori" },
          { status: 400 }
        );
      }
    }

    // Enhanced security validation
    const securityValidation = await validateFileUpload(file);
    if (!securityValidation.isValid) {
      return NextResponse.json(
        {
          error: "Güvenlik kontrolü başarısız",
          details: securityValidation.errors
        },
        { status: 400 }
      );
    }

    // Legacy validation for backward compatibility
    if (!validateFileType(file.type)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya türü" },
        { status: 400 }
      );
    }

    if (!validateFileSize(file.size, file.type)) {
      return NextResponse.json(
        { error: "Dosya boyutu çok büyük" },
        { status: 400 }
      );
    }

    // Generate secure filename
    const sanitizedName = sanitizeFilename(file.name);
    const filename = generateSecureFilename(sanitizedName);

    // Save file to disk
    const categoryName = category?.name || "custom"; // Use category name or fallback to "custom"
    const filePath = await saveUploadedFile(file, filename, categoryName, effectiveCustomFolder);

    // Perform additional security checks on saved file
    const postUploadValidation = await validateFileUpload(file, filePath);
    if (!postUploadValidation.isValid) {
      // Delete the uploaded file if validation fails
      try {
        await unlink(filePath);
      } catch (deleteError) {
        console.error('Error deleting invalid file:', deleteError);
      }

      return NextResponse.json(
        {
          error: "Dosya güvenlik kontrolünden geçemedi",
          details: postUploadValidation.errors
        },
        { status: 400 }
      );
    }

    // Virus scanning
    const virusScanResult = await scanForVirus(filePath);
    if (!virusScanResult.isClean) {
      // Delete the infected file
      try {
        await unlink(filePath);
      } catch (deleteError) {
        console.error('Error deleting infected file:', deleteError);
      }

      return NextResponse.json(
        {
          error: "Dosyada güvenlik tehdidi tespit edildi",
          details: virusScanResult.threat
        },
        { status: 400 }
      );
    }

    // Generate public URL based on custom folder or category
    const url = effectiveCustomFolder 
      ? getCustomFolderFileUrl(filename, effectiveCustomFolder)
      : getMediaFileUrl(filename, categoryName);

    // Debug logging for URL generation
    console.log("🔍 [MEDIA_UPLOAD_DEBUG] URL generation:", {
      originalCustomFolder: customFolder,
      effectiveCustomFolder,
      categoryName,
      filename,
      generatedUrl: url,
      useCustomFolder: !!effectiveCustomFolder
    });

    // Process image if it's an image file (only for category-based uploads, not custom folders)
    let imageProcessingResult = null;
    if (file.type.startsWith('image/') && !effectiveCustomFolder) {
      try {
        imageProcessingResult = await processImage(filePath, filename, categoryName);
        console.log('Image processing completed:', {
          original: imageProcessingResult.original.fileSize,
          variants: imageProcessingResult.variants.length,
          compression: imageProcessingResult.metadata.compressionRatio
        });
      } catch (imageError) {
        console.error('Image processing failed:', imageError);
        // Continue without image processing - don't fail the upload
      }
    }

    // Save to database
    // MediaType belirleme
    let mediaType = "IMAGE";
    let embedUrl = null;
    if (file.type.startsWith("image/")) {
      mediaType = "IMAGE";
    } else if (file.type.startsWith("video/")) {
      mediaType = "VIDEO";
    } else if (file.type === "application/pdf") {
      mediaType = "PDF";
    } else if (file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      mediaType = "WORD";
    }
    // Eğer formData'da embedUrl varsa (video linki için)
    const embedUrlFromForm = formData.get("embedUrl");
    if (embedUrlFromForm && typeof embedUrlFromForm === "string" && embedUrlFromForm.length > 0) {
      mediaType = "EMBED";
      embedUrl = embedUrlFromForm;
    }
    const media = await db.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filePath,
        url,
        alt: alt || null,
        caption: caption || null,
        categoryId: category?.id || null, // Allow null for custom folder uploads
        type: mediaType,
        embedUrl: embedUrl,
      },
      include: {
        category: true,
      },
    });

    // Include image processing results in response
    const responseData = {
      ...media,
      imageProcessing: imageProcessingResult ? {
        variants: imageProcessingResult.variants.length,
        compressionRatio: imageProcessingResult.metadata.compressionRatio,
        totalProcessedSize: imageProcessingResult.metadata.totalProcessedSize
      } : null
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Dosya başarıyla yüklendi"
    }, { status: 201 });

  } catch (error) {
    if (Sentry) {
      Sentry.captureException(error);
    }
    console.error("[MEDIA_POST]", error);
    return NextResponse.json(
      { error: "Dosya yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// GET - List media files with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    console.log("🔍 Media API: Session check", { hasSession: !!session, user: session?.user?.email });

    if (!session) {
      console.log("❌ Media API: No session found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const type = searchParams.get("type"); // image, video, document
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const customFolder = searchParams.get("customFolder");

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (customFolder) {
      // url veya path içinde customFolder geçen dosyaları filtrele
      where.OR = [
        { url: { contains: `/${customFolder}/`, mode: "insensitive" } },
        { path: { contains: `/${customFolder}/`, mode: "insensitive" } }
      ];
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { originalName: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      switch (type) {
        case "image":
          where.mimeType = { startsWith: "image/" };
          break;
        case "video":
          where.mimeType = { startsWith: "video/" };
          break;
        case "document":
          where.mimeType = {
            in: [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "text/plain"
            ]
          };
          break;
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get media files
    const [media, total] = await Promise.all([
      db.media.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.media.count({ where }),
    ]);

    console.log("📊 Media API: Query results", { 
      mediaCount: media.length, 
      total, 
      where: JSON.stringify(where),
      page,
      limit 
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const responseData = {
      data: media,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };

    console.log("✅ Media API: Sending response", { 
      dataCount: responseData.data.length,
      pagination: responseData.pagination 
    });

    return NextResponse.json(responseData);

  } catch (error) {
    if (Sentry) {
      Sentry.captureException(error);
    }
    console.error("[MEDIA_GET]", error);
    return NextResponse.json(
      { error: "Medya dosyaları yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
