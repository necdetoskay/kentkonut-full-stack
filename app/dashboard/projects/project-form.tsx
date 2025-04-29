"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { MapPin, X } from "lucide-react"
import dynamic from "next/dynamic"
import RichTextEditor from "../../components/rich-text-editor"
import { useDropzone } from "react-dropzone"
import { DirectCropper } from "../banners/components/direct-cropper"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  title: z.string().min(1, "Proje adı zorunludur"),
  description: z.string().min(1, "Açıklama zorunludur"),
  location: z.string().optional(),
  isActive: z.boolean(),
  coverImage: z.string().min(1, "Kapak görseli zorunludur"),
  status: z.enum(["ONGOING", "COMPLETED", "PLANNING"]),
  mainImage: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const LeafletMap = dynamic(() => import("./components/LeafletMap"), { ssr: false })

export function ProjectForm({ initialData, onFormChange, defaultStatus, onIsActiveChange }: { initialData?: Partial<FormValues>; onFormChange: (isDirty: boolean) => void; defaultStatus?: "ONGOING" | "COMPLETED" | "PLANNING"; onIsActiveChange?: (val: boolean) => void }) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      isActive: initialData?.isActive ?? true,
      coverImage: initialData?.coverImage ?? "",
      status: initialData?.status ?? defaultStatus ?? "ONGOING",
      mainImage: initialData?.mainImage ?? "",
    },
  })

  const [mapOpen, setMapOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.coverImage || null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [mainPreview, setMainPreview] = useState<string | null>(initialData?.mainImage || null)
  const [mainCropOpen, setMainCropOpen] = useState(false)
  const [mainCropped, setMainCropped] = useState<string | null>(null)
  const [mediaList, setMediaList] = useState<Array<{ type: 'image' | 'video', src: string, file?: File }>>([])
  const [mediaCropDialogOpen, setMediaCropDialogOpen] = useState(false)
  const [mediaCropImage, setMediaCropImage] = useState<string | null>(null)
  const [pendingMediaFile, setPendingMediaFile] = useState<File | null>(null)

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      // Eski resim ve videoları mediaList'e ekle (file olmadan)
      const oldImages = ((initialData as any)?.images ?? []).map((img: any) => ({ type: 'image', src: img.url || img }));
      const oldVideos = ((initialData as any)?.videos ?? []).map((vid: any) => ({ type: 'video', src: vid.url || vid }));
      setMediaList(prev => {
        // Sadece ilk yüklemede ekle, tekrar tekrar eklenmesin
        if (prev.length === 0) {
          return [...oldImages, ...oldVideos];
        }
        return prev;
      });
    }
  }, [initialData]);

  // isActive değiştiğinde üst parent'a bildir
  useEffect(() => {
    if (onIsActiveChange) {
      const subscription = form.watch((values, { name }) => {
        if (name === 'isActive') {
          onIsActiveChange(values.isActive);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onIsActiveChange]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        setIsCropDialogOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
  })

  const handleCropComplete = (croppedImage: string, outputScale?: number) => {
    console.log("Cropped image received with scale:", outputScale, "%");
    setCroppedImage(croppedImage)
    setPreviewImage(croppedImage)
    form.setValue("coverImage", croppedImage, { shouldDirty: true })
    setIsCropDialogOpen(false)
  }

  const onMainDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {D
      const reader = new FileReader()
      reader.onloadend = () => {
        setMainPreview(reader.result as string)
        setMainCropOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps: getMainRootProps, getInputProps: getMainInputProps, isDragActive: isMainDragActive } = useDropzone({
    onDrop: onMainDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
  })

  const handleMainCropComplete = (croppedImageData: string) => {
    setMainCropped(croppedImageData)
    setMainPreview(croppedImageData)
    form.setValue("mainImage", croppedImageData, { shouldDirty: true })
    setMainCropOpen(false)
  }

  const onMediaDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    // Boyut ve tip kontrolü
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast.error('Dosya boyutu 20MB üzerinde olamaz.');
      return;
    }
    if (file.type.startsWith('image/')) {
      if (!validImageTypes.includes(file.type)) {
        toast.error('Geçersiz resim formatı. Sadece JPG, PNG, WebP, GIF yükleyebilirsiniz.');
        return;
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaCropImage(reader.result as string)
        setPendingMediaFile(file)
        setMediaCropDialogOpen(true)
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('video/')) {
      if (!validVideoTypes.includes(file.type)) {
        toast.error('Geçersiz video formatı. Sadece MP4, WebM, MOV yükleyebilirsiniz.');
        return;
      }
      const url = URL.createObjectURL(file)
      setMediaList(prev => [...prev, { type: 'video', src: url, file }])
    } else {
      toast.error('Sadece resim veya video dosyası yükleyebilirsiniz.');
    }
  }

  const handleMediaCropComplete = (croppedImageData: string) => {
    if (pendingMediaFile) {
      setMediaList(prev => [...prev, { type: 'image', src: croppedImageData, file: pendingMediaFile }])
      setPendingMediaFile(null)
      setMediaCropImage(null)
      setMediaCropDialogOpen(false)
    }
  }

  const handleRemoveMedia = (idx: number) => {
    setMediaList(prev => prev.filter((_, i) => i !== idx))
  }

  const { getRootProps: getMediaRootProps, getInputProps: getMediaInputProps, isDragActive: isMediaDragActive } = useDropzone({
    onDrop: onMediaDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'video/mp4': [],
      'video/webm': [],
    },
    maxFiles: 1,
  })

  const onSubmit = async (data: FormValues) => {
    try {
      let projectId = (initialData as any)?.id;
      let isEdit = !!projectId;
      let coverImageUrl = data.coverImage;
      let mainImageUrl = data.mainImage;

      // 1. Eğer yeni proje ise önce projeyi kaydet, id al
      if (!isEdit) {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            coverImage: '',
            mainImage: '',
            images: [],
            videos: [],
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Project create error:', errorText);
          throw new Error('Proje kaydedilemedi (ilk kayıt)');
        }
        const created = await response.json();
        projectId = created.id;
        isEdit = true;
      }

      // 2. Medya yükleme için hedef klasör
      const targetFolder = `projeler/${projectId}`;

      // Kapak görseli yükle
      if (coverImageUrl && coverImageUrl.startsWith('data:')) {
        const base64Response = await fetch(coverImageUrl);
        const blob = await base64Response.blob();
        const file = new File([blob], `project-cover-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('files', file);
        formData.append('targetFolder', targetFolder);
        Array.from(formData.entries()).forEach(([key, value]) => {
          console.log('CoverImage FormData:', key, value);
        });
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadResponse.ok) throw new Error('Image upload failed');
        const uploadData = await uploadResponse.json();
        if (uploadData.urls && uploadData.urls.length > 0) {
          coverImageUrl = uploadData.urls[0];
        } else {
          throw new Error('No URL returned from upload');
        }
      }
      // Ana görsel yükle
      if (mainImageUrl && mainImageUrl.startsWith('data:')) {
        const base64Response = await fetch(mainImageUrl);
        const blob = await base64Response.blob();
        const file = new File([blob], `project-main-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('files', file);
        formData.append('targetFolder', targetFolder);
        Array.from(formData.entries()).forEach(([key, value]) => {
          console.log('MainImage FormData:', key, value);
        });
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadResponse.ok) throw new Error('Image upload failed');
        const uploadData = await uploadResponse.json();
        if (uploadData.urls && uploadData.urls.length > 0) {
          mainImageUrl = uploadData.urls[0];
        } else {
          throw new Error('No URL returned from upload');
        }
      }
      // Medyalar yükle
      const imageFiles = mediaList.filter(m => m.type === 'image' && m.file);
      const videoFiles = mediaList.filter(m => m.type === 'video' && m.file);
      const oldImageUrls = mediaList
        .filter(m => m.type === 'image' && !m.file && typeof m.src === 'string')
        .map(m => m.src);
      const oldVideoUrls = mediaList
        .filter(m => m.type === 'video' && !m.file && typeof m.src === 'string')
        .map(m => m.src);
      let newImageUrls: string[] = [];
      let newVideoUrls: string[] = [];
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(media => formData.append('files', media.file!));
        formData.append('targetFolder', targetFolder);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Medya (resim) yüklenemedi');
        const uploadData = await uploadRes.json();
        newImageUrls = uploadData.urls || [];
      }
      if (videoFiles.length > 0) {
        const formData = new FormData();
        videoFiles.forEach(media => formData.append('files', media.file!));
        formData.append('targetFolder', targetFolder);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Medya (video) yüklenemedi');
        const uploadData = await uploadRes.json();
        newVideoUrls = uploadData.urls || [];
      }
      const imageUrls = [...oldImageUrls, ...newImageUrls];
      const videoUrls = [...oldVideoUrls, ...newVideoUrls];

      // 3. Projeyi güncelle (PATCH)
      const url = `/api/projects/${projectId}`;
      const bodyData = {
        ...data,
        coverImage: coverImageUrl,
        mainImage: mainImageUrl,
        images: imageUrls,
        videos: videoUrls,
      };
      console.log("PATCH bodyData:", JSON.stringify(bodyData, null, 2));
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Project update error:', errorText);
        throw new Error('Proje güncellenemedi (medya sonrası)');
      }
      toast.success('Proje başarıyla kaydedildi!');
      // Yönlendirme: Duruma göre doğru taba git
      const status = data.status || defaultStatus || 'ONGOING';
      if (status === 'COMPLETED') {
        router.push('/dashboard/projects?tab=completed');
      } else {
        router.push('/dashboard/projects?tab=ongoing');
      }
    } catch (err) {
      console.error('onSubmit error:', err);
      toast.error('Proje kaydedilemedi!');
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="relative bg-white rounded-lg p-6 mb-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Proje Adı</FormLabel>
                <FormControl>
                  <Input placeholder="Proje adı" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Proje hakkında detaylı açıklama yazın..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proje Tipi</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Proje Tipi Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONGOING">Devam Eden</SelectItem>
                    <SelectItem value="PLANNING">Planlanan</SelectItem>
                    <SelectItem value="COMPLETED">Tamamlanan</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konum</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <Input
                    placeholder="Koordinat (örn: 40.123,29.456)"
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setMapOpen(true)}
                    tabIndex={-1}
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
              <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                <DialogContent aria-describedby="map-dialog-desc">
                  <p id="map-dialog-desc" className="sr-only">
                    Haritadan konum seçmek için tıklayın.
                  </p>
                  <LeafletMap
                    onLocationSelect={(lat, lng) => {
                      field.onChange(`${lat.toFixed(6)},${lng.toFixed(6)}`)
                      setMapOpen(false)
                    }}
                  />
                </DialogContent>
              </Dialog>
            </FormItem>
          )}
        />
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Kapak Görseli */}
          <div className="flex-1 flex flex-col items-center">
            <span className="mb-2 font-semibold text-sm text-gray-700">Kapak Görseli <span className="text-xs text-muted-foreground">(370×255 px)</span></span>
            <div className="w-full max-w-[370px]">
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div
                        style={{ maxWidth: 370 }}
                        className="w-full"
                      >
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 bg-white hover:shadow-lg hover:border-primary ${(previewImage || croppedImage) ? "py-2" : "py-6"}`}>
                          <input {...getInputProps()} />
                          {(previewImage || croppedImage) ? (
                            <div className="space-y-2 relative">
                              <div className="relative w-full" style={{ height: '170px', maxWidth: '370px', margin: '0 auto' }}>
                                <Image
                                  src={croppedImage || previewImage || ""}
                                  alt="Kapak Görseli Önizleme"
                                  fill
                                  className="object-contain rounded"
                                />
                                <button
                                  type="button"
                                  aria-label="Görseli sil"
                                  className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 shadow z-10"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setPreviewImage(null);
                                    setCroppedImage(null);
                                    form.setValue("coverImage", "", { shouldDirty: true });
                                  }}
                                >
                                  <X className="w-5 h-5 text-destructive" />
                                </button>
                              </div>
                              <p className="text-sm text-muted-foreground">Görseli değiştirmek için tıklayın</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                              </div>
                              <p className="text-sm font-medium">{isDragActive ? "Resmi Buraya Bırakın" : "Resmi Sürükleyin veya Tıklayın"}</p>
                              <p className="text-xs text-muted-foreground mt-1">Önerilen boyut: 370x255 px</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DirectCropper
                open={isCropDialogOpen}
                onClose={() => setIsCropDialogOpen(false)}
                image={previewImage || ''}
                onCropComplete={(image, scale) => handleCropComplete(image, scale)}
                aspectRatio={370/255}
                width={370}
                height={255}
              />
            </div>
          </div>
          {/* Ana Resim */}
          <div className="flex-1 flex flex-col items-center">
            <span className="mb-2 font-semibold text-sm text-gray-700">Ana Resim <span className="text-xs text-muted-foreground">(1190×748 px)</span></span>
            <div className="w-full max-w-[400px]">
              <FormField
                control={form.control}
                name="mainImage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div style={{ maxWidth: 400 }} className="w-full">
                        <div {...getMainRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 bg-white hover:shadow-lg hover:border-primary ${(mainPreview || mainCropped) ? "py-2" : "py-6"}`}>
                          <input {...getMainInputProps()} />
                          {(mainPreview || mainCropped) ? (
                            <div className="space-y-2 relative">
                              <div className="relative w-full" style={{ height: '252px', maxWidth: '400px', margin: '0 auto' }}>
                                <Image
                                  src={mainCropped || mainPreview || ""}
                                  alt="Ana Resim Önizleme"
                                  fill
                                  className="object-contain rounded"
                                />
                                <button
                                  type="button"
                                  aria-label="Görseli sil"
                                  className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 shadow z-10"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setMainPreview(null);
                                    setMainCropped(null);
                                    form.setValue("mainImage", "", { shouldDirty: true });
                                  }}
                                >
                                  <X className="w-5 h-5 text-destructive" />
                                </button>
                              </div>
                              <p className="text-sm text-muted-foreground">Görseli değiştirmek için tıklayın</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                              </div>
                              <p className="text-sm font-medium">{isMainDragActive ? "Resmi Buraya Bırakın" : "Resmi Sürükleyin veya Tıklayın"}</p>
                              <p className="text-xs text-muted-foreground mt-1">Önerilen boyut: 1190x748 px</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DirectCropper
                open={mainCropOpen}
                onClose={() => setMainCropOpen(false)}
                image={mainPreview || ''}
                onCropComplete={(image, scale) => handleCropComplete(image, scale)}
                aspectRatio={1190/748}
                width={1190}
                height={748}
              />
            </div>
          </div>
        </div>
        {/* Medyalar Alanı */}
        <div className="mt-8">
          <div className="mb-2 font-semibold text-base text-gray-700">Medyalar</div>
          <div className="flex flex-row gap-6 items-start">
            {/* Dropzone */}
            <div {...getMediaRootProps()} className={`w-32 h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer bg-white hover:shadow-lg hover:border-primary transition-all duration-200 ${isMediaDragActive ? 'border-primary bg-primary/10' : ''}`}>
              <input {...getMediaInputProps()} />
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <span className="text-sm font-medium">{isMediaDragActive ? 'Dosyayı Bırakın' : 'Resim veya Video Yükle'}</span>
                <span className="text-xs text-muted-foreground mt-1">Resim: 1190x748 px</span>
              </div>
            </div>
            {/* Medya Önizlemeleri */}
            <div className="flex flex-row gap-4 flex-wrap">
              {mediaList.map((media, idx) => {
                // src'nin string olup olmadığını kontrol et
                const isValidSrc = typeof media.src === 'string' && media.src.trim() !== '';
                if (!isValidSrc) return null;
                return (
                  <div key={idx} className="relative w-[120px] h-[80px] group">
                    {media.type === 'image' ? (
                      <img src={media.src} className="object-cover w-full h-full rounded" />
                    ) : (
                      <video src={media.src} controls className="object-cover w-full h-full rounded" />
                    )}
                    <button type="button" onClick={() => handleRemoveMedia(idx)} className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1 shadow z-10 opacity-80 group-hover:opacity-100">
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <DirectCropper
            open={mediaCropDialogOpen}
            onClose={() => setMediaCropDialogOpen(false)}
            image={mediaCropImage || ''}
            onCropComplete={(image, scale) => handleCropComplete(image, scale)}
            aspectRatio={1190/748}
            width={1190}
            height={748}
          />
        </div>
        <Button type="submit">Kaydet</Button>
      </form>
    </Form>
  )
} 