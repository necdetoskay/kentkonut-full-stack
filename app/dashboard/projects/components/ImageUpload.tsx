"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define the FileWithPreview interface directly in this file
export interface FileWithPreview extends File {
  preview: string;
}

interface ImageUploadProps {
  onChange: (value: string) => void;
  onRemove: () => void;
  value: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  onRemove,
  value,
  disabled
}) => {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dosya boyutu 5MB'dan küçük olmalıdır");
        return;
      }

      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file)
      });

      setFile(fileWithPreview);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file0", file);
      formData.append("targetFolder", "projeler");

      fetch("/api/upload", {
        method: "POST",
        body: formData
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Upload failed with status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("Upload response:", data);
          if (data.urls && data.urls.length > 0) {
            onChange(data.urls[0]);
          } else {
            throw new Error("No URL returned from upload API");
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Upload error:", err);
          toast.error("Dosya yüklenirken bir hata oluştu");
          setIsLoading(false);
        });
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1,
    disabled: disabled || isLoading
  });

  useEffect(() => {
    // If the component unmounts, clean up the preview
    return () => {
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  if (value && !isLoading) {
    return (
      <div className="relative h-[200px] w-full overflow-hidden rounded-md">
        <img 
          src={value} 
          alt="Uploaded image" 
          className="h-full w-full object-cover"
        />
        {!disabled && (
          <Button 
            onClick={onRemove} 
            variant="destructive" 
            size="icon" 
            className="absolute right-2 top-2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        relative flex h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition
        ${isDragActive ? "border-primary/50 bg-primary/5" : "border-primary/20 hover:bg-primary/5"}
        ${disabled || isLoading ? "cursor-not-allowed opacity-50" : ""}
      `}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <span className="animate-spin">
            <Upload className="h-10 w-10 text-primary" />
          </span>
          <p>Yükleniyor...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <Image className="h-10 w-10 text-primary" />
          <p>Resmi sürükleyip bırakın veya yüklemek için tıklayın</p>
          <p className="text-xs">5MB'a kadar PNG, JPG veya WebP</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 