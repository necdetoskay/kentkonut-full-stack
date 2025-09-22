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

interface ImageUploaderProps {
  /** Yüklenen resmin genişliği (piksel) */
  width: number;
  /** Yüklenen resmin yüksekliği (piksel) */
  height: number;
  /** Başlangıçta gösterilecek resim URL'i (varsa) */
  initialImage?: string;
  /** Resim yüklendikten sonra çağrılacak callback */
  onImageUploaded: (imageUrl: string) => void;
  /** Yükleme sırasında gösterilecek metin */
  uploadingText?: string;
  /** Yükleme tamamlandığında gösterilecek metin */
  uploadedText?: string;
  /** Sürükle-bırak alanında gösterilecek metin */
  dropText?: string;
  /** Sürükle-bırak alanında gösterilecek alternatif metin */
  browseText?: string;
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

export default function ImageUploader({
  width,
  height,
  initialImage,
  onImageUploaded,
  uploadingText = "Yükleniyor...",
  uploadedText = "Resim başarıyla yüklendi",
  dropText = "Resmi Buraya Bırakın",
  browseText = "Resmi Sürükleyin veya Tıklayın",
  className,
}: ImageUploaderProps) {
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
  const [imageInfo, setImageInfo] = useState<{
    originalWidth: number;
    originalHeight: number;
    needsUpscaling: boolean;
    needsCropping: boolean;
  } | null>(null)

  const aspect = width / height
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
    const targetRatio = width / height;

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
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error("Lütfen geçerli bir görsel formatı yükleyin (JPEG, PNG, GIF, WebP)")
      return
    }

    // Crop dialog kullanma
    setSelectedFile(file)
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '')
      setIsCropDialogOpen(true)
    })
    reader.readAsDataURL(file)
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
      formData.append("width", width.toString())
      formData.append("height", height.toString())

      // İlerleme izleme için XMLHttpRequest kullanın
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.open('POST', '/api/upload-simple')

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(progress)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText)
            setPreviewImage(response.url)
            onImageUploaded(response.url)
            toast.success(uploadedText)
            resolve()
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
      console.error("Resim yükleme hatası:", error)
      toast.error(error instanceof Error ? error.message : "Resim yüklenirken bir hata oluştu")
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const img = e.currentTarget;
      const { width, height } = img;

      // Resim bilgilerini analiz et
      const strategy = calculateScalingStrategy(img.naturalWidth, img.naturalHeight);
      setImageInfo(strategy);

      // Kırpma alanını ayarla
      setCrop(centerAspectCrop(width, height, aspect));

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
  const confirmDeleteImage = () => {
    setPreviewImage(null)
    onImageUploaded("") // Boş URL gönder
    setIsDeleteDialogOpen(false)
    toast.success("Resim kaldırıldı")
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
                Resmi değiştirmek için tıklayın veya sürükleyin
              </p>
              <p className="text-xs text-muted-foreground">
                {width}x{height}px
              </p>
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
              Önerilen boyut: {width}x{height}px
            </p>
          </div>
        )}
      </div>

      {/* Upload progress göstergesi */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-xs text-center text-muted-foreground">
            {uploadingText} %{uploadProgress}
          </p>
        </div>
      )}

      {/* Kırpma Dialogu */}
      <Dialog
        open={isCropDialogOpen}
        onOpenChange={(open) => {
          if (!open) return;
          setIsCropDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Resmi Kırp</DialogTitle>
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
                  aspect={aspect}
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

      {/* Resim Silme Onay Dialogu */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resmi Kaldır</AlertDialogTitle>
            <AlertDialogDescription>
              Bu resmi kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteImage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Resmi Kaldır
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
