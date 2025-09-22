import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from 'zod';

// Hafriyat Belge Kategori validasyon şeması
const HafriyatBelgeKategoriSchema = z.object({
  ad: z.string().min(1, "Kategori adı gereklidir"),
  ikon: z.string().default("document"),
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

// GET - Tüm belge kategorilerini listele
export async function GET(request: NextRequest) {
  try {
    const kategoriler = await db.hafriyatBelgeKategori.findMany({
      include: {
        belgeler: {
          select: {
            id: true,
            baslik: true,
            saha: {
              select: {
                ad: true
              }
            }
          }
        },
        _count: {
          select: {
            belgeler: true
          }
        }
      },
      orderBy: { sira: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: kategoriler,
      message: "Belge kategorileri başarıyla getirildi"
    });
  } catch (error) {
    return handleServerError(error, 'Belge kategorileri getirme hatası');
  }
}

// POST - Yeni belge kategorisi oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validatedData = HafriyatBelgeKategoriSchema.parse(body);
    
    // Aynı isimde kategori var mı kontrol et
    const mevcutKategori = await db.hafriyatBelgeKategori.findFirst({
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

    const yeniKategori = await db.hafriyatBelgeKategori.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            belgeler: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: yeniKategori,
      message: "Belge kategorisi başarıyla oluşturuldu"
    }, { status: 201 });
  } catch (error) {
    return handleServerError(error, 'Belge kategorisi oluşturma hatası');
  }
}
