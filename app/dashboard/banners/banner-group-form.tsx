"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { PlayMode, AnimationType } from "@/lib/constants/banner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface BannerGroupFormProps {
  onSuccess?: () => void
  bannerGroup?: {
    id: string
    name: string
    status: "active" | "passive"
    playMode: "MANUAL" | "AUTO"
    animationType: "FADE" | "SLIDE" | "ZOOM"
    displayDuration: number
    transitionDuration: number
    width: number
    height: number
  }
  onFormChange?: (isDirty: boolean) => void
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Banner grubu adı en az 2 karakter olmalıdır.",
  }),
  status: z.enum(["active", "passive"]),
  playMode: z.enum([PlayMode.MANUAL, PlayMode.AUTO]),
  animationType: z.enum([AnimationType.FADE, AnimationType.SLIDE, AnimationType.ZOOM]),
  displayDuration: z.coerce.number().min(1, {
    message: "Görüntülenme süresi en az 1 saniye olmalıdır.",
  }),
  transitionDuration: z.coerce.number().min(0.1, {
    message: "Geçiş süresi en az 0.1 saniye olmalıdır.",
  }),
  width: z.coerce.number().min(1, {
    message: "Genişlik en az 1 piksel olmalıdır.",
  }),
  height: z.coerce.number().min(1, {
    message: "Yükseklik en az 1 piksel olmalıdır.",
  }),
})

type FormValues = z.infer<typeof formSchema>

