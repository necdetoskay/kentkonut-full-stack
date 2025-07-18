"use client";

import { useState, useCallback } from "react";
import { MediaSelector } from "@/components/media/MediaSelector";
import { MediaBrowser } from "@/components/media/MediaBrowser";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

export interface GlobalMediaFile {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  thumbnailSmall?: string;
  thumbnailMedium?: string;
  thumbnailLarge?: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface GlobalMediaSelectorProps {
  onSelect: (media: GlobalMediaFile) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;  acceptedTypes?: string[];
  defaultCategory?: 'content-images' | 'project-images' | 'news-images' | 'banner-images' | 'corporate-images' | 'department-images' | 'general';
  categoryId?: number;     // Doğrudan kategori ID'si gönderme seçeneği
  restrictToCategory?: boolean; // Sadece belirtilen kategoriden seçim yapılsın mı?
  targetWidth?: number;
  targetHeight?: number;
  width?: number;          // Yeni: Genişlik parametresi
  height?: number;         // Yeni: Yükseklik parametresi
  buttonText?: string;
  showPreview?: boolean;
  selectedMedia?: GlobalMediaFile | null;
  multiSelect?: boolean;  // Çoklu seçim yapılsın mı?
  onMultiSelect?: (media: GlobalMediaFile[]) => void; // Çoklu seçim için callback
  selectedItems?: GlobalMediaFile[]; // Çoklu seçim için ön seçili medyalar
  customFolder?: string; // Custom upload folder
}

import { MEDIA_CATEGORIES } from "@/lib/media-categories";

// Map category keys to their IDs for backward compatibility
const CATEGORY_MAPPING = {
  'content-images': MEDIA_CATEGORIES.CONTENT_IMAGES.id,    // İçerik Resimleri (5)
  'project-images': MEDIA_CATEGORIES.PROJECT_IMAGES.id,    // Projeler (3)
  'news-images': MEDIA_CATEGORIES.NEWS_IMAGES.id,          // Haberler (2)
  'banner-images': MEDIA_CATEGORIES.BANNER_IMAGES.id,      // Bannerlar (1)
  'corporate-images': MEDIA_CATEGORIES.CORPORATE_IMAGES.id, // Kurumsal (6)
  'department-images': MEDIA_CATEGORIES.DEPARTMENT_IMAGES.id, // Birimler (4)
  'general': undefined                                     // Genel (kategorisiz)
};

const CATEGORY_TITLES = {
  'content-images': 'İçerik Görseli Seç',
  'project-images': 'Proje Görseli Seç',
  'news-images': 'Haber Görseli Seç',
  'banner-images': 'Banner Görseli Seç',
  'corporate-images': 'Kurumsal Görseli Seç',
  'department-images': 'Birim Görseli Seç',
  'general': 'Medya Seç'
};

const CATEGORY_DESCRIPTIONS = {
  'content-images': 'Sayfa içeriği için görsel seçin veya yükleyin',
  'project-images': 'Proje için görsel seçin veya yükleyin',
  'news-images': 'Haber için görsel seçin veya yükleyin',
  'banner-images': 'Banner için görsel seçin veya yükleyin',
  'corporate-images': 'Kurumsal için görsel seçin veya yükleyin',
  'department-images': 'Birim/Departman için görsel seçin veya yükleyin',
  'general': 'Galeriden medya seçin veya yeni medya yükleyin'
};

/**
 * Global MediaSelector component - Tüm projede tutarlı medya seçimi için kullanılır
 * 
 * @param onSelect - Medya seçildiğinde çağrılacak fonksiyon
 * @param trigger - Modal açan buton (opsiyonel, varsayılan buton kullanılır)
 * @param title - Modal başlığı (opsiyonel, kategori bazlı otomatik)
 * @param description - Modal açıklaması (opsiyonel, kategori bazlı otomatik)
 * @param acceptedTypes - Kabul edilen dosya tipleri
 * @param defaultCategory - Varsayılan kategori (hangi klasörde açılacak)
 * @param targetWidth - Hedef resim genişliği
 * @param targetHeight - Hedef resim yüksekliği
 * @param buttonText - Buton metni
 * @param showPreview - Seçili medyanın önizlemesini göster
 * @param selectedMedia - Mevcut seçili medya
 */
export function GlobalMediaSelector({
  onSelect,
  trigger,
  title,
  description,
  acceptedTypes = ['image/*'],
  defaultCategory = 'general',
  categoryId,
  restrictToCategory = false,
  targetWidth = 800,
  targetHeight = 600,
  width = 800,           // Yeni: Varsayılan genişlik
  height = 600,          // Yeni: Varsayılan yükseklik
  buttonText = "Medya Seç",
  showPreview = false,
  selectedMedia,
  multiSelect,
  onMultiSelect,
  selectedItems,
  customFolder = 'media'  // Yeni: Varsayılan klasör
}: GlobalMediaSelectorProps) {
  
  // Kategori bazlı varsayılan değerler
  const finalTitle = title || CATEGORY_TITLES[defaultCategory];
  const finalDescription = description || CATEGORY_DESCRIPTIONS[defaultCategory];
  const effectiveCategoryId = categoryId || CATEGORY_MAPPING[defaultCategory];

  // Varsayılan trigger buton
  const defaultTrigger = (
    <Button 
      type="button"
      variant="outline" 
      className="w-full"
    >
      <Image className="w-4 h-4 mr-2" />
      {selectedMedia ? selectedMedia.originalName : buttonText}
    </Button>
  );
  // State for multi-select mode
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);

