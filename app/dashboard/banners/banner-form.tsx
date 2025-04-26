"use client"

import { useState, useCallback, useRef, useEffect } from "react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
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
  onFormChange?: (isDirty: boolean) => void
}

// Aspect ratio hesaplama yardımcı fonksiyonu
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  // Resmin doğal boyutlarına daha uygun bir başlangıç kırpma alanı oluştur
  // Tüm resmi kaplamaya çalışan bir yaklaşım
  const width = Math.min(90, (mediaHeight * aspect * 100) / mediaWidth)
  
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: width,
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
  groupHeight = 1080,
  onFormChange
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
  const [formChanged, setFormChanged] = useState(false)
  
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

  // Kırpma alanını hedef boyutlara göre otomatik ayarlama fonksiyonu
  const setOptimalCrop = useCallback(() => {
    if (!imgRef.current) return;
    
    const img = imgRef.current;
    const { naturalWidth, naturalHeight, width, height } = img;
    
    // Tam olarak hedef boyutlara göre hesaplama yap
    const targetAspect = groupWidth / groupHeight;
    const imageAspect = width / height;
    
    // Kırpma alanının genişliği ve yüksekliği (yüzde olarak)
    let cropWidth, cropHeight;
    
    if (targetAspect >= imageAspect) {
      // Hedef daha geniş, yatay sınırlama olacak
      cropWidth = 100; // Tam genişlik
      cropHeight = (width / targetAspect) * 100 / height; // Hedef oranı koruyacak yükseklik
    } else {
      // Hedef daha dar, dikey sınırlama olacak
      cropHeight = 100; // Tam yükseklik
      cropWidth = (height * targetAspect) * 100 / width; // Hedef oranı koruyacak genişlik
    }
    
    // Merkeze konumlandırılmış bir kırpma alanı oluştur
    const x = (100 - cropWidth) / 2;
    const y = (100 - cropHeight) / 2;
    
    const newCrop: Crop = {
      unit: '%',
      x,
      y,
      width: cropWidth,
      height: cropHeight
    };
    
    setCrop(newCrop);
    
    // Piksel bazlı kırpma bilgilerini de güncelle
    const pixelCrop: PixelCrop = {
      x: (newCrop.x * width) / 100,
      y: (newCrop.y * height) / 100,
      width: (newCrop.width * width) / 100,
      height: (newCrop.height * height) / 100,
      unit: 'px',
    };
    
    setCompletedCrop(pixelCrop);
  }, [aspect, groupWidth, groupHeight]);

  // Form değişikliğini watch ile izle
  form.watch((value) => {
    // Eğer daha önce form değişmediyse ve şu an değiştiyse
    const title = value.title !== (initialData?.title ?? "");
    const description = value.description !== (initialData?.description ?? "");
    const imageUrl = value.imageUrl !== (initialData?.imageUrl ?? "");
    const isActive = value.isActive !== (initialData?.isActive ?? true);
    const link = value.link !== (initialData?.link ?? "");

    const isChanged = title || description || imageUrl || isActive || link;
    if (formChanged !== isChanged) {
      setFormChanged(isChanged);
      
      // Üst bileşene bildir
      if (onFormChange) {
        onFormChange(isChanged);
      }
    }
  });

  // Görsel yüklendiğinde formu değişmiş olarak işaretle
  useEffect(() => {
    if (previewImage && previewImage !== initialData?.imageUrl) {
      setFormChanged(true);
      if (onFormChange) {
        onFormChange(true);
      }
    }
  }, [previewImage, initialData?.imageUrl, onFormChange]);

  // Resim yüklendiğinde optimal kırpma alanını ayarla
  useEffect(() => {
    if (imgRef.current && isCropDialogOpen && imgSrc) {
      // Bir süre bekleyerek resmin tam olarak yüklenmesini sağla
      const timer = setTimeout(() => {
        setOptimalCrop();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isCropDialogOpen, imgSrc, setOptimalCrop]);

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
      
      // Diyalog açıldığında kırpma alanını sıfırla
      // Sonrasında onImageLoad ile otomatik ayarlanacak
      setCrop(undefined)
      setCompletedCrop(undefined)
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

    // Kırpılan görüntünün tam olarak hedef boyutlarda olmasını sağla
    canvas.width = groupWidth
    canvas.height = groupHeight

    // Resmi kırp
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    // Önce kırpma işlemini gerçekleştir
    const sourceX = completedCrop.x * scaleX
    const sourceY = completedCrop.y * scaleY
    const sourceWidth = completedCrop.width * scaleX
    const sourceHeight = completedCrop.height * scaleY
    
    // Kırpılmış görseli tam hedef boyutlara ölçekle
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      groupWidth,
      groupHeight
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
    if (!file) return null;
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("width", groupWidth.toString());
    formData.append("height", groupHeight.toString());
    formData.append("groupId", groupId.toString());
    
    try {
      const xhr = new XMLHttpRequest();
      
      xhr.open("POST", "/api/upload", true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = function() {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } else {
            reject(new Error("Yükleme başarısız oldu"));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error("Yükleme sırasında bir hata oluştu"));
        };
      });
      
      xhr.send(formData);
      
      // Upload tamamlandığında
      const imageUrl = await uploadPromise;
      form.setValue("imageUrl", imageUrl, { shouldDirty: true });
      form.setValue("isActive", true, { shouldDirty: true }); // Yeni görsel yüklendiğinde banner'ı aktif yap
      
      return imageUrl;
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      toast.error("Dosya yüklenirken bir hata oluştu");
      return null;
    } finally {
      // Yükleme tamamlandığında progressi sıfırla
      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      // Başlangıçta manuel olarak setOptimalCrop çağrılacağından burada temel ayarları yap
      const { width, height } = e.currentTarget;
      
      // Resmin yüklendiğini işaretle ama kırpma alanını setOptimalCrop belirleyecek
      // Bu sayede useEffect ile daha doğru bir zamanlama sağlanır
      if (!crop) {
        // Geçici bir crop değeri ata, setOptimalCrop bunu düzeltecek
        const initialCrop = centerAspectCrop(width, height, aspect);
        setCrop(initialCrop);
      }
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true)

      if (!values.imageUrl) {
        toast.error("Lütfen bir görsel seçin")
        return
      }

      // Banner grubunun boyutlarını kontrol et
      if (previewImage) {
        // Gerçek görsel boyutlarını kontrol et
        const img = new Image()
        img.src = previewImage
        await new Promise((resolve) => {
          img.onload = resolve
        })

        // Görsel boyutları ile istenen boyutları karşılaştır
        if (img.width !== groupWidth || img.height !== groupHeight) {
          // İdeal boyutlarda değilse kullanıcıyı uyar ve pasif olarak kaydet
          const confirmMessage = `Görsel boyutları (${img.width}x${img.height}px) banner grubu boyutlarıyla uyumlu değil (${groupWidth}x${groupHeight}px). Görsel boyutu uyumlu olmadığı için banner pasif olarak kaydedilecektir.`
          
          toast.warning(confirmMessage)
          values.isActive = false
        }
      }

      // API isteği
      const response = await fetch(`/api/banners${bannerId ? `/${bannerId}` : ''}`, {
        method: bannerId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          groupId
        }),
      })

      if (!response.ok) {
        throw new Error(`Banner ${bannerId ? 'güncellenirken' : 'oluşturulurken'} bir hata oluştu`)
      }

      toast.success(`Banner başarıyla ${bannerId ? 'güncellendi' : 'oluşturuldu'}`)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Banner formu gönderilirken hata:", error)
      toast.error(error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  // İptal fonksiyonu
  function handleCancel() {
    setFormChanged(false)
    if (onFormChange) onFormChange(false)
    if (onSuccess) {
      onSuccess();
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : bannerId ? "Güncelle" : "Ekle"}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog 
        open={isCropDialogOpen} 
        onOpenChange={(open) => {
          // Sadece açma işleminde izin ver, kapanma işlemleri butonlarla yönetilsin
          if (open) {
            setIsCropDialogOpen(true);
          }
          // Açıkça kapatma isteği geldiğinde (dışarı tıklama, escape tuşu vb.) hiçbir işlem yapmayız
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resmi Kırp</DialogTitle>
            <DialogDescription>
              Önerilen Banner Boyutu: {groupWidth}x{groupHeight}px
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {imgSrc && (
              <>
                <div className="flex justify-between items-center mb-2 text-sm">
                  <div className="text-muted-foreground">
                    Orijinal Boyut: {imgRef.current ? `${imgRef.current.naturalWidth}x${imgRef.current.naturalHeight}px` : 'Yükleniyor...'}
                  </div>
                  <div className="text-muted-foreground">
                    Kırpma Boyutu: {completedCrop 
                      ? `${Math.round(completedCrop.width * (imgRef.current?.naturalWidth || 0) / 100)}x${Math.round(completedCrop.height * (imgRef.current?.naturalHeight || 0) / 100)}px` 
                      : 'Kırpma alanı seçilmedi'}
                  </div>
                </div>
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => {
                    setCrop(percentCrop);
                    // onChange sırasında da boyut bilgilerini güncelle
                    if (imgRef.current) {
                      const { width, height, naturalWidth, naturalHeight } = imgRef.current;
                      const pixelCrop: PixelCrop = {
                        x: (percentCrop.x * width) / 100,
                        y: (percentCrop.y * height) / 100,
                        width: (percentCrop.width * width) / 100,
                        height: (percentCrop.height * height) / 100,
                        unit: 'px',
                      };
                      setCompletedCrop(pixelCrop);
                    }
                  }}
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
                <div className="flex justify-between items-center mt-2 text-sm">
                  <button 
                    type="button"
                    className="text-muted-foreground hover:text-primary flex items-center gap-1.5 px-2 py-1 rounded hover:bg-primary/5 transition-colors"
                    onClick={setOptimalCrop}
                    title="Kırpma alanını otomatik ayarla"
                  >
                    <span>Hedef Boyuta Ayarla:</span>
                    <span className="font-medium">{groupWidth}x{groupHeight}px</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </button>
                  <div className="text-primary font-medium">
                    {completedCrop && imgRef.current && (
                      <>
                        {Math.round(completedCrop.width * imgRef.current.naturalWidth / imgRef.current.width)}
                        x
                        {Math.round(completedCrop.height * imgRef.current.naturalHeight / imgRef.current.height)}
                        px
                      </>
                    ) || 'Kırpma işlemini tamamlayın'}
                  </div>
                </div>
              </>
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