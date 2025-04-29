import { NextResponse } from "next/server"
import { readdir, stat } from "fs/promises"
import { join } from "path"
import path from "path"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Medya dosyalarının saklandığı klasör
const UPLOADS_DIR = join(process.cwd(), "public", "uploads")

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // URL parametrelerini al
    const url = new URL(request.url);
    const onlyReferenced = url.searchParams.get('onlyReferenced') === 'true';
    const onlyUnreferenced = url.searchParams.get('onlyUnreferenced') === 'true';

    try {
      // Veritabanından Media kayıtlarını al
      const dbMediaFiles = await prisma.media.findMany({
        orderBy: { uploadedAt: 'desc' }
      });
      
      // Dosya sistemindeki dosyaları oku
      if (!UPLOADS_DIR) {
        return NextResponse.json([]);
      }

      const files = await readdir(UPLOADS_DIR);
      
      // Dosya bilgilerini topla
      const mediaPromises = files.map(async (filename) => {
        try {
          const filePath = join(UPLOADS_DIR, filename);
          const fileStats = await stat(filePath);
          
          // Dosya tipini belirle
          const isImage = /\.(jpe?g|png|gif|webp)$/i.test(filename);
          const isVideo = /\.(mp4|webm|mov)$/i.test(filename);
          const type = isImage ? "image" : isVideo ? "video" : "other";
          
          // URL oluştur
          const url = `/uploads/${filename}`;
          
          // Veritabanında ilgili kaydı bul
          const dbFile = dbMediaFiles.find(dbFile => {
            return dbFile.url === url || dbFile.filename === filename;
          });
          
          // İlişkili olup olmadığını belirle
          const isReferenced = dbFile?.isReferenced || false;
          
          // Filtreleme kontrolü
          if ((onlyReferenced && !isReferenced) || (onlyUnreferenced && isReferenced)) {
            return null; // Filtre kriterlerine uymayan dosyaları çıkar
          }
          
          // Dosya bilgilerini döndür
          return {
            id: dbFile?.id || filename.replace(/\.[^/.]+$/, ""), // DB'de varsa ID'sini kullan
            url,
            filename,
            type,
            size: fileStats.size,
            uploadDate: dbFile?.uploadedAt.toISOString() || fileStats.mtime.toISOString(),
            isReferenced: isReferenced,
            referencedBy: dbFile?.references || []
          };
        } catch (error) {
          console.error(`Error processing file ${filename}:`, error);
          return null;
        }
      });
      
      const mediaFiles = (await Promise.all(mediaPromises)).filter(Boolean);
      return NextResponse.json(mediaFiles);
    } catch (error) {
      console.error("Error reading media files:", error);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Media library error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Fiziksel dosyalar ile veritabanı kayıtlarını senkronize et
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Sadece admin kullanıcıların senkronizasyon yapabilmesini sağla
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    
    if (user?.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Uploads klasöründeki tüm dosyaları oku
    const files = await readdir(UPLOADS_DIR)
    
    // Her dosya için veritabanında kayıt oluştur veya güncelle
    let added = 0;
    let updated = 0;
    
    for (const filename of files) {
      const filePath = join(UPLOADS_DIR, filename);
      const fileStats = await stat(filePath);
      
      // Dosya tipini belirle
      const isImage = /\.(jpe?g|png|gif|webp)$/i.test(filename);
      const isVideo = /\.(mp4|webm|mov)$/i.test(filename);
      const type = isImage ? "image" : isVideo ? "video" : "other";
      
      // URL oluştur
      const url = `/uploads/${filename}`;
      
      // Dosyanın veritabanında kaydı var mı kontrol et
      const existingMedia = await prisma.media.findFirst({
        where: { OR: [{ url }, { filename }] }
      });
      
      if (existingMedia) {
        // Mevcut kaydı güncelle
        await prisma.media.update({
          where: { id: existingMedia.id },
          data: {
            size: fileStats.size,
            lastAccessed: new Date()
          }
        });
        updated++;
      } else {
        // Yeni kayıt oluştur
        await prisma.media.create({
          data: {
            url,
            filename,
            size: fileStats.size,
            type,
            uploadedAt: fileStats.mtime,
            lastAccessed: new Date(),
            isReferenced: false,
            references: []
          }
        });
        added++;
      }
    }
    
    return NextResponse.json({
      success: true,
      fileCount: files.length,
      added,
      updated,
      message: "Medya dosyaları veritabanı ile senkronize edildi"
    })
    
  } catch (error) {
    console.error("Media sync error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 