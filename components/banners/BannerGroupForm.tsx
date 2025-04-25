"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { bannerGroupSchema, type BannerGroupFormValues } from "@/lib/validations/banner";

export function BannerGroupForm() {
  const router = useRouter();
  const form = useForm<BannerGroupFormValues>({
    resolver: zodResolver(bannerGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      playMode: "MANUAL",
      displayDuration: 5000,
      animationType: "FADE",
      width: 1920,
      height: 1080,
    },
  });

  async function onSubmit(data: BannerGroupFormValues) {
    try {
      const response = await fetch("/api/banner-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Bir hata oluştu");
      }

      toast.success("Banner grubu oluşturuldu");
      router.push("/dashboard/banners");
      router.refresh();
    } catch (error) {
      toast.error("Banner grubu oluşturulamadı");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grup Adı</FormLabel>
              <FormControl>
                <Input placeholder="Ana Sayfa Bannerları" {...field} />
              </FormControl>
              <FormDescription>
                Banner grubunun görüntülenecek adı
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
                  placeholder="Bu banner grubu ana sayfada görüntülenecek bannerları içerir"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Banner grubunun açıklaması (opsiyonel)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Aktif</FormLabel>
                <FormDescription>
                  Banner grubunun görüntülenme durumu
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
          name="playMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Oynatma Modu</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Oynatma modunu seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MANUAL">Manuel</SelectItem>
                  <SelectItem value="AUTO">Otomatik</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Bannerların nasıl değiştirileceği
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
              <FormLabel>Görüntülenme Süresi (ms)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Her banner kaç milisaniye görüntülenecek
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
                    <SelectValue placeholder="Animasyon tipini seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FADE">Solma</SelectItem>
                  <SelectItem value="SLIDE">Kayma</SelectItem>
                  <SelectItem value="ZOOM">Yakınlaşma</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Banner geçişlerinde kullanılacak animasyon
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
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
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
                <FormLabel>Yükseklik (px)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Banner Grubu Oluştur</Button>
      </form>
    </Form>
  );
} 