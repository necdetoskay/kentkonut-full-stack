import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { GalleryFileInfo, GalleryApiResponse, DeleteApiResponse } from '@/types/advanced-uploader';

// Force Node.js runtime for this API route
// runtime kept internal to avoid Next.js type issues
const runtime = 'nodejs';

// Dynamic import for sharp to handle optional dependency
let sharp: any = null;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp not available, image processing will be limited:', error);
}

// Maksimum dosya boyutu (20 MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// İzin verilen dosya türleri
const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/mov', 'video/avi', 'video/webm',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Dosya türü belirleme
function getFileType(mimeType: string): 'image' | 'video' | 'pdf' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  return 'other';
}

// Thumbnail oluşturma
async function generateThumbnails(filePath: string, fileName: string, uploadDir: string) {
  try {
    // Check if sharp is available
    if (!sharp) {
      console.warn('Sharp not available, skipping thumbnail creation');
      return null;
    }

    const thumbnails = {
      small: `thumb_small_${fileName}`,
      medium: `thumb_medium_${fileName}`,
      large: `thumb_large_${fileName}`
    };

    await sharp(filePath)
      .resize(150, 150, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(join(uploadDir, thumbnails.small));

    await sharp(filePath)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(join(uploadDir, thumbnails.medium));

    await sharp(filePath)
      .resize(600, 600, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toFile(join(uploadDir, thumbnails.large));

    return thumbnails;
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    return null;
  }
}

// Dizin oluşturma
async function ensureDirectoryExists(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

// [GET] - Medya dosyalarını listele
export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  try {
    // Authentication kontrolü
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [action, ...additionalParams] = params.params;
    const { searchParams } = new URL(request.url);
    
    if (action === 'list') {
      const categoryId = searchParams.get('categoryId');
      const customFolder = searchParams.get('customFolder');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';
      const searchQuery = searchParams.get('search');
      const fileType = searchParams.get('type');

      // Veritabanından medya dosyalarını getir
      const whereClause: any = {};
      
      if (categoryId && categoryId !== 'all') {
        whereClause.categoryId = parseInt(categoryId);
      }
      
      if (customFolder) {
        whereClause.path = { contains: customFolder };
      }
      
      if (searchQuery) {
        whereClause.OR = [
          { originalName: { contains: searchQuery, mode: 'insensitive' } },
          { filename: { contains: searchQuery, mode: 'insensitive' } },
          { alt: { contains: searchQuery, mode: 'insensitive' } }
        ];
      }
      
      if (fileType && fileType !== 'all') {
        whereClause.mimeType = { startsWith: fileType };
      }

      const [mediaFiles, totalCount] = await Promise.all([
        db.media.findMany({
          where: whereClause,
          include: {
            category: {
              select: { id: true, name: true, icon: true }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.media.count({ where: whereClause })
      ]);

      // GalleryFileInfo formatına dönüştür
      const galleryFiles: GalleryFileInfo[] = mediaFiles.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        alt: file.alt || undefined,
        caption: file.caption || undefined,
        mimeType: file.mimeType,
        size: file.size,
        type: getFileType(file.mimeType),
        thumbnailSmall: file.thumbnailSmall || undefined,
        thumbnailMedium: file.thumbnailMedium || undefined,
        thumbnailLarge: file.thumbnailLarge || undefined,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        categoryId: file.categoryId,
        category: file.category
      }));

      const response: GalleryApiResponse = {
        success: true,
        data: galleryFiles,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };

      return NextResponse.json(response);
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Advanced media API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// [DELETE] - Medya dosyasını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  try {
    // Authentication kontrolü
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [action, fileId] = params.params;
    
    if (action === 'delete' && fileId) {
      // Use fileId directly as string since database uses string IDs
      const mediaId = fileId;

      // Veritabanından dosya bilgisini al
      const mediaFile = await db.media.findUnique({
        where: { id: mediaId }
      });

      if (!mediaFile) {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        );
      }

      // Fiziksel dosyayı sil
      try {
        const fullPath = join(process.cwd(), 'public', mediaFile.path);
        if (existsSync(fullPath)) {
          await unlink(fullPath);
        }

        // Thumbnail'ları da sil
        if (mediaFile.thumbnailSmall) {
          const thumbPath = join(process.cwd(), 'public', mediaFile.thumbnailSmall);
          if (existsSync(thumbPath)) await unlink(thumbPath);
        }
        if (mediaFile.thumbnailMedium) {
          const thumbPath = join(process.cwd(), 'public', mediaFile.thumbnailMedium);
          if (existsSync(thumbPath)) await unlink(thumbPath);
        }
        if (mediaFile.thumbnailLarge) {
          const thumbPath = join(process.cwd(), 'public', mediaFile.thumbnailLarge);
          if (existsSync(thumbPath)) await unlink(thumbPath);
        }
      } catch (fileError) {
        console.error('File deletion error:', fileError);
        // Dosya silinmese bile veritabanından kaydı sil
      }

      // Veritabanından kaydı sil
      await db.media.delete({
        where: { id: mediaId }
      });

      const response: DeleteApiResponse = {
        success: true,
        message: 'File deleted successfully'
      };

      return NextResponse.json(response);
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
