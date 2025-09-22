"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  File,
  X,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderOpen,
  Settings,
  User
} from "lucide-react";
import { toast } from "sonner";

// Import our enhanced components
import { FolderSelector } from "./FolderSelector";
import { 
  FileTypeSupport, 
  FileTypeCategory, 
  ENHANCED_FILE_SUPPORT,
  validateFile,
  getAcceptedMimeTypes,
  formatFileSize
} from "./FileTypeSupport";
import {
  EmbeddedVideoInput,
  EmbeddedVideoData
} from "./EmbeddedVideoInput";
import {
  AdministratorInfoTab,
  ExecutiveType
} from "./AdministratorInfoTab";

// Enhanced file interface
interface EnhancedUploadFile {
  id: string;
  file?: File;
  embeddedVideo?: EmbeddedVideoData;
  fileType: FileTypeCategory | 'embedded';
  name: string;
  size: number;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  metadata?: {
    alt?: string;
    caption?: string;
    title?: string;
    description?: string;
  };
}

interface EnhancedMediaUploaderProps {
  // Compatibility with existing MediaUploader
  categoryId?: number;
  defaultCategoryId?: number;
  onUploadComplete?: (uploadedFiles: any[]) => void;
  onUploadStart?: () => void;
  maxFiles?: number;
  className?: string;
  acceptedTypes?: string[];
  customFolder?: string;
  
  // Enhanced features
  enableFolderSelection?: boolean;
  enableEmbeddedVideo?: boolean;
  enableMultiFormat?: boolean;
  showFileTypeSelector?: boolean;
  enableAdvancedPreview?: boolean;
  enableAdministratorInfo?: boolean; // New feature for administrator management
  
  // UI customization
  title?: string;
  description?: string;
  layout?: 'compact' | 'expanded' | 'tabs';
  theme?: 'default' | 'minimal' | 'professional';
  showHeader?: boolean; // New prop to control header visibility
}

