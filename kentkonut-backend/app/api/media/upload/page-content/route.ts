import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Sadece resim dosyaları kabul edilir' },
        { status: 400 }
      );
    }

    // Dosya boyutunu kontrol et (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu 5MB\'dan büyük olamaz' },
        { status: 400 }
      );
    }

    // Sayfa içeriği kategorisini bul veya oluştur
    let pageContentCategory = await prisma.mediaCategory.findFirst({
      where: { name: 'Sayfa İçerikleri' }
    });    if (!pageContentCategory) {
      pageContentCategory = await prisma.mediaCategory.create({
        data: {
          name: 'Sayfa İçerikleri',
          icon: 'FileText',
          order: 10,
          isBuiltIn: true
        }
      });
    }

    // Dosya uzantısını al
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `page-content-${timestamp}-${randomString}.${fileExtension}`;

    // Upload klasörünü oluştur
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'page-content');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.log('Directory already exists or created');
    }

    // Dosyayı kaydet
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Determine media type based on MIME type
    let mediaType: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED' = 'IMAGE';
    if (file.type.startsWith('video/')) {
      mediaType = 'VIDEO';
    } else if (file.type === 'application/pdf') {
      mediaType = 'PDF';
    } else if (file.type.includes('word') || file.type.includes('document')) {
      mediaType = 'WORD';
    }

    // Veritabanına kaydet
    const fileUrl = `/uploads/page-content/${fileName}`;
    const media = await prisma.media.create({
      data: {
        filename: fileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filePath,
        url: fileUrl,
        type: mediaType,
        alt: alt || '',
        categoryId: pageContentCategory.id
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: media.id,
        url: fileUrl,
        filename: fileName,
        alt: alt || '',
        size: file.size
      }
    });

  } catch (error) {
    console.error('Page content image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Dosya yükleme sırasında hata oluştu' },
      { status: 500 }
    );
  }
}
