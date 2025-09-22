"use client"

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Upload, ImageIcon, X, Crop as CropIcon } from 'lucide-react';
import { getCroppedImg } from '../../lib/crop-image';

interface ImageUploaderProps {
  /** Current image source for cropping */
  cropperImgSrc: string | null;
  /** URL of the final image to display */
  displayImageUrl: string | null;
  /** Whether to show the crop tool */
  showCropTool: boolean;
  /** Callback when image is cropped */
  onImageCropped: (image: { file: File; url: string } | null) => void;
  /** Callback to set the cropper image source */
  onSetCropperImgSrc: (src: string | null) => void;
  /** Callback to set show crop tool state */
  onSetShowCropTool: (show: boolean) => void;
  /** Callback to set cropped image data */
  onSetCroppedImageData: (data: { file: File; url: string } | null) => void;
  /** Aspect ratio for cropping */
  aspectRatio?: number;
  /** Class name for styling */
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  cropperImgSrc,
  displayImageUrl,
  showCropTool,
  onImageCropped,
  onSetCropperImgSrc,
  onSetShowCropTool,
  onSetCroppedImageData,
  aspectRatio = 16 / 9,
  className
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const imgRef = useRef<HTMLImageElement>(null);

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          if (reader.result) {
            onSetCropperImgSrc(reader.result.toString());
            onSetShowCropTool(true);
            onSetCroppedImageData(null);
            setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 });
          }
        });
        reader.readAsDataURL(file);
      }
    },
  });

  // File input handler
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (reader.result) {
          onSetCropperImgSrc(reader.result.toString());
          onSetShowCropTool(true);
          onSetCroppedImageData(null);
          setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 });
        }
      });
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  // Crop completion handler
  const onCropComplete = useCallback(async () => {
    try {
      if (!imgRef.current || !cropperImgSrc) return;

      const croppedImageResult = await getCroppedImg(
        imgRef.current,
        crop,
        'cropped.jpg'
      );

      if (croppedImageResult) {
        const { file, url } = croppedImageResult;
        onImageCropped({ file, url });
      }
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  }, [crop, cropperImgSrc, onImageCropped]);

  // Cancel crop handler
  const handleCancelCrop = () => {
    onSetShowCropTool(false);
    setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 });
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {!showCropTool && (
        <>
          {/* File input and action buttons */}
          <div className="flex gap-2 mb-4">
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload-input"
              onChange={onSelectFile}
            />
            <Label htmlFor="image-upload-input" asChild>
              <Button variant="default" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {displayImageUrl ? 'Resmi Değiştir' : 'Resim Seç'}
              </Button>
            </Label>
            {cropperImgSrc && !showCropTool && (
              <Button
                variant="outline"
                onClick={() => onSetShowCropTool(true)}
              >
                <CropIcon className="w-4 h-4 mr-2" />
                Resmi Kırp/Düzenle
              </Button>
            )}
          </div>

          {/* Dropzone area */}
          <Card
            {...getRootProps()}
            className={cn(
              "min-h-[200px] cursor-pointer transition-colors",
              "border-2 border-dashed",
              isDragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-primary/50",
              displayImageUrl && "p-0"
            )}
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              <input {...getInputProps()} />
              
              {displayImageUrl ? (
                <div className="w-full text-center">
                  <img 
                    src={displayImageUrl} 
                    alt="Yüklenen resim önizlemesi" 
                    className="max-w-full max-h-[300px] object-contain mx-auto mb-3 rounded-lg" 
                  />
                  <p className="text-sm text-muted-foreground">
                    Resmi değiştirmek için tıklayın veya yeni bir resim sürükleyin
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    {isDragActive ? 'Resmi buraya bırakın...' : 'Resim Sürükleyin veya Seçin'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yüksek çözünürlüklü görseller kullanmanız önerilir.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Crop tool */}
      {showCropTool && cropperImgSrc && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resmi Kırp</h3>
              
              <div className="border rounded-lg overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={aspectRatio}
                >
                  <img
                    ref={imgRef}
                    src={cropperImgSrc}
                    alt="Kırpılacak resim"
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={onCropComplete}
                  className="flex-1"
                >
                  <CropIcon className="w-4 h-4 mr-2" />
                  Kırpmayı Tamamla
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelCrop}
                >
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
