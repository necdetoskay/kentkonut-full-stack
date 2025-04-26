import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import path from "path"
import fs from "fs/promises"
import sharp from "sharp"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return new NextResponse("Banner group ID is required", { status: 400 })
    }

    // Banner grubunu al
    const bannerGroup = await db.bannerGroup.findUnique({
      where: { id: parseInt(id) },
      include: { banners: true }
    })

    if (!bannerGroup) {
      return new NextResponse("Banner group not found", { status: 404 })
    }

    const width = bannerGroup.width
    const height = bannerGroup.height
    const banners = bannerGroup.banners

    // Her banner için yeniden boyutlandırma işlemi
    const results = []
    for (const banner of banners) {
      try {
        // Banner'ın mevcut görselini al
        const imageUrl = banner.imageUrl
        if (!imageUrl) continue

        // Dosya yolunu oluştur
        const filePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""))
        
        // Dosyanın varlığını kontrol et
        try {
          await fs.access(filePath)
        } catch (error) {
          console.error(`File not found: ${filePath}`)
          results.push({ id: banner.id, success: false, error: "File not found" })
          continue
        }

        // Dosyayı oku
        const imageBuffer = await fs.readFile(filePath)
        
        // Yeni dosya adı oluştur (orijinali korumak için)
        const fileDir = path.dirname(filePath)
        const fileExt = path.extname(filePath)
        const fileName = path.basename(filePath, fileExt)
        const newFileName = `${fileName}-resized-${Date.now()}${fileExt}`
        const newFilePath = path.join(fileDir, newFileName)
        
        // Görüntüyü yeniden boyutlandır
        const resizedBuffer = await sharp(imageBuffer)
          .resize({
            width,
            height,
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .toBuffer()
        
        // Yeni dosyayı kaydet
        await fs.writeFile(newFilePath, resizedBuffer)
        
        // Veritabanında güncelle
        const newImageUrl = `/${path.relative(path.join(process.cwd(), "public"), newFilePath).replace(/\\/g, '/')}`
        await db.banner.update({
          where: { id: banner.id },
          data: { 
            imageUrl: newImageUrl,
            active: true  // Banner'ı yeniden boyutlandırıldıktan sonra aktif ediyoruz
          }
        })
        
        results.push({ id: banner.id, success: true, newImageUrl })
      } catch (error) {
        console.error(`Error processing banner ${banner.id}:`, error)
        results.push({ id: banner.id, success: false, error: "Image processing error" })
      }
    }

    return NextResponse.json({
      message: "Banners resizing completed",
      groupId: bannerGroup.id,
      totalBanners: banners.length,
      results
    })
  } catch (error) {
    console.error("[RESIZE_BANNERS]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 