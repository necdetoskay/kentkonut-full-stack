import { PixelCrop } from "react-image-crop"

/**
 * Görsel boyutlarını almak için yardımcı fonksiyon
 */
export const getImageDimensions = (src: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Client-side kırpma ve dosya oluşturma
 */
export const cropImageToFile = async (
  completedCrop: PixelCrop | null,
  imgRef: React.RefObject<HTMLImageElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  selectedFile: File | null,
  targetWidth: number,
  targetHeight: number
): Promise<File | null> => {
  if (!completedCrop || !imgRef.current || !canvasRef.current || !selectedFile) {
    return null;
  }

  const image = imgRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return null;
  }

  // Kırpılan görüntünün tam olarak hedef boyutlarda olmasını sağla
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Resmi kırp
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  // Önce kırpma işlemini gerçekleştir
  const sourceX = completedCrop.x * scaleX;
  const sourceY = completedCrop.y * scaleY;
  const sourceWidth = completedCrop.width * scaleX;
  const sourceHeight = completedCrop.height * scaleY;
  
  // Kırpılmış görseli tam hedef boyutlara ölçekle
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // Canvas'ı blob'a dönüştür
  return new Promise<File | null>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      
      // Yeni dosya oluştur
      const croppedFile = new File([blob], selectedFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      
      resolve(croppedFile);
    }, 'image/jpeg', 0.95);
  });
}; 