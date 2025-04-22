import React, { useRef, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  onCrop: (croppedImage: string) => void;
  aspectRatio?: number;
  imageUrl: string;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  open,
  onClose,
  onCrop,
  aspectRatio = 16 / 9,
  imageUrl,
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCrop = () => {
    if (cropperRef.current) {
      setIsLoading(true);
      const cropper = cropperRef.current.cropper;
      const croppedCanvas = cropper.getCroppedCanvas();
      const croppedImage = croppedCanvas.toDataURL('image/jpeg');
      onCrop(croppedImage);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Resmi Kırp</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', height: 400 }}>
          <Cropper
            ref={cropperRef}
            src={imageUrl}
            style={{ width: '100%', height: '100%' }}
            aspectRatio={aspectRatio}
            guides={true}
            viewMode={1}
            autoCropArea={1}
            background={false}
            responsive={true}
            restore={false}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleCrop} disabled={isLoading} variant="contained" color="primary">
          {isLoading ? 'Kırpılıyor...' : 'Kırp'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 