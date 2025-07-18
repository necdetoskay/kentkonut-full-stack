import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from 'zod';

// Hafriyat Bölge validasyon şeması
const HafriyatBolgeSchema = z.object({
  ad: z.string().min(1, "Bölge adı gereklidir"),
  aciklama: z.string().optional(),
  yetkiliKisi: z.string().min(1, "Yetkili kişi adı gereklidir"),
  yetkiliTelefon: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
  aktif: z.boolean().default(true)
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

// GET - Tüm hafriyat bölgelerini listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aktif = searchParams.get('aktif');
    const arama = searchParams.get('arama');

    const where: any = {};
    
    // Aktif/pasif filtresi
    if (aktif !== null) {
      where.aktif = aktif === 'true';
    }
    
    // Arama filtresi
    if (arama) {
      where.OR = [
        { ad: { contains: arama, mode: 'insensitive' } },
        { yetkiliKisi: { contains: arama, mode: 'insensitive' } },
        { aciklama: { contains: arama, mode: 'insensitive' } }
      ];
    }

    const bolgeler = await db.hafriyatBolge.findMany({
      where,
      include: {
        sahalar: {
          select: {
            id: true,
            ad: true,
            durum: true,
            ilerlemeyuzdesi: true,
            aktif: true
          },
          where: { aktif: true }
        },
        _count: {
          select: {
            sahalar: {
              where: { aktif: true }
            }
          }
        }
      },
      orderBy: { olusturulmaTarihi: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      data: bolgeler,
      message: "Bölgeler başarıyla getirildi"
    });
  } catch (error) {
    return handleServerError(error, 'Hafriyat bölgeleri getirme hatası');
  }
}

// POST - Yeni hafriyat bölgesi oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validatedData = HafriyatBolgeSchema.parse(body);
    
    // Aynı isimde bölge var mı kontrol et
    const mevcutBolge = await db.hafriyatBolge.findFirst({
      where: { 
        ad: validatedData.ad,
        aktif: true
      }
    });

    if (mevcutBolge) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Bu isimde bir bölge zaten mevcut" 
        },
        { status: 409 }
      );
    }

    const yeniBolge = await db.hafriyatBolge.create({
      data: validatedData,
      include: {
        sahalar: true,
        _count: {
          select: {
            sahalar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: yeniBolge,
      message: "Bölge başarıyla oluşturuldu"
    }, { status: 201 });
  } catch (error) {
    return handleServerError(error, 'Hafriyat bölgesi oluşturma hatası');
  }
}
