import React, { useState, useCallback, useRef } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useDropzone } from 'react-dropzone';
import { getCroppedImg } from '../../utils/cropImage';

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
        }
      });
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

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
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={aspectRatio}
          >
            <img
              ref={imgRef}
              src={cropperImgSrc}
              alt="Kırpılacak resim"
              style={{ maxWidth: '100%' }}
            />
          </ReactCrop>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onCropComplete}
            >
              Kırpmayı Tamamla
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                onSetShowCropTool(false);
                setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 });
              }}
            >
              İptal
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}; 