"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Link,
  CheckCircle,
  AlertCircle,
  Loader2,
  Youtube,
  Video,
  ExternalLink,
  Clock,
  Eye,
  FolderOpen,
  Monitor
} from "lucide-react";
import { toast } from "sonner";
import { GlobalMediaFile } from "../GlobalMediaSelector";
import { MediaBrowserSimple } from "../MediaBrowserSimple";

export interface EmbeddedVideoData {
  url: string;
  platform: 'youtube' | 'vimeo' | 'local';
  videoId: string;
  title?: string;
  thumbnail?: string;
  duration?: number;
  description?: string;
  author?: string;
  viewCount?: number;
  publishedAt?: string;
  // Local video specific fields
  localFile?: {
    id: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    categoryId: number;
    categoryName?: string;
  };
}

interface EmbeddedVideoInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onVideoDataExtracted: (videoData: EmbeddedVideoData) => void;
  onValidationError: (error: string) => void;
  isValidating?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  autoValidate?: boolean;
  enableLocalMedia?: boolean; // New prop to enable local media browsing
}

// Supported platforms configuration
const SUPPORTED_PLATFORMS = {
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-500',
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
    ],
    embedUrl: (videoId: string) => `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: (videoId: string) => `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  },
  vimeo: {
    name: 'Vimeo',
    icon: Video,
    color: 'text-blue-500',
    patterns: [
      /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/,
      /(?:https?:\/\/)?player\.vimeo\.com\/video\/(\d+)/
    ],
    embedUrl: (videoId: string) => `https://player.vimeo.com/video/${videoId}`,
    thumbnailUrl: (videoId: string) => `https://vumbnail.com/${videoId}.jpg`
  }
};

// Utility functions
export function detectPlatform(url: string): { platform: 'youtube' | 'vimeo' | null; videoId: string | null } {
  for (const [platform, config] of Object.entries(SUPPORTED_PLATFORMS)) {
    for (const pattern of config.patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          platform: platform as 'youtube' | 'vimeo',
          videoId: match[1]
        };
      }
    }
  }
  return { platform: null, videoId: null };
}

