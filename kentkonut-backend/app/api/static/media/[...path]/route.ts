import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import mime from 'mime-types';

const readFile = promisify(fs.readFile);

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const filePathParts = params.path;
    if (!filePathParts || filePathParts.length === 0) {
      return new NextResponse('File path is required', { status: 400 });
    }

    // IMPORTANT: Prevent directory traversal attacks
    const requestedPath = path.join(...filePathParts);
    const publicDir = path.join(process.cwd(), 'public');
    const absoluteFilePath = path.join(publicDir, requestedPath);

    // Check if the resolved path is still within the public directory
    if (!absoluteFilePath.startsWith(publicDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if file exists
    if (!fs.existsSync(absoluteFilePath)) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Read file and determine content type
    const fileBuffer = await readFile(absoluteFilePath);
    const contentType = mime.lookup(absoluteFilePath) || 'application/octet-stream';

    // Return file content
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('[Media GET Handler] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
