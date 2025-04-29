import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v4 as uuidv4 } from 'uuid';
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { base64Image, targetFolder, dimensions, originalFilename, outputScale } = body;

    if (!base64Image) {
      return NextResponse.json(
        { error: "No image data received" },
        { status: 400 }
      );
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public/uploads', targetFolder || '');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Extract base64 data
    const [header, base64Data] = base64Image.split(',');
    const mimeType = header.match(/data:(.*?);/)?.[1] || 'image/png';
    
    // Determine file extension
    const fileExtension = mimeType.split('/')[1] || 'png';
    
    // Generate unique filename
    const filename = originalFilename 
      ? `${originalFilename.split('.')[0]}-${uuidv4().slice(0, 8)}.${fileExtension}`
      : `image-${uuidv4()}.${fileExtension}`;
    
    const filePath = join(uploadDir, filename);
    const urlPath = `/uploads/${targetFolder ? `${targetFolder}/` : ''}${filename}`;
    
    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Write the file to disk
    await writeFile(filePath, buffer);
    
    // Create a database record
    const { width, height } = dimensions || { width: 0, height: 0 };
    
    // Store scale information in metadata for future reference
    const metadataInfo = {
      outputScale: outputScale || 100,
      originalWidth: width,
      originalHeight: height
    };
    
    // Log metadata for debugging
    console.log("Image metadata:", metadataInfo);
    
    await prisma.media.create({
      data: {
        id: uuidv4(),
        url: urlPath,
        filename,
        size: buffer.length,
        type: 'image',
        mimeType,
        width: width || 0,
        height: height || 0,
        uploadedAt: new Date(),
        lastAccessed: new Date(),
        isReferenced: false,
        references: []
      }
    });
    
    return NextResponse.json({
      success: true,
      url: urlPath,
      filename,
      dimensions: { width, height },
      outputScale: outputScale || 100,
      size: buffer.length
    });
    
  } catch (error) {
    console.error("Base64 upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
} 