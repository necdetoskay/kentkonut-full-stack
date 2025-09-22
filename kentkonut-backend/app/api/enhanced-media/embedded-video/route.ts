import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface EmbeddedVideoRequest {
  videoData: {
    url: string;
    platform: 'youtube' | 'vimeo';
    videoId: string;
    title?: string;
    thumbnail?: string;
    duration?: number;
    description?: string;
    author?: string;
    viewCount?: number;
    publishedAt?: string;
  };
  categoryId: number;
  customFolder?: string;
  metadata?: {
    title?: string;
    description?: string;
    alt?: string;
    caption?: string;
  };
}

interface EmbeddedVideoResponse {
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

    const body: EmbeddedVideoRequest = await req.json();
    const { videoData, categoryId, customFolder, metadata } = body;

    if (!videoData || !videoData.url || !videoData.platform || !videoData.videoId) {
      return NextResponse.json(
        { success: false, error: 'Invalid video data' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await db.mediaCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Generate filename for embedded video
    const timestamp = Date.now();
    const filename = `embedded-${videoData.platform}-${videoData.videoId}-${timestamp}.json`;
    
    // Determine file path
    let filePath: string;
    if (customFolder) {
      filePath = `${customFolder}/${filename}`;
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
      filePath = `media/${categoryPath}/${filename}`;
    }

    // Create URL for the embedded video
    const url = `/${filePath}`;

    // Prepare metadata for storage
    const videoMetadata = {
      platform: videoData.platform,
      videoId: videoData.videoId,
      originalUrl: videoData.url,
      embedUrl: videoData.platform === 'youtube' 
        ? `https://www.youtube.com/embed/${videoData.videoId}`
        : `https://player.vimeo.com/video/${videoData.videoId}`,
      duration: videoData.duration,
      author: videoData.author,
      viewCount: videoData.viewCount,
      publishedAt: videoData.publishedAt,
      extractedAt: new Date().toISOString()
    };

    try {
      // Save to database
      const savedMedia = await db.media.create({
        data: {
          filename: filename,
          originalName: metadata?.title || videoData.title || `${videoData.platform} Video`,
          mimeType: 'application/json', // Special MIME type for embedded videos
          size: JSON.stringify(videoMetadata).length,
          url: url,
          alt: metadata?.alt || videoData.title || '',
          caption: metadata?.caption || videoData.description || '',
          categoryId: categoryId,
          metadata: videoMetadata
        }
      });

      // Return success response
      const response = {
        success: true,
        data: {
          id: savedMedia.id,
          filename: savedMedia.filename,
          originalName: savedMedia.originalName,
          url: savedMedia.url,
          mimeType: savedMedia.mimeType,
          size: savedMedia.size,
          alt: savedMedia.alt,
          caption: savedMedia.caption,
          categoryId: savedMedia.categoryId,
          metadata: savedMedia.metadata,
          createdAt: savedMedia.createdAt,
          updatedAt: savedMedia.updatedAt,
          // Additional video-specific data
          videoData: {
            platform: videoData.platform,
            videoId: videoData.videoId,
            title: videoData.title,
            thumbnail: videoData.thumbnail,
            embedUrl: videoMetadata.embedUrl,
            originalUrl: videoData.url
          }
        }
      };

      console.log('Embedded video saved successfully:', {
        id: savedMedia.id,
        platform: videoData.platform,
        videoId: videoData.videoId,
        categoryId: categoryId
      });

      return NextResponse.json(response);

    } catch (dbError) {
      console.error('Database error saving embedded video:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to save video to database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Embedded video storage error:', error);
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

    // Get embedded videos from database
    const embeddedVideos = await db.media.findMany({
      where: {
        mimeType: 'application/json',
        filename: {
          startsWith: 'embedded-'
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
      message: 'Embedded video storage endpoint is working',
      embeddedVideos: embeddedVideos.map(video => ({
        id: video.id,
        title: video.originalName,
        platform: video.metadata?.platform,
        videoId: video.metadata?.videoId,
        category: video.category?.name,
        createdAt: video.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching embedded videos:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
