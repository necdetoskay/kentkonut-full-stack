"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface CropperProps {
  open: boolean
  onClose: () => void
  image: string
  onCropComplete: (croppedImage: string, outputScale: number) => void
  aspectRatio?: number
  width?: number
  height?: number
}

export function DirectCropper({
  open,
  onClose,
  image,
  onCropComplete,
  aspectRatio,
  width,
  height,
}: CropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scale, setScale] = useState(1.0)
  const [outputScale, setOutputScale] = useState(100)
  const [pixelCropSize, setPixelCropSize] = useState<{width: number, height: number} | null>(null)
  const [isPerfectMatch, setIsPerfectMatch] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [scaleFactor, setScaleFactor] = useState(1)
  const [cropPosition, setCropPosition] = useState<{x: number, y: number} | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cropAreaRef = useRef<{ crop: Crop | undefined, completed: PixelCrop | undefined }>({
    crop: undefined,
    completed: undefined
  })

  // Reset crop state when image changes
  useEffect(() => {
    setIsImageLoaded(false)
    setCrop(undefined)
    setCompletedCrop(undefined)
    cropAreaRef.current = { crop: undefined, completed: undefined }
  }, [image])

  // Store crop values in ref
  useEffect(() => {
    if (crop) {
      cropAreaRef.current.crop = crop
    }
    if (completedCrop) {
      cropAreaRef.current.completed = completedCrop
    }
  }, [crop, completedCrop])

  // Calculate scale to fit crop area in viewport
  useEffect(() => {
    function updateScale() {
      if (typeof window === 'undefined') return;
      const maxW = window.innerWidth * 0.9;
      const maxH = window.innerHeight * 0.7;
      let scale = 1;
      
      if (width && height) {
        scale = Math.min(maxW / width, maxH / height, 1);
      }
      
      setScaleFactor(scale);
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [width, height]);

  // Görsel yüklendiğinde kırpma alanını oluştur
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!e.currentTarget) return;
    
    try {
      const { width: imgWidth, height: imgHeight } = e.currentTarget;
      console.log("Yüklenen görüntü boyutları:", imgWidth, "x", imgHeight);
      
      // Eğer zaten bir crop değeri varsa onu kullan
      if (cropAreaRef.current.crop) {
        setCrop(cropAreaRef.current.crop);
        if (cropAreaRef.current.completed) {
          setCompletedCrop(cropAreaRef.current.completed);
        }
      } else {
        // İlk kırpma alanı - TAMAMEN SERBEST, ORAN KISITLAMASI YOK
        const initialCrop = {
          unit: '%' as const,
          width: 50,
          height: 50,
          x: 25,
          y: 25,
        };
        
        console.log("Başlangıç kırpma alanı:", initialCrop);
        setCrop(initialCrop);
        cropAreaRef.current.crop = initialCrop;
      }
      
      setIsImageLoaded(true);
    } catch (error) {
      console.error("Error processing image in crop dialog:", error);
    }
  }, []);
  
  // Kırpma alanı değiştiğinde piksel boyutlarını hesapla
  useEffect(() => {
    if (completedCrop && imgRef.current) {
      const { naturalWidth, naturalHeight, width: displayWidth, height: displayHeight } = imgRef.current;
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
      
      // Piksel boyutlarını doğru hesapla - bunlar GERÇEK piksel boyutları
      const pixelWidth = Math.round(completedCrop.width * scaleX);
      const pixelHeight = Math.round(completedCrop.height * scaleY);
      
      console.log("Kırpma alanı piksel boyutları:", pixelWidth, "x", pixelHeight);
      
      setPixelCropSize({ width: pixelWidth, height: pixelHeight });
      setCropPosition({ x: completedCrop.x, y: completedCrop.y });
      
      // Hedef boyut varsa eşleşme kontrolü yap
      if (width && height) {
        const isWidthMatch = Math.abs(pixelWidth - width) <= 2;
        const isHeightMatch = Math.abs(pixelHeight - height) <= 2;
        setIsPerfectMatch(isWidthMatch && isHeightMatch);
      }
    }
  }, [completedCrop, width, height])

  // Zoom değiştiğinde kırpma alanını orantılı olarak ölçeklendir
  useEffect(() => {
    // Eğer crop alanı tanımlanmışsa ve görsel yüklenmişse
    if (completedCrop && imgRef.current && isImageLoaded) {
      console.log("Zoom orantılı kırpma alanı güncelleniyor, ölçek:", scale);
      
      // Kırpma alanını güncelle - burada crop ve completedCrop güncellemiyoruz
      // çünkü bunlar React Crop tarafından içeride kontrol ediliyor
      // Bu sadece piksel boyutlarını ve görüntülenecek bilgileri günceller
      
      const { naturalWidth, naturalHeight, width: displayWidth, height: displayHeight } = imgRef.current;
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
      
      // Piksel boyutlarını doğru hesapla - bunlar GERÇEK piksel boyutları
      const pixelWidth = Math.round(completedCrop.width * scaleX);
      const pixelHeight = Math.round(completedCrop.height * scaleY);
      
      setPixelCropSize({ width: pixelWidth, height: pixelHeight });
      setCropPosition({ x: completedCrop.x, y: completedCrop.y });
    }
  }, [scale, completedCrop, isImageLoaded]);

  // Update the preview canvas when crop changes
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return;
    
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error("Canvas context could not be created");
      return;
    }
    
    // Tam boyut crop hesaplama
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    // Doğru piksel koordinatları ve boyutları
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    // Ölçek faktörünü uygula
    const outputScaleFactor = outputScale / 100;
    
    // İstenen piksel boyutları
    let targetWidth, targetHeight;
    
    if (width && height) {
      // Belirli bir hedef boyut varsa
      targetWidth = width * outputScaleFactor;
      targetHeight = height * outputScaleFactor;
    } else {
      // Boyut yoksa crop'a göre hesapla
      targetWidth = cropWidth * outputScaleFactor;
      targetHeight = cropHeight * outputScaleFactor;
    }
    
    // Hedef boyutları tam sayıya yuvarla
    targetWidth = Math.round(targetWidth);
    targetHeight = Math.round(targetHeight);
    
    // Canvas boyutlarını ayarla
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Düzgün ölçekleme için
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Debug için log
    console.log("Canvas render:", {
      sourceImage: {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      },
      cropCoordinates: {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight
      },
      outputOptions: {
        scale: outputScale + "%",
        targetWidth,
        targetHeight
      }
    });
    
    // Görüntüyü çiz
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, targetWidth, targetHeight
    );
  }, [completedCrop, width, height, outputScale]);

  // Handle crop complete - BU FONKSİYON TAMAMEN YENİDEN YAZILDI
  const handleCropComplete = () => {
    if (!completedCrop || !imgRef.current || !pixelCropSize) return;
    
    try {
      // Orijinal görüntüyü al
      const originalImg = imgRef.current;
      const { naturalWidth, naturalHeight, width: displayWidth, height: displayHeight } = originalImg;
      
      // Kırpılacak alanın gerçek piksel koordinatlarını hesapla
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
      
      const cropX = Math.round(completedCrop.x * scaleX);
      const cropY = Math.round(completedCrop.y * scaleY);
      
      // GERÇEK piksel boyutlarını al (kırpma alanının)
      const cropWidth = pixelCropSize.width;
      const cropHeight = pixelCropSize.height;
      
      // Görüntüleme ölçeği 
      const outputScaleFactor = scale;
      
      // Çıktı boyutlarını hesapla - Scale değerine göre
      const targetWidth = Math.round(cropWidth * outputScaleFactor);
      const targetHeight = Math.round(cropHeight * outputScaleFactor);
      
      console.log(`Kırpma İşlemi Detayları:
        Orijinal Görüntü: ${naturalWidth} x ${naturalHeight}
        Kırpma Alanı (piksel): ${cropWidth} x ${cropHeight} @ (${cropX}, ${cropY})
        Ölçeklendirme: ${outputScaleFactor * 100}%
        Final Boyut: ${targetWidth} x ${targetHeight}
      `);
      
      // İki aşamalı canvas oluştur:
      // 1. Kırpma canvas - GERÇEK piksel boyutlarında
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropWidth;
      cropCanvas.height = cropHeight;
      
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) throw new Error("Canvas context oluşturulamadı");
      
      // Orijinal resimden kırpma bölgesini tam olarak al
      cropCtx.drawImage(
        originalImg,
        cropX, cropY, cropWidth, cropHeight,  // Kaynak bölgesi
        0, 0, cropWidth, cropHeight           // Hedef bölgesi (aynı boyut)
      );
      
      // 2. Final canvas - ölçeklendirilmiş boyutlarda
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) throw new Error("Final canvas oluşturulamadı");
      
      // Yüksek kaliteli ölçekleme
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      
      // Kırpılan alanı istenen ölçekte çiz
      finalCtx.drawImage(
        cropCanvas,
        0, 0, cropWidth, cropHeight,    // Kaynak bölgesi (tam kırpma boyutu)
        0, 0, targetWidth, targetHeight // Hedef bölgesi (ölçeklendirilmiş)
      );
      
      // Base64 veri URL'si oluştur
      const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.95);
      
      // Callback'i çağır ve dialog'u kapat
      console.log(`Kırpma tamamlandı: ${targetWidth} x ${targetHeight}`);
      onCropComplete(dataUrl, outputScaleFactor * 100);
      onClose();
      
    } catch (error) {
      console.error('Görüntü işleme hatası:', error);
    }
  }

  // Kayıt boyutunu hesapla - doğrudan piksel boyutlarını kullan
  const getOutputDimensions = () => {
    if (!pixelCropSize) return null;
    
    return {
      width: Math.round(pixelCropSize.width * scale),
      height: Math.round(pixelCropSize.height * scale)
    };
  }

  const outputDimensions = getOutputDimensions();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle>Görsel Kırpma</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-w-full overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col gap-2 w-full">
              <Label>Görüntüleme ve Kayıt Ölçeği: {Math.round(scale * 100)}%</Label>
              <Slider
                min={0.1}
                max={3}
                step={0.1}
                value={[scale]}
                onValueChange={(value) => {
                  setScale(value[0]);
                  setOutputScale(Math.round(value[0] * 100));
                }}
              />
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Küçült (10%)</span>
                <span>Normal (100%)</span>
                <span>Büyüt (300%)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                • Ölçek ayarı aynı anda hem resmi hem kırpma alanını orantılı şekilde büyütür/küçültür
              </p>
            </div>
          </div>
          
          <div className="relative flex justify-center items-center" ref={containerRef}>
            {/* Crop boyutları overlay */}
            {pixelCropSize && cropPosition && (
              <div 
                className="absolute z-10 pointer-events-none"
                style={{
                  left: `${cropPosition.x}px`,
                  top: `${cropPosition.y - 30}px`,
                }}
              >
                <Badge variant={isPerfectMatch ? "default" : "secondary"} className="text-xs">
                  {pixelCropSize.width} × {pixelCropSize.height} px
                  {isPerfectMatch && " ✓"}
                </Badge>
              </div>
            )}
            
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                maxHeight: '70vh',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                backgroundColor: '#222'
              }}
              ref={containerRef}
            >
              <div className="zoom-container" style={{ 
                position: 'relative',
                overflow: 'hidden',
                width: '100%', 
                height: '100%',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {/* Dış div - sabit boyutlu */}
                <div className="crop-outer-container" style={{ 
                  position: 'relative',
                  width: '100%',
                  maxWidth: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {/* React Crop komponenti - Zoom ölçeğini burada uyguluyoruz */}
                  <div className="ReactCrop-wrapper" style={{ 
                    position: 'relative',
                    maxWidth: '100%',
                    transform: `scale(${scale})`, 
                    transformOrigin: 'center',
                    transition: 'transform 0.2s ease',
                  }}>
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={undefined}
                      locked={false}
                      minWidth={20}
                      minHeight={20}
                      keepSelection={true}
                      circularCrop={false}
                      ruleOfThirds={true}
                      disabled={false}
                      className="image-crop-container"
                    >
                      {image ? (
                        <img
                          ref={imgRef}
                          src={image}
                          alt="Crop preview"
                          onLoad={onImageLoad}
                          className="crop-image"
                          style={{ 
                            display: 'block',
                            maxWidth: '100%',
                            maxHeight: '60vh',
                            margin: '0 auto'
                          }}
                        />
                      ) : (
                        <div className="w-full h-[200px] flex items-center justify-center text-xs text-muted-foreground">Yükleniyor</div>
                      )}
                    </ReactCrop>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ölçeklendirme ve kayıt bilgileri */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Kayıt Bilgileri</h3>
            <div className="space-y-1 text-sm">
              {pixelCropSize && (
                <div className="flex justify-between">
                  <span>Seçilen Boyut:</span>
                  <span className="font-medium font-mono">{pixelCropSize.width} × {pixelCropSize.height} px</span>
                </div>
              )}
              {outputDimensions && (
                <div className="flex justify-between">
                  <span>Kayıt Boyutu:</span>
                  <span className="font-medium font-mono">{outputDimensions.width} × {outputDimensions.height} px</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ölçeklendirme:</span>
                <span className="font-medium">{Math.round(scale * 100)}%</span>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                <p>• Kırpma alanı, resim üzerinde seçtiğiniz bölgeyi belirler</p>
                <p>• Zoom, hem resmi hem kırpma alanını aynı anda büyütür/küçültür</p>
                <p>• Kayıt boyutu, seçilen alanın son ölçeklendirilmiş halidir</p>
              </div>
            </div>
          </div>
          
          {/* Hedef boyut varsa göster */}
          {width && height && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Hedef boyut: {width} × {height} px
              </div>
              {pixelCropSize && (
                <div className="text-sm">
                  {isPerfectMatch ? (
                    <span className="text-primary">✓ Boyut eşleşiyor</span>
                  ) : (
                    <span className="text-muted-foreground">
                      Mevcut: {pixelCropSize.width} × {pixelCropSize.height} px
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <canvas
          ref={canvasRef}
          className="hidden"
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={handleCropComplete} disabled={!completedCrop}>
            Kırp ve Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 