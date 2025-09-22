"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileImage, FileText, Film, File, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/config/ports";

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  name: string;
  size: number;
  type: string;
}

interface SimpleMediaUploaderProps {
  onUploadComplete?: (uploadedFiles: any[]) => void;
  onUploadStart?: () => void;
  maxFiles?: number;
  className?: string;
  acceptedTypes?: string[];
  customFolder: string; // Required - her zaman özel klasör kullan
  title?: string;
  description?: string;
}

export function SimpleMediaUploader({
  onUploadComplete,
  onUploadStart,
  maxFiles = 10,
  className = "",
  acceptedTypes = ['image/*'],
  customFolder,
  title = "Dosya Yükle",
  description
}: SimpleMediaUploaderProps) {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupAllBlobUrls();
    };
  }, []);

  // Get file type icon
  const getFileIcon = (file: UploadFile) => {
    if (file.type.startsWith('image/')) return FileImage;
    if (file.type.startsWith('video/')) return Film;
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText;
    return File;
  };

  // Create blob URL with tracking
  const createTrackedBlobUrl = (file: File): string | undefined => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return undefined;

    const blobUrl = URL.createObjectURL(file);
    blobUrlsRef.current.add(blobUrl);
    return blobUrl;
  };

  // Cleanup specific blob URL
  const cleanupBlobUrl = (blobUrl: string) => {
    if (blobUrlsRef.current.has(blobUrl)) {
      URL.revokeObjectURL(blobUrl);
      blobUrlsRef.current.delete(blobUrl);
    }
  };

  // Cleanup all blob URLs
  const cleanupAllBlobUrls = () => {
    blobUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url);
    });
    blobUrlsRef.current.clear();
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file sizes based on type
    const validFiles = acceptedFiles.filter(file => {
      if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: Resim dosyası 5MB'dan büyük olamaz`);
        return false;
      }
      if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name}: Video dosyası 50MB'dan büyük olamaz`);
        return false;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: Dosya 10MB'dan büyük olamaz`);
        return false;
      }
      return true;
    });

    const newFiles: UploadFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      progress: 0,
      status: 'pending' as const,
      preview: createTrackedBlobUrl(file),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} dosya seçildi`);
    }
  }, [maxFiles]);

  // Handle manual file selection
  const handleManualFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      onDrop(selectedFiles);
    }
    event.target.value = '';
  };

  // Dynamic accept object based on acceptedTypes
  const getAcceptObject = () => {
    const acceptObj: { [key: string]: string[] } = {};
    
    acceptedTypes.forEach(type => {
      if (type === 'image/*') {
        acceptObj['image/*'] = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];
      } else if (type === 'video/*') {
        acceptObj['video/*'] = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
      } else if (type === 'application/pdf') {
        acceptObj['application/pdf'] = ['.pdf'];
      } else if (type === 'text/plain') {
        acceptObj['text/plain'] = ['.txt'];
      }
    });
    
    return acceptObj;
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: getAcceptObject(),
    maxSize: 50 * 1024 * 1024,
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  // Remove file from list with proper cleanup
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        cleanupBlobUrl(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Upload files to the API
  const uploadFiles = async (filesToUpload: UploadFile[]): Promise<any> => {
    const uploadPromises = filesToUpload.map(async (fileData: UploadFile) => {
      const formData = new FormData();
      formData.append('file', fileData.file);
      
      // Her zaman sabit kategori kullan (Bannerlar = 1)
      formData.append('categoryId', '1');
      
      // Custom folder her zaman belirtilir
      formData.append('customFolder', customFolder);

      console.log("🔍 [SIMPLE_UPLOADER_DEBUG] Upload request:", {
        filename: fileData.file.name,
        customFolder,
        categoryId: '1'
      });

      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/media`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
          throw new Error('Session expired');
        }
        
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      return result;
    });

    const results = await Promise.all(uploadPromises);
    
    return {
      success: true,
      message: `${results.length} dosya başarıyla yüklendi`,
      uploadedFiles: results
    };
  };

  // Handle upload all files
  const handleUpload = async () => {
    if (status === 'loading') {
      toast.error("Kimlik doğrulama kontrol ediliyor, lütfen bekleyin...");
      return;
    }

    if (status === 'unauthenticated' || !session) {
      toast.error("Dosya yüklemek için giriş yapmanız gerekiyor");
      return;
    }

    if (files.length === 0) {
      toast.error("Yüklenecek dosya seçin");
      return;
    }

    setIsUploading(true);
    onUploadStart?.();

    const pendingFiles = files.filter(f => f.status === 'pending');

    try {
      // Update all files to uploading status
      setFiles(prev => prev.map(f =>
        pendingFiles.some(pf => pf.id === f.id)
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      ));

      // Upload all files with real progress tracking
      const result = await uploadFiles(pendingFiles);

      if (result.success) {
        // Update successful files
        const uploadedFileNames = result.uploadedFiles.map((uf: any) => uf.originalName);

        setFiles(prev => prev.map(f => {
          if (pendingFiles.some(pf => pf.id === f.id)) {
            const wasUploaded = uploadedFileNames.includes(f.name);
            return {
              ...f,
              status: wasUploaded ? 'success' as const : 'error' as const,
              progress: 100,
              error: wasUploaded ? undefined : 'Yükleme başarısız'
            };
          }
          return f;
        }));

        toast.success(result.message);
        onUploadComplete?.(result.uploadedFiles);

        // Clear successful uploads after a delay
        setTimeout(() => {
          setFiles(prev => {
            const successfulFiles = prev.filter(f => f.status === 'success');
            successfulFiles.forEach(file => {
              if (file.preview) {
                cleanupBlobUrl(file.preview);
              }
            });
            return prev.filter(f => f.status !== 'success');
          });
        }, 3000);
      }

    } catch (error) {
      setFiles(prev => prev.map(f =>
        f.status === 'uploading'
          ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Yükleme başarısız' }
          : f
      ));

      toast.error("Dosya yükleme sırasında hata oluştu");
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 h-full flex flex-col overflow-y-auto max-h-[65vh]">
        {/* Klasör Bilgisi */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-purple-50 border-purple-200">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">Klasör</Badge>
            <span className="text-sm font-medium">/{customFolder}/</span>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            ✓ Dosyalar /{customFolder}/ klasörüne yüklenecek
          </p>
          {description && (
            <p className="text-sm text-gray-600 mt-2">{description}</p>
          )}
        </div>

        {/* Hidden File Input for Manual Selection */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleManualFileSelect}
          accept={acceptedTypes.join(',')}
          multiple
          style={{ display: 'none' }}
        />

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center transition-colors
            ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-base font-medium mb-1">
            {isDragActive ? 'Dosyaları buraya bırakın' : 'Dosyaları sürükleyip bırakın'}
          </p>
          <p className="text-xs text-gray-500 mb-2">veya</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (typeof open === 'function') {
                try {
                  open();
                  return;
                } catch (error) {
                  console.error('Error calling dropzone open function:', error);
                }
              }

              if (fileInputRef.current) {
                fileInputRef.current.click();
              } else {
                console.error('File input ref not available');
              }
            }}
            className="mb-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Dosya Seç
          </Button>
          <p className="text-xs text-gray-400 text-center">
            Desteklenen formatlar: {acceptedTypes.includes('image/*') && 'JPG, PNG, GIF, WebP'} 
            {acceptedTypes.includes('video/*') && ', MP4, WebM, MOV'} 
            {acceptedTypes.includes('application/pdf') && ', PDF'}
            <br />
            Maksimum dosya boyutu: Resimler 5MB, Videolar 50MB, Diğer dosyalar 10MB
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4 flex-1 flex flex-col min-h-0">
            <h3 className="text-base font-medium mb-3 flex-shrink-0">Seçilen Dosyalar ({files.length})</h3>
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[30vh] pr-2">
              {files.map((file) => {
                const FileIcon = getFileIcon(file);
                return (
                  <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        file.type.startsWith('image/') ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : file.type.startsWith('video/') ? (
                          <video
                            src={file.preview}
                            className="w-12 h-12 object-cover rounded"
                            muted
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <FileIcon className="w-6 h-6 text-gray-500" />
                          </div>
                        )
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <FileIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

                      {/* Progress Bar */}
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-2" />
                      )}

                      {/* Error Message */}
                      {file.status === 'error' && (
                        <p className="text-xs text-red-500 mt-1">{file.error}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {/* Status Icons */}
                      {file.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      {file.status === 'pending' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          title="Dosyayı kaldır"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <div className="mt-4 flex justify-end flex-shrink-0 border-t pt-4">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0 || files.every(f => f.status !== 'pending')}
              className="min-w-[120px]"
            >
              {isUploading ? 'Yükleniyor...' : 'Dosyaları Yükle'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
