import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { auth } from "@/lib/auth"
import { v4 as uuidv4 } from 'uuid'

// Banner dosyalarının saklanacağı ana klasör
const UPLOADS_DIR = join(process.cwd(), "public", "uploads")
const BANNERS_DIR = join(UPLOADS_DIR, "banners")

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Banner klasörünün var olduğundan emin ol
    if (!existsSync(BANNERS_DIR)) {
      await mkdir(BANNERS_DIR, { recursive: true })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const urls = []

    for (const file of files) {
      // Dosya içeriğini al
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Dosya uzantısını al
      const fileExtension = file.name.split('.').pop() || 'jpg'
      
      // Benzersiz dosya adı oluştur
      const uniqueFilename = `banner-${uuidv4()}.${fileExtension}`
      const filePath = join(BANNERS_DIR, uniqueFilename)
      
      // Dosyayı kaydet
      await writeFile(filePath, buffer)
      
      // URL oluştur ve URL listesine ekle
      const url = `/uploads/banners/${uniqueFilename}`
      urls.push(url)
    }

    // Başarılı yanıt döndür
    return NextResponse.json({ 
      success: true, 
      urls,
      message: `${urls.length} dosya başarıyla yüklendi`
    })

  } catch (error) {
    console.error("Banner upload error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: `Banner upload failed: ${errorMessage}` }, { status: 500 })
  }
} 