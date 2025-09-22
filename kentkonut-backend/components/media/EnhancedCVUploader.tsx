"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlobalMediaSelector, GlobalMediaFile } from "@/components/media/GlobalMediaSelector";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface EnhancedCVUploaderProps {
  onCVSelect: (cvUrl: string, mediaId?: number) => void;
  currentCVUrl?: string;
  isUploading?: boolean;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onError?: (error: string) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function EnhancedCVUploader({
  onCVSelect,
  currentCVUrl,
  isUploading = false,
  onUploadStart,
  onUploadEnd,
  onError,
  label = "Özgeçmiş (CV) Dosyası",
  description = "PDF veya Word dosyası yükleyebilirsiniz",
  className = ""
}: EnhancedCVUploaderProps) {
  // Media selection handler

  const handleMediaSelect = (media: GlobalMediaFile) => {
    console.log('CV selected from gallery:', media);
    onCVSelect(media.url, media.id);
    toast.success("CV başarıyla seçildi.");
  };

  const handleRemoveCV = () => {
    onCVSelect('');
    toast.success("CV kaldırıldı.");
  };

  const isLoading = isUploading;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="cv-upload">{label}</Label>
      
      <div className="space-y-3">
        {/* Media Gallery Selector Only */}
        <div className="flex justify-start">
          <GlobalMediaSelector
            onSelect={handleMediaSelect}
            trigger={
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Galeriden Seç
              </Button>
            }
            title="CV Dosyası Seç"
            description="Mevcut CV dosyalarından birini seçin veya yeni dosya yükleyin"
            acceptedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
            defaultCategory="corporate-images"
            customFolder="media/kurumsal/birimler"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            <span>Yükleniyor...</span>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          {description || "Galeriden mevcut CV dosyalarını seçebilir veya yeni dosya yükleyebilirsiniz"}
        </p>
        
        {/* Current CV Display */}
        {currentCVUrl && !isLoading && (
          <div className="p-3 border rounded-md bg-muted/50 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              <span className="text-sm font-medium">CV Dosyası Yüklendi</span>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={currentCVUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Görüntüle
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveCV}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedCVUploader;
