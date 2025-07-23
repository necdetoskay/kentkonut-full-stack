import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface LocalVideoReferenceRequest {
  localFileId: number;
  categoryId: number;
  customFolder?: string;
  metadata?: {
    title?: string;
    description?: string;
    alt?: string;
    caption?: string;
  };
}

interface LocalVideoReferenceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: LocalVideoReferenceRequest = await req.json();
    const { localFileId, categoryId, customFolder, metadata } = body;

    if (!localFileId) {
      return NextResponse.json(
        { success: false, error: 'Local file ID is required' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Verify the local file exists and is a video
    const localFile = await db.media.findUnique({
      where: { id: localFileId.toString() },
      include: { category: true }
    });

    if (!localFile) {
      return NextResponse.json(
        { success: false, error: 'Local file not found' },
        { status: 404 }
      );
    }

    if (!localFile.mimeType.startsWith('video/')) {
      return NextResponse.json(
        { success: false, error: 'Selected file is not a video' },
        { status: 400 }
      );
    }

    // Verify target category exists
    const targetCategory = await db.mediaCategory.findUnique({
      where: { id: categoryId }
    });

    if (!targetCategory) {
      return NextResponse.json(
        { success: false, error: 'Target category not found' },
        { status: 404 }
      );
    }

    // Create a reference entry for the local video in the target category
    // This allows the same video file to be "used" in multiple categories
    const timestamp = Date.now();
    const referenceFilename = `local-video-ref-${localFileId}-${timestamp}.json`;
    
    // Determine file path for the reference
    let referencePath: string;
    if (customFolder) {
      referencePath = `${customFolder}/${referenceFilename}`;
    } else {
      // Use category-based path
      const categoryPaths: { [key: number]: string } = {
        1: 'bannerlar',      // Bannerlar
        2: 'haberler',       // Haberler
        3: 'projeler',       // Projeler
        4: 'birimler',       // Birimler
        5: 'sayfa',          // İçerik Resimleri (Pages)
        6: 'kurumsal',       // Kurumsal
      };
      const categoryPath = categoryPaths[categoryId] || 'genel';
      referencePath = `media/${categoryPath}/${referenceFilename}`;
    }

    // Create URL for the reference
    const referenceUrl = `/${referencePath}`;

    // Prepare metadata for the reference
    const referenceMetadata = {
      type: 'local-video-reference',
      originalFileId: localFileId,
      originalUrl: localFile.url,
      originalFilename: localFile.filename,
      originalMimeType: localFile.mimeType,
      originalSize: localFile.size,
      originalCategory: localFile.category?.name,
      referencedAt: new Date().toISOString(),
      // Include any additional metadata
      ...metadata
    };

    try {
      // Save the reference to database
      const savedReference = await db.media.create({
        data: {
          filename: referenceFilename,
          originalName: metadata?.title || `${localFile.originalName} (Reference)`,
          mimeType: 'application/json', // Special MIME type for references
          size: JSON.stringify(referenceMetadata).length,
          url: referenceUrl,
          alt: metadata?.alt || localFile.alt || '',
          caption: metadata?.caption || localFile.caption || '',
          categoryId: categoryId,
          metadata: referenceMetadata
        }
      });

      // Return success response
      const response = {
        success: true,
        data: {
          id: savedReference.id,
          filename: savedReference.filename,
          originalName: savedReference.originalName,
          url: savedReference.url,
          mimeType: savedReference.mimeType,
          size: savedReference.size,
          alt: savedReference.alt,
          caption: savedReference.caption,
          categoryId: savedReference.categoryId,
          metadata: savedReference.metadata,
          createdAt: savedReference.createdAt,
          updatedAt: savedReference.updatedAt,
          // Additional reference-specific data
          referenceData: {
            type: 'local-video-reference',
            originalFile: {
              id: localFile.id,
              filename: localFile.filename,
              originalName: localFile.originalName,
              url: localFile.url,
              mimeType: localFile.mimeType,
              size: localFile.size,
              category: localFile.category?.name
            }
          }
        }
      };

      console.log('Local video reference created successfully:', {
        referenceId: savedReference.id,
        originalFileId: localFileId,
        targetCategoryId: categoryId
      });

      return NextResponse.json(response);

    } catch (dbError) {
      console.error('Database error creating local video reference:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to create video reference' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Local video reference creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get local video references from database
    const localVideoReferences = await db.media.findMany({
      where: {
        mimeType: 'application/json',
        filename: {
          startsWith: 'local-video-ref-'
        }
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      message: 'Local video reference endpoint is working',
      localVideoReferences: localVideoReferences.map(ref => ({
        id: ref.id,
        title: ref.originalName,
        originalFileId: ref.metadata?.originalFileId,
        category: ref.category?.name,
        createdAt: ref.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching local video references:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
