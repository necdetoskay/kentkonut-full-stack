"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Plus, X, MoreVertical, Trash2, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { DirectCropper } from "@/app/dashboard/banners/components/direct-cropper";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FolderItem {
  name: string;
  path: string;
  subFolders: FolderItem[];
  sizeBytes: number;
  size: string;
  fileCount: number;
  modifiedAt: string;
}

interface FolderTreeProps {
  data: FolderItem;
  onFolderSelect: (path: string) => void;
  selectedPath: string;
  level?: number;
  onRefresh?: () => void;
}

// Medya galerisi için özel cropper bileşeni
function MediaCropper({
  open,
  onClose,
  image,
  onCropComplete,
  targetWidth = 800,   // Varsayılan hedef genişlik
  targetHeight = 600   // Varsayılan hedef yükseklik
}: {
  open: boolean;
  onClose: () => void;
  image: string;
  onCropComplete: (croppedImage: string, outputScale?: number) => void;
  targetWidth?: number;
  targetHeight?: number;
}) {
  return (
    <DirectCropper
      open={open}
      onClose={onClose}
      image={image}
      onCropComplete={(croppedImage, outputScale) => {
        console.log("MediaCropper: DirectCropper'dan gelen ölçek:", outputScale);
        onCropComplete(croppedImage, outputScale);
      }}
      aspectRatio={targetWidth / targetHeight}  // Hedef boyutlara göre aspect ratio hesapla
      width={targetWidth}      // Hedef genişlik
      height={targetHeight}    // Hedef yükseklik
    />
  );
}

