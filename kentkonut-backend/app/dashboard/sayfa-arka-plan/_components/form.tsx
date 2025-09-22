'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { SayfaArkaPlan } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GlobalMediaSelector, GlobalMediaFile } from "@/components/media/GlobalMediaSelector";
import Image from "next/image";

const formSchema = z.object({
  sayfaUrl: z.string().min(1, { message: "Sayfa URL'i gereklidir." }),
  resimUrl: z.string().min(1, { message: "Resim URL'i gereklidir." }),
});

type SayfaArkaPlanFormValues = z.infer<typeof formSchema>;

interface SayfaArkaPlanFormProps {
  initialData: SayfaArkaPlan | null;
}

export const SayfaArkaPlanForm: React.FC<SayfaArkaPlanFormProps> = ({
  initialData,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Kaydı Düzenle" : "Yeni Kayıt Ekle";
  const description = initialData ? "Mevcut kaydı düzenleyin." : "Yeni bir kayıt ekleyin.";
  const toastMessage = initialData ? "Kayıt güncellendi." : "Kayıt oluşturuldu.";
  const action = initialData ? "Değişiklikleri Kaydet" : "Oluştur";

  const form = useForm<SayfaArkaPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      sayfaUrl: "",
      resimUrl: "",
    },
  });

  const onSubmit = async (data: SayfaArkaPlanFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.put(`/api/sayfa-arka-plan/${initialData.id}`, data);
      } else {
        await axios.post("/api/sayfa-arka-plan", data);
      }
      router.refresh();
      router.push("/dashboard/sayfa-arka-plan");
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Bir hata oluştu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMediaSelect = (media: GlobalMediaFile) => {
    form.setValue("resimUrl", media.url);
  };

  const currentImageUrl = form.watch("resimUrl");

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <hr className="my-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="sayfaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sayfa URL</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="/kurumsal/hakkimizda"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resimUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arka Plan Resmi</FormLabel>
                  <FormControl>
                    <div>
                        <GlobalMediaSelector
                            onSelect={handleMediaSelect}
                            buttonText="Arka Plan Resmi Seç"
                            targetWidth={1900}
                            targetHeight={270}
                        />
                        {currentImageUrl && (
                            <div className="mt-4 relative w-full h-64">
                                <Image
                                    src={currentImageUrl}
                                    alt="Seçilen Arka Plan Resmi"
                                    layout="fill"
                                    objectFit="contain"
                                />
                            </div>
                        )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
