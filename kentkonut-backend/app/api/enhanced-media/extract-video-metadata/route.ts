import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface VideoMetadataRequest {
  url: string;
  platform: 'youtube' | 'vimeo';
  videoId: string;
}

interface VideoMetadataResponse {
  success: boolean;
  videoData?: {
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
  error?: string;
}

// YouTube API helper (requires API key)
async function getYouTubeMetadata(videoId: string) {
  // In a real implementation, you would use YouTube Data API v3
  // For now, we'll return basic data with thumbnail
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  // Check if thumbnail exists by trying to fetch it
  try {
    const thumbnailResponse = await fetch(thumbnailUrl, { method: 'HEAD' });
    const thumbnail = thumbnailResponse.ok ? thumbnailUrl : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
    return {
      title: 'YouTube Video',
      thumbnail,
      duration: undefined,
      description: undefined,
      author: undefined,
      viewCount: undefined,
      publishedAt: undefined
    };
  } catch (error) {
    return {
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: undefined,
      description: undefined,
      author: undefined,
      viewCount: undefined,
      publishedAt: undefined
    };
  }
}

// Vimeo API helper
async function getVimeoMetadata(videoId: string) {
  try {
    // Use Vimeo's oEmbed API (no API key required)
    const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
    
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || 'Vimeo Video',
        thumbnail: data.thumbnail_url || `https://vumbnail.com/${videoId}.jpg`,
        duration: data.duration,
        description: data.description,
        author: data.author_name,
        viewCount: undefined,
        publishedAt: undefined
      };
    }
  } catch (error) {
    console.error('Error fetching Vimeo metadata:', error);
  }
  
  // Fallback data
  return {
    title: 'Vimeo Video',
    thumbnail: `https://vumbnail.com/${videoId}.jpg`,
    duration: undefined,
    description: undefined,
    author: undefined,
    viewCount: undefined,
    publishedAt: undefined
  };
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

    const body: VideoMetadataRequest = await req.json();
    const { url, platform, videoId } = body;

    if (!url || !platform || !videoId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let metadata;
    
    try {
      if (platform === 'youtube') {
        metadata = await getYouTubeMetadata(videoId);
      } else if (platform === 'vimeo') {
        metadata = await getVimeoMetadata(videoId);
      } else {
        return NextResponse.json(
          { success: false, error: 'Unsupported platform' },
          { status: 400 }
        );
      }

      const videoData = {
        url,
        platform,
        videoId,
        ...metadata
      };

      return NextResponse.json({
        success: true,
        videoData
      });

    } catch (error) {
      console.error('Error extracting video metadata:', error);
      
      // Return basic data as fallback
      const fallbackData = {
        url,
        platform,
        videoId,
        title: platform === 'youtube' ? 'YouTube Video' : 'Vimeo Video',
        thumbnail: platform === 'youtube' 
          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          : `https://vumbnail.com/${videoId}.jpg`,
        duration: undefined,
        description: undefined,
        author: undefined,
        viewCount: undefined,
        publishedAt: undefined
      };

      return NextResponse.json({
        success: true,
        videoData: fallbackData
      });
    }

  } catch (error) {
    console.error('Video metadata extraction error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Video metadata extraction endpoint is working',
    supportedPlatforms: ['youtube', 'vimeo'],
    endpoints: {
      extract: 'POST /api/enhanced-media/extract-video-metadata'
    }
  });
}
