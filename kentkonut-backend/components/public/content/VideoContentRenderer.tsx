"use client";

import { useState } from 'react';
import { SafeHtmlRenderer } from '@/components/content/SafeHtmlRenderer';
import { 
  getYoutubeEmbedUrl, 
  getVimeoEmbedUrl, 
  getYoutubeThumbnailUrl 
} from '@/lib/video-utils';

interface VideoContentProps {
  content: {
    id: string;
    title?: string;
    content?: string;
    videoUrl?: string;
    caption?: string;
  };
}

export function VideoContentRenderer({ content }: VideoContentProps) {
  const [youtubeVideoShown, setYoutubeVideoShown] = useState(false);
  const [vimeoVideoShown, setVimeoVideoShown] = useState(false);
  const [normalVideoShown, setNormalVideoShown] = useState(false);

  if (!content.videoUrl) {
    return (
      <div className="mb-6">
        <div className="rounded-lg overflow-hidden relative bg-gray-900 aspect-video">
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-6xl mb-2">🎬</div>
              <div className="text-sm">Video bulunamadı</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const videoUrl = content.videoUrl;

  const renderYouTubeVideo = () => {
    const embedUrl = getYoutubeEmbedUrl(videoUrl);
    const thumbnailUrl = getYoutubeThumbnailUrl(videoUrl);

    if (youtubeVideoShown) {
      return (
        <iframe
          src={embedUrl}
          title={content.title || "YouTube Video"}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <div 
        className="w-full h-full cursor-pointer relative group"
        onClick={() => setYoutubeVideoShown(true)}
      >
        {/* YouTube thumbnail background */}
        {thumbnailUrl ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          />
        ) : (
          <div className="w-full h-full bg-red-600 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-2">📺</div>
              <div className="text-sm">YouTube Video</div>
            </div>
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[12px] border-y-transparent ml-1"></div>
          </div>
        </div>
        
        {/* YouTube badge */}
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded">
          YouTube
        </div>
      </div>
    );
  };

  const renderVimeoVideo = () => {
    const embedUrl = getVimeoEmbedUrl(videoUrl);

    if (vimeoVideoShown) {
      return (
        <iframe 
          src={embedUrl}
          title={content.title || "Vimeo Video"}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <div 
        className="w-full h-full cursor-pointer relative group bg-blue-600"
        onClick={() => setVimeoVideoShown(true)}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-6xl mb-2">🎬</div>
            <div className="text-sm">Vimeo Video</div>
          </div>
        </div>
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[12px] border-y-transparent ml-1"></div>
          </div>
        </div>
        
        {/* Vimeo badge */}
        <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          Vimeo
        </div>
      </div>
    );
  };

  const renderLocalVideo = () => {
    if (normalVideoShown) {
      return (
        <video
          controls
          autoPlay
          className="w-full h-full"
          src={videoUrl}
        >
          Tarayıcınız video elementi desteklemiyor.
        </video>
      );
    }

    return (
      <div 
        className="w-full h-full cursor-pointer relative group bg-indigo-600"
        onClick={() => setNormalVideoShown(true)}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-6xl mb-2">🎥</div>
            <div className="text-sm">Video</div>
          </div>
        </div>
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
          <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[12px] border-y-transparent ml-1"></div>
          </div>
        </div>
        
        {/* Local badge */}
        <div className="absolute top-3 left-3 bg-indigo-500 text-white text-xs px-2 py-1 rounded">
          Video
        </div>
      </div>
    );
  };

  const renderVideoPlayer = () => {
    // YouTube video
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return renderYouTubeVideo();
    }
    
    // Vimeo video
    if (videoUrl.includes('vimeo.com')) {
      return renderVimeoVideo();
    }
    
    // Local/uploaded video
    return renderLocalVideo();
  };

  return (
    <div className="mb-6">
      {/* Video başlığı */}
      {content.title && (
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {content.title}
        </h3>
      )}
      
      {/* Video container */}
      <div className="rounded-lg overflow-hidden relative bg-gray-900 aspect-video">
        {renderVideoPlayer()}
      </div>
      
      {/* Caption */}
      {content.caption && (
        <p className="text-center text-gray-600 mt-2 italic">
          {content.caption}
        </p>
      )}
      
      {/* Ek içerik */}
      {content.content && content.content.trim() !== '' && (
        <div className="mt-6 max-w-none">
          <SafeHtmlRenderer
            content={content.content}
            className=""
          />
        </div>
      )}
    </div>
  );
}
