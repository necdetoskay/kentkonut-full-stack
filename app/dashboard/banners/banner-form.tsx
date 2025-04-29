"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
import { cn } from "@/lib/utils"
import { Trash } from "lucide-react"
import { DirectCropper } from "./components/direct-cropper"
import { useDropzone } from "react-dropzone"

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
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  weight: z.coerce.number().int().min(0).max(1000),
  groupId: z.string(),
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
  bannerGroup?: any
}

export function BannerForm({
  groupId,
  bannerId,
  initialData,
  onSuccess,
  groupWidth = 1920,
  groupHeight = 1080,
  onFormChange,
  bannerGroup
}: BannerFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.imageUrl || null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [formChanged, setFormChanged] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [showImageOptions, setShowImageOptions] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)

  const aspect = groupWidth / groupHeight

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      isActive: initialData?.isActive ?? true,
      link: initialData?.link ?? "",
      weight: initialData?.weight ?? 0,
      groupId: groupId.toString(),
      startDate: initialData?.startDate,
      endDate: initialData?.endDate,
    }
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        handleFileChange(file);
      }
    },
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1
  });

  // Form değişikliğini watch ile izle
  form.watch((value) => {
    // Eğer daha önce form değişmediyse ve şu an değiştiyse
    const title = value.title !== (initialData?.title ?? "");
    const description = value.description !== (initialData?.description ?? "");
    const imageUrl = value.imageUrl !== (initialData?.imageUrl ?? "");
    const isActive = value.isActive !== (initialData?.isActive ?? true);
    const link = value.link !== (initialData?.link ?? "");
    const weight = value.weight !== (initialData?.weight ?? 0);
    const startDate = value.startDate !== (initialData?.startDate ?? undefined);
    const endDate = value.endDate !== (initialData?.endDate ?? undefined);

    const isChanged = title || description || imageUrl || isActive || link || weight || startDate || endDate;
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

  // Base64 URL'yi File nesnesine dönüştürme
  function dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
  }

  // Helper function to prepare image for upload
  const prepareImageForUpload = async (base64Image: string): Promise<File> => {
    try {
      // Convert base64 to blob
      const base64Response = await fetch(base64Image);
      const blob = await base64Response.blob();
      
      // Generate a unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `banner-${timestamp}-${randomString}.jpg`;
      
      // Create a file from the blob
      return new File([blob], fileName, { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error preparing image for upload:', error);
      throw new Error('Failed to prepare image for upload');
    }
  }

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      // Initial imageUrl from form values or fallback to empty string
      let imageUrl = values.imageUrl || "";

      // If there's a cropped image, upload it first
      if (croppedImage) {
        try {
          // Use the helper function to prepare the image
          const file = await prepareImageForUpload(croppedImage);
          
          // Create FormData and append the file
          const formData = new FormData();
          formData.append('files', file);
          formData.append('targetFolder', 'banners');
          
          console.log('Uploading cropped image to /api/upload');
          
          // Upload the image
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload API error response:', errorText);
            throw new Error(`Image upload failed: ${uploadResponse.statusText}`);
          }
          
          const uploadData = await uploadResponse.json();
          console.log('Upload response:', uploadData);
          
          if (uploadData.urls && uploadData.urls.length > 0) {
            imageUrl = uploadData.urls[0];
            console.log('Image successfully uploaded, URL:', imageUrl);
          } else {
            throw new Error('No URL returned from upload');
          }
        } catch (error) {
          console.error('Error uploading cropped image:', error);
          toast.error('Failed to upload image. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // If we still don't have an image URL at this point, show an error
      if (!imageUrl) {
        toast.error('Görsel yüklemek zorunludur');
        setIsLoading(false);
        return;
      }

      // Construct JSON data with the image URL (either from form or newly uploaded)
      const jsonData = {
        groupId: parseInt(values.groupId.toString()),
        title: values.title,
        imageUrl: imageUrl,
        linkUrl: values.link || "",
        isActive: values.isActive,
        order: values.weight,
        startDate: values.startDate?.toISOString() || null,
        endDate: values.endDate?.toISOString() || null,
      };
      
      console.log("Sending banner data:", jsonData);
      
      if (bannerId) {
        // Update existing banner
        console.log("Updating banner ID:", bannerId);
        
        // API isteği
        const response = await fetch(`/api/banners/${bannerId}`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          console.error("API error response:", errorData);
          throw new Error(`Banner güncellenirken bir hata oluştu: ${errorData?.error || response.statusText}`);
        }

        toast.success("Banner başarıyla güncellendi");
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Yeni banner ekleme işlemi
        console.log("Creating new banner");
        
        // API isteği
        const response = await fetch("/api/banners", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          console.error("API error response:", errorData);
          throw new Error(`Banner oluşturulurken bir hata oluştu: ${errorData?.error || response.statusText}`);
        }

        const responseData = await response.json();
        console.log("Banner created successfully:", responseData);
        toast.success("Banner başarıyla oluşturuldu");
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Banner formu gönderilirken hata:", error);
      toast.error(error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
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

  // Görsel işlemleri için fonksiyonlar
  const handleSelectImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Tıklama olayının dışarı yayılmasını önle
    
    if (!previewImage) {
      // Eğer görsel yoksa önce dosya seçim ekranını aç
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
        } else {
      // Eğer görsel varsa seçenek menüsünü göster
      setShowImageOptions(true);
    }
  };

  const handleUploadNewImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Tıklama olayının dışarı yayılmasını önle
    setShowImageOptions(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCropCurrentImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Tıklama olayının dışarı yayılmasını önle
    setShowImageOptions(false);
    setIsCropDialogOpen(true);
  };

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
      handleFileChange(file)
    }
  }

  // Görsel yükleme işlemleri
  const handleFileChange = (file: File) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        setIsCropDialogOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImageData: string) => {
    setCroppedImage(croppedImageData)
    setPreviewImage(croppedImageData)
    form.setValue("imageUrl", "custom_cropped_image", { shouldDirty: true })
    setIsCropDialogOpen(false)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileChange(file)
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
                        (previewImage || croppedImage) ? "py-2" : "py-6"
                      )}
                      onClick={handleSelectImageClick}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {(previewImage || croppedImage) ? (
                        <div className="space-y-2 relative">
                          <div className="relative w-full" style={{ height: '200px' }}>
                            <Image
                              src={croppedImage || previewImage || ""}
                              alt="Önizleme"
                              fill
                              className="object-contain rounded"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Görsel ayarlarını değiştirmek için tıklayın
                          </p>
                          
                          {/* Görsel seçenekleri menüsü */}
                          {showImageOptions && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded z-50"
                              onClick={(e) => e.stopPropagation()} // Menü arka planına tıklamayı engellemek için
                            >
                              <div className="flex flex-col gap-2 p-4 bg-background rounded shadow-lg max-w-[220px] w-full">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="flex items-center gap-2 justify-start"
                                  onClick={handleUploadNewImage}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                  </svg>
                                  Yeni Resim Yükle
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="flex items-center gap-2 justify-start"
                                  onClick={handleCropCurrentImage}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                                    <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                                  </svg>
                                  Bu Resmi Kırp
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  className="mt-2" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowImageOptions(false);
                                  }}
                                >
                                  İptal
                                </Button>
                              </div>
                            </div>
                          )}
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

      {/* DirectCropper Entegrasyonu */}
      <DirectCropper 
        open={isCropDialogOpen} 
        onClose={() => setIsCropDialogOpen(false)}
        image={previewImage || ''}
        onCropComplete={handleCropComplete}
        aspectRatio={aspect}
        width={groupWidth}
        height={groupHeight}
      />

      {/* İşlemler dışında herhangi bir yere tıklanırsa görsel seçeneklerini kapat */}
      {showImageOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowImageOptions(false)} 
        />
      )}
    </>
  )
} 