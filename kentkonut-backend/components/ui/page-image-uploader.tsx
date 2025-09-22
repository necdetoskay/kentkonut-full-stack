"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Image, FileImage, Crop, Search, Check } from "lucide-react"
import { formatFileSize } from "@/lib/media-utils"
import { useMediaCategories } from "@/app/context/MediaCategoryContext"
import { ImageEditorModal } from "@/components/media/ImageEditorModal"
import { GlobalMediaFile } from "/@/components/media/GlobalMediaSelector"
import { getApiBaseUrl } from "@/config/ports";
import { corporateApiFetch } from "@/lib/corporateApi";

interface UploadFile {
  id: string
  file: File
  preview?: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  alt?: string
  caption?: string
  name: string
  size: number
  type: string
  uploadedUrl?: string  // URL from successful upload
}

interface PageImageUploaderProps {
  onImageSelect: (imageUrl: string, altText?: string) => void
  onClose: () => void
  targetWidth?: number
  targetHeight?: number
}

export function PageImageUploader({
  onImageSelect,
  onClose,
  targetWidth = 800,
  targetHeight = 600
}: PageImageUploaderProps) {
  const { categories } = useMediaCategories();
  const [mediaFiles, setMediaFiles] = useState<GlobalMediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null)
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [pageContentCategoryId, setPageContentCategoryId] = useState<number | null>(null)
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false)
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<UploadFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const blobUrlsRef = useRef<Set<string>>(new Set())
  // Sayfa içerik resimleri kategorisini bul
  useEffect(() => {
    const pageContentCategory = categories.find(cat => cat.name === "Sayfa İçerikleri")
    if (pageContentCategory) {
      setPageContentCategoryId(pageContentCategory.id)
    }
  }, [categories])

  // Filter media files for page content category only
  const isFileTypeAccepted = (mimeType: string): boolean => {
    return mimeType.startsWith('image/')
  }
  // Get best thumbnail URL for given size
  const getThumbnailUrl = (media: GlobalMediaFile, preferredSize: 'small' | 'medium' | 'large' = 'small') => {
    if (!media.mimeType.startsWith('image/')) return media.url

    switch (preferredSize) {
      case 'small':
        return media.thumbnailSmall || media.thumbnailMedium || media.thumbnailLarge || media.url
      case 'medium':
        return media.thumbnailMedium || media.thumbnailLarge || media.thumbnailSmall || media.url
      case 'large':
        return media.thumbnailLarge || media.thumbnailMedium || media.thumbnailSmall || media.url
      default:
        return media.url
    }
  }

  // Create blob URL with tracking
  const createTrackedBlobUrl = (file: File): string | undefined => {
    if (!file.type.startsWith('image/')) return undefined

    const blobUrl = URL.createObjectURL(file)
    blobUrlsRef.current.add(blobUrl)
    return blobUrl
  }

  // Cleanup specific blob URL
  const cleanupBlobUrl = (blobUrl: string) => {
    if (blobUrlsRef.current.has(blobUrl)) {
      URL.revokeObjectURL(blobUrl)
      blobUrlsRef.current.delete(blobUrl)
    }
  }

  // Cleanup all blob URLs
  const cleanupAllBlobUrls = () => {
    blobUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url)
    })
    blobUrlsRef.current.clear()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAllBlobUrls()
    }
  }, [])

  // Fetch media files
  const fetchMediaFiles = async (page = 1, reset = false) => {
    if (!pageContentCategoryId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sortBy: "createdAt",
        sortOrder: "desc",
        categoryId: pageContentCategoryId.toString()
      })

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response_data = await corporateApiFetch<any>(`/api/media?${params}`)

      if (!response_data || !Array.isArray(response_data.data)) {
        setMediaFiles([])
        setTotalPages(0)
        setCurrentPage(page)
        return
      }

      // Filter by accepted types
      const filteredMedia = response_data.data.filter((file: GlobalMediaFile) =>
        isFileTypeAccepted(file.mimeType)
      )

      if (reset) {
        setMediaFiles(filteredMedia)
      } else {
        setMediaFiles(prev => [...prev, ...filteredMedia])
      }

      setTotalPages(response_data.pagination?.totalPages || Math.ceil((response_data.pagination?.total || 0) / 12))
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching media:", error)
      toast.error("Medya dosyaları yüklenirken hata oluştu")
      setMediaFiles([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  // Load more media files
  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchMediaFiles(currentPage + 1, false)
    }
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    fetchMediaFiles(1, true)
  }  // Handle media selection from gallery
  const handleMediaSelect = (media: GlobalMediaFile) => {
    onImageSelect(media.url, media.alt)
    onClose()
    toast.success("Resim seçildi")
  }
  // Handle uploaded file selection (after upload success)
  const handleUploadedFileSelect = (file: UploadFile) => {
    console.log('Selecting uploaded file:', file); // Debug log
    console.log('Upload URL:', file.uploadedUrl); // Debug log
    
    if (file.uploadedUrl) {
      onImageSelect(file.uploadedUrl, file.alt)
      onClose()
      toast.success("Resim seçildi")
    } else {
      toast.error("Resim URL'si bulunamadı")
    }
  }

  // Handle file drop for upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      progress: 0,
      status: 'pending' as const,
      preview: createTrackedBlobUrl(file),
      name: file.name,
      size: file.size,
      type: file.type,
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  // Handle manual file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length > 0) {
      onDrop(selectedFiles)
    }
    event.target.value = ''
  }

  // Remove file from list with proper cleanup
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        cleanupBlobUrl(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  // Update file metadata
  const updateFileMetadata = (fileId: string, field: 'alt' | 'caption', value: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, [field]: value } : f
    ))
  }  // Handle image editor save
  const handleImageEditorSave = (editedFile: UploadFile) => {
    setFiles(prev => prev.map(f =>
      f.id === editedFile.id ? {
        ...editedFile,
        status: 'pending' as const,
        progress: 0,
        error: undefined
      } : f
    ))

    setSelectedImageForEdit(null)
    setIsImageEditorOpen(false)
    toast.success("Resim başarıyla düzenlendi")  }

  // Upload files to the API
  const uploadFiles = async (filesToUpload: UploadFile[]) => {
    const uploadPromises = filesToUpload.map(async (fileData: UploadFile) => {
      const formData = new FormData()
      formData.append('file', fileData.file)
      
      if (fileData.alt) {
        formData.append('alt', fileData.alt)
      }

      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/media/upload/page-content`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      console.log('Upload API response:', result) // Debug log
      return result
    })

    // Upload all files concurrently
    const results = await Promise.all(uploadPromises)
    console.log('All upload results:', results) // Debug log
    
    return {
      success: true,
      message: `${results.length} dosya başarıyla yüklendi`,
      uploadedFiles: results.map((r: any) => r.data)
    }
  }

  // Handle upload all files
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Yüklenecek dosya seçin")
      return
    }

    if (!pageContentCategoryId) {
      toast.error("Sayfa içerik resimleri kategorisi bulunamadı")
      return
    }

    setIsUploading(true)

    const pendingFiles = files.filter(f => f.status === 'pending')

    try {
      // Update all files to uploading status
      setFiles(prev => prev.map(f =>
        pendingFiles.some(pf => pf.id === f.id)
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      ))

      // Upload all files with real progress tracking
      const result = await uploadFiles(pendingFiles)

      if (result.success) {
        console.log('Upload success, result:', result); // Debug log
        
        // Update successful files with uploaded URLs
        setFiles(prev => prev.map((f, index) => {
          if (pendingFiles.some(pf => pf.id === f.id)) {
            // Use index to match uploaded file since we upload in order
            const uploadIndex = pendingFiles.findIndex(pf => pf.id === f.id);
            const uploadedFile = result.uploadedFiles?.[uploadIndex];
            
            console.log(`File ${f.name}:`, {
              uploadIndex,
              uploadedFile,
              originalUrl: f.preview,
              newUrl: uploadedFile?.url
            }); // Debug log
            
            return {
              ...f,
              status: 'success' as const,
              progress: 100,
              error: undefined,
              uploadedUrl: uploadedFile?.url || f.preview  // Use uploaded URL or fallback to preview
            }
          }
          return f
        }))

        toast.success(result.message)
        
        // Do not auto-close modal after upload - let user choose manually
        // Refresh gallery to show new uploads
        fetchMediaFiles(1, true)

      }

    } catch (error) {
      setFiles(prev => prev.map(f =>
        f.status === 'uploading'
          ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Yükleme başarısız' }
          : f
      ))

      toast.error("Dosya yükleme sırasında hata oluştu")
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // Load media files when dialog opens
  useEffect(() => {
    if (pageContentCategoryId) {
      fetchMediaFiles(1, true)
    }
  }, [pageContentCategoryId])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Sayfa İçin Resim Seç</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Galeri'den bir resim seçin veya yeni resim yükleyin
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="gallery" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery">Galeri</TabsTrigger>
              <TabsTrigger value="upload">Yükle</TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="flex-1 flex flex-col space-y-4 overflow-hidden">
              {/* Search */}
              <div className="flex gap-4 flex-shrink-0">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Resim ara..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                  📁 Sayfa İçerik Resimleri
                </div>
              </div>              {/* Selected Media Preview */}
              {selectedMedia && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={getThumbnailUrl(selectedMedia, 'small')}
                          alt={selectedMedia.alt || selectedMedia.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{selectedMedia.originalName}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedMedia.size)}</p>
                      </div>
                      <Badge variant="secondary">Seçili</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleMediaSelect(selectedMedia)}
                        size="sm"
                      >
                        Bu Resmi Seç
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMedia(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto">
                {loading && mediaFiles.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-500">Resimler yükleniyor...</p>
                    </div>
                  </div>
                ) : mediaFiles.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">Henüz resim yok</p>
                      <p className="text-sm text-gray-400">Yükle sekmesinden resim ekleyebilirsiniz</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {mediaFiles.map((media) => (
                      <div
                        key={media.id}
                        className={`
                          relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all
                          ${selectedMedia?.id === media.id
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                        onClick={() => setSelectedMedia(media)}
                        onDoubleClick={() => handleMediaSelect(media)}
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={getThumbnailUrl(media, 'small')}
                            alt={media.alt || media.originalName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Selection Indicator */}
                        {selectedMedia?.id === media.id && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check className="w-3 h-3" />
                          </div>
                        )}

                        {/* File Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs truncate">{media.originalName}</p>
                          <p className="text-xs text-gray-300">{formatFileSize(media.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Load More Button */}
                {currentPage < totalPages && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
                    </Button>
                  </div>
                )}              </div>
            </TabsContent>

            <TabsContent value="upload" className="flex-1 flex flex-col">
              <Card className="border-0 shadow-none flex-1">
                <CardContent className="p-6">
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                  />

                  {/* Drop Zone */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors hover:border-gray-400"
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">
                      Resimleri sürükleyip bırakın
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      veya
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click()
                        }
                      }}
                      className="mb-4"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Resim Seç
                    </Button>
                    <p className="text-xs text-gray-400">
                      Desteklenen formatlar: JPG, PNG, GIF, WebP
                      <br />
                      Önerilen boyut: {targetWidth}x{targetHeight} px
                    </p>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Seçilen Resimler ({files.length})</h3>
                      <div className="space-y-3">
                        {files.map((file) => (
                          <div key={file.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                            {/* File Preview */}
                            <div className="flex-shrink-0">
                              {file.preview ? (
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                  <FileImage className="w-8 h-8 text-gray-500" />
                                </div>
                              )}
                            </div>

                            {/* File Info and Metadata */}
                            <div className="flex-1 min-w-0 space-y-2">
                              <div>
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>

                              {/* Alt Text Input */}
                              <div>
                                <Label htmlFor={`alt-${file.id}`} className="text-xs font-medium">
                                  Alt Metni
                                </Label>
                                <Input
                                  id={`alt-${file.id}`}
                                  placeholder="Resmin açıklaması..."
                                  value={file.alt || ''}
                                  onChange={(e) => updateFileMetadata(file.id, 'alt', e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              {/* Caption Input */}
                              <div>
                                <Label htmlFor={`caption-${file.id}`} className="text-xs font-medium">
                                  Açıklama (İsteğe bağlı)
                                </Label>
                                <Textarea
                                  id={`caption-${file.id}`}
                                  placeholder="Resim açıklaması..."
                                  value={file.caption || ''}
                                  onChange={(e) => updateFileMetadata(file.id, 'caption', e.target.value)}
                                  className="mt-1"
                                  rows={2}
                                />
                              </div>

                              {/* Progress Bar */}
                              {file.status === 'uploading' && (
                                <Progress value={file.progress} className="mt-2" />
                              )}

                              {/* Error Message */}
                              {file.status === 'error' && (
                                <p className="text-xs text-red-500 mt-1">{file.error}</p>
                              )}                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 flex flex-col items-center gap-2 w-24">{/* Crop/Edit Button for pending files */}
                              {file.type.startsWith('image/') && file.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedImageForEdit(file)
                                    setIsImageEditorOpen(true)
                                  }}
                                  title="Resmi düzenle ve kırp"                                  className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 w-full"
                                >
                                  <Crop className="w-3 h-3 mr-1" />
                                  Kırp
                                </Button>
                              )}

                              {/* Manual select button for pending files (original preview) */}                              {file.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (file.preview) {
                                      onImageSelect(file.preview, file.alt)
                                      onClose()
                                      toast.success("Resim seçildi")
                                    }
                                  }}
                                  title="Resmi olduğu gibi seç (yüklemeden)"
                                  className="text-xs px-2 py-1 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 w-full"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Seç
                                </Button>
                              )}

                              {/* Success status with select button */}

                              {/* Manual select button for pending files (original preview) */}                              {file.status === 'success' && (
                                <div className="flex flex-col items-center gap-1 w-full">
                                  <Check className="w-5 h-5 text-green-500" />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUploadedFileSelect(file)}
                                    className="text-xs px-2 py-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 w-full"
                                  >
                                    Bu Resmi Seç
                                  </Button>
                                </div>
                              )}

                              {/* Remove button for pending files */}{/* Remove button for pending files */}                              {file.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                  title="Dosyayı kaldır"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Upload Button */}
                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading || files.length === 0 || files.every(f => f.status !== 'pending')}
                          className="min-w-[120px]"
                        >
                          {isUploading ? 'Yükleniyor...' : 'Resimleri Yükle'}
                        </Button>
                      </div>
                    </div>                  )}

                  {/* Image Editor Modal */}
                  <ImageEditorModal
                    isOpen={isImageEditorOpen}
                    onClose={() => setIsImageEditorOpen(false)}
                    imageFile={selectedImageForEdit}
                    onSave={handleImageEditorSave}
                    targetDimensions={targetWidth && targetHeight ? { width: targetWidth, height: targetHeight } : undefined}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
