"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
  multiple?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  onRemove,
  value,
  multiple = false
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      
      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Görsel yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      if (!multiple) {
        // If not multiple, replace existing images
        onChange(data.urls);
      } else {
        // If multiple, append to existing images
        onChange([...value, ...data.urls]);
      }
      
      toast.success('Görsel başarıyla yüklendi');
    } catch (error) {
      console.error(error);
      toast.error('Görsel yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  }, [onChange, value, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  return (
    <div>
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-md p-4 mt-1
          ${isDragActive ? 'border-primary' : 'border-border'}
          transition-colors duration-200 cursor-pointer
          hover:border-primary
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {value.map((url) => (
              <div 
                key={url} 
                className="relative w-24 h-24 group"
              >
                <img
                  src={url}
                  alt="Uploaded image"
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(url);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            {multiple && (
              <div className="w-24 h-24 flex items-center justify-center border border-border rounded-md">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <Image className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              {isUploading ? 'Yükleniyor...' : 'Görsel yüklemek için buraya tıklayın veya sürükleyin'}
            </p>
            <p className="text-xs text-muted-foreground">
              {multiple ? 'Maksimum 10 görsel' : '1 görsel'}
            </p>
          </div>
        )}
      </div>
      
      {value.length > 0 && !multiple && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => onChange([])}
        >
          <X className="h-4 w-4 mr-2" />
          Görseli Kaldır
        </Button>
      )}
    </div>
  );
};

export default ImageUpload; 