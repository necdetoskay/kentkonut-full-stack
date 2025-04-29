import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";

const UPLOADS_DIR = join(process.cwd(), "public", "uploads");

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { fileNames, folderPath } = await request.json();

    if (!Array.isArray(fileNames) || !folderPath) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
    }

    let deletedCount = 0;
    let failedCount = 0;

    for (const fileName of fileNames) {
      try {
        // Güvenlik için dosya adında klasör geçişi engelleniyor
        if (fileName.includes('/') || fileName.includes('\\')) {
          failedCount++;
          continue;
        }
        const filePath = join(UPLOADS_DIR, folderPath, fileName);
        await unlink(filePath);
        deletedCount++;
      } catch (error) {
        console.error(`'${fileName}' dosyası silinirken hata:`, error);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      failedCount,
      message: `${deletedCount} dosya başarıyla silindi. ${failedCount} dosya silinemedi.`
    });
  } catch (error) {
    console.error("Toplu dosya silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
} 