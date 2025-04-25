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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Banner başlığı en az 2 karakter olmalıdır.",
  }),
  description: z.string().optional(),
  imageUrl: z.string().url({
    message: "Geçerli bir resim URL'si giriniz.",
  }),
  linkUrl: z.string().url({
    message: "Geçerli bir link URL'si giriniz.",
  }).optional(),
  active: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface BannerFormProps {
  groupId: string
  onSuccess?: () => void
  banner?: {
    id: string
    title: string
    description?: string
    imageUrl: string
    linkUrl?: string
    active: boolean
    startDate?: string
    endDate?: string
  }
}

export function BannerForm({ groupId, onSuccess, banner }: BannerFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: banner || {
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      active: true,
      startDate: "",
      endDate: "",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)
      const url = banner
        ? `/api/banners/${banner.id}`
        : "/api/banners"
      const method = banner ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          groupId,
        }),
      })

      if (!response.ok) {
        throw new Error(
          banner
            ? "Banner güncellenirken bir hata oluştu"
            : "Banner oluşturulurken bir hata oluştu"
        )
      }

      toast.success(
        banner
          ? "Banner başarıyla güncellendi"
          : "Banner başarıyla oluşturuldu"
      )
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error("Form hatası:", error)
      toast.error(
        banner
          ? "Banner güncellenirken bir hata oluştu"
          : "Banner oluşturulurken bir hata oluştu"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Başlığı</FormLabel>
              <FormControl>
                <Input placeholder="Banner başlığı" {...field} />
              </FormControl>
              <FormDescription>
                Bannerın görüntülenecek başlığı.
              </FormDescription>
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
                <Textarea
                  placeholder="Banner açıklaması"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Banner hakkında kısa bir açıklama.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resim URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Banner resminin URL adresi.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormDescription>
                Banner tıklandığında yönlendirilecek adres.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Aktif</FormLabel>
                <FormDescription>
                  Bannerın görüntülenme durumu.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Başlangıç Tarihi</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                Bannerın görüntülenmeye başlayacağı tarih.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bitiş Tarihi</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                Bannerın görüntülenmesinin sona ereceği tarih.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? banner
                ? "Güncelleniyor..."
                : "Oluşturuluyor..."
              : banner
              ? "Güncelle"
              : "Oluştur"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 