  // Handle multi-select mode
  if (multiSelect && onMultiSelect) {
    console.log('🔧 GlobalMediaSelector: Using multi-select mode');
    console.log('📁 GlobalMediaSelector: customFolder value:', customFolder);
    console.log('📂 GlobalMediaSelector: effectiveCategoryId:', effectiveCategoryId);
    console.log('🔒 GlobalMediaSelector: restrictToCategory:', restrictToCategory);

    return (
      <>
        {trigger ? (
          <div onClick={() => {
            console.log('🖱️ GlobalMediaSelector: Opening MediaBrowser with customFolder:', customFolder);
            setIsMultiSelectOpen(true);
          }}>
            {trigger}
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              console.log('🖱️ GlobalMediaSelector: Opening MediaBrowser with customFolder:', customFolder);
              setIsMultiSelectOpen(true);
            }}
          >
            <Image className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
        )}

        <MediaBrowser
          isOpen={isMultiSelectOpen}
          onClose={() => setIsMultiSelectOpen(false)}
          onSelect={(selectedFiles) => {
            console.log('🖼️ GlobalMediaSelector: Multi-select callback with', selectedFiles.length, 'files');
            onMultiSelect(selectedFiles);
            setIsMultiSelectOpen(false);
          }}
          multiple={true}
          allowedTypes={acceptedTypes}
          categoryFilter={effectiveCategoryId}
          restrictCategorySelection={restrictToCategory}
          title={finalTitle}
          customFolder={customFolder}
        />
      </>
    );
  }

  // Single-select mode (existing behavior)
  console.log('🔧 GlobalMediaSelector: Using single-select mode');
  return (
    <MediaSelector
      onSelect={onSelect}
      selectedMedia={selectedMedia}
      acceptedTypes={acceptedTypes}
      trigger={trigger || defaultTrigger}
      title={finalTitle}
      description={finalDescription}
      targetWidth={targetWidth}
      targetHeight={targetHeight}
      width={width}
      height={height}
      defaultCategoryId={effectiveCategoryId}
      filterToCategory={restrictToCategory ? effectiveCategoryId : undefined}
      customFolder={customFolder}
    />
  );
}

/**
 * Hook for consistent media selection across the project
 */
export function useGlobalMediaSelector() {
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null);
  
  const handleSelect = useCallback((media: GlobalMediaFile) => {
    setSelectedMedia(media);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMedia(null);
  }, []);

  return {
    selectedMedia,
    handleSelect,
    clearSelection,
    setSelectedMedia
  };
}

export type { GlobalMediaFile as MediaFile };
