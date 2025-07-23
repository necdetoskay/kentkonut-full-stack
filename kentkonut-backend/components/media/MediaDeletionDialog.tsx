"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { GlobalMediaFile } from "./GlobalMediaSelector";

interface MediaDeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  files: GlobalMediaFile[];
  isDeleting: boolean;
}

export function MediaDeletionDialog({
  isOpen,
  onClose,
  onConfirm,
  files,
  isDeleting
}: MediaDeletionDialogProps) {
  const isBulkDelete = files.length > 1;
  const fileName = files.length === 1 ? files[0].originalName : '';

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Deletion error:', error);
      toast.error('Silme işlemi sırasında bir hata oluştu');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                {isBulkDelete ? 'Dosyaları Sil' : 'Dosyayı Sil'}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-sm text-gray-600 mt-4">
          {isBulkDelete ? (
            <>
              <strong>{files.length} dosyayı</strong> kalıcı olarak silmek istediğinizden emin misiniz?
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500 mb-2">Silinecek dosyalar:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {files.slice(0, 5).map((file, index) => (
                    <div key={file.id} className="text-xs text-gray-700 truncate">
                      • {file.originalName}
                    </div>
                  ))}
                  {files.length > 5 && (
                    <div className="text-xs text-gray-500 italic">
                      ... ve {files.length - 5} dosya daha
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <strong>"{fileName}"</strong> dosyasını kalıcı olarak silmek istediğinizden emin misiniz?
            </>
          )}
          
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-700">
                <strong>Uyarı:</strong> Bu işlem geri alınamaz. Dosya{isBulkDelete ? 'lar' : ''} hem sunucudan hem de veritabanından kalıcı olarak silinecek.
              </div>
            </div>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="mr-2"
          >
            İptal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Siliniyor...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {isBulkDelete ? `${files.length} Dosyayı Sil` : 'Dosyayı Sil'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Individual file deletion confirmation
interface SingleFileDeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  file: GlobalMediaFile;
  isDeleting: boolean;
}

export function SingleFileDeletionDialog({
  isOpen,
  onClose,
  onConfirm,
  file,
  isDeleting
}: SingleFileDeletionDialogProps) {
  return (
    <MediaDeletionDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      files={[file]}
      isDeleting={isDeleting}
    />
  );
}

// Bulk deletion confirmation
interface BulkDeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  files: GlobalMediaFile[];
  isDeleting: boolean;
}

export function BulkDeletionDialog({
  isOpen,
  onClose,
  onConfirm,
  files,
  isDeleting
}: BulkDeletionDialogProps) {
  return (
    <MediaDeletionDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      files={files}
      isDeleting={isDeleting}
    />
  );
}

// Hook for deletion operations
export function useDeletionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<GlobalMediaFile[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDialog = (files: GlobalMediaFile[]) => {
    setFilesToDelete(files);
    setIsOpen(true);
  };

  const closeDialog = () => {
    if (!isDeleting) {
      setIsOpen(false);
      setFilesToDelete([]);
    }
  };

  const handleDeletion = async (deletionFn: (files: GlobalMediaFile[]) => Promise<void>) => {
    setIsDeleting(true);
    try {
      await deletionFn(filesToDelete);
      setIsOpen(false);
      setFilesToDelete([]);
      toast.success(
        filesToDelete.length === 1 
          ? 'Dosya başarıyla silindi' 
          : `${filesToDelete.length} dosya başarıyla silindi`
      );
    } catch (error) {
      console.error('Deletion error:', error);
      toast.error('Silme işlemi sırasında bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isOpen,
    filesToDelete,
    isDeleting,
    openDialog,
    closeDialog,
    handleDeletion
  };
}
