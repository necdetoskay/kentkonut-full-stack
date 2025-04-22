/**
 * URL'den bir resim nesnesi oluşturur
 * @param url - Resmin URL'si
 * @returns HTMLImageElement Promise'i
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Bir resmi belirtilen piksel koordinatlarına göre kırpar
 * @param imageSrc - Resim kaynağı (URL veya base64 string)
 * @param pixelCrop - Kırpma alanının piksel koordinatları
 * @param fileName - Oluşturulacak dosyanın adı
 * @returns Kırpılmış resim dosyası ve URL'yi içeren bir Promise
 */
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  fileName: string = 'cropped-image.jpeg'
): Promise<{ file: File; url: string }> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context oluşturulamadı');
  }

  // Canvas boyutunu kırpılmış resmin boyutuna ayarla
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Canvas'a resmi çiz (kırpılmış bölgeyi)
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Canvas'ı blob'a dönüştür
  return new Promise<{ file: File; url: string }>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas blobu oluşturulamadı'));
          return;
        }

        // Blob'dan dosya oluştur
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        
        // URL oluştur
        const url = URL.createObjectURL(blob);
        
        resolve({ file, url });
      },
      'image/jpeg',
      0.95 // Kalite
    );
  });
}; 