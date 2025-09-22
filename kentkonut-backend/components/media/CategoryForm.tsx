"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
import { IconSelector } from "@/components/media/IconSelector";
import { MediaCategory, useMediaCategories } from "@/app/context/MediaCategoryContext";

// Form schema
const formSchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır"),
  icon: z.string().min(1, "Bir ikon seçmelisiniz"),
  order: z.number().int().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  initialData?: MediaCategory;
  onSuccess?: () => void;
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const { addCategory, updateCategory } = useMediaCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values or existing category data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          icon: initialData.icon,
          order: initialData.order,
        }
      : {
          name: "",
          icon: "",
          order: 0,
        },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        // Update existing category
        await updateCategory(initialData.id, values);
        toast.success("Kategori başarıyla güncellendi");
      } else {
        // Create new category
        await addCategory({
          ...values,
          isBuiltIn: false
        });
        toast.success("Kategori başarıyla oluşturuldu");
      }

      // Reset form and call success callback
      if (!initialData) {
        form.reset({
          name: "",
          icon: "",
          order: 0,
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori Adı</FormLabel>
              <FormControl>
                <Input placeholder="Örn: Bannerlar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İkon</FormLabel>
              <FormControl>
                <IconSelector
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Kaydediliyor..."
              : initialData
              ? "Güncelle"
              : "Oluştur"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
