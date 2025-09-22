'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Define the shape of the data we expect for the form
interface OgeData {
  id: string;
  title: string;
  hedefUrl: string;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: OgeData | null;
  sayfaId: string;
}

const formSchema = z.object({
  title: z.string().min(1, { message: 'Başlık zorunludur.' }),
  hedefUrl: z.string().min(1, { message: 'Hedef URL zorunludur.' }),
});

type FormValues = z.infer<typeof formSchema>;

export const HizliErisimOgeFormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  sayfaId,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Linki Düzenle' : 'Yeni Link Ekle';
  const description = initialData ? 'Mevcut linki düzenleyin.' : 'Yeni bir hızlı erişim linki oluşturun.';
  const toastMessage = initialData ? 'Link güncellendi.' : 'Link oluşturuldu.';
  const action = initialData ? 'Değişiklikleri Kaydet' : 'Oluştur';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      hedefUrl: '',
    },
  });

  useEffect(() => {
    form.reset(initialData || { title: '', hedefUrl: '' });
  }, [initialData, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      let response;
      if (initialData) {
        // Update existing link
        response = await fetch(`/api/admin/hizli-erisim-ogeleri/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
      } else {
        // Create new link
        response = await fetch(`/api/admin/hizli-erisim-ogeleri`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, sayfaId }),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bir hata oluştu.');
      }

      toast.success(toastMessage);
      router.refresh();
      onClose(); // Close the modal on success
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={title} description={description} isOpen={isOpen} onClose={onClose}>
      <div className="py-2 pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Başlık</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Örn: Hafriyat Sahaları" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hedefUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hedef URL</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="/projeler/devam-eden" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button type="button" disabled={loading} variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {action}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};
