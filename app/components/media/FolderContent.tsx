"use client";

import { useState } from "react";
import { Trash2, FileIcon, Image, Video, Eye, Download, FolderIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";

interface FolderFile {
  name: string;
  path: string;
  url: string;
  size: number;
  sizeFormatted: string;
  type: string;
  modifiedAt: string;
}

interface FolderContentProps {
  folderPath: string;
  files: FolderFile[];
  onRefresh: () => void;
  isTemp?: boolean; // temp klasörü için özel işlemler
}

export function FolderContent({ folderPath, files, onRefresh, isTemp = false }: FolderContentProps) {
  const [previewFile, setPreviewFile] = useState<FolderFile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FolderFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  
  // Dosya önizleme
  const handlePreview = (file: FolderFile) => {
    setPreviewFile(file);
    // Resim boyutlarını sıfırla
    setImageDimensions(null);
    
    // Görsel ise boyutları hesapla
    if (file.type === 'image') {
      // Browser'da çalışacak
      if (typeof window !== 'undefined') {
        const img = document.createElement('img');
        img.onload = () => {
          setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };
        img.src = file.url;
      }
    }
  };
  
  // Dosya silme
  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    setLoading(true);
    try {
      // Temp klasörü için özel API
      const response = await fetch('/api/media-library/clean-temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileNames: [confirmDelete.name]
        }),
      });
      
      if (!response.ok) {
        throw new Error('Dosya silinemedi');
      }
      
      toast.success(`${confirmDelete.name} dosyası silindi`);
      onRefresh();
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      toast.error('Dosya silinirken bir hata oluştu');
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };
  
  // Temp klasörünü temizleme
  const handleCleanTempFolder = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media-library/clean-temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Boş body, tüm klasörü temizlemek için
      });
      
      if (!response.ok) {
        throw new Error('Klasör temizlenemedi');
      }
      
      const result = await response.json();
      toast.success(result.message);
      onRefresh();
    } catch (error) {
      console.error('Klasör temizleme hatası:', error);
      toast.error('Klasör temizlenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Çoklu dosya silme
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    setBulkDeleteLoading(true);
    try {
      // API endpoint: temp klasörü için özel, diğerleri için genel
      const endpoint = isTemp
        ? '/api/media-library/clean-temp'
        : '/api/media-library/delete-files';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileNames: selectedFiles, folderPath }),
      });
      if (!response.ok) throw new Error('Dosyalar silinemedi');
      toast.success(`${selectedFiles.length} dosya silindi`);
      setSelectedFiles([]);
      onRefresh();
    } catch (error) {
      console.error('Toplu dosya silme hatası:', error);
      toast.error('Dosyalar silinirken bir hata oluştu');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Checkbox değişimi
  const handleSelectFile = (fileName: string, checked: boolean) => {
    setSelectedFiles(prev =>
      checked ? [...prev, fileName] : prev.filter(f => f !== fileName)
    );
  };
  const allSelected = files.length > 0 && selectedFiles.length === files.length;
  const handleSelectAll = (checked: boolean) => {
    setSelectedFiles(checked ? files.map(f => f.name) : []);
  };
  
  // Tarih formatı
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: tr
      });
    } catch (e) {
      return 'Bilinmeyen tarih';
    }
  };
  
  // Dosya kartları
  const renderFileCards = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {files.map((file) => (
          <Card key={file.name} className="overflow-hidden relative group">
            <div className="h-32 p-2 flex items-center justify-center bg-slate-50 relative">
              {file.type === 'image' ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : file.type === 'video' ? (
                <Video className="h-16 w-16 text-muted-foreground" />
              ) : (
                <FileIcon className="h-16 w-16 text-muted-foreground" />
              )}
              
              {/* Dosya işlemleri - üzerine gelince görünür */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                <div className="absolute top-2 right-2">
                  <input
                    type="checkbox"
                    className="accent-primary h-4 w-4"
                    checked={selectedFiles.includes(file.name)}
                    onChange={(e) => handleSelectFile(file.name, e.target.checked)}
                  />
                </div>

                <div className="flex gap-1">
                  <Button
                    onClick={() => handlePreview(file)}
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full"
                    title="Önizle"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <a
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="icon"
                      variant="secondary" 
                      className="h-8 w-8 rounded-full"
                      title="İndir"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  
                  <Button
                    onClick={() => setConfirmDelete(file)}
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-2 text-xs">
              <div className="font-medium truncate" title={file.name}>
                {file.name}
              </div>
              <div className="text-muted-foreground flex justify-between mt-1">
                <span>{file.sizeFormatted}</span>
                <span>{formatDate(file.modifiedAt)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toplu silme ve toplu seçim barı */}
      {files.length > 0 && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={e => handleSelectAll(e.target.checked)}
              className="accent-primary h-4 w-4"
              id="select-all-files"
            />
            <label htmlFor="select-all-files" className="text-sm select-none cursor-pointer">Tümünü Seç</label>
          </div>
          {selectedFiles.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {bulkDeleteLoading ? 'Siliniyor...' : `Seçili Dosyaları Sil (${selectedFiles.length})`}
            </Button>
          )}
        </div>
      )}
      {isTemp && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            <p>Geçici dosya klasörü - İlişkilendirilmemiş dosyaları içerir</p>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleCleanTempFolder}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Geçici Klasörü Temizle
          </Button>
        </div>
      )}
      
      {/* Dosya listesi */}
      {files.length > 0 ? (
        renderFileCards()
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <FolderIcon className="h-12 w-12 mb-2" />
          <p>Bu klasörde henüz dosya yok</p>
        </div>
      )}
      
      {/* Dosya önizleme */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-4xl mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{previewFile?.name}</span>
              <span className="text-sm font-normal text-muted-foreground">{previewFile?.sizeFormatted}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center bg-muted/30 rounded-lg p-2 min-h-[300px]">
            {previewFile?.type === 'image' ? (
              <div className="relative">
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-h-[70vh] max-w-full object-contain rounded"
                />
                {imageDimensions && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {imageDimensions.width} × {imageDimensions.height}
                  </div>
                )}
              </div>
            ) : previewFile?.type === 'video' ? (
              <video
                src={previewFile.url}
                controls
                className="max-h-[70vh] max-w-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <FileIcon className="h-20 w-20 mb-4" />
                <p>Bu dosya türü önizlenemez</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <a
              href={previewFile?.url}
              download={previewFile?.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Silme onay diyaloğu */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dosyayı Sil</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              <strong>{confirmDelete?.name}</strong> dosyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setConfirmDelete(null)}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Siliniyor..." : "Sil"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 