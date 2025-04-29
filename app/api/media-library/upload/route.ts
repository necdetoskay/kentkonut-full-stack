import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');
    const targetFolder = formData.get('targetFolder') as string;
    
    // Boyut bilgilerini al (loglamak için)
    let dimensions = null;
    const dimensionsStr = formData.get('dimensions');
    if (dimensionsStr && typeof dimensionsStr === 'string') {
      try {
        dimensions = JSON.parse(dimensionsStr);
        console.log(`Clienttan gelen boyutlar: ${dimensions.width}x${dimensions.height}`);
      } catch (e) {
        console.error('Dimensions parsing error:', e);
      }
    }

    if (!files?.length) {
      return NextResponse.json(
        { error: "No files received." },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), 'public/uploads', targetFolder);

    // Klasör yoksa oluştur
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const savedFiles = await Promise.all(
      files.map(async (file: any) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Dosya boyutu (debugging için)
        console.log(`Dosya boyutu: ${buffer.length} bytes`);

        // Dosya adını temizle ve benzersiz yap
        const originalName = file.name;
        const timestamp = Date.now();
        
        // Dosya adından boyut bilgisini çıkar (varsa)
        const sizeMatch = originalName.match(/(\d+)x(\d+)/);
        if (sizeMatch && sizeMatch.length === 3) {
          const width = parseInt(sizeMatch[1], 10);
          const height = parseInt(sizeMatch[2], 10);
          console.log(`Dosya adı boyut bilgisi: ${width}x${height}`);
        }
        
        const cleanName = originalName.toLowerCase().replace(/[^a-z0-9.]/g, '-');
        const uniqueName = `${timestamp}-${cleanName}`;
        const filePath = join(uploadDir, uniqueName);

        // Dosyayı kaydet
        await writeFile(filePath, buffer);
        
        // URL'i oluştur
        const fileUrl = `/uploads/${targetFolder}/${uniqueName}`;

        return {
          originalName,
          savedName: uniqueName,
          url: fileUrl,
          size: buffer.length,
          requestedDimensions: dimensions
        };
      })
    );

    return NextResponse.json({ 
      message: "Files uploaded successfully", 
      files: savedFiles 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: "Error uploading files" },
      { status: 500 }
    );
  }
} 