// Medya önizleme kartı bileşeni
function MediaPreviewCard({ src, name, size, time }: { src: string; name: string; size: string; time?: string }) {
  return (
    <div className="rounded-xl shadow bg-white overflow-hidden w-[180px]">
      <div className="relative w-full aspect-video flex items-center justify-center bg-muted">
        {/* Checkbox ve overlay butonlar buraya eklenebilir */}
        {src ? (
          <img
            src={src}
            alt={name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <Image className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      <div className="p-2">
        <div className="font-medium text-xs truncate">{name}</div>
        <div className="text-xs text-muted-foreground">{size}{time && <span> • {time}</span>}</div>
      </div>
    </div>
  );
}

export function FolderTreeItem({ 
  data, 
  onFolderSelect, 
  selectedPath, 
  level = 0,
  onRefresh
}: FolderTreeProps) {
  const [expanded, setExpanded] = useState(level < 1);
  const [adding, setAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{x: number, y: number} | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const handleFolderSelect = () => {
    onFolderSelect(data.path);
  };
  
  const isSelected = selectedPath === data.path;
  const hasSubFolders = data.subFolders && data.subFolders.length > 0;
  
  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      setError("Klasör adı girin");
      return;
    }
    setAddLoading(true);
    setError("");
    try {
      const res = await fetch("/api/media-library/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentPath: data.path, name: newFolderName.trim() })
      });
      if (!res.ok) throw new Error("Klasör oluşturulamadı");
      setAdding(false);
      const newPath = data.path ? `${data.path}/${newFolderName.trim()}` : newFolderName.trim();
      setNewFolderName("");
      setTimeout(() => {
        if (onRefresh) onRefresh();
        if (onFolderSelect) onFolderSelect(newPath);
      }, 300);
    } catch (e) {
      setError("Klasör oluşturulamadı");
    } finally {
      setAddLoading(false);
    }
  };
  
  const handleDeleteFolder = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/media-library/delete-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: data.path })
      });
      if (!res.ok) throw new Error("Klasör silinemedi");
      setShowDeleteConfirm(false);
      if (onRefresh) onRefresh();
    } catch (e) {
      // Hata gösterilebilir
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Resim dosyası kontrolü
    if (file.type.startsWith('image/')) {
      setUploadingFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImage(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Diğer dosya tipleri için direkt upload
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File, cropData?: { croppedImage: string, outputScale: number }) => {
    setIsUploading(true);
    setUploadError(null);
    
    if (!data.path) {
      setUploadError("No folder selected");
      setIsUploading(false);
      return;
    }

    try {
      if (cropData) {
        // Use the base64-upload API for cropped images
        const targetPath = data.path.replace(/^\/uploads\//, '');
        
        // Calculate dimensions using the window.Image constructor
        const img = document.createElement('img');
        img.src = cropData.croppedImage;
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
        });
        
        const dimensions = {
          width: img.width,
          height: img.height
        };
        
        console.log("Uploading cropped image with dimensions:", dimensions);
        
        const response = await fetch('/api/media-library/base64-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base64Image: cropData.croppedImage,
            targetFolder: targetPath,
            dimensions,
            originalFilename: file.name,
            outputScale: cropData.outputScale
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }
        
        const result = await response.json();
        console.log("Cropped image uploaded successfully:", result);
        
        toast.success(`Image uploaded to ${data.name || 'root'} folder`);
        
        if (onRefresh) {
          onRefresh();
        }
      } else {
        // Use the regular upload API for uncropped files
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", data.path.replace(/^\/uploads\//, ''));
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }
        
        toast.success(`File uploaded to ${data.name || 'root'} folder`);
        
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropComplete = async (croppedImage: string, outputScale?: number) => {
    setCroppedImage(croppedImage);
    setCropDialogOpen(false);
    if (uploadingFile) {
      await handleFileUpload(uploadingFile, { 
        croppedImage, 
        outputScale: outputScale || 100 // Provide default value if undefined
      });
      setUploadingFile(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true
  });

  return (
    <div className="select-none">
      <div
        {...getRootProps()}
        className={cn(
          "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-muted group text-sm",
          isSelected && "bg-muted text-primary",
          isDragActive && "border-2 border-dashed border-primary bg-primary/10"
        )}
        onClick={handleFolderSelect}
        style={{ paddingLeft: `${(level * 12) + 4}px` }}
        onContextMenu={e => {
          e.preventDefault();
          setShowMenu(true);
          setMenuPos({ x: e.clientX, y: e.clientY });
        }}
      >
        <input {...getInputProps()} />
        <div className="flex items-center mr-1" onClick={handleToggleExpand}>
          {hasSubFolders ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-4"></span>
          )}
        </div>
        
        <div className="mr-2">
          {expanded ? (
            <FolderOpen className="h-4 w-4 text-yellow-400" />
          ) : (
            <Folder className="h-4 w-4 text-yellow-400" />
          )}
        </div>
        
        <div className="overflow-hidden whitespace-nowrap text-ellipsis flex-grow">
          {data.name && typeof data.name === 'string'
            ? data.name
            : (data.path ? data.path.split(/[/\\]/).pop() : '')}
        </div>
        
        <div className="text-muted-foreground text-xs ml-2">
          {data.fileCount} dosya | {data.size}
        </div>
      </div>
      
      {/* Sağ tık menüsü */}
      {showMenu && menuPos && (
        <div
          className="fixed z-50 bg-popover border rounded shadow-md py-1 text-sm"
          style={{ left: menuPos.x, top: menuPos.y, minWidth: 140 }}
          onMouseLeave={() => setShowMenu(false)}
        >
          <button
            className="flex items-center w-full px-3 py-2 hover:bg-muted"
            onClick={() => { setAdding(true); setShowMenu(false); }}
          >
            <Plus className="w-4 h-4 mr-2" /> Yeni Klasör
          </button>
          {data.path && data.path !== '' && (
            <button
              className="flex items-center w-full px-3 py-2 hover:bg-muted text-destructive"
              onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Klasörü Sil
            </button>
          )}
        </div>
      )}
      
      {adding && (
        <div className="flex items-center gap-2 ml-8 my-1">
          <input
            type="text"
            className="border rounded px-2 py-1 text-xs"
            placeholder="Yeni klasör adı"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddFolder();
              if (e.key === 'Escape') setAdding(false);
            }}
            disabled={addLoading}
          />
          <button
            className="text-xs px-2 py-1 bg-primary text-white rounded disabled:opacity-50"
            onClick={handleAddFolder}
            disabled={addLoading}
          >Ekle</button>
          <button
            className="text-xs px-2 py-1 bg-muted text-foreground rounded"
            onClick={() => { setAdding(false); setNewFolderName(""); setError(""); }}
            disabled={addLoading}
          ><X className="w-3 h-3" /></button>
          {error && <span className="text-xs text-destructive ml-2">{error}</span>}
        </div>
      )}
      
      {/* Silme onay dialogu */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-popover border rounded shadow-lg p-6 min-w-[320px]">
            <div className="font-bold mb-2 text-destructive">Klasörü Sil</div>
            <div className="mb-4">Bu klasörü ve altındaki tüm dosya/klasörleri silmek istediğinize emin misiniz?</div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 rounded bg-muted"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >Vazgeç</button>
              <button
                className="px-3 py-1 rounded bg-destructive text-white"
                onClick={handleDeleteFolder}
                disabled={deleteLoading}
              >{deleteLoading ? 'Siliniyor...' : 'Sil'}</button>
            </div>
          </div>
        </div>
      )}
      
      {expanded && hasSubFolders && (
        <div className="ml-2">
          {data.subFolders.map((subFolder, index) => (
            <FolderTreeItem
              key={`${subFolder.path}-${index}`}
              data={subFolder}
              onFolderSelect={onFolderSelect}
              selectedPath={selectedPath}
              level={level + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* Crop Dialog - MediaCropper kullan */}
      <MediaCropper
        open={cropDialogOpen}
        onClose={() => {
          setCropDialogOpen(false);
          setCropImage(null);
        }}
        image={cropImage || ""}
        onCropComplete={handleCropComplete}
        targetWidth={800}  // Optimum genişlik
        targetHeight={600} // Optimum yükseklik
      />
    </div>
  );
}

export function FolderTree({ 
  data, 
  onFolderSelect, 
  selectedPath,
  onRefresh
}: {
  data: FolderItem;
  onFolderSelect: (path: string) => void;
  selectedPath: string;
  onRefresh?: () => void;
}) {
  return (
    <div className="bg-background border rounded-md p-2 w-full min-h-[240px] overflow-auto">
      <FolderTreeItem
        data={data}
        onFolderSelect={onFolderSelect}
        selectedPath={selectedPath}
        onRefresh={onRefresh}
      />
    </div>
  );
} 