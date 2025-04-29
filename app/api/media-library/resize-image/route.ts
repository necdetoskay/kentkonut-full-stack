import { NextResponse } from "next/server";
import { createCanvas, loadImage } from "canvas";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { imageData, width, height } = data;
    
    if (!imageData || !width || !height) {
      return NextResponse.json(
        { error: "Missing required parameters: imageData, width, height" },
        { status: 400 }
      );
    }
    
    console.log(`Resizing image to ${width}x${height}`);
    
    // Base64 veriyi Image nesnesine dönüştür
    const image = await loadImage(imageData);
    
    // Canvas oluştur
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Kaliteli ölçekleme
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Görüntüyü çiz
    ctx.drawImage(image, 0, 0, width, height);
    
    // JPEG formatında base64 döndür
    const resizedImageData = canvas.toDataURL('image/jpeg', 0.95);
    
    return NextResponse.json({ 
      imageData: resizedImageData,
      dimensions: { width, height }
    });
  } catch (error) {
    console.error('Resize error:', error);
    return NextResponse.json(
      { error: "Error resizing image" },
      { status: 500 }
    );
  }
} 