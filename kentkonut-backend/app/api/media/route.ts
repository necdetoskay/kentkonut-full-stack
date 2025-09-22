import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import crypto from "crypto";
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
import { handleCorsPreflightRequest } from "@/lib/cors";
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

// CORS preflight support for production (required for multipart/form-data uploads)
export async function OPTIONS(req: NextRequest) {
  return handleCorsPreflightRequest(req);
}

// POST - Upload new media file
export async function POST(req: NextRequest) {
  const uploadId = crypto.randomUUID();
  console.log(`🚀 [MEDIA_UPLOAD_${uploadId}] Starting upload process`);
  
  try {
    console.log(`🔐 [MEDIA_UPLOAD_${uploadId}] Checking authentication...`);
    const session = await auth();

    if (!session) {
      console.log(`❌ [MEDIA_UPLOAD_${uploadId}] Authentication failed - no session`);
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] Authentication successful - user: ${session.user?.email}`);

    console.log(`📋 [MEDIA_UPLOAD_${uploadId}] Parsing form data...`);
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const categoryId = formData.get("categoryId") as string;
    const alt = formData.get("alt") as string;
    const caption = formData.get("caption") as string;
    const customFolder = formData.get("customFolder") as string; // Custom folder support
    const embedVideoUrl = formData.get("embedUrl") as string; // Embed URL için

    // Debug logging for hafriyat uploads
    console.log(`🔍 [MEDIA_UPLOAD_${uploadId}] Received parameters:`, {
      filename: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      categoryId,
      customFolder,
      hasFile: !!file,
      hasEmbedUrl: !!embedVideoUrl,
      referer: req.headers.get('referer'),
      userAgent: req.headers.get('user-agent'),
      contentLength: req.headers.get('content-length')
    });

    // WORKAROUND: If customFolder is null and request comes from hafriyat page, 
    // set customFolder to "hafriyat" (original, now commented out)
    let effectiveCustomFolder = customFolder;
    const referer = req.headers.get('referer') || '';
    console.log(`🔧 [MEDIA_UPLOAD_${uploadId}] Checking custom folder logic...`);
    if (!customFolder && referer.includes('/hafriyat/')) {
      effectiveCustomFolder = 'hafriyat';
      console.log(`🔧 [MEDIA_UPLOAD_${uploadId}] Applied hafriyat workaround based on referer - setting customFolder to 'hafriyat'`);
    } else if (!customFolder && categoryId === '1') {
      effectiveCustomFolder = 'hafriyat';
      console.log(`🔧 [MEDIA_UPLOAD_${uploadId}] Applied hafriyat workaround based on categoryId=1 - setting customFolder to 'hafriyat'`);
    }
    console.log(`📁 [MEDIA_UPLOAD_${uploadId}] Final folder settings:`, {
      originalCustomFolder: customFolder,
      effectiveCustomFolder,
      categoryId,
      referer
    });

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
    console.log(`📝 [MEDIA_UPLOAD_${uploadId}] Starting file validation...`);
    
    // Validate required fields
    console.log(`📝 [MEDIA_UPLOAD_${uploadId}] Before file existence check`);
    if (!file) {
      console.log(`❌ [MEDIA_UPLOAD_${uploadId}] Validation failed - no file provided`);
      return NextResponse.json(
        { error: "Dosya gereklidir" },
        { status: 400 }
      );
    }
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] After file existence check - file exists`);

    // Category is only required if no custom folder is specified
    console.log(`📝 [MEDIA_UPLOAD_${uploadId}] Before category/custom folder check`);
    if (!categoryId && !effectiveCustomFolder) {
      console.log(`❌ [MEDIA_UPLOAD_${uploadId}] Validation failed - no category or custom folder`);
      return NextResponse.json(
        { error: "Kategori seçimi veya özel klasör gereklidir" },
        { status: 400 }
      );
    }
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] After category/custom folder check`);

    let category = null;
    
    // Validate category exists (only if categoryId is provided)
    if (categoryId) {
      console.log(`🏷️ [MEDIA_UPLOAD_${uploadId}] Validating category with ID: ${categoryId}`);
      category = await db.mediaCategory.findUnique({
        where: { id: parseInt(categoryId) }
      });

      if (!category) {
        console.log(`❌ [MEDIA_UPLOAD_${uploadId}] Category validation failed - category not found: ${categoryId}`);
        return NextResponse.json(
          { error: "Geçersiz kategori" },
          { status: 400 }
        );
      }
      console.log(`✅ [MEDIA_UPLOAD_${uploadId}] Category validation passed:`, {
        categoryId: category.id,
        categoryName: category.name
      });
    } else {
      console.log(`ℹ️ [MEDIA_UPLOAD_${uploadId}] No category ID provided - using custom folder`);
    }

    // Enhanced security validation
    console.log(`🔒 [MEDIA_UPLOAD_${uploadId}] Starting security validation...`);
    console.log(`🔒 [MEDIA_UPLOAD_${uploadId}] Before validateFileUpload`);
    const securityValidation = await validateFileUpload(file);
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] After validateFileUpload`);
    if (!securityValidation.isValid) {
      console.log(`❌ [MEDIA_UPLOAD_${uploadId}] Security validation failed:`, securityValidation.errors);
      return NextResponse.json(
        {
          error: "Güvenlik kontrolünden geçemedi",
          details: securityValidation.errors
        },
        { status: 400 }
      );
    }
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] Security validation passed`);

    // Legacy validation for backward compatibility
    console.log(`📝 [MEDIA_UPLOAD_${uploadId}] Before validateFileType`);
    if (!validateFileType(file.type)) {
      console.log(`❌ [MEDIA_UPLOAD_${uploadId}] validateFileType failed`);
      return NextResponse.json(
        { error: "Desteklenmeyen dosya türü" },
        { status: 400 }
      );
    }
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] After validateFileType`);

    console.log(`📝 [MEDIA_UPLOAD_${uploadId}] Before validateFileSize`);
    if (!validateFileSize(file.size, file.type)) {
      console.log(`❌ [MEDIA_UPLOAD_${uploadId}] validateFileSize failed`);
      return NextResponse.json(
        { error: "Dosya boyutu çok büyük" },
        { status: 400 }
      );
    }
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] After validateFileSize`);

    // Generate secure filename
    console.log(`📝 [MEDIA_UPLOAD_${uploadId}] Generating secure filename...`);
    const sanitizedName = sanitizeFilename(file.name);
    const filename = generateSecureFilename(sanitizedName);
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] Filename generated:`, {
      originalName: file.name,
      sanitizedName,
      finalFilename: filename
    });

    // Save file to disk
    const categoryName = category?.name || "custom"; // Use category name or fallback to "custom"
    console.log(`💾 [MEDIA_UPLOAD_${uploadId}] Saving file to disk...`, {
      filename,
      categoryName,
      effectiveCustomFolder
    });
    console.log(`💾 [MEDIA_UPLOAD_${uploadId}] Before saveUploadedFile`);
    const filePath = await saveUploadedFile(file, filename, categoryName, effectiveCustomFolder);
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] File saved successfully to: ${filePath}`);

    // Perform additional security checks on saved file
    console.log(`🔒 [MEDIA_UPLOAD_${uploadId}] Before postUploadValidation`);
    const postUploadValidation = await validateFileUpload(file, filePath);
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] After postUploadValidation`);
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
    console.log(`🦠 [MEDIA_UPLOAD_${uploadId}] Before scanForVirus`);
    const virusScanResult = await scanForVirus(filePath);
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] After scanForVirus`);
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
    console.log(`🔗 [MEDIA_UPLOAD_${uploadId}] URL generation:`, {
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
      console.log(`🖼️ [MEDIA_UPLOAD_${uploadId}] Before processImage`);
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
    let mediaType: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED' = "IMAGE";
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
    console.log(`💾 [MEDIA_UPLOAD_${uploadId}] Saving to database...`, {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      mediaType,
      categoryId: category?.id || null,
      hasEmbedUrl: !!embedUrl
    });
    
    console.log(`🔗 [MEDIA_UPLOAD_${uploadId}] URL generated for DB: ${url}`);
    console.log(`💾 [MEDIA_UPLOAD_${uploadId}] Before db.media.create`);
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
    
    console.log(`✅ [MEDIA_UPLOAD_${uploadId}] Database record created successfully:`, {
      mediaId: media.id,
      filename: media.filename,
      url: media.url,
      categoryName: media.category?.name
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

    console.log(`🎉 [MEDIA_UPLOAD_${uploadId}] Upload completed successfully!`, {
      mediaId: media.id,
      filename: media.filename,
      fileSize: media.size,
      processingTime: Date.now() - parseInt(uploadId.split('-')[0], 16)
    });
    
    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Dosya başarıyla yüklendi"
    }, { status: 201 });

  } catch (error) {
    console.error(`💥 [MEDIA_UPLOAD_${uploadId}] Upload failed with error:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    if (Sentry) {
      Sentry.captureException(error);
    }
    
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
