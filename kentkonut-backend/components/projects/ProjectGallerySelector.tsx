"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Upload, Plus, Image as ImageIcon } from "lucide-react";
import { GlobalMediaFile } from "@/components/media/GlobalMediaSelector";
import { MediaBrowserSimple } from "@/components/media/MediaBrowserSimple";
import { MEDIA_CATEGORIES } from "@/lib/media-categories";
import { toast } from "sonner";

interface ProjectGallerySelectorProps {
  selectedItems: GlobalMediaFile[];
  onSelectionChange: (items: GlobalMediaFile[]) => void;
}

export function ProjectGallerySelector({ selectedItems, onSelectionChange }: ProjectGallerySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [actionMode, setActionMode] = useState<'replace' | 'add'>('replace'); // Yeni ekleme modu
  const handleMediaSelected = (selectedFiles: GlobalMediaFile[]) => {
    onSelectionChange(selectedFiles);
    setIsOpen(false);
    toast.success(`${selectedFiles.length} görsel seçildi`);
  };

  const handleAddMoreImages = (selectedFiles: GlobalMediaFile[]) => {
    // Mevcut seçime ekleme yapar (duplicate kontrolü ile)
    const existingIds = selectedItems.map(item => item.id);
    const newFiles = selectedFiles.filter(file => !existingIds.includes(file.id));
    const combinedSelection = [...selectedItems, ...newFiles];
    onSelectionChange(combinedSelection);
    setIsOpen(false);
    toast.success(`${newFiles.length} yeni görsel eklendi`);
  };
  const handleConfirmSelection = (selectedFiles: GlobalMediaFile[]) => {
    if (actionMode === 'add') {
      handleAddMoreImages(selectedFiles);
    } else {
      handleMediaSelected(selectedFiles);
    }
  };

  const openModalForReplace = () => {
    setActionMode('replace');
    setIsOpen(true);
  };

  const openModalForAdd = () => {
    setActionMode('add');
    setIsOpen(true);
  }; 

  const getMediaUrl = (url?: string) => {
    if (!url) return '';
    let normalizedUrl = url;
    if (normalizedUrl.startsWith('http')) return normalizedUrl;

    // Remove common prefixes
    normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/');

    // Ensure it starts with /
    if (!normalizedUrl.startsWith('/')) {
      normalizedUrl = '/' + normalizedUrl;
    }

    return normalizedUrl;
  };
  return (
    <div className="space-y-4">
      {/* Eğer hiç görsel yoksa tek buton, varsa iki buton göster */}
      {selectedItems.length === 0 ? (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-12 flex items-center gap-2"
          onClick={openModalForReplace}
        >
          <Upload className="h-4 w-4" />
          Galeri Görselleri Seç
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 h-12 flex items-center gap-2"
            onClick={openModalForAdd}
          >
            <Plus className="h-4 w-4" />
            Görsel Ekle
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 h-12 flex items-center gap-2"
            onClick={openModalForReplace}
          >
            <Upload className="h-4 w-4" />
            Değiştir ({selectedItems.length})
          </Button>
        </div>
      )}      <MediaBrowserSimple 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleConfirmSelection}
        multiple={true}
        categoryFilter={MEDIA_CATEGORIES.PROJECT_IMAGES.id} // Projects category (ID: 3)
        restrictCategorySelection={true} // Kategori değiştirilemez
        title={actionMode === 'add' ? "Galeri Görselleri Ekle" : "Proje Görselleri Seç"}
        allowedTypes={['image']}
        preSelected={actionMode === 'add' ? selectedItems : []} // Ekleme modunda mevcut seçimleri göster
        customFolder="media/projeler"
      />

      {selectedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Seçilen medya dosyaları: {selectedItems.length}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange([])}
            >
              <X className="h-4 w-4 mr-1" />
              Tümünü Kaldır
            </Button>
          </div>          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {selectedItems.map((item) => (
              <div key={item.id} className="relative group">
                <div className="gallery-thumb-container">
                  <img
                    src={getMediaUrl(item.url)}
                    alt={item.alt || item.filename}
                    className="gallery-thumb-image"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0"
                    onClick={() => {
                      onSelectionChange(selectedItems.filter(prevItem => prevItem.id !== item.id));
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded truncate">
                    {item.filename}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedItems.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Henüz galeri görseli seçilmedi
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Yukarıdaki "Galeri Görselleri Seç" butonu ile görselleri ekleyebilirsiniz
          </p>
        </div>
      )}
    </div>
  );
}
