import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Desteklenen dosya tipleri
const ALLOWED_FILE_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
];

// Maksimum dosya boyutu (10 MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// İçerik görselleri için kategori ID (APİ ilk kullanımda oluşturacak)
let CONTENT_IMAGES_CATEGORY_ID: number;

export async function POST(request: NextRequest) {
  try {    // Oturum kontrolü
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const contentId = formData.get("contentId") as string;

    // Dosya kontrolleri
    if (!file) {
      return NextResponse.json({ error: "Dosya yüklenemedi" }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya formatı. Sadece resim dosyaları kabul edilmektedir." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu çok büyük (maksimum 10 MB)" },
        { status: 400 }
      );
    }    // İçerik görselleri kategorisini kontrol et veya oluştur
    let contentImagesCategory = await db.mediaCategory.findFirst({
      where: {
        name: "İçerik Görselleri",
        isBuiltIn: true
      }
    });

    if (!contentImagesCategory) {
      contentImagesCategory = await db.mediaCategory.create({
        data: {
          name: "İçerik Görselleri",
          icon: "image", // Need to provide required fields
          order: 999, // High order number to be at the bottom of the list
          isBuiltIn: true // This makes it protected
        }
      });
    }

    CONTENT_IMAGES_CATEGORY_ID = contentImagesCategory.id;

    // Dosya ismini ve kaydetme yolunu oluştur
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = uuidv4();
    const originalExt = path.extname(file.name);
    const originalName = path.basename(file.name, originalExt);
    const sanitizedName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const fileName = `${sanitizedName}-${uniqueId}${originalExt}`;

    // İçerik görselleri için özel dizin
    const fileType = "content-images";
    const directory = path.join(process.cwd(), "public", "uploads", fileType);
    await mkdir(directory, { recursive: true });

    // Dosyayı kaydet
    const filePath = path.join(directory, fileName);
    await writeFile(filePath, buffer);

    // URL yolunu oluştur
    const fileUrl = `/uploads/${fileType}/${fileName}`;

    // Determine media type based on MIME type
    let mediaType: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED' = 'IMAGE';
    if (file.type.startsWith('video/')) {
      mediaType = 'VIDEO';
    } else if (file.type === 'application/pdf') {
      mediaType = 'PDF';
    } else if (file.type.includes('word') || file.type.includes('document')) {
      mediaType = 'WORD';
    }

    // Medya veritabanına kaydet
    const media = await db.media.create({
      data: {
        filename: fileName,
        originalName: file.name,
        path: filePath,
        url: fileUrl,
        mimeType: file.type,
        size: file.size,
        type: mediaType,
        alt: `${sanitizedName} görsel`,
        categoryId: contentImagesCategory.id
      }
    });

    // TODO: Update with URL after Prisma client regenerates
    // const updatedMedia = await db.media.update({
    //   where: { id: media.id },
    //   data: { url: fileUrl }
    // });

    // Başarılı yanıt döndür
    return NextResponse.json({
      id: media.id,
      fileUrl: fileUrl, // Frontend için URL
      fileName: media.filename,
      fileType: media.mimeType,
      fileSize: media.size
    });
  } catch (error) {
    console.error("İçerik görsel yükleme hatası:", error);
    return NextResponse.json(
      { error: "Görsel yükleme hatası" },
      { status: 500 }
    );
  }
}
