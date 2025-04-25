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
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Banner grubu adı en az 2 karakter olmalıdır.",
  }),
  status: z.enum(["active", "passive"]),
  playMode: z.enum(["MANUAL", "AUTO"]),
  animationType: z.enum(["FADE", "SLIDE", "ZOOM"]),
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

export function BannerGroupForm({ onSuccess, bannerGroup }: BannerGroupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

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

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)
      const url = bannerGroup
        ? `/api/banner-groups/${bannerGroup.id}`
        : "/api/banner-groups"
      const method = bannerGroup ? "PUT" : "POST"

      // API'ye gönderilecek veriyi hazırla
      const apiData = {
        name: data.name,
        status: data.status,
        playMode: data.playMode,
        animationType: data.animationType,
        displayDuration: Math.round(data.displayDuration * 1000), // Saniyeyi milisaniyeye çevir
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
      
      toast.success(
        bannerGroup
          ? "Banner grubu başarıyla güncellendi"
          : "Banner grubu başarıyla oluşturuldu"
      )
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error("Form hatası:", error)
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Grubu Adı</FormLabel>
              <FormControl>
                <Input placeholder="Ana Sayfa Bannerları" {...field} />
              </FormControl>
              <FormDescription>
                Banner grubunu tanımlayan benzersiz bir isim.
              </FormDescription>
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
              <FormDescription>
                Banner grubunun görüntülenme durumu.
              </FormDescription>
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
                  <SelectItem value="MANUAL">Manuel</SelectItem>
                  <SelectItem value="AUTO">Otomatik</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Banner grubundaki bannerların oynatılma modu.
              </FormDescription>
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
                  <SelectItem value="FADE">Solma</SelectItem>
                  <SelectItem value="SLIDE">Kayma</SelectItem>
                  <SelectItem value="ZOOM">Yakınlaştırma</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Bannerlar arasındaki geçiş animasyonu.
              </FormDescription>
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
              <FormDescription>
                Her bannerın ekranda kalma süresi.
              </FormDescription>
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
              <FormDescription>
                Bannerlar arası geçiş animasyonunun süresi.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genişlik (px)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Banner grubunun genişliği.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yükseklik (px)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Banner grubunun yüksekliği.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? bannerGroup
                ? "Güncelleniyor..."
                : "Oluşturuluyor..."
              : bannerGroup
              ? "Güncelle"
              : "Oluştur"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 