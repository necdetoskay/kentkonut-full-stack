"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';

// Form şeması ve validasyon kuralları
const formSchema = z.object({
  sayfaUrl: z.string().min(1, { message: 'Sayfa URL\'si boş olamaz.' }).startsWith('/', { message: 'URL / ile başlamalıdır.' }),
  baslik: z.string().min(1, { message: 'Başlık boş olamaz.' }),
});

const CreateHizliErisimPage = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sayfaUrl: '',
      baslik: 'Hızlı Erişim',
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/admin/hizli-erisim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Menü oluşturulurken bir hata oluştu.');
      }

      toast.success('Yeni hızlı erişim menüsü başarıyla oluşturuldu!');
      router.push('/dashboard/hizli-erisim');
      router.refresh(); // Sayfa listesinin güncellenmesi için

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Beklenmedik bir hata oluştu.');
      }
    }
  };

  return (
    <div className="p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Hızlı Erişim Menüsü Oluştur</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="sayfaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sayfa URL'si</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={isSubmitting}
                        placeholder="/ornek-sayfa/alt-sayfa" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baslik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menü Başlığı</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={isSubmitting}
                        placeholder="Sayfa Başlıkları" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? 'Oluşturuluyor...' : 'Oluştur'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateHizliErisimPage;
