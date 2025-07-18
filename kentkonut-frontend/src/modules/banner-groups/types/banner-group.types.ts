export type AnimasyonTuru = 
  | 'yok' 
  | 'sol_kaydir'
  | 'sag_kaydir' 
  | 'yukari_kaydir'
  | 'asagi_kaydir'
  | 'sol_yasli'
  | 'sag_yasli'
  | 'sol_alt'
  | 'sag_alt'
  | 'sol_ust'
  | 'sag_ust'
  | 'yakinlastir'
  | 'uzaklastir'
  | 'donusum';

export interface BannerGroup {
  id: number;
  name: string;
  slug: string;
  description?: string;
  width: number;
  height: number;
  animationType: AnimasyonTuru;
  displayDuration: number;
  transitionDuration: number;
  isActive: boolean;
  silinemez: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerGroupDto {
  name: string;
  slug: string;
  description?: string;
  width: number;
  height: number;
  animationType: AnimasyonTuru;
  displayDuration: number;
  transitionDuration: number;
  isActive?: boolean;
  silinemez?: boolean;
}

export interface UpdateBannerGroupDto extends Partial<CreateBannerGroupDto> {}

// Validasyon şeması için
import * as z from 'zod';

export const bannerGroupFormSchema = z.object({
  name: z.string().min(3, 'En az 3 karakter olmalıdır'),
  slug: z.string().min(3, 'En az 3 karakter olmalıdır'),
  description: z.string().optional(),
  width: z.number().int().positive('Pozitif bir sayı olmalıdır'),
  height: z.number().int().positive('Pozitif bir sayı olmalıdır'),
  animationType: z.enum([
    'yok', 'sol_kaydir', 'sag_kaydir', 'yukari_kaydir', 'asagi_kaydir',
    'sol_yasli', 'sag_yasli', 'sol_alt', 'sag_alt', 'sol_ust', 
    'sag_ust', 'yakinlastir', 'uzaklastir', 'donusum'
  ] as const),
  displayDuration: z.number().int().min(1, 'En az 1 saniye olmalıdır'),
  transitionDuration: z.number().int().min(0, 'Negatif olamaz'),
  isActive: z.boolean().default(true),
  silinemez: z.boolean().default(false)
});

export type BannerGroupFormValues = z.infer<typeof bannerGroupFormSchema>;
