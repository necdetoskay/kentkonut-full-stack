import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
// Import sharp koşullu olarak yapılacak
import { auth } from "@/lib/auth"
import sharp from "sharp"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const width = parseInt(formData.get("width") as string)
    const height = parseInt(formData.get("height") as string)
    const groupId = formData.get("groupId") as string

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 })
    }

    if (!width || !height) {
      return new NextResponse("Width and height are required", { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Dosya adını oluştur
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const filename = `banner-${uniqueSuffix}.${fileExtension}`
    
    // Resmi belirtilen ölçülere uygun olarak yeniden boyutlandır
    const resizedBuffer = await sharp(buffer)
      .resize({
        width: width,
        height: height,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer()

    // Resmi public/uploads klasörüne kaydet
    const uploadDir = join(process.cwd(), "public", "uploads")
    await writeFile(join(uploadDir, filename), resizedBuffer)

    // Resim URL'ini döndür
    const imageUrl = `/uploads/${filename}`
    return NextResponse.json({ url: imageUrl })

  } catch (error) {
    console.error("Upload error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 