import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
// @ts-ignore
import ReactCrop, { Crop, PixelCrop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useDropzone } from 'react-dropzone';
import { getCroppedImg } from '../../utils/cropImage';
import { PixelCropArea } from '../../types/carousel.types';

interface ImageUploaderProps {
  cropperImgSrc: string | null;
  displayImageUrl: string | null;
  showCropTool: boolean;
  onImageCropped: (image: { file: File; url: string } | null) => void;
  onSetCropperImgSrc: (src: string | null) => void;
  onSetShowCropTool: (show: boolean) => void;
  onSetCroppedImageData: (data: { file: File; url: string } | null) => void;
  aspectRatio?: number;
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
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
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
            setCompletedCrop(null);
          }
        });
        reader.readAsDataURL(file);
      }
    },
  });

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
          setCompletedCrop(null);
        }
      });
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCropComplete = useCallback((pixelCrop: PixelCrop, _: PercentCrop) => {
    setCompletedCrop(pixelCrop);
  }, []);

  const handleSaveCroppedImage = useCallback(async () => {
    if (!cropperImgSrc || !completedCrop || !completedCrop.width || !completedCrop.height) {
      console.error('Kırpma işlemi için gerekli bilgiler eksik.', { cropperImgSrc, completedCrop });
      return;
    }

    setIsLoading(true);
    try {
      const pixelCropArea: PixelCropArea = {
        x: completedCrop.x,
        y: completedCrop.y,
        width: completedCrop.width,
        height: completedCrop.height,
      };

      console.log('Kırpma alanı:', pixelCropArea);
      console.log('Kaynak URL:', cropperImgSrc.substring(0, 100) + '...');

      const croppedImageResult = await getCroppedImg(cropperImgSrc, pixelCropArea, 'carousel-image.jpeg');
      console.log('Kırpma sonucu alındı:', croppedImageResult);

      onImageCropped(croppedImageResult);
      onSetShowCropTool(false);

    } catch (error) {
      console.error('Resim kırpma hatası:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cropperImgSrc, completedCrop, onImageCropped, onSetShowCropTool]);

  const handleCancelCrop = useCallback(() => {
    onSetShowCropTool(false);
  }, [onSetShowCropTool]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // const { width, height } = e.currentTarget; // Kullanılmadığı için kaldırıldı
    // console.log('Image loaded:', e.currentTarget.naturalWidth, e.currentTarget.naturalHeight);
    // İsteğe bağlı: Burada varsayılan bir crop ayarlanabilir
  };

  return (
    <Box sx={{ width: '100%' }}>
      {!showCropTool && (
        <>
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload-input"
              onChange={onSelectFile}
            />
            <label htmlFor="image-upload-input">
              <Button variant="contained" component="span" sx={{ mr: 2 }}>
                {displayImageUrl ? 'Resmi Değiştir' : 'Resim Seç'}
              </Button>
            </label>
            {cropperImgSrc && !showCropTool && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => onSetShowCropTool(true)}
              >
                Resmi Kırp/Düzenle
              </Button>
            )}
            {displayImageUrl && !cropperImgSrc && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  onSetCropperImgSrc(displayImageUrl);
                  onSetShowCropTool(true);
                }}
              >
                Resmi Kırp/Düzenle
              </Button>
            )}
          </Box>

          <Paper
            {...getRootProps()}
            sx={{
              width: '100%',
              minHeight: 200,
              backgroundColor: isDragActive ? '#e3f2fd' : '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : '#ddd',
              borderRadius: 1,
              cursor: 'pointer',
              p: 3,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: '#eeeeee',
              },
            }}
          >
            <input {...getInputProps()} />
            
            {displayImageUrl ? (
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <img 
                  src={displayImageUrl} 
                  alt="Yüklenen resim önizlemesi" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'contain',
                    marginBottom: '12px'
                  }} 
                />
                <Typography variant="body2" color="textSecondary">
                  Resmi değiştirmek için tıklayın veya yeni bir resim sürükleyin
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                  {isDragActive ? 'Resmi buraya bırakın...' : 'Resim Sürükleyin veya Seçin'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Yüksek çözünürlüklü görseller kullanmanız önerilir.
                </Typography>
              </>
            )}
          </Paper>
        </>
      )}

      {showCropTool && cropperImgSrc && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveCroppedImage}
              disabled={isLoading || !completedCrop || !completedCrop.width || !completedCrop.height}
            >
              {isLoading ? 'İşleniyor...' : 'Kırpılmış Resmi Uygula'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancelCrop}
            >
              İptal
            </Button>
          </Box>
          
          <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden', background: '#f0f0f0' }}>
            <ReactCrop
              crop={crop}
              onChange={(c: Crop) => setCrop(c)}
              onComplete={handleCropComplete}
              aspect={aspectRatio}
            >
              <img
                ref={imgRef}
                src={cropperImgSrc}
                alt="Kırpılacak Resim"
                style={{ width: '100%', display: 'block' }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, p: 1, textAlign: 'center', color: 'text.secondary' }}>
              Kırpmak için alanı sürükleyin veya kenarlarından boyutlandırın.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}; 