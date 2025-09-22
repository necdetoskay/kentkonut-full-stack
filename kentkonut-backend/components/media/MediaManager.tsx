"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMediaCategories } from "@/app/context/MediaCategoryContext";
import {
  Trash2,
  FolderOpen,
  CheckSquare,
  Square,
  Download,
  Move,
  X,
  AlertTriangle,
  Edit3,
  FileDown,
  Copy,
  Tag,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { getApiBaseUrl } from '@/config/ports';
import { GlobalMediaFile } from "./GlobalMediaSelector";

interface MediaManagerProps {
  selectedFiles: GlobalMediaFile[];
  onSelectionChange: (files: GlobalMediaFile[]) => void;
  onBulkAction: (action: string, data?: any) => void;
  allFiles: GlobalMediaFile[];
  className?: string;
}

export function MediaManager({
  selectedFiles,
  onSelectionChange,
  onBulkAction,
  allFiles,
  className = ""
}: MediaManagerProps) {
  const { categories } = useMediaCategories();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");
  const [bulkAlt, setBulkAlt] = useState<string>("");
  const [bulkCaption, setBulkCaption] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<"zip" | "json">("zip");
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate selection stats
  const totalSize = selectedFiles.reduce((sum: number, file: GlobalMediaFile) => sum + file.size, 0);
  const fileTypes = selectedFiles.reduce((acc: Record<string, number>, file: GlobalMediaFile) => {
    const type = file.mimeType.split('/')[0];
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedFiles.length === allFiles.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allFiles);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsProcessing(true);
      await onBulkAction('delete', { mediaIds: selectedFiles.map(f => f.id) });
      setIsDeleteDialogOpen(false);
      onSelectionChange([]);
      toast.success(`${selectedFiles.length} dosya başarıyla silindi`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Dosyalar silinirken bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk move
  const handleBulkMove = async () => {
    if (!targetCategoryId) {
      toast.error('Hedef kategori seçin');
      return;
    }

    try {
      setIsProcessing(true);
      await onBulkAction('categorize', {
        mediaIds: selectedFiles.map(f => f.id),
        categoryId: parseInt(targetCategoryId)
      });
      setIsMoveDialogOpen(false);
      setTargetCategoryId("");
      onSelectionChange([]);

      const targetCategory = categories.find(c => c.id === parseInt(targetCategoryId));
      toast.success(`${selectedFiles.length} dosya ${targetCategory?.name} kategorisine taşındı`);
    } catch (error) {
      console.error('Bulk move error:', error);
      toast.error('Dosyalar taşınırken bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk download
  const handleBulkDownload = () => {
    selectedFiles.forEach((file, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 100); // Stagger downloads to avoid browser blocking
    });

    toast.success(`${selectedFiles.length} dosya indiriliyor`);
  };

  // Handle bulk metadata update
  const handleBulkMetadataUpdate = async () => {
    if (!bulkAlt.trim() && !bulkCaption.trim()) {
      toast.error('En az bir metadata alanı doldurulmalıdır');
      return;
    }

    try {
      setIsProcessing(true);
      await onBulkAction('updateMetadata', {
        mediaIds: selectedFiles.map(f => f.id),
        alt: bulkAlt.trim() || undefined,
        caption: bulkCaption.trim() || undefined,
      });
      setIsMetadataDialogOpen(false);
      setBulkAlt("");
      setBulkCaption("");
      onSelectionChange([]);

      toast.success(`${selectedFiles.length} dosyanın metadata'sı güncellendi`);
    } catch (error) {
      console.error('Bulk metadata update error:', error);
      toast.error('Metadata güncellenirken bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk export
  const handleBulkExport = async () => {
    try {
      setIsProcessing(true);
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/media/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export',
          mediaIds: selectedFiles.map(f => f.id),
          format: exportFormat,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();

      if (exportFormat === 'json') {
        // Download JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `media-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // For ZIP, trigger individual downloads
        data.files.forEach((file: any, index: number) => {
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, index * 200);
        });
      }

      setIsExportDialogOpen(false);
      toast.success(`${selectedFiles.length} dosya export edildi`);
    } catch (error) {
      console.error('Bulk export error:', error);
      toast.error('Export sırasında bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle copy URLs to clipboard
  const handleCopyUrls = async () => {
    const urls = selectedFiles.map(file => `${window.location.origin}${file.url}`).join('\n');

    try {
      await navigator.clipboard.writeText(urls);
      toast.success(`${selectedFiles.length} dosyanın URL'si panoya kopyalandı`);
    } catch (error) {
      toast.error('URL&apos;ler kopyalanamadı');
    }
  };

  if (selectedFiles.length === 0) {
    return (
      <Card className={`sticky top-4 ${className}`}>
        <CardHeader>
          <CardTitle className="text-sm">Toplu İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-4">
              Toplu işlemler için dosya seçin
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={allFiles.length === 0}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Tümünü Seç ({allFiles.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`sticky top-4 ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Toplu İşlemler</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Seçili Dosyalar</span>
              <Badge variant="secondary">{selectedFiles.length}</Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Toplam Boyut</span>
              <span>{formatFileSize(totalSize)}</span>
            </div>

            {/* File Type Breakdown */}
            {Object.keys(fileTypes).length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-700">Dosya Tipleri</span>
                {Object.entries(fileTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{type === 'image' ? 'Resim' : type === 'video' ? 'Video' : 'Belge'}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Selection Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="w-full justify-start"
            >
              {selectedFiles.length === allFiles.length ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Hiçbirini Seçme
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tümünü Seç ({allFiles.length})
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Bulk Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Toplu İşlemler
            </h4>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMoveDialogOpen(true)}
              className="w-full justify-start"
              disabled={isProcessing}
            >
              <Move className="h-4 w-4 mr-2" />
              Kategori Değiştir
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMetadataDialogOpen(true)}
              className="w-full justify-start"
              disabled={isProcessing}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Metadata Düzenle
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrls}
              className="w-full justify-start"
              disabled={isProcessing}
            >
              <Copy className="h-4 w-4 mr-2" />
              URL&apos;leri Kopyala
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDownload}
              className="w-full justify-start"
              disabled={isProcessing}
            >
              <Download className="h-4 w-4 mr-2" />
              Tümünü İndir
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportDialogOpen(true)}
              className="w-full justify-start"
              disabled={isProcessing}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tümünü Sil
            </Button>
          </div>

          {/* Category Distribution */}
          <Separator />
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Kategoriler
            </h4>
            {categories.map(category => {
              const count = selectedFiles.filter(f => f?.category?.id === category.id).length;
              if (count === 0) return null;

              return (
                <div key={category.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center">
                    <FolderOpen className="h-3 w-3 mr-1" />
                    {category.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Dosyaları Sil
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedFiles.length}</strong> dosyayı silmek istediğinizden emin misiniz?
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Toplam boyut: {formatFileSize(totalSize)}
              </span>
              <br />
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move Category Dialog */}
      <AlertDialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategori Değiştir</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedFiles.length}</strong> dosyayı hangi kategoriye taşımak istiyorsunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Hedef kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                    {category.isBuiltIn && (
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-1 py-0.5 rounded">
                        Sistem
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkMove}
              disabled={isProcessing || !targetCategoryId}
            >
              {isProcessing ? 'Taşınıyor...' : 'Taşı'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Metadata Update Dialog */}
      <Dialog open={isMetadataDialogOpen} onOpenChange={setIsMetadataDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Metadata Düzenle</DialogTitle>
            <DialogDescription>
              Seçili {selectedFiles.length} dosya için metadata bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-alt">Alt Text</Label>
              <Input
                id="bulk-alt"
                value={bulkAlt}
                onChange={(e) => setBulkAlt(e.target.value)}
                placeholder="Tüm dosyalar için alt text..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Boş bırakırsanız mevcut alt text korunur
              </p>
            </div>

            <div>
              <Label htmlFor="bulk-caption">Caption</Label>
              <Input
                id="bulk-caption"
                value={bulkCaption}
                onChange={(e) => setBulkCaption(e.target.value)}
                placeholder="Tüm dosyalar için açıklama..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Boş bırakırsanız mevcut caption korunur
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMetadataDialogOpen(false)}
              disabled={isProcessing}
            >
              İptal
            </Button>
            <Button
              onClick={handleBulkMetadataUpdate}
              disabled={isProcessing || (!bulkAlt.trim() && !bulkCaption.trim())}
            >
              {isProcessing ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dosyaları Export Et</DialogTitle>
            <DialogDescription>
              Seçili {selectedFiles.length} dosyayı export etmek için format seçin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Export Formatı</Label>
              <Select value={exportFormat} onValueChange={(value: "zip" | "json") => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zip">ZIP - Dosyaları İndir</SelectItem>
                  <SelectItem value="json">JSON - Metadata Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {exportFormat === "zip" ? (
                <p>Tüm dosyalar ayrı ayrı indirilecek.</p>
              ) : (
                <p>Dosya bilgileri JSON formatında export edilecek.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              disabled={isProcessing}
            >
              İptal
            </Button>
            <Button
              onClick={handleBulkExport}
              disabled={isProcessing}
            >
              {isProcessing ? "Export Ediliyor..." : "Export Et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
