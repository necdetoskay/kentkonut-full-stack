export type MediaCategory = 
  | "content-images"
  | "project-images"
  | "news-images"
  | "corporate-images"
  | "department-images"
  | "personnel-images"
  | "general";

export const mediaCategories: MediaCategory[] = [
  "content-images",
  "project-images",
  "news-images",
  "corporate-images",
  "department-images",
  "personnel-images",
  "general",
] as const;

export const mediaCategoryPaths: Record<MediaCategory, string> = {
  "content-images": "icerik/gorseller",
  "project-images": "projeler/gorseller",
  "news-images": "haberler/gorseller",
  "corporate-images": "corporate-images",
  "department-images": "department-images",
  "personnel-images": "personnel-images",
  general: "general",
};