export function BannerGroupForm({ onSuccess, bannerGroup, onFormChange }: BannerGroupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSizeChangeDialog, setShowSizeChangeDialog] = useState(false)
  const [formValues, setFormValues] = useState<FormValues | null>(null)
  const [sizeChanged, setSizeChanged] = useState(false)
  const [formChanged, setFormChanged] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: bannerGroup?.name ?? "",
      status: bannerGroup?.status ?? "active",
      playMode: bannerGroup?.playMode ?? "MANUAL",
      animationType: bannerGroup?.animationType ?? "FADE",
      displayDuration: bannerGroup?.displayDuration ?? 5,
      transitionDuration: bannerGroup?.transitionDuration ?? 0.5,
      width: bannerGroup?.width ?? 1920,
      height: bannerGroup?.height ?? 1080,
    },
  })

  const widthValue = form.watch("width")
  const heightValue = form.watch("height")

  const originalWidth = bannerGroup?.width
  const originalHeight = bannerGroup?.height

  // Form değişikliğini watch ile izle
  form.watch((value) => {
    // Değerlerin değişip değişmediğini kontrol et
    const name = value.name !== (bannerGroup?.name ?? "");
    const status = value.status !== (bannerGroup?.status ?? "active");
    const playMode = value.playMode !== (bannerGroup?.playMode ?? "MANUAL");
    const animationType = value.animationType !== (bannerGroup?.animationType ?? "FADE");
    const displayDuration = value.displayDuration !== (bannerGroup?.displayDuration ?? 5);
    const transitionDuration = value.transitionDuration !== (bannerGroup?.transitionDuration ?? 0.5);
    const width = value.width !== (bannerGroup?.width ?? 1920);
    const height = value.height !== (bannerGroup?.height ?? 1080);

    const isChanged = name || status || playMode || animationType || 
                      displayDuration || transitionDuration || width || height;

    if (formChanged !== isChanged) {
      setFormChanged(isChanged);
      
      // Global değişkeni de ayarla (tarayıcı uyarıları için)
      if (typeof window !== 'undefined') {
        (window as any).isAnyFormDirty = isChanged;
      }
      
      // Üst bileşene bildir
      if (onFormChange) {
        onFormChange(isChanged);
      }
    }
  });

  async function handleSubmitWithConfirm(data: FormValues) {
    if (!bannerGroup || (data.width === originalWidth && data.height === originalHeight)) {
      await onSubmit(data)
      return
    }

    if (data.width !== originalWidth || data.height !== originalHeight) {
      setFormValues(data)
      setShowSizeChangeDialog(true)
      setSizeChanged(true)
    } else {
      await onSubmit(data)
    }
  }

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)
      const url = bannerGroup
        ? `/api/banner-groups/${bannerGroup.id}`
        : "/api/banner-groups"
      const method = bannerGroup ? "PUT" : "POST"

      const apiData = {
        name: data.name,
        status: data.status,
        playMode: data.playMode,
        animationType: data.animationType,
        displayDuration: Math.round(data.displayDuration * 1000),
        transitionDuration: Number(data.transitionDuration),
        width: Number(data.width),
        height: Number(data.height),
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData)
        throw new Error(errorData.message || "Banner grubu güncellenirken bir hata oluştu")
      }

      const result = await response.json()
      
      // Size değişikliği varsa özel mesaj göster
      const sizeChanged = bannerGroup && 
                         (Number(data.width) !== originalWidth || 
                          Number(data.height) !== originalHeight);
      
      if (sizeChanged) {
        toast.success("Banner grubu güncellendi. Banner boyutları değişti, görselleri yeniden boyutlandırmanız gerekebilir.");
      } else {
        toast.success(bannerGroup ? "Banner grubu güncellendi" : "Banner grubu oluşturuldu");
      }
      
      // Form değişiklik durumunu sıfırla
      setFormChanged(false);
      
      // Global değişkeni de sıfırla
      if (typeof window !== 'undefined') {
        (window as any).isAnyFormDirty = false;
      }
      
      if (onFormChange) {
        onFormChange(false);
      }
      
      // Başarı callback'ini çağır ve sonra yönlendir
      if (onSuccess) {
        onSuccess();
      }
      
      // Yeni grup oluşturulmuşsa detay sayfasına yönlendir
      if (!bannerGroup) {
        router.push(`/dashboard/banners/${result.id}`);
      } else if (!onSuccess) {
        // onSuccess yoksa ana sayfaya yönlendir
        router.push("/dashboard/banners");
      }
    } catch (error) {
      console.error(error)
      toast.error("Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  // İptal fonksiyonu
  function handleCancel() {
    // Form değişiklik durumunu sıfırla
    setFormChanged(false);
    
    // Global değişkeni de sıfırla
    if (typeof window !== 'undefined') {
      (window as any).isAnyFormDirty = false;
    }
    
    if (onFormChange) {
      onFormChange(false);
    }
    
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/dashboard/banners");
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitWithConfirm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grup Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Ana Sayfa Bannerları" {...field} />
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
                  <FormLabel>Durum</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="passive">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="playMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Oynatma Modu</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Oynatma modu seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PlayMode.MANUAL}>Manuel</SelectItem>
                      <SelectItem value={PlayMode.AUTO}>Otomatik</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="animationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Animasyon Tipi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Animasyon tipi seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={AnimationType.FADE}>Solma</SelectItem>
                      <SelectItem value={AnimationType.SLIDE}>Kayma</SelectItem>
                      <SelectItem value={AnimationType.ZOOM}>Yakınlaştırma</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Görüntülenme Süresi (saniye)</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transitionDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geçiş Süresi (saniye)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genişlik (piksel)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yükseklik (piksel)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : (bannerGroup ? "Güncelle" : "Oluştur")}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={showSizeChangeDialog} onOpenChange={setShowSizeChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Banner boyutlarını değiştirmeyi onaylayın</DialogTitle>
            <DialogDescription>
              Banner grubunun boyutlarını değiştirmek, mevcut banner görsellerinin görünümünü bozabilir. 
              Değişiklikten sonra, bannerlar doğru görüntülenmeyebilir ve yeniden boyutlandırma gerekebilir.
              Devam etmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setShowSizeChangeDialog(false)}>
              İptal
            </Button>
            {bannerGroup && (
              <Button onClick={() => {
                if (formValues) {
                  onSubmit(formValues)
                  setShowSizeChangeDialog(false)
                }
              }}>
                Güncelle ve Detay Sayfasında Kal
              </Button>
            )}
            <Button onClick={() => {
              if (formValues) {
                onSubmit(formValues)
                setShowSizeChangeDialog(false)
                
                // Eğer mevcut grup güncelleniyorsa ve onSuccess yoksa, detay sayfasına git
                if (bannerGroup && !onSuccess) {
                  router.push(`/dashboard/banners/${bannerGroup.id}`);
                }
              }
            }}>
              {bannerGroup ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 