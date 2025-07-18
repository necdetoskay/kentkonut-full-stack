import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Haberler dizinini kontrol et ve oluştur
    const uploadDir = join(process.cwd(), 'public', 'haberler');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Dosya adını oluştur (timestamp_originalname)
    const timestamp = Date.now();
    const originalName = file.name;
    const fileName = `${timestamp}_${originalName}`;
    const filePath = join(uploadDir, fileName);

    // Dosyayı kaydet
    await writeFile(filePath, buffer);
    console.log('✅ [UPLOAD_DEBUG] File saved successfully:', filePath);

    // URL'yi oluştur
    const fileUrl = `/haberler/${fileName}`;
    console.log('✅ [UPLOAD_DEBUG] File URL:', fileUrl);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: fileName
    });

  } catch (error) {
    console.error('❌ [UPLOAD_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 