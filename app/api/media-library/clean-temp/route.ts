import { NextResponse } from "next/server"
import { readdir, unlink, stat } from "fs/promises"
import { join } from "path"
import { auth } from "@/lib/auth"

// Temp klasörünün yolu
const TEMP_DIR = join(process.cwd(), "public", "uploads", "temp")

export async function POST(request: Request) {
  try {
    // Kimlik doğrulama
    const session = await auth()
    if (!session) {
      return new NextResponse("Yetkisiz erişim", { status: 401 })
    }
    
    // İsteğin gövdesinden silme parametrelerini al
    const body = await request.json().catch(() => ({}))
    const { fileNames } = body
    
    // Belirli dosyalar mı yoksa tüm klasör mü temizlenecek?
    if (Array.isArray(fileNames) && fileNames.length > 0) {
      // Belirli dosyaları sil
      let deletedCount = 0
      let failedCount = 0
      
      for (const fileName of fileNames) {
        try {
          // Dosya adında klasör yolu kontrolü (güvenlik için)
          if (fileName.includes('/') || fileName.includes('\\')) {
            failedCount++
            continue
          }
          
          const filePath = join(TEMP_DIR, fileName)
          await unlink(filePath)
          deletedCount++
        } catch (error) {
          console.error(`'${fileName}' dosyası silinirken hata:`, error)
          failedCount++
        }
      }
      
      return NextResponse.json({
        success: true,
        deletedCount,
        failedCount,
        message: `${deletedCount} dosya başarıyla silindi. ${failedCount} dosya silinemedi.`
      })
    } else {
      // Tüm klasörü temizle
      const files = await readdir(TEMP_DIR)
      let deletedCount = 0
      let failedCount = 0
      
      for (const file of files) {
        try {
          const filePath = join(TEMP_DIR, file)
          const fileStat = await stat(filePath)
          
          // Klasörleri değil, sadece dosyaları sil
          if (fileStat.isFile()) {
            await unlink(filePath)
            deletedCount++
          }
        } catch (error) {
          console.error(`'${file}' dosyası silinirken hata:`, error)
          failedCount++
        }
      }
      
      return NextResponse.json({
        success: true,
        deletedCount,
        failedCount,
        message: `Geçici klasör temizlendi. ${deletedCount} dosya silindi. ${failedCount} dosya silinemedi.`
      })
    }
  } catch (error) {
    console.error("Temp klasörü temizleme hatası:", error)
    return new NextResponse("Sunucu hatası", { status: 500 })
  }
} 