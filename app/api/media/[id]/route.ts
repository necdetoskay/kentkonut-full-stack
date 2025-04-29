import { NextResponse } from "next/server"
import { unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Medya dosyalarının saklandığı klasör
const UPLOADS_DIR = join(process.cwd(), "public", "uploads")

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "No file ID provided" }, { status: 400 })
    }

    // Dosya adını bul (muhtemelen id bir dosya adıdır veya dosya adının bir parçasıdır)
    const filename = id
    
    // Desteklenen uzantıları kontrol et
    const possibleExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov']
    
    // İlk önce tam id ile eşleşen dosyayı bulmayı dene
    let filePath = join(UPLOADS_DIR, filename)
    
    // Eğer tam ID yoksa, uzantıları ekleyerek dene
    if (!existsSync(filePath)) {
      for (const ext of possibleExtensions) {
        const testPath = join(UPLOADS_DIR, `${filename}${ext}`)
        if (existsSync(testPath)) {
          filePath = testPath
          break
        }
      }
    }
    
    // Dosya bulunamadıysa hata ver
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
    
    // Dosyayı sil
    try {
      await unlink(filePath)
      return NextResponse.json({ success: true, message: "File deleted successfully" })
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error)
      return NextResponse.json({ 
        error: `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Delete media error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    }, { status: 500 })
  }
} 