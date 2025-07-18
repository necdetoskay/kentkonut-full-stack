import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Desteklenen dosya tipleri
const ALLOWED_FILE_TYPES = [
  // Resimler
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  // Videolar
  "video/mp4", "video/webm", "video/ogg",
  // Dökümanlar
  "application/pdf", 
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain"
];

// Maksimum dosya boyutu (20 MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Dosya kontrolleri
    if (!file) {
      return NextResponse.json({ error: "Dosya yüklenemedi" }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya formatı" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu çok büyük (maksimum 20 MB)" },
        { status: 400 }
      );
    }

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

    // Hangi klasöre kaydedeceğimizi belirle
    let fileType = "other";
    if (file.type.startsWith("image/")) fileType = "images";
    else if (file.type.startsWith("video/")) fileType = "videos";
    else if (
      file.type.startsWith("application/") || 
      file.type.startsWith("text/")
    ) fileType = "documents";

    // Dizin yolunu oluştur
    const directory = path.join(process.cwd(), "public", "uploads", fileType);
    await mkdir(directory, { recursive: true });

    // Dosyayı kaydet
    const filePath = path.join(directory, fileName);
    await writeFile(filePath, buffer);

    // URL yolunu oluştur
    const fileUrl = `/uploads/${fileType}/${fileName}`;

    // Başarılı yanıt döndür
    return NextResponse.json({
      fileUrl,
      fileName,
      fileType: file.type,
      fileSize: file.size
    });
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    return NextResponse.json(
      { error: "Dosya yükleme hatası" },
      { status: 500 }
    );
  }
}
