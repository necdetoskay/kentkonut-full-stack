import * as z from "zod";

export const bannerGroupSchema = z.object({
  name: z.string().min(1, "Grup adı zorunludur"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  playMode: z.enum(["MANUAL", "AUTO"]),
  displayDuration: z.number().min(1000).max(60000),
  animationType: z.enum(["FADE", "SLIDE", "ZOOM"]),
  width: z.number().min(1, "Genişlik zorunludur"),
  height: z.number().min(1, "Yükseklik zorunludur"),
});

export const bannerSchema = z.object({
  groupId: z.number(),
  title: z.string().min(1, "Banner başlığı zorunludur"),
  imageUrl: z.string().min(1, "Görsel URL'i zorunludur"),
  linkUrl: z.string().optional().or(z.literal('')),
  order: z.number().optional().default(0),
  isActive: z.boolean().default(true),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
  path: ["endDate"],
});

export type BannerGroupFormValues = z.infer<typeof bannerGroupSchema>;
export type BannerFormValues = z.infer<typeof bannerSchema>; 