export function validateVideoUrl(url: string): { isValid: boolean; error?: string } {
  if (!url.trim()) {
    return { isValid: false, error: 'Video URL gereklidir' };
  }

  const { platform, videoId } = detectPlatform(url);
  
  if (!platform || !videoId) {
    return { 
      isValid: false, 
      error: 'Desteklenmeyen video platformu. YouTube veya Vimeo URL\'si girin.' 
    };
  }

  return { isValid: true };
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Local media utility functions
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

export function createLocalVideoData(file: GlobalMediaFile): EmbeddedVideoData {
  return {
    url: file.url,
    platform: 'local',
    videoId: file.id.toString(),
    title: file.originalName || file.filename,
    thumbnail: file.url, // For videos, we might want to generate thumbnails
    description: file.caption || file.alt,
    localFile: {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName || file.filename,
      mimeType: file.mimeType,
      size: file.size,
      categoryId: file.categoryId,
      categoryName: file.category?.name
    }
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Extract video metadata from URL
async function extractVideoMetadata(url: string): Promise<EmbeddedVideoData> {
  const { platform, videoId } = detectPlatform(url);

  if (!platform || !videoId) {
    throw new Error('Invalid video URL');
  }

  try {
    // Call our API endpoint to extract video metadata
    const response = await fetch('/api/enhanced-media/extract-video-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, platform, videoId }),
    });

    if (!response.ok) {
      throw new Error('Failed to extract video metadata');
    }

    const data = await response.json();
    return data.videoData;
  } catch (error) {
    console.error('Error extracting video metadata:', error);

    // Fallback to basic data if API fails
    const config = SUPPORTED_PLATFORMS[platform];
    return {
      url,
      platform,
      videoId,
      title: `${config.name} Video`,
      thumbnail: config.thumbnailUrl(videoId),
      duration: undefined,
      description: undefined,
      author: undefined,
      viewCount: undefined,
      publishedAt: undefined
    };
  }
}

export function EmbeddedVideoInput({
  url,
  onUrlChange,
  onVideoDataExtracted,
  onValidationError,
  isValidating = false,
  disabled = false,
  placeholder = "YouTube veya Vimeo video URL'si girin",
  className = "",
  showPreview = true,
  autoValidate = true,
  enableLocalMedia = true
}: EmbeddedVideoInputProps) {
  const [localUrl, setLocalUrl] = useState(url);
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'valid' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string>('');
  const [videoData, setVideoData] = useState<EmbeddedVideoData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Local media state
  const [activeTab, setActiveTab] = useState<'url' | 'local'>('url');
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [selectedLocalFile, setSelectedLocalFile] = useState<GlobalMediaFile | null>(null);

  // Update local URL when prop changes
  useEffect(() => {
    setLocalUrl(url);
  }, [url]);

  // Auto-validate URL when it changes
  useEffect(() => {
    if (autoValidate && localUrl.trim()) {
      validateUrl();
    } else if (!localUrl.trim()) {
      setValidationState('idle');
      setVideoData(null);
    }
  }, [localUrl, autoValidate]);

  const validateUrl = () => {
    const validation = validateVideoUrl(localUrl);
    
    if (validation.isValid) {
      setValidationState('valid');
      setValidationError('');
      if (autoValidate) {
        extractMetadata();
      }
    } else {
      setValidationState('error');
      setValidationError(validation.error || 'Geçersiz URL');
      onValidationError(validation.error || 'Geçersiz URL');
    }
  };

  const extractMetadata = async () => {
    if (!localUrl.trim()) return;

    setIsExtracting(true);
    try {
      const data = await extractVideoMetadata(localUrl);
      setVideoData(data);
      onVideoDataExtracted(data);
      toast.success('Video bilgileri başarıyla alındı');
    } catch (error) {
      console.error('Error extracting video metadata:', error);
      setValidationState('error');
      setValidationError('Video bilgileri alınamadı');
      onValidationError('Video bilgileri alınamadı');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setLocalUrl(newUrl);
    onUrlChange(newUrl);
    setVideoData(null);
    setValidationState('idle');
    setValidationError('');
  };

  const handleSubmit = () => {
    if (validationState === 'valid' && !videoData) {
      extractMetadata();
    } else if (validationState !== 'valid') {
      validateUrl();
    }
  };

  // Handle local media selection
  const handleLocalMediaSelect = (files: GlobalMediaFile[]) => {
    if (files.length === 0) return;

    const selectedFile = files[0];

    // Validate that it's a video file
    if (!isVideoFile(selectedFile.mimeType)) {
      toast.error('Lütfen bir video dosyası seçin');
      return;
    }

    setSelectedLocalFile(selectedFile);
    const localVideoData = createLocalVideoData(selectedFile);
    setVideoData(localVideoData);
    onVideoDataExtracted(localVideoData);
    setShowMediaBrowser(false);
    toast.success('Local video seçildi');
  };

  // Handle tab change
  const handleTabChange = (tab: 'url' | 'local') => {
    setActiveTab(tab);
    // Clear data when switching tabs
    setVideoData(null);
    setSelectedLocalFile(null);
    setLocalUrl('');
    onUrlChange('');
    setValidationState('idle');
    setValidationError('');
  };

  const { platform } = detectPlatform(localUrl);
  const platformConfig = platform ? SUPPORTED_PLATFORMS[platform] : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Selection */}
      {enableLocalMedia ? (
        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'url' | 'local')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              External URL
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Local Media
            </TabsTrigger>
          </TabsList>

          {/* External URL Tab */}
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">Video URL</h3>
              </div>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="url"
              placeholder={placeholder}
              value={localUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              disabled={disabled || isValidating || isExtracting}
              className={`pr-10 ${
                validationState === 'valid' ? 'border-green-500' :
                validationState === 'error' ? 'border-red-500' : ''
              }`}
            />
            
            {/* Validation Icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {(isValidating || isExtracting) && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              )}
              {validationState === 'valid' && !isExtracting && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {validationState === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={disabled || !localUrl.trim() || isValidating || isExtracting}
            variant={videoData ? "outline" : "default"}
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Alınıyor...
              </>
            ) : videoData ? (
              'Yenile'
            ) : (
              'Doğrula'
            )}
          </Button>
        </div>

        {/* Platform Detection */}
        {platformConfig && (
          <div className="flex items-center gap-2">
            <platformConfig.icon className={`w-4 h-4 ${platformConfig.color}`} />
            <span className="text-sm text-gray-600">
              {platformConfig.name} video algılandı
            </span>
          </div>
        )}

        {/* Validation Error */}
        {validationState === 'error' && validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
            </div>
          </TabsContent>

          {/* Local Media Tab */}
          <TabsContent value="local" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">Local Video Files</h3>
              </div>

              <div className="space-y-3">
                {/* Browse Button */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMediaBrowser(true)}
                    disabled={disabled}
                    className="flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Browse Video Files
                  </Button>

                  {selectedLocalFile && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {selectedLocalFile.originalName}
                    </Badge>
                  )}
                </div>

                {/* Selected File Info */}
                {selectedLocalFile && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <Video className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedLocalFile.originalName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{selectedLocalFile.mimeType}</span>
                          <span>•</span>
                          <span>{formatFileSize(selectedLocalFile.size)}</span>
                          {selectedLocalFile.category && (
                            <>
                              <span>•</span>
                              <span>{selectedLocalFile.category.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Alert */}
                <Alert>
                  <Video className="h-4 w-4" />
                  <AlertDescription>
                    Sistemde yüklü olan video dosyalarını seçebilirsiniz. Desteklenen formatlar: MP4, AVI, MOV, WebM
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Original single URL input (when local media is disabled)
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">Video URL</h3>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="url"
                placeholder={placeholder}
                value={localUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                disabled={disabled || isValidating || isExtracting}
                className={`pr-10 ${
                  validationState === 'valid' ? 'border-green-500' :
                  validationState === 'error' ? 'border-red-500' : ''
                }`}
              />

              {/* Validation Icon */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {(isValidating || isExtracting) && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                )}
                {validationState === 'valid' && !isExtracting && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {validationState === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={disabled || !localUrl.trim() || isValidating || isExtracting}
              variant={videoData ? "outline" : "default"}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Alınıyor...
                </>
              ) : videoData ? (
                'Yenile'
              ) : (
                'Doğrula'
              )}
            </Button>
          </div>

          {/* Platform Detection */}
          {platformConfig && (
            <div className="flex items-center gap-2">
              <platformConfig.icon className={`w-4 h-4 ${platformConfig.color}`} />
              <span className="text-sm text-gray-600">
                {platformConfig.name} video algılandı
              </span>
            </div>
          )}

          {/* Validation Error */}
          {validationState === 'error' && validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Video Preview */}
      {showPreview && videoData && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            {/* Thumbnail */}
            <div className="relative w-32 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {videoData.thumbnail ? (
                <img
                  src={videoData.thumbnail}
                  alt={videoData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {videoData.title || 'Video Başlığı'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {videoData.author || 'Bilinmeyen Kanal'}
              </p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {videoData.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(videoData.duration)}
                  </div>
                )}
                {videoData.viewCount && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatViewCount(videoData.viewCount)} görüntüleme
                  </div>
                )}
              </div>
            </div>

            {/* Platform Badge */}
            <Badge variant="outline" className="flex items-center gap-1">
              {videoData.platform === 'local' ? (
                <>
                  <Monitor className="w-3 h-3" />
                  Local Video
                </>
              ) : (
                <>
                  {platformConfig && <platformConfig.icon className="w-3 h-3" />}
                  {platformConfig?.name}
                </>
              )}
            </Badge>
          </div>

          {/* Description */}
          {videoData.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {videoData.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(videoData.url, '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Aç
            </Button>
          </div>
        </div>
      )}

      {/* Supported Platforms Info */}
      <div className="text-xs text-gray-500">
        <strong>Desteklenen kaynaklar:</strong>
        {enableLocalMedia ? ' YouTube, Vimeo, Local Video Files' : ' YouTube, Vimeo'}
      </div>

      {/* Media Browser Modal */}
      {enableLocalMedia && (
        <MediaBrowserSimple
          isOpen={showMediaBrowser}
          onClose={() => setShowMediaBrowser(false)}
          onSelect={handleLocalMediaSelect}
          multiple={false}
          allowedTypes={['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/mkv', 'video/flv']}
          title="Video Dosyası Seç"
          className="z-50"
        />
      )}
    </div>
  );
}
