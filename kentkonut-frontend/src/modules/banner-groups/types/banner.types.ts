import * as z from 'zod';

export interface Banner {
  id: number;
  bannerGroupId: number;
  title: string;
  description?: string;
  imageUrl: string;
  targetUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerDto {
  bannerGroupId: number;
  title: string;
  description?: string;
  imageUrl: string;
  targetUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateBannerDto extends Partial<Omit<CreateBannerDto, 'bannerGroupId'>> {}

export const bannerFormSchema = z.object({
  title: z.string().min(3, 'En az 3 karakter olmalıdır'),
  description: z.string().optional(),
  imageUrl: z.string().url('Geçerli bir URL olmalıdır'),
  targetUrl: z.string().url('Geçerli bir URL olmalıdır').or(z.literal('')),
  displayOrder: z.number().int().min(0, 'Negatif olamaz'),
  isActive: z.boolean().default(true),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export type BannerFormValues = z.infer<typeof bannerFormSchema>;
