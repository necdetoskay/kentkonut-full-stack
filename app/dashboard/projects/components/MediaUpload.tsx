"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image, Video, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Önceden tanımlanmış boyutlar
const PREDEFINED_SIZES = [
  { width: 370, height: 255, label: "Kapak Görseli (370x255)" },
  { width: 1200, height: 670, label: "Büyük Görsel (1200x670)" },
  { width: 800, height: 600, label: "Orta Boy (800x600)" },
  { width: 400, height: 400, label: "Kare (400x400)" },
  { width: 1080, height: 1080, label: "Instagram (1080x1080)" },
  { width: 1200, height: 628, label: "Facebook (1200x628)" },
];

interface MediaUploadProps {
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
  multiple?: boolean;
  mediaType?: "image" | "video" | "all";
  aspectRatio?: number;
  preferredWidth?: number;
  preferredHeight?: number;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onChange,
  onRemove,
  value,
  multiple = false,
  mediaType = "image",
  aspectRatio,
  preferredWidth = 370,
  preferredHeight = 255
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState(0); // İlk önayarlı boyutu seç
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    width: preferredWidth,
    height: preferredHeight,
    x: 0,
    y: 0
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);

  // Seçilen aspekt oranını hesapla
  const selectedAspectRatio = aspectRatio || (PREDEFINED_SIZES[selectedSize].width / PREDEFINED_SIZES[selectedSize].height);

  const acceptedTypes = {
    image: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    video: { 'video/*': ['.mp4', '.webm', '.mov'] },
    all: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Video dosyalarını ve resim dosyalarını ayır
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
    const videoFiles = acceptedFiles.filter(file => file.type.startsWith('video/'));
    
    if (imageFiles.length > 0) {
      // Eğer resim varsa ve kırpma gerekiyorsa
      const firstImage = imageFiles[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          setImgSrc(e.target.result as string);
          setCropOpen(true);
          setCurrentImage(null);
        }
      };
      
      reader.readAsDataURL(firstImage);
      
      // Diğer resimler ve videolar varsa onları yükle
      const remainingFiles = [...imageFiles.slice(1), ...videoFiles];
      if (remainingFiles.length > 0) {
        await uploadFiles(remainingFiles);
      }
    } else if (videoFiles.length > 0) {
      // Sadece video varsa direkt yükle
      await uploadFiles(acceptedFiles);
    }
  }, [onChange, value, multiple]);

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      
      // Each file gets its own key
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      // Set the target folder based on mediaType
      const targetFolder = mediaType === "video" ? "videos" : "projeler";
      formData.append("targetFolder", targetFolder);
      
      console.log('Yüklemeye çalışılan dosyalar:', files.map(f => `${f.name} (${f.size} bytes, ${f.type})`));
      console.log('Hedef klasör:', targetFolder);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = `Medya yüklenirken bir hata oluştu: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response may not be JSON, try to get text instead
          try {
            const errorText = await response.text();
            console.error('API Hata Detayı:', errorText);
            errorMessage = `${errorMessage} - Detay: ${errorText}`;
          } catch (textError) {
            console.error('API hata detayı alınamadı:', textError);
          }
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.urls || !Array.isArray(data.urls)) {
        throw new Error('API yanıtı geçerli URL dizisi döndürmedi');
      }
      
      if (!multiple) {
        // If not multiple, replace existing media
        onChange(data.urls);
      } else {
        // If multiple, append to existing media
        onChange([...value, ...data.urls]);
      }
      
      toast.success('Medya başarıyla yüklendi');
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Medya yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const applyCrop = async () => {
    if (!imgRef || !completedCrop) {
      toast.error('Kırpma için gerekli bilgiler eksik');
      setCropOpen(false);
      return;
    }
    
    try {
      setIsUploading(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context could not be created');
      }
      
      const scaleX = imgRef.naturalWidth / imgRef.width;
      const scaleY = imgRef.naturalHeight / imgRef.height;
      
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      
      ctx.drawImage(
        imgRef,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );
      
      // Canvas'ı blob'a dönüştür
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob failed'));
        }, 'image/jpeg', 0.95);
      });
      
      // Blob'u dosyaya dönüştür
      const fileName = `cropped-image-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      
      // Dosyayı yükle
      const formData = new FormData();
      formData.append('files', file);
      
      // Set the target folder based on mediaType
      const targetFolder = "projeler";
      formData.append("targetFolder", targetFolder);
      
      console.log('Kırpılan görsel yükleniyor:', `${file.name} (${file.size} bytes, ${file.type})`);
      console.log('Hedef klasör:', targetFolder);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = `Görsel yüklenirken bir hata oluştu: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          try {
            const errorText = await response.text();
            console.error('API Hata Detayı:', errorText);
            errorMessage = `${errorMessage} - Detay: ${errorText}`;
          } catch (textError) {
            console.error('API hata detayı alınamadı:', textError);
          }
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.urls || !Array.isArray(data.urls)) {
        throw new Error('API yanıtı geçerli URL dizisi döndürmedi');
      }
      
      if (!multiple) {
        // If not multiple, replace existing media
        onChange(data.urls);
      } else {
        // If multiple, append to existing media
        onChange([...value, ...data.urls]);
      }
      
      toast.success('Görsel başarıyla kırpıldı ve yüklendi');
      
      // Reset cropping state
      setCropOpen(false);
      setImgSrc('');
      setCompletedCrop(null);
      
    } catch (error) {
      console.error('Kırpma ve yükleme hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Görsel kırpma sırasında bir hata oluştu');
      setCropOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes[mediaType],
    multiple,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
  };

  // Otomatik kırpma alanını ayarla
  const setOptimalCrop = () => {
    if (!imgRef) return;
    
    const { width, height } = imgRef;
    const targetWidth = PREDEFINED_SIZES[selectedSize].width;
    const targetHeight = PREDEFINED_SIZES[selectedSize].height;
    const targetAspectRatio = targetWidth / targetHeight;
    
    // İlk yüklendiğinde otomatik kırpma alanı ayarla
    let newCrop: Crop = {
      unit: 'px',
      width: width,
      height: width / targetAspectRatio,
      x: 0,
      y: (height - (width / targetAspectRatio)) / 2
    };
    
    // Eğer resim çok büyükse, kırpma alanını ayarla
    if (newCrop.height > height) {
      newCrop.height = height;
      newCrop.width = height * targetAspectRatio;
      newCrop.x = (width - (height * targetAspectRatio)) / 2;
      newCrop.y = 0;
    }
    
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  };

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
                {isVideo(url) ? (
                  <div className="w-full h-full rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={url}
                    alt="Uploaded media"
                    className="w-full h-full object-cover rounded-md"
                  />
                )}
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
            {mediaType === "image" ? (
              <Image className="h-10 w-10 text-muted-foreground mb-2" />
            ) : mediaType === "video" ? (
              <Video className="h-10 w-10 text-muted-foreground mb-2" />
            ) : (
              <div className="flex gap-2 mb-2">
                <Image className="h-10 w-10 text-muted-foreground" />
                <Video className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="text-sm text-muted-foreground mb-1">
              {isUploading ? 'Yükleniyor...' : `${mediaType === "image" ? 'Görsel' : mediaType === "video" ? 'Video' : 'Medya'} yüklemek için buraya tıklayın veya sürükleyin`}
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span>{multiple ? 'Maksimum 10 dosya' : '1 dosya'}</span>
                <span>-</span>
                {mediaType === "image" ? (
                  <span>Görsel boyutu: {PREDEFINED_SIZES[selectedSize].width}x{PREDEFINED_SIZES[selectedSize].height} px (otomatik kırpma)</span>
                ) : mediaType === "video" ? (
                  <span>MP4, WebM, MOV formatları</span>
                ) : (
                  <span>Görsel (JPG, PNG, WebP) veya Video (MP4, WebM, MOV)</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center mt-2 space-x-2">
        {value.length > 0 && !multiple && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([])}
          >
            <X className="h-4 w-4 mr-2" />
            Medyayı Kaldır
          </Button>
        )}
        
        {mediaType === "image" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Boyut Ayarları
          </Button>
        )}
      </div>

      {/* Kırpma Diyaloğu */}
      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resmi Kırp</DialogTitle>
            <DialogDescription>
              Önerilen boyut: {PREDEFINED_SIZES[selectedSize].width}x{PREDEFINED_SIZES[selectedSize].height} piksel. Kırpma alanını istediğiniz şekilde ayarlayabilirsiniz.
              {completedCrop && (
                <div className="mt-1 text-sm font-medium">
                  Kırpma boyutu: {Math.round(completedCrop.width * (imgRef?.naturalWidth || 0) / (imgRef?.width || 1))} x {Math.round(completedCrop.height * (imgRef?.naturalHeight || 0) / (imgRef?.height || 1))} piksel
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-xs mb-2">
              <Label htmlFor="image-size" className="text-sm">Görsel Boyutu</Label>
              <Select 
                value={selectedSize.toString()} 
                onValueChange={(value) => {
                  const newSizeIndex = parseInt(value);
                  setSelectedSize(newSizeIndex);
                  
                  // Boyut değiştiğinde otomatik kırpma alanı ayarla
                  setTimeout(() => {
                    setOptimalCrop();
                  }, 0);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Boyut seçin" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_SIZES.map((size, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={selectedAspectRatio}
              className="max-h-[60vh] mt-4"
            >
              <img
                ref={(node) => setImgRef(node)}
                src={imgSrc}
                alt="Crop"
                style={{ transform: `scale(${scale})` }}
                onLoad={(e) => {
                  setOptimalCrop();
                }}
              />
            </ReactCrop>
            
            <div className="w-full max-w-md flex items-center space-x-2">
              <span className="text-sm">Yakınlaştır:</span>
              <Slider
                value={[scale]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={(value) => setScale(value[0])}
                className="flex-1"
              />
              <span className="text-sm font-medium">{scale.toFixed(1)}x</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCropOpen(false)}>
              İptal
            </Button>
            
            <Button 
              onClick={setOptimalCrop}
              variant="outline"
            >
              Otomatik Boyutlandır
            </Button>

            <Button onClick={applyCrop}>
              Uygula ve Yükle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Boyut Ayarları Diyaloğu */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Görsel Boyutu Ayarları</DialogTitle>
            <DialogDescription>
              Yüklenecek görseller için varsayılan kırpma boyutunu seçin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-size-setting">Görsel Boyutu</Label>
              <Select 
                value={selectedSize.toString()} 
                onValueChange={(value) => {
                  setSelectedSize(parseInt(value));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Boyut seçin" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_SIZES.map((size, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {size.label} - {size.width}x{size.height}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Seçilen boyut: {PREDEFINED_SIZES[selectedSize].width}x{PREDEFINED_SIZES[selectedSize].height} piksel
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              İptal
            </Button>
            <Button onClick={() => setSettingsOpen(false)}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaUpload; 