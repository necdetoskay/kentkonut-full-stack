// Galeri kategorileri enum'u (backend'den gelen)
export enum ProjectGalleryCategory {
  DIS_MEKAN = 'DIS_MEKAN',
  IC_MEKAN = 'IC_MEKAN',
  VIDEO = 'VIDEO'
}

// Kategori etiketleri
export const getCategoryLabel = (category: ProjectGalleryCategory): string => {
  const labels = {
    [ProjectGalleryCategory.DIS_MEKAN]: 'Dış Mekan',
    [ProjectGalleryCategory.IC_MEKAN]: 'İç Mekan',
    [ProjectGalleryCategory.VIDEO]: 'Video'
  };
  return labels[category] || category;
};

// Medya dosyası interface'i
export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt?: string;
  type: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED';
  embedUrl?: string;
  mimeType?: string;
}

// Proje galeri item'ı interface'i
export interface ProjectGalleryItem {
  id: number;
  projectId: number;
  mediaId?: string;
  order: number;
  title: string;                    // Galeri başlığı (örn: "Kat Planları", "2+1", "3+1")
  description?: string;             // Galeri açıklaması
  parentId?: number;                // Parent galeri referansı
  isActive: boolean;
  isFolder: boolean;                // Bu bir klasör mü yoksa görsel mi?
  createdAt: string;
  updatedAt: string;
  type?: string;
  category: ProjectGalleryCategory;
  
  // Relations
  media?: MediaItem;                // isFolder=true ise null olabilir
  parent?: ProjectGalleryItem;
  children?: ProjectGalleryItem[];
}

// Hierarchical galeri yapısı için node interface'i
export interface GalleryNode {
  item: ProjectGalleryItem;
  children: GalleryNode[];
  level: number;
}

// Galeri oluşturma/güncelleme için form data
export interface GalleryFormData {
  mediaId?: string;
  title: string;
  description?: string;
  parentId?: number;
  order?: number;
  isFolder: boolean;
  category: ProjectGalleryCategory;
}

// Galeri filtreleme seçenekleri
export interface GalleryFilter {
  category?: ProjectGalleryCategory;
  isFolder?: boolean;
  parentId?: number;
}

// Lightbox için görsel verisi
export interface LightboxImage {
  id: number;
  url: string;
  alt?: string;
  title?: string;
}
