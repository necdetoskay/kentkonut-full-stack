import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Dosya adını oluştur
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const filename = `banner-${uniqueSuffix}.${fileExtension}`

    // Resmi public/banners klasörüne kaydet
    const uploadDir = join(process.cwd(), "public", "banners")
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)

    // Resim URL'ini döndür (banners altında servis edilecek)
    const imageUrl = `/banners/${filename}`
    return NextResponse.json({ url: imageUrl })

  } catch (error) {
    console.error("Upload error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}