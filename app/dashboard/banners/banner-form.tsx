"use client"

import { useState, useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import Image from "next/image"
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Başlık en az 2 karakter olmalıdır",
  }),
  description: z.string().optional(),
  imageUrl: z.string().min(1, {
    message: "Görsel gereklidir",
  }).optional().or(z.literal('')),
  isActive: z.boolean(),
  link: z.string().refine(
    (val) => {
      if (!val) return true; // Boş link kabul edilir
      if (val === '/') return true; // Ana sayfaya yönlendirme kabul edilir
      try {
        new URL(val.startsWith('http') ? val : `https://${val}`);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Geçerli bir URL giriniz",
    }
  ).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

interface BannerFormProps {
  groupId: string | number
  bannerId?: string
  initialData?: Partial<FormValues>
  onSuccess?: () => void
  groupWidth?: number
  groupHeight?: number
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

export function BannerForm({
  groupId,
  bannerId,
  initialData,
  onSuccess,
  groupWidth = 1920,
  groupHeight = 1080
}: BannerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.imageUrl || null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [uploadProgress, setUploadProgress] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const aspect = groupWidth / groupHeight
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      isActive: initialData?.isActive ?? true,
      link: initialData?.link ?? "",
    }
  })

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

    // Canvas boyutlarını ayarla
    canvas.width = completedCrop.width
    canvas.height = completedCrop.height

    // Resmi kırp
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    )

    // Canvas'ı blob'a dönüştür
    return new Promise<File | null>((resolve) => {
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
      }, 'image/jpeg', 0.95)
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
      formData.append("groupId", groupId.toString())
      formData.append("width", groupWidth.toString())
      formData.append("height", groupHeight.toString())

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
            form.setValue("imageUrl", response.url)
            setPreviewImage(response.url)
            toast.success("Resim başarıyla yüklendi")
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
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true)
      
      // URL formatını düzelt
      const formattedValues = { ...values };
      
      // Eğer link '/' ile başlıyorsa ve tam URL değilse, düzelt
      if (formattedValues.link && !formattedValues.link.match(/^https?:\/\//)) {
        // Link yalnızca '/' ise, olduğu gibi bırak (ana sayfa yönlendirme)
        if (formattedValues.link === '/') {
          // Link zaten doğru formatta
        }
        // Başka bir local path ise, tam URL'e çevir
        else if (formattedValues.link.startsWith('/')) {
          // Mevcut origin'i al (window.location.origin)
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          formattedValues.link = `${origin}${formattedValues.link}`;
        } else {
          // Başlangıç protokolü ekle
          formattedValues.link = `https://${formattedValues.link}`;
        }
      }

      // API'ye gönderilecek veriyi hazırla
      const apiData = {
        groupId: parseInt(groupId.toString()),
        title: formattedValues.title,
        description: formattedValues.description || "",
        imageUrl: formattedValues.imageUrl || "",
        linkUrl: formattedValues.link || "",
        isActive: formattedValues.isActive,
        // Opsiyonel alanları kaldıralım
        // order otomatik atanacak
      };

      console.log("Gönderilecek veriler:", apiData);
      
      // Doğru API endpoint'ini kullan
      const url = bannerId
        ? `/api/banners/${bannerId}`
        : `/api/banners`;
      
      const response = await fetch(url, {
        method: bannerId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      // API yanıtını ayrıntılı işle
      let responseData;
      try {
        // JSON yanıtı varsa parse et
        if (response.headers.get("content-type")?.includes("application/json")) {
          responseData = await response.json();
        } else {
          // JSON yanıtı yoksa text olarak al
          responseData = { message: await response.text() };
        }
      } catch (e) {
        console.error("API yanıtı parse edilemedi:", e);
        responseData = null;
      }
      
      console.log("API yanıtı:", response.status, responseData);

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || "Banner kaydedilirken bir hata oluştu";
        throw new Error(errorMessage);
      }

      toast.success(bannerId ? "Banner güncellendi" : "Banner eklendi")
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Banner form hatası:", error)
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu")
    } finally {
      setIsLoading(false)
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

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Başlık</FormLabel>
                <FormControl>
                  <Input placeholder="Banner başlığı" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Açıklama</FormLabel>
                <FormControl>
                  <Textarea placeholder="Banner açıklaması" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Görsel</FormLabel>
                <FormControl>
                  <div className="space-y-4">
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
                              className="object-contain rounded"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Resmi değiştirmek için tıklayın veya sürükleyin
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-6 w-6"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium">
                            {isDragging ? "Resmi Buraya Bırakın" : "Resmi Sürükleyin veya Tıklayın"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Önerilen boyut: {groupWidth}x{groupHeight}px
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Upload progress göstergesi */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} />
                        <p className="text-xs text-center text-muted-foreground">
                          Yükleniyor... %{uploadProgress}
                        </p>
                      </div>
                    )}
                    
                    <Input type="hidden" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yönlendirme Linki</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com veya /sayfa" {...field} />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  Tam URL veya site içi sayfa linki (örn: /hakkimizda)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 gap-4">
                <FormLabel className="text-base mb-0 font-medium cursor-pointer">Aktif</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Kaydediliyor..." : bannerId ? "Güncelle" : "Ekle"}
          </Button>
        </form>
      </Form>

      <Dialog 
        open={isCropDialogOpen} 
        onOpenChange={(open) => {
          // Sadece dialog kapatılmak istendiğinde kontrol yap
          if (!open) {
            // Dialog dışına tıklandığında kapanmasını engelle
            return;
          }
          setIsCropDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resmi Kırp</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {imgSrc && (
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
    </>
  )
} 