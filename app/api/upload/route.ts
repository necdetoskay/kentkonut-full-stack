import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import mime from 'mime-types';
import prisma from '@/lib/prisma';

// Define the main upload directory
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// Define allowed folders for upload
const ALLOWED_FOLDERS = ['temp', 'corporate', 'homepage', 'banners', 'projeler'];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    // Parse FormData
    const formData = await request.formData();
    
    // Check for target folder
    const targetFolder = formData.get('targetFolder') as string || '';
    
    // Validate target folder if provided
    let uploadPath = UPLOAD_DIR;
    if (targetFolder) {
      // Security check: allow predefined folders and their subfolders
      if (!ALLOWED_FOLDERS.some(folder => targetFolder === folder || targetFolder.startsWith(folder + '/'))) {
        return NextResponse.json({ 
          error: `Invalid target folder. Allowed folders: ${ALLOWED_FOLDERS.join(', ')}` 
        }, { status: 400 });
      }
      
      // Set upload path to include the target folder
      uploadPath = join(UPLOAD_DIR, targetFolder);
    }
    
    // Create upload directory if it doesn't exist
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    // Get all files from the form data using indexed keys (file0, file1, etc.)
    const files: File[] = [];
    
    // Look for files with index-based keys (file0, file1, etc.) or array-style (files[])
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if ((key.startsWith('file') || key === 'files[]' || key === 'files') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      try {
        // Check file size
        if (file.size > 20 * 1024 * 1024) { // 20MB
          throw new Error(`File ${file.name} exceeds the maximum file size of 20MB`);
        }

        // Get file type
        const fileType = file.type;
        
        // Valid image types
        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        // Valid video types
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        
        // Check if the file type is valid
        const isValidImageType = validImageTypes.includes(fileType);
        const isValidVideoType = validVideoTypes.includes(fileType);
        
        if (!isValidImageType && !isValidVideoType) {
          throw new Error(`Invalid file type for ${file.name}: ${fileType}. Allowed types: JPG, PNG, WebP, GIF, MP4, WebM, MOV`);
        }
        
        // Generate a unique filename to prevent overwriting
        const fileExtension = mime.extension(fileType) || path.extname(file.name).slice(1);
        const uniqueFilename = `${uuidv4()}.${fileExtension}`;
        const filePath = join(uploadPath, uniqueFilename);
        
        // Create the URL with correct path
        const urlPath = targetFolder 
          ? `/uploads/${targetFolder}/${uniqueFilename}` 
          : `/uploads/${uniqueFilename}`;
        
        // Process and save the file (no sharp processing)
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        
        // Save the file directly
        await writeFile(filePath, fileBuffer);
        
        // Create a media record in the database
        let width = 0;
        let height = 0;
        
        // Try to extract width and height from image files (optional)
        // For now, we'll just set these to 0 since we're not using sharp

        if (isValidImageType) {
          // Create an image record
          await prisma.$executeRaw`
            INSERT INTO "Media" (
              "id", "url", "filename", "size", "type", "mimeType", "width", "height", "uploadedAt", "lastAccessed", "isReferenced"
            ) VALUES (
              ${uuidv4()}, ${urlPath}, ${uniqueFilename}, ${file.size}, 'image', ${fileType}, 
              ${width}, ${height}, NOW(), NOW(), false
            )
          `;
        } else if (isValidVideoType) {
          // Create a video record
          await prisma.$executeRaw`
            INSERT INTO "Media" (
              "id", "url", "filename", "size", "type", "mimeType", "uploadedAt", "lastAccessed", "isReferenced"
            ) VALUES (
              ${uuidv4()}, ${urlPath}, ${uniqueFilename}, ${file.size}, 'video', ${fileType}, 
              NOW(), NOW(), false
            )
          `;
        }
        
        return urlPath;
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        throw error; // Re-throw to be caught by the outer handler
      }
    });
    
    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      return NextResponse.json({ urls: uploadedUrls });
    } catch (error) {
      console.error('Error during batch file processing:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Error during file uploads'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error uploading files'
    }, { status: 500 });
  }
} 