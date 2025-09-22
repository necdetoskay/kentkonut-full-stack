'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Banner, BannerFormValues, bannerFormSchema } from '../types/banner.types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { bannerService } from '../services/banner.service';
import { mediaService } from '@/services/mediaService';
import { format } from 'date-fns/format';
import { tr } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import DOMPurify from 'dompurify';

interface BannerFormProps {
  bannerGroupId: number;
  initialData?: Banner | null;
  isEdit?: boolean;
}

export function BannerForm({ bannerGroupId, initialData, isEdit = false }: BannerFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      displayOrder: initialData.displayOrder || 0,
      startDate: initialData.startDate || null,
      endDate: initialData.endDate || null,
    } : {
      title: '',
      description: '',
      imageUrl: '',
      targetUrl: '',
      displayOrder: 0,
      isActive: true,
      startDate: null,
      endDate: null,
    },
  });

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Banner kategorisi ID'si (1 = Bannerlar kategorisi)
      const bannerCategoryId = 1;
      
      // Medya servisini kullanarak dosyayı yükle
      const uploadedFile = await mediaService.uploadMediaFile(file, bannerCategoryId);
      
      if (uploadedFile && uploadedFile.url) {
        // Yüklenen dosyanın URL'sini forma set et
        form.setValue('imageUrl', uploadedFile.url, { shouldValidate: true });
        toast.success('Dosya başarıyla yüklendi');
      } else {
        throw new Error('Dosya yüklendi ancak URL alınamadı');
      }
    } catch (error) {
      console.error('Dosya yüklenirken hata:', error);
      toast.error('Dosya yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: BannerFormValues) => {
    try {
      setIsLoading(true);
      
      // Map frontend field names to backend field names
      const bannerData = {
        title: data.title || '',
        description: data.description ? DOMPurify.sanitize(data.description) : '',
        imageUrl: data.imageUrl || '',
        link: data.targetUrl || '', // Map targetUrl to link
        order: data.displayOrder || 0, // Map displayOrder to order
        isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
        deletable: true, // Default value for new banners
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        bannerGroupId,
      };
      
      if (isEdit && initialData?.id) {
        await bannerService.update(initialData.id, bannerData);
        toast.success('Banner başarıyla güncellendi');
      } else {
        await bannerService.create(bannerData);
        toast.success('Banner başarıyla oluşturuldu');
      }
      
      navigate(`/dashboard/banner-groups/${bannerGroupId}/banners`);
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isEdit ? 'Bannerı Düzenle' : 'Yeni Banner Ekle'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEdit 
            ? 'Banner bilgilerini düzenleyin' 
            : 'Yeni bir banner ekleyin'}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              name="targetUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hedef URL (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://ornek.com" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Resim URL</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <label className="relative">
                      <span className="sr-only">Dosya yükle</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file);
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        disabled={isUploading}
                        className="whitespace-nowrap"
                      >
                        {isUploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Yükle
                      </Button>
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('imageUrl') && (
              <div className="md:col-span-2">
                <div className="relative aspect-video max-w-2xl border rounded-md overflow-hidden">
                  <img 
                    src={form.watch('imageUrl')} 
                    alt="Banner önizleme"
                    className="w-full h-full object-contain bg-muted"
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Başlangıç Tarihi (Opsiyonel)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: tr })
                          ) : (
                            <span>Tarih seçin</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString())}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Bitiş Tarihi (Opsiyonel)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: tr })
                          ) : (
                            <span>Tarih seçin</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          const startDate = form.getValues('startDate');
                          if (startDate && date && new Date(startDate) > date) {
                            toast.error('Bitiş tarihi başlangıç tarihinden önce olamaz');
                            return;
                          }
                          field.onChange(date?.toISOString());
                        }}
                        disabled={(date) => {
                          const startDate = form.getValues('startDate');
                          return startDate ? date < new Date(startDate) : date < new Date();
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sıralama</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Düşük değerler önce gösterilir
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
                      Bu banner aktif olarak gösterilsin mi?
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
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Açıklama (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Banner hakkında açıklama"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/dashboard/banner-groups/${bannerGroupId}`)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
