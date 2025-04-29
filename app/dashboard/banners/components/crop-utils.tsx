import { PixelCrop } from "react-image-crop";

/**
 * Resmin boyutlarını getir
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(image.src);
      resolve({
        width: image.width,
        height: image.height,
      });
    };
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}

/**
 * Canvas'a kırpma işlemi uygula
 */
export function drawCanvasCrop(
  crop: PixelCrop,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  // Canvas boyutlarını ayarla
  canvas.width = width;
  canvas.height = height;

  // Resmi kırp ve canvas'a çiz
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const pixelRatio = window.devicePixelRatio;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    width,
    height
  );
}

/**
 * Kırpılmış resmi dosya olarak oluştur
 */
export async function cropImageToFile(
  crop: PixelCrop,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  file: File,
  width: number,
  height: number
): Promise<File | null> {
  // Canvas'a çiz
  drawCanvasCrop(crop, image, canvas, width, height);

  // Canvas'ı blob olarak al
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas to Blob failed"));
        return null;
      }

      // Yeni dosya oluştur
      const newFile = new File([blob], file.name, {
        type: "image/png",
        lastModified: Date.now(),
      });

      resolve(newFile);
    }, "image/png");
  });
}

/**
 * Resmin boyut bilgisini neredeyse gerçek zamanlı olarak hesapla
 */
export function calculateCropDimensions(
  crop: PixelCrop | null | undefined,
  image: HTMLImageElement | null
): { width: number; height: number } | null {
  if (!crop || !image) return null;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const width = Math.round(crop.width * scaleX);
  const height = Math.round(crop.height * scaleY);

  return { width, height };
} 