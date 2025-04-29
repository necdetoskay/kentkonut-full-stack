import { NextResponse } from "next/server"
import { readdir, stat } from "fs/promises"
import { join, extname } from "path"
import { auth } from "@/lib/auth"

// Medya dosyalarının saklandığı ana klasör
const UPLOADS_DIR = join(process.cwd(), "public", "uploads")

// Dosya boyutunu okunabilir formatta döndürme
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

// Resim dosyası kontrolü
function isImageFile(filename: string): boolean {
  const ext = extname(filename).toLowerCase()
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext)
}

// Video dosyası kontrolü
function isVideoFile(filename: string): boolean {
  const ext = extname(filename).toLowerCase()
  return ['.mp4', '.webm', '.mov', '.avi', '.mkv'].includes(ext)
}

// Klasör yapısını özyinelemeli olarak oku
async function readFolderStructure(folderPath: string, relativePath: string = ''): Promise<any> {
  try {
    const entries = await readdir(folderPath, { withFileTypes: true })
    
    // Klasör bilgilerini tutacağız
    let totalSize = 0
    let fileCount = 0
    const files = []
    const subFolders = []
    
    // Dosyaları ve klasörleri işle
    for (const entry of entries) {
      const entryPath = join(folderPath, entry.name)
      const entryStats = await stat(entryPath)
      
      if (entry.isDirectory()) {
        // Alt klasör ise özyinelemeli olarak oku
        const subFolder = await readFolderStructure(entryPath, join(relativePath, entry.name))
        subFolders.push(subFolder)
        
        // Alt klasörün boyutunu ve dosya sayısını ana klasöre ekle
        totalSize += subFolder.sizeBytes
        fileCount += subFolder.fileCount
      } else {
        // Dosya ise bilgilerini al
        const fileType = isImageFile(entry.name) 
          ? 'image' 
          : isVideoFile(entry.name) 
            ? 'video' 
            : 'other'
        
        const fileInfo = {
          name: entry.name,
          path: join(relativePath, entry.name),
          url: `/uploads/${join(relativePath, entry.name).replace(/\\/g, '/')}`,
          size: entryStats.size,
          sizeFormatted: formatFileSize(entryStats.size),
          type: fileType,
          modifiedAt: entryStats.mtime
        }
        
        files.push(fileInfo)
        totalSize += entryStats.size
        fileCount += 1
      }
    }
    
    // Klasör bilgilerini döndür
    return {
      name: relativePath ? relativePath.split(/[/\\\\]/).pop() : 'uploads',
      path: relativePath || '',
      files,
      subFolders,
      sizeBytes: totalSize,
      size: formatFileSize(totalSize),
      fileCount,
      modifiedAt: new Date()
    }
  } catch (error) {
    console.error(`Error reading folder structure for ${folderPath}:`, error)
    return {
      name: relativePath ? relativePath.split(/[/\\\\]/).pop() : 'uploads',
      path: relativePath || '',
      files: [],
      subFolders: [],
      sizeBytes: 0,
      size: '0 B',
      fileCount: 0,
      error: 'Klasör okunamadı'
    }
  }
}

export async function GET(request: Request) {
  try {
    // Kimlik doğrulama
    const session = await auth()
    if (!session) {
      return new NextResponse("Yetkisiz erişim", { status: 401 })
    }
    
    // URL parametrelerini al
    const url = new URL(request.url)
    const folderPath = url.searchParams.get('path') || ''
    
    // Tam klasör yolunu oluştur
    const fullPath = join(UPLOADS_DIR, folderPath)
    
    // Klasör yapısını oku
    const structure = await readFolderStructure(fullPath, folderPath)
    
    return NextResponse.json(structure)
  } catch (error) {
    console.error("Medya klasör yapısı okuma hatası:", error)
    return new NextResponse("Sunucu hatası", { status: 500 })
  }
} 