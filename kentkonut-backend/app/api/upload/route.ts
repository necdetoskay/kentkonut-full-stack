import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import {
  createAllThumbnails,
  isImageFile,
  getResponsiveThumbnailUrls
} from '@/lib/thumbnail-generator';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/avif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Get file type category
function getFileTypeCategory(mimeType: string): string {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'document';
  return 'other';
}

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // Short UUID
  return `${timestamp}_${uuid}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const categoryId = formData.get('categoryId') as string;
    const customFolder = formData.get('customFolder') as string; // Custom folder support

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Get category if provided, otherwise get default category
    let category = null;
    if (categoryId && categoryId !== 'undefined' && categoryId !== '0') {
      category = await db.mediaCategory.findUnique({
        where: { id: parseInt(categoryId) }
      });

      if (!category) {
        return NextResponse.json({ error: 'Geçersiz kategori' }, { status: 400 });
      }
    }

    // If no category provided or category not found, get the first available category
    if (!category) {
      category = await db.mediaCategory.findFirst({
        orderBy: { id: 'asc' }
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Hiçbir medya kategorisi bulunamadı. Lütfen önce bir kategori oluşturun.' },
          { status: 400 }
        );
      }
    }

    const uploadedFiles = [];
    const errors = [];

    // Determine upload directory - use custom folder if specified
    const baseUploadDir = path.join(process.cwd(), 'public', 'uploads');
    let uploadDir;

    if (customFolder && customFolder !== 'default') {
      // Özel klasör yolu oluştur ve temizle
      const cleanCustomFolder = customFolder.replace(/\.\./g, '').replace(/[^a-zA-Z0-9\/\-_]/g, '');
      uploadDir = path.join(process.cwd(), 'public', cleanCustomFolder);
    } else {
      uploadDir = baseUploadDir;
    }

    // Klasörü oluştur (yoksa)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      try {
        // Validate file
        if (!ALL_ALLOWED_TYPES.includes(file.type)) {
          errors.push(`${file.name}: Desteklenmeyen dosya tipi`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: Dosya boyutu çok büyük (max 10MB)`);
          continue;
        }

        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(file.name);
        const filePath = path.join(uploadDir, uniqueFilename);

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save file
        await writeFile(filePath, buffer);

        // Create thumbnails for images
        let thumbnailUrls = null;
        if (isImageFile(file.type)) {
          try {
            thumbnailUrls = await createAllThumbnails(buffer, uniqueFilename, {
              quality: 85,
              format: 'jpeg'
            });
            console.log(`Thumbnails created for ${uniqueFilename}:`, thumbnailUrls);
          } catch (error) {
            console.error(`Error creating thumbnails for ${uniqueFilename}:`, error);
            // Continue without thumbnails
          }
        }

        // Generate file URL based on custom folder or default uploads
        const fileUrl = customFolder && customFolder !== 'default'
          ? `/${customFolder}/${uniqueFilename}`
          : `/uploads/${uniqueFilename}`;

        // Log file paths for debugging
        console.log('📁 [UPLOAD_DEBUG] File paths:', {
          uploadDir,
          filePath,
          fileUrl,
          customFolder,
          uniqueFilename
        });

        // Save to database
        const mediaFile = await db.media.create({
          data: {
            filename: uniqueFilename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            path: filePath,
            url: fileUrl,
            categoryId: category.id,
            ...(thumbnailUrls && {
              thumbnailSmall: thumbnailUrls.small,
              thumbnailMedium: thumbnailUrls.medium,
              thumbnailLarge: thumbnailUrls.large,
            })
          },
          include: {
            category: true,
          },
        });

        uploadedFiles.push(mediaFile);

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push(`${file.name}: Yükleme sırasında hata oluştu`);
      }
    }

    // Return results
    return NextResponse.json({
      success: true,
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      message: `${uploadedFiles.length} dosya başarıyla yüklendi${errors.length > 0 ? `, ${errors.length} dosyada hata oluştu` : ''}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}