export function EnhancedMediaUploader({
  categoryId,
  defaultCategoryId,
  onUploadComplete,
  onUploadStart,
  maxFiles = 10,
  className = "",
  acceptedTypes,
  customFolder,
  enableFolderSelection = true,
  enableEmbeddedVideo = true,
  enableMultiFormat = true,
  showFileTypeSelector = true,
  enableAdvancedPreview = true,
  enableAdministratorInfo = false,
  title = "Gelişmiş Dosya Yükleme",
  description = "Dosyalarınızı yükleyin veya video URL'si ekleyin",
  layout = 'expanded',
  theme = 'default',
  showHeader = true
}: EnhancedMediaUploaderProps) {
  const { data: session } = useSession();
  
  // State management
  const [files, setFiles] = useState<EnhancedUploadFile[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categoryId || defaultCategoryId || null
  );
  const [selectedFileTypes, setSelectedFileTypes] = useState<FileTypeCategory[]>(['images']);
  const [activeTab, setActiveTab] = useState<'files' | 'embedded' | 'administrator'>('files');
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  
  // Embedded video state
  const [embeddedVideoUrl, setEmbeddedVideoUrl] = useState("");
  const [isValidatingVideo, setIsValidatingVideo] = useState(false);
  
  // Refs for cleanup
  const blobUrlsRef = useRef<Set<string>>(new Set());
  
  // Cleanup blob URLs
  const cleanupBlobUrl = (url: string) => {
    if (blobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
  };

  const cleanupAllBlobUrls = () => {
    blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    blobUrlsRef.current.clear();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAllBlobUrls();
    };
  }, []);

  // Handle file type selection
  const handleFileTypeToggle = (type: FileTypeCategory) => {
    setSelectedFileTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Create blob URL with tracking
  const createTrackedBlobUrl = (file: File): string => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current.add(url);
    return url;
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maksimum ${maxFiles} dosya yükleyebilirsiniz`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid && validation.fileType && selectedFileTypes.includes(validation.fileType)) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      toast.error(`Bazı dosyalar reddedildi:\n${errors.join('\n')}`);
    }

    const newFiles: EnhancedUploadFile[] = validFiles.map(file => {
      const validation = validateFile(file);
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        fileType: validation.fileType!,
        name: file.name,
        size: file.size,
        preview: file.type.startsWith('image/') ? createTrackedBlobUrl(file) : undefined,
        progress: 0,
        status: 'pending' as const,
      };
    });

    setFiles(prev => [...prev, ...newFiles]);
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} dosya eklendi`);
    }
  }, [files.length, maxFiles, selectedFileTypes]);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedMimeTypes(selectedFileTypes).reduce((acc, mimeType) => {
      acc[mimeType] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: Math.max(...selectedFileTypes.map(type => ENHANCED_FILE_SUPPORT[type].maxSize)),
    multiple: true,
    noClick: false,
    disabled: isUploading
  });

  // Handle embedded video
  const handleEmbeddedVideoData = (videoData: EmbeddedVideoData) => {
    const newFile: EnhancedUploadFile = {
      id: Math.random().toString(36).substr(2, 9),
      embeddedVideo: videoData,
      fileType: 'embedded',
      name: videoData.title || (videoData.platform === 'local' ? 'Local Video' : 'Embedded Video'),
      size: videoData.localFile?.size || 0,
      preview: videoData.thumbnail,
      progress: 0,
      status: 'pending'
    };

    setFiles(prev => [...prev, newFile]);
    setEmbeddedVideoUrl("");

    if (videoData.platform === 'local') {
      toast.success('Local video eklendi');
    } else {
      toast.success('Video eklendi');
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview && fileToRemove.file) {
        cleanupBlobUrl(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Handle administrator data save
  const handleAdministratorSave = async (administratorData: any) => {
    try {
      // Create administrator entry via API
      const response = await fetch('/api/enhanced-media/administrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...administratorData,
          categoryId: selectedCategoryId || 6, // Default to Kurumsal category
          customFolder
        })
      });

      if (!response.ok) {
        throw new Error('Administrator save failed');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Yönetici bilgileri başarıyla kaydedildi');
        onUploadComplete?.([result.data]);
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Administrator save error:', error);
      toast.error('Yönetici bilgileri kaydedilemedi');
      throw error;
    }
  };

  // Upload files
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Yüklenecek dosya seçilmedi');
      return;
    }

    if (!selectedCategoryId) {
      toast.error('Klasör seçilmedi');
      return;
    }

    setIsUploading(true);
    onUploadStart?.();

    try {
      const baseUrl = getApiBaseUrl();
      const uploadPromises = files.map(async (fileData) => {
        if (fileData.status !== 'pending') return null;

        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading' as const } : f
        ));

        try {
          let response;
          
          if (fileData.embeddedVideo) {
            // Handle embedded video (external or local)
            if (fileData.embeddedVideo.platform === 'local') {
              // For local videos, we just create a reference without uploading
              // since the file already exists in the system
              response = await fetch(`${baseUrl}/api/enhanced-media/local-video-reference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  localFileId: fileData.embeddedVideo.localFile?.id,
                  categoryId: selectedCategoryId,
                  customFolder,
                  metadata: fileData.metadata
                })
              });
            } else {
              // Handle external embedded video (YouTube, Vimeo)
              response = await fetch(`${baseUrl}/api/enhanced-media/embedded-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  videoData: fileData.embeddedVideo,
                  categoryId: selectedCategoryId,
                  customFolder,
                  metadata: fileData.metadata
                })
              });
            }
          } else if (fileData.file) {
            // Handle file upload
            const formData = new FormData();
            formData.append('file', fileData.file);
            formData.append('categoryId', selectedCategoryId.toString());
            if (customFolder) {
              formData.append('customFolder', customFolder);
            }
            if (fileData.metadata?.alt) {
              formData.append('alt', fileData.metadata.alt);
            }
            if (fileData.metadata?.caption) {
              formData.append('caption', fileData.metadata.caption);
            }

            response = await fetch(`${baseUrl}/api/media`, {
              method: 'POST',
              credentials: 'include',
              body: formData
            });
          }

          if (!response?.ok) {
            throw new Error('Upload failed');
          }

          const result = await response.json();

          // Update status to success
          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { 
              ...f, 
              status: 'success' as const, 
              progress: 100 
            } : f
          ));

          return result;
        } catch (error) {
          console.error('Upload error:', error);
          
          // Update status to error
          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { 
              ...f, 
              status: 'error' as const, 
              error: 'Yükleme başarısız' 
            } : f
          ));
          
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean);

      if (successfulUploads.length > 0) {
        toast.success(`${successfulUploads.length} dosya başarıyla yüklendi`);
        onUploadComplete?.(successfulUploads);
        
        // Clear successful uploads
        setFiles(prev => prev.filter(f => f.status !== 'success'));
      }

      const failedCount = files.length - successfulUploads.length;
      if (failedCount > 0) {
        toast.error(`${failedCount} dosya yüklenemedi`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Yükleme sırasında hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate overall progress
  useEffect(() => {
    if (files.length === 0) {
      setOverallProgress(0);
      return;
    }

    const totalProgress = files.reduce((sum: number, file: { progress: number }) => sum + file.progress, 0);
    setOverallProgress(Math.round(totalProgress / files.length));
  }, [files]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header - Only show if showHeader is true */}
      {showHeader && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      )}

      {/* Folder Selection */}
      {enableFolderSelection && (
        <FolderSelector
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          customFolder={customFolder}
          enableCustomFolder={true}
          enableCategoryCreation={true}
          compact={layout === 'compact'}
        />
      )}

      {/* File Type Selection */}
      {enableMultiFormat && showFileTypeSelector && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Dosya Türleri</h3>
          <FileTypeSupport
            selectedTypes={selectedFileTypes}
            onTypeToggle={handleFileTypeToggle}
            layout={layout === 'compact' ? 'compact' : 'cards'}
            showDetails={layout !== 'compact'}
          />
        </div>
      )}

      {/* Upload Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'files' | 'embedded' | 'administrator')}>
        <TabsList className={`grid w-full ${
          enableAdministratorInfo && enableEmbeddedVideo ? 'grid-cols-3' :
          enableAdministratorInfo || enableEmbeddedVideo ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Dosya Yükleme
          </TabsTrigger>
          {enableEmbeddedVideo && (
            <TabsTrigger value="embedded" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Video URL
            </TabsTrigger>
          )}
          {enableAdministratorInfo && (
            <TabsTrigger value="administrator" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Yönetici Bilgileri
            </TabsTrigger>
          )}
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="files" className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Dosyaları buraya bırakın' : 'Dosyaları sürükleyin veya tıklayın'}
            </h3>
            <p className="text-sm text-gray-600">
              Desteklenen formatlar: {selectedFileTypes.map(type => 
                ENHANCED_FILE_SUPPORT[type].extensions.slice(0, 3).join(', ')
              ).join(', ')}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Maksimum {maxFiles} dosya, dosya başına en fazla{' '}
              {formatFileSize(Math.max(...selectedFileTypes.map(type => ENHANCED_FILE_SUPPORT[type].maxSize)))}
            </p>
          </div>
        </TabsContent>

        {/* Embedded Video Tab */}
        {enableEmbeddedVideo && (
          <TabsContent value="embedded">
            <EmbeddedVideoInput
              url={embeddedVideoUrl}
              onUrlChange={setEmbeddedVideoUrl}
              onVideoDataExtracted={handleEmbeddedVideoData}
              onValidationError={(error) => toast.error(error)}
              isValidating={isValidatingVideo}
              showPreview={true}
              autoValidate={true}
              enableLocalMedia={true}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Seçilen Dosyalar ({files.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                files.forEach(file => {
                  if (file.preview && file.file) {
                    cleanupBlobUrl(file.preview);
                  }
                });
                setFiles([]);
              }}
              disabled={isUploading}
            >
              Tümünü Temizle
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
              >
                {/* File Icon/Preview */}
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <File className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {file.fileType}
                    </Badge>
                    {file.size > 0 && (
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                    )}
                  </div>
                  
                  {/* Progress */}
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-2 h-1" />
                  )}
                  
                  {/* Error */}
                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {file.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  {file.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              Yükleniyor...
            </span>
            <span className="text-sm text-gray-600">
              {overallProgress}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {files.length > 0 && (
            <>
              {files.length} dosya seçildi
              {selectedCategoryId && (
                <span className="ml-2">
                  • Hedef: Kategori {selectedCategoryId}
                </span>
              )}
            </>
          )}
        </div>
        
        <Button
          onClick={uploadFiles}
          disabled={files.length === 0 || isUploading || !selectedCategoryId}
          className="min-w-[120px]"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Yükle ({files.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
