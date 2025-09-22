import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UploadApiResponse } from '@/types/advanced-uploader';

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
function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (mimeType === 'application/pdf') return 'documents';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'documents';
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

    const baseNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const thumbnails = {
      small: `thumb_small_${baseNameWithoutExt}.jpg`,
      medium: `thumb_medium_${baseNameWithoutExt}.jpg`,
      large: `thumb_large_${baseNameWithoutExt}.jpg`
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

    return {
      small: `/uploads/${getFileType('image/jpeg')}/${thumbnails.small}`,
      medium: `/uploads/${getFileType('image/jpeg')}/${thumbnails.medium}`,
      large: `/uploads/${getFileType('image/jpeg')}/${thumbnails.large}`
    };
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

// [POST] - Dosya yükleme
export async function POST(request: NextRequest) {
  try {
    // Authentication kontrolü
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const categoryId = formData.get('categoryId') as string;
    const customFolder = formData.get('customFolder') as string;
    const alt = formData.get('alt') as string;
    const caption = formData.get('caption') as string;

    // Dosya kontrolleri
    if (!file) {
      return NextResponse.json({ success: false, error: 'Dosya yüklenemedi' }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Desteklenmeyen dosya formatı' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu çok büyük (maksimum 20 MB)' },
        { status: 400 }
      );
    }

    // Kategori kontrolü ve varsayılan kategori
    let finalCategoryId = categoryId ? parseInt(categoryId) : null;
    
    if (!finalCategoryId) {
      // Varsayılan kategoriyi bul veya oluştur
      let defaultCategory = await db.mediaCategory.findFirst({
        where: { name: 'Genel' }
      });
      
      if (!defaultCategory) {
        defaultCategory = await db.mediaCategory.create({
          data: {
            name: 'Genel',
            icon: 'folder',
            order: 0,
            isBuiltIn: true
          }
        });
      }
      
      finalCategoryId = defaultCategory.id;
    }

    // Dosya adı ve yol oluşturma
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const fileType = getFileType(file.type);
    
    // Upload dizini belirleme
    let uploadPath: string;
    if (customFolder) {
      uploadPath = join('uploads', customFolder);
    } else {
      uploadPath = join('uploads', fileType);
    }
    
    const uploadDir = join(process.cwd(), 'public', uploadPath);
    await ensureDirectoryExists(uploadDir);

    // Dosyayı kaydet
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    // URL oluştur
    const fileUrl = `/${uploadPath}/${uniqueFileName}`.replace(/\\/g, '/');

    // Thumbnail oluştur (sadece resimler için)
    let thumbnailUrls = null;
    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      thumbnailUrls = await generateThumbnails(filePath, uniqueFileName, uploadDir);
    }

    // Determine media type
    let mediaType: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED' = 'IMAGE';
    if (file.type.startsWith('video/')) {
      mediaType = 'VIDEO';
    } else if (file.type === 'application/pdf') {
      mediaType = 'PDF';
    } else if (file.type.includes('word') || file.type.includes('document')) {
      mediaType = 'WORD';
    }

    // Veritabanına kaydet
    const mediaFile = await db.media.create({
      data: {
        filename: uniqueFileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filePath.replace(process.cwd(), '').replace(/\\/g, '/'),
        url: fileUrl,
        type: mediaType,
        alt: alt || null,
        caption: caption || null,
        categoryId: finalCategoryId,
        uploadedBy: session.user.id,
        ...(thumbnailUrls && {
          thumbnailSmall: thumbnailUrls.small,
          thumbnailMedium: thumbnailUrls.medium,
          thumbnailLarge: thumbnailUrls.large,
        }),
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true }
        }
      }
    });

    console.log('✅ [ADVANCED_UPLOAD] File uploaded successfully:', {
      id: mediaFile.id,
      filename: mediaFile.filename,
      url: mediaFile.url,
      categoryId: mediaFile.categoryId,
      categoryName: mediaFile.category?.name
    });

    const response: UploadApiResponse = {
      success: true,
      data: mediaFile,
      message: 'Dosya başarıyla yüklendi'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [ADVANCED_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Dosya yükleme hatası' },
      { status: 500 }
    );
  }
}
