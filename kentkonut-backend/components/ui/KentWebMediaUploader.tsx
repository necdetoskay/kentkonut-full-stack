"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { toast } from "sonner"
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { X, Upload, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface KentWebMediaUploaderProps {
  /** ZORUNLU: Dosyanın kaydedileceği klasör adı (örn: "hafriyat", "banner", "proje") */
  customFolder: string;
  /** Yüklenen resmin genişliği (piksel) - varsayılan: 800 */
  width?: number;
  /** Yüklenen resmin yüksekliği (piksel) - varsayılan: 450 */
  height?: number;
  /** Crop aspect ratio - varsayılan: width/height oranı */
  aspectRatio?: number;
  /** Başlangıçta gösterilecek resim URL'i (varsa) */
  initialImage?: string;
  /** Resim yüklendikten sonra çağrılacak callback */
  onImageUploaded: (imageUrl: string) => void;
  /** Resim silindiğinde çağrılacak callback */
  onImageDeleted?: () => void;
  /** Yükleme sonrası uploader'ı temizle (galeri için yararlı) - varsayılan: false */
  clearAfterUpload?: boolean;
  /** Yükleme sırasında gösterilecek metin */
  uploadingText?: string;
  /** Yükleme tamamlandığında gösterilecek metin */
  uploadedText?: string;
  /** Sürükle-bırak alanında gösterilecek metin */
  dropText?: string;
  /** Sürükle-bırak alanında gösterilecek alternatif metin */
  browseText?: string;
  /** Cropping zorunlu mu? */
  enableCropping?: boolean;
  /** Özel CSS sınıfı */
  className?: string;
}

// Aspect ratio hesaplama yardımcı fonksiyonu
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function KentWebMediaUploader({
  customFolder,
  width = 800,
  height = 450,
  aspectRatio,
  initialImage,
  onImageUploaded,
  onImageDeleted,
  clearAfterUpload = false,
  uploadingText = "Yükleniyor...",
  uploadedText = "Medya başarıyla yüklendi",
  dropText = "Medyayı Buraya Bırakın",
  browseText = "Medyayı Sürükleyin veya Tıklayın",
  enableCropping = true,
  className,
}: KentWebMediaUploaderProps) {
  // customFolder zorunlu kontrolü
  if (!customFolder || customFolder.trim() === '') {
    throw new Error('KentWebMediaUploader: customFolder parametresi zorunludur!');
  }

  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(initialImage || null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageInfo, setImageInfo] = useState<{
    originalWidth: number;
    originalHeight: number;
    needsUpscaling: boolean;
    needsCropping: boolean;
  } | null>(null)

  const finalAspectRatio = aspectRatio || (width / height)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Resim ölçeklendirme stratejisini hesapla
  const calculateScalingStrategy = (
    originalWidth: number,
    originalHeight: number
  ) => {
    const originalRatio = originalWidth / originalHeight;
    const targetRatio = finalAspectRatio;

    // Resim hedef boyuttan küçük mü?
    const needsUpscaling = originalWidth < width || originalHeight < height;

    // Resim oranı hedef orandan farklı mı?
    const needsCropping = Math.abs(originalRatio - targetRatio) > 0.01;

    return {
      originalWidth,
      originalHeight,
      needsUpscaling,
      needsCropping,
      originalRatio,
      targetRatio
    };
  }

  const onSelectFile = (file: File) => {
    if (!file) return

    // Resim formatını kontrol et
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error("Lütfen geçerli bir görsel formatı yükleyin (JPEG, PNG, GIF, WebP)")
      return
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    setSelectedFile(file)

    if (enableCropping) {
      // Crop dialog kullan
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '')
        setIsCropDialogOpen(true)
      })
      reader.readAsDataURL(file)
    } else {
      // Direkt yükle
      uploadFile(file)
    }
  }

  // Client-side kırpma ve dosya oluşturma
  const cropAndCreateFile = async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      toast.error("Kırpma tamamlanamadı")
      return null
    }

    const image = imgRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      toast.error("Canvas context oluşturulamadı")
      return null
    }

    // Canvas boyutlarını ayarla - her zaman hedef boyutlara ölçeklendir
    canvas.width = width
    canvas.height = height

    // Resmi kırp ve hedef boyutlara ölçeklendir
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Görüntü işleme kalitesini artırmak için
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Resmi kırp ve ölçeklendir
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      width,
      height
    )

    // Eğer resim küçükse ve büyütülüyorsa, kullanıcıya bilgi ver
    if (imageInfo?.needsUpscaling) {
      console.log("Resim büyütülüyor:", imageInfo.originalWidth, "x", imageInfo.originalHeight, "->", width, "x", height);
    }

    // Canvas'ı blob'a dönüştür
    return new Promise<File | null>((resolve) => {
      // JPEG kalitesini ayarla - büyütme durumunda daha yüksek kalite kullan
      const jpegQuality = imageInfo?.needsUpscaling ? 0.98 : 0.95;

      canvas.toBlob((blob) => {
        if (!blob || !selectedFile) {
          resolve(null)
          return
        }

        // Yeni dosya oluştur
        const croppedFile = new File([blob], selectedFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })

        resolve(croppedFile)
      }, 'image/jpeg', jpegQuality)
    })
  }

  const onCropComplete = async () => {
    try {
      setIsLoading(true)
      setIsCropDialogOpen(false)

      // Resmi client-side kırp
      const croppedFile = await cropAndCreateFile()

      if (!croppedFile) {
        throw new Error("Resim kırpılamadı")
      }

      // Kırpılmış dosyayı yükle
      await uploadFile(croppedFile)

    } catch (error) {
      console.error("Kırpma hatası:", error)
      toast.error(error instanceof Error ? error.message : "Resim kırpılırken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  // İlerleme göstergeli dosya yükleme
  const uploadFile = async (file: File) => {
    try {
      setIsLoading(true)
      setUploadProgress(0)

      // Dosyayı FormData olarak hazırla
      const formData = new FormData()
      formData.append("file", file)
      formData.append("customFolder", customFolder)
      formData.append("width", width.toString())
      formData.append("height", height.toString())

      console.log('Uploading to folder:', customFolder);

      // İlerleme izleme için XMLHttpRequest kullan
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.open('POST', '/api/media')

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(progress)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText)
            
            if (response.success && response.data?.url) {
              // clearAfterUpload prop'u kontrolü
              if (clearAfterUpload) {
                // Galeri senaryosu: uploader'ı temizle
                setPreviewImage(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = '' // File input'u temizle
                }
              } else {
                // Normal senaryo: yüklenen resmi göster
                setPreviewImage(response.data.url)
              }
              
              onImageUploaded(response.data.url)
              toast.success(uploadedText)
              resolve()
            } else {
              reject(new Error(response.error || "Yükleme başarısız"))
            }
          } else {
            reject(new Error("Yükleme başarısız: " + xhr.statusText))
          }
        }

        xhr.onerror = () => {
          reject(new Error("Ağ hatası"))
        }

        xhr.send(formData)
      })

    } catch (error) {
      console.error("Medya yükleme hatası:", error)
      toast.error(error instanceof Error ? error.message : "Medya yüklenirken bir hata oluştu")
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (finalAspectRatio) {
      const img = e.currentTarget;
      const { width, height } = img;

      // Resim bilgilerini analiz et
      const strategy = calculateScalingStrategy(img.naturalWidth, img.naturalHeight);
      setImageInfo(strategy);

      // Kırpma alanını ayarla
      setCrop(centerAspectCrop(width, height, finalAspectRatio));

      console.log("Resim analizi:", strategy);
    }
  }

  // Gizli dosya input'u için referans
  const handleSelectImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Sürükle-bırak işlemlerini ele alma
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      onSelectFile(file)
    }
  }

  // Resim silme işlemi
  const handleDeleteImage = () => {
    setIsDeleteDialogOpen(true)
  }

  // Resim silme onayı
  const confirmDeleteImage = async () => {
    try {
      setIsDeleting(true)
      
      // Silme işlemini simüle et (gerçek senaryoda API çağrısı olabilir)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPreviewImage(null)
      onImageUploaded("") // Boş URL gönder
      onImageDeleted?.() // Optional callback
      toast.success("Medya kaldırıldı")
    } catch (error) {
      console.error("Silme hatası:", error)
      toast.error("Medya silinirken bir hata oluştu")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onSelectFile(file)
        }}
      />

      {/* Sürükle-bırak alanı */}
      <div
        ref={dropAreaRef}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "hover:border-primary",
          previewImage ? "py-2" : "py-6"
        )}
        onClick={handleSelectImageClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewImage ? (
          <div className="space-y-2">
            <div className="relative w-full" style={{ height: '200px' }}>
              <Image
                src={previewImage}
                alt="Önizleme"
                fill
                className="object-contain rounded border border-gray-200 p-1"
              />

              {/* Resim Silme Butonu */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-sm opacity-90 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage();
                }}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Medyayı değiştirmek için tıklayın veya sürükleyin
              </p>
              <div className="text-xs text-muted-foreground">
                <p>{width}x{height}px</p>
                <p className="text-blue-600">📁 {customFolder}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">
              {isDragging ? dropText : browseText}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Hedef boyut: {width}x{height}px • Klasör: <span className="text-blue-600 font-semibold">{customFolder}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {enableCropping ? "🔲 Kırpma etkin" : "⚡ Direkt yükleme"}
            </p>
          </div>
        )}
      </div>

      {/* Upload progress göstergesi */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-xs text-center text-muted-foreground">
            {uploadingText} %{uploadProgress} • Klasör: {customFolder}
          </p>
        </div>
      )}

      {/* Kırpma Dialogu */}
      {enableCropping && (
        <Dialog
          open={isCropDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsCropDialogOpen(false);
            }
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Medyayı Kırp - {customFolder}</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              {imgSrc && (
                <div className="space-y-4">
                  {/* Resim Bilgileri */}
                  {imageInfo && (
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div>
                          <span className="font-medium">Orijinal Boyut:</span> {imageInfo.originalWidth} × {imageInfo.originalHeight} px
                        </div>
                        <div>
                          <span className="font-medium">Hedef Boyut:</span> {width} × {height} px
                        </div>
                        <div>
                          <span className="font-medium">Klasör:</span> <span className="text-blue-600 font-semibold">{customFolder}</span>
                        </div>
                        {imageInfo.needsUpscaling && (
                          <div className="text-amber-500 font-medium">
                            ⚠️ Bu resim hedef boyuttan küçük. Kalite kaybı olabilir.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Kırpma Alanı */}
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={finalAspectRatio}
                    className="max-h-[500px] mx-auto"
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imgSrc}
                      onLoad={onImageLoad}
                      className="max-h-[500px] mx-auto"
                    />
                  </ReactCrop>

                  {/* Kırpma Bilgileri */}
                  {completedCrop && (
                    <div className="text-center text-sm text-muted-foreground">
                      Seçilen alan: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} px
                      {imageInfo?.needsUpscaling && (
                        <span className="ml-2">
                          (Hedef boyuta ölçeklendirilecek: {width} × {height} px)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCropDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={onCropComplete} disabled={isLoading}>
                {isLoading ? "İşleniyor..." : "Kırp ve Yükle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Resim Silme Onay Dialogu */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Medyayı Kaldır</AlertDialogTitle>
            <AlertDialogDescription>
              Bu medyayı kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.
              <br />
              <span className="text-blue-600 font-semibold">Klasör: {customFolder}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteImage}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Siliniyor..." : "Medyayı Kaldır"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
