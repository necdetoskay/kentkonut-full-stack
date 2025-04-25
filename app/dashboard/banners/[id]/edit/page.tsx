"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Banner grubu adı en az 2 karakter olmalıdır.",
  }),
  status: z.enum(["active", "passive"]),
  playMode: z.enum(["sequential", "random"]),
  animationType: z.enum(["fade", "slide"]),
  displayDuration: z.coerce.number().min(1, {
    message: "Görüntülenme süresi en az 1 saniye olmalıdır.",
  }),
  transitionDuration: z.coerce.number().min(0.1, {
    message: "Geçiş süresi en az 0.1 saniye olmalıdır.",
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function EditBannerGroupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: "active",
      playMode: "sequential",
      animationType: "fade",
      displayDuration: 5,
      transitionDuration: 0.5,
    },
  })

  useEffect(() => {
    const fetchBannerGroup = async () => {
      try {
        const response = await fetch(`/api/banner-groups/${params.id}`)
        if (!response.ok) {
          throw new Error("Banner grubu yüklenirken bir hata oluştu")
        }
        const data = await response.json()
        form.reset({
          name: data.name,
          status: data.active ? "active" : "passive",
          playMode: data.playMode,
          animationType: data.animation,
          displayDuration: data.duration / 1000,
          transitionDuration: 0.5,
        })
      } catch (error) {
        console.error("Banner grubu yüklenirken hata:", error)
        toast.error("Banner grubu yüklenirken bir hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBannerGroup()
  }, [params.id, form])

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/banner-groups/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Banner grubu güncellenirken bir hata oluştu")
      }

      toast.success("Banner grubu başarıyla güncellendi")
      router.push("/dashboard/banners")
      router.refresh()
    } catch (error) {
      console.error("Güncelleme hatası:", error)
      toast.error("Banner grubu güncellenirken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Banner Grubunu Düzenle</h2>
        <p className="text-muted-foreground">
          Banner grubunun özelliklerini güncelleyin
        </p>
      </div>
      <div className="mx-auto max-w-2xl">
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
                      <SelectItem value="sequential">Sıralı</SelectItem>
                      <SelectItem value="random">Rastgele</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Banner grubundaki bannerların oynatılma sırası.
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
                      <SelectItem value="fade">Solma</SelectItem>
                      <SelectItem value="slide">Kayma</SelectItem>
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
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/banners")}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
} 