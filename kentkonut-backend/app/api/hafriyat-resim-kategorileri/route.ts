import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from 'zod';

// Hafriyat Resim Kategori validasyon şeması
const HafriyatResimKategoriSchema = z.object({
  ad: z.string().min(1, "Kategori adı gereklidir"),
  ikon: z.string().default("image"),
  sira: z.number().int().min(0, "Sıra değeri negatif olamaz").default(0)
});

// Server-side error handler
function handleServerError(error: unknown, context: string) {
  console.error(`${context}:`, error);
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        success: false,
        message: "Doğrulama hatası", 
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      },
      { status: 400 }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { success: false, message: "Sunucu hatası" },
    { status: 500 }
  );
}

// GET - Tüm resim kategorilerini listele
export async function GET(request: NextRequest) {
  try {
    const kategoriler = await db.hafriyatResimKategori.findMany({
      include: {
        resimler: {
          select: {
            id: true,
            baslik: true,
            dosyaYolu: true,
            saha: {
              select: {
                ad: true
              }
            }
          },
          take: 5,
          orderBy: { olusturulmaTarihi: 'desc' }
        },
        _count: {
          select: {
            resimler: true
          }
        }
      },
      orderBy: { sira: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: kategoriler,
      message: "Resim kategorileri başarıyla getirildi"
    });
  } catch (error) {
    return handleServerError(error, 'Resim kategorileri getirme hatası');
  }
}

// POST - Yeni resim kategorisi oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validatedData = HafriyatResimKategoriSchema.parse(body);
    
    // Aynı isimde kategori var mı kontrol et
    const mevcutKategori = await db.hafriyatResimKategori.findFirst({
      where: { 
        ad: validatedData.ad
      }
    });

    if (mevcutKategori) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Bu isimde bir kategori zaten mevcut" 
        },
        { status: 409 }
      );
    }

    const yeniKategori = await db.hafriyatResimKategori.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            resimler: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: yeniKategori,
      message: "Resim kategorisi başarıyla oluşturuldu"
    }, { status: 201 });
  } catch (error) {
    return handleServerError(error, 'Resim kategorisi oluşturma hatası');
  }
}
