"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cropImageToFile } from "./crop-utils"
import { cn } from "@/lib/utils"

// Özel stil sınıfları
const cropperStyles = {
  container: "relative overflow-hidden",
  cropArea: "!border-2 !border-white !rounded-sm",
}

interface CropMonitorProps {
  open: boolean
  onClose: () => void
  image: string | null
  file: File | null
  onCropComplete: (file: File) => void
  aspectRatio?: number
  recommendedWidth?: number
  recommendedHeight?: number
}

export function CropMonitor({
  open,
  onClose,
  image,
  file,
  onCropComplete,
  aspectRatio = 16 / 9,
  recommendedWidth,
  recommendedHeight,
}: CropMonitorProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null)
  const [cropDimensions, setCropDimensions] = useState<{ width: number; height: number } | null>(null)

  // Görsel yüklendiğinde kırpma alanını ortalar
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setOriginalDimensions({ width, height })

    // Görsel yüklendiğinde kırpma alanını ortalar
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    )
    
    setCrop(initialCrop)
  }, [aspectRatio])

  // Kırpma alanını önerilen boyutlara göre otomatik ayarla
  const setOptimalCrop = useCallback(() => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const { naturalWidth, naturalHeight, width, height } = img;
    
    // Tam olarak hedef boyutlara göre hesaplama yap
    const targetAspect = aspectRatio;
    const imageAspect = width / height;
    
    // Kırpma alanının genişliği ve yüksekliği (yüzde olarak)
    let cropWidth, cropHeight;
    
    if (targetAspect >= imageAspect) {
      // Hedef daha geniş, yatay sınırlama olacak
      cropWidth = 100; // Tam genişlik
      cropHeight = (width / targetAspect) * 100 / height; // Hedef oranı koruyacak yükseklik
    } else {
      // Hedef daha dar, dikey sınırlama olacak
      cropHeight = 100; // Tam yükseklik
      cropWidth = (height * targetAspect) * 100 / width; // Hedef oranı koruyacak genişlik
    }
    
    // Merkeze konumlandırılmış bir kırpma alanı oluştur
    const x = (100 - cropWidth) / 2;
    const y = (100 - cropHeight) / 2;
    
    const newCrop: Crop = {
      unit: '%',
      x,
      y,
      width: cropWidth,
      height: cropHeight
    };
    
    setCrop(newCrop);
    
    // Piksel bazlı kırpma bilgilerini de güncelle
    if (img) {
      const pixelCrop: PixelCrop = {
        x: (newCrop.x * width) / 100,
        y: (newCrop.y * height) / 100,
        width: (newCrop.width * width) / 100,
        height: (newCrop.height * height) / 100,
        unit: 'px',
      };
      
      setCompletedCrop(pixelCrop);
    }
    
    // Zoom seviyesini sıfırla
    setScale(1);
  }, [aspectRatio]);

  // Kırpma tamamlandığında
  const handleCropComplete = useCallback(() => {
    if (!imageRef.current || !canvasRef.current || !completedCrop || !file) return

    // Önerilen boyutlar veya kırpma boyutları
    const width = recommendedWidth || completedCrop.width
    const height = recommendedHeight || completedCrop.height

    cropImageToFile(
      completedCrop, 
      imageRef, 
      canvasRef, 
      file, 
      width, 
      height
    )
      .then((croppedFile) => {
        if (croppedFile) {
          onCropComplete(croppedFile)
        }
        onClose()
      })
      .catch((error) => {
        console.error("Kırpma işlemi başarısız:", error)
      })
  }, [completedCrop, file, imageRef, canvasRef, onCropComplete, onClose, recommendedWidth, recommendedHeight])

  // Klavye kontrolü için event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || !crop || !imageRef.current) return;
      
      const STEP = 0.5; // Normal hareket adımı
      const SIZE_STEP = 1; // Boyut değişim adımı
      
      // Ölçek değişimi için
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setScale(prev => Math.min(prev + 0.1, 2));
        return;
      }
      
      if (e.key === '-') {
        e.preventDefault();
        setScale(prev => Math.max(prev - 0.1, 0.5));
        return;
      }
      
      // Ctrl tuşu basılı ise zoom değişimi yap
      if (e.ctrlKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setScale(prev => Math.min(prev + 0.1, 2));
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setScale(prev => Math.max(prev - 0.1, 0.5));
          return;
        }
      }
      
      // Ok tuşları ile kırpma alanını hareket ettir
      let newCrop = { ...crop };
      let modified = false;
      
      if (e.shiftKey) {
        // Shift basılıyken boyut değiştir
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          newCrop.width = Math.max(10, crop.width - SIZE_STEP);
          modified = true;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          newCrop.width = Math.min(100 - crop.x, crop.width + SIZE_STEP);
          modified = true;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          newCrop.height = Math.max(10, crop.height - SIZE_STEP);
          modified = true;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          newCrop.height = Math.min(100 - crop.y, crop.height + SIZE_STEP);
          modified = true;
        }
        
        // En-boy oranını koru
        if (aspectRatio && modified) {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            newCrop.height = newCrop.width / aspectRatio;
          } else {
            newCrop.width = newCrop.height * aspectRatio;
          }
        }
      } else {
        // Pozisyon değiştir
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          newCrop.x = Math.max(0, crop.x - STEP);
          modified = true;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          newCrop.x = Math.min(100 - crop.width, crop.x + STEP);
          modified = true;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          newCrop.y = Math.max(0, crop.y - STEP);
          modified = true;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          newCrop.y = Math.min(100 - crop.height, crop.y + STEP);
          modified = true;
        }
      }
      
      if (modified) {
        setCrop(newCrop);
        
        // Piksel bazlı kırpma bilgilerini de güncelle
        const { width, height } = imageRef.current;
        const pixelCrop: PixelCrop = {
          x: (newCrop.x * width) / 100,
          y: (newCrop.y * height) / 100,
          width: (newCrop.width * width) / 100,
          height: (newCrop.height * height) / 100,
          unit: 'px',
        };
        setCompletedCrop(pixelCrop);
      }
    };
    
    // Klavye olayını dialog açıkken dinlemeye başla
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, crop, aspectRatio]);

  // Kırpma değiştiğinde boyutları güncelle
  useEffect(() => {
    if (imageRef.current && completedCrop) {
      // Boyut hesaplama
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
      
      const width = Math.round(completedCrop.width * scaleX);
      const height = Math.round(completedCrop.height * scaleY);
      
      setCropDimensions({ width, height });
    }
  }, [completedCrop])

  // Görsel yüklendiğinde optimal kırpma alanını ayarla
  useEffect(() => {
    if (imageRef.current && open && image) {
      // Bir süre bekleyerek resmin tam olarak yüklenmesini sağla
      const timer = setTimeout(() => {
        setOptimalCrop();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [open, image, setOptimalCrop]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Görseli Kırp</DialogTitle>
          <DialogDescription>
            Görselin görüntülenmesini istediğiniz bölümünü seçin.
            {recommendedWidth && recommendedHeight && (
              <div className="mt-2">
                <span className="font-medium">Önerilen boyut:</span> {recommendedWidth}px x {recommendedHeight}px
              </div>
            )}
            {originalDimensions && (
              <div className="mt-1">
                <span className="font-medium">Orijinal boyut:</span> {originalDimensions.width}px x {originalDimensions.height}px
              </div>
            )}
            {cropDimensions && (
              <div className="mt-1">
                <span className="font-medium">Kırpma boyutu:</span> {cropDimensions.width}px x {cropDimensions.height}px
              </div>
            )}
            <div className="mt-2 text-xs">
              <p>Kırpma alanını köşelerdeki kutucuklardan boyutlandırabilirsiniz.</p>
              <p>Alanı taşımak için içinden tutup sürükleyebilir veya yön tuşlarını kullanabilirsiniz.</p>
              <p>Boyutu değiştirmek için SHIFT + yön tuşlarını kullanabilirsiniz.</p>
              <p>Yakınlaştırmak/uzaklaştırmak için + ve - tuşlarını kullanabilirsiniz.</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center my-4 overflow-hidden bg-muted">
          {image && (
            <div className="w-full">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                minWidth={100}
                ruleOfThirds={true}
                keepSelection={true}
                circularCrop={false}
                className="max-h-[60vh] mx-auto"
              >
                <img
                  ref={imageRef}
                  src={image}
                  alt="Kırpılacak görsel"
                  style={{ transform: `scale(${scale})` }}
                  onLoad={onImageLoad}
                  className="max-w-full h-auto"
                />
              </ReactCrop>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Label htmlFor="zoom" className="min-w-24">
            Yakınlaştırma: {scale.toFixed(1)}x
          </Label>
          <Slider
            id="zoom"
            min={0.5}
            max={2}
            step={0.1}
            value={[scale]}
            onValueChange={(value) => setScale(value[0])}
            className="w-full"
          />
        </div>

        <div className="flex justify-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={setOptimalCrop}
            className="text-xs"
          >
            Otomatik Boyutlandır
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleCropComplete} disabled={!completedCrop}>
            Kırp ve Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 