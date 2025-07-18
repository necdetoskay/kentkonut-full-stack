import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from 'zod';

const HafriyatSahaUpdateSchema = z.object({
  ad: z.string().min(1, "Saha adı gereklidir").optional(),
  konumAdi: z.string().min(1, "Konum adı gereklidir").optional(),
  enlem: z.number().min(-90).max(90, "Geçerli bir enlem değeri giriniz").optional(),
  boylam: z.number().min(-180).max(180, "Geçerli bir boylam değeri giriniz").optional(),
  durum: z.enum(["DEVAM_EDIYOR", "TAMAMLANDI"]).optional(),
  ilerlemeyuzdesi: z.number().min(0).max(100, "İlerleme yüzdesi 0-100 arasında olmalıdır").optional(),
  tonBasiUcret: z.number().positive("Ton başı ücret pozitif olmalıdır").optional(),
  kdvOrani: z.number().min(0).max(100, "KDV oranı 0-100 arasında olmalıdır").optional(),
  bolgeId: z.string().min(1, "Bölge seçimi gereklidir").optional(),
  baslangicTarihi: z.string().datetime().optional(),
  tahminibitisTarihi: z.string().datetime().optional(),
  toplamTon: z.number().min(0, "Toplam ton negatif olamaz").optional(),
  tamamlananTon: z.number().min(0, "Tamamlanan ton negatif olamaz").optional(),  aciklama: z.string().optional(),
  aktif: z.boolean().optional(),
  // SEO fields
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  seoLink: z.string().optional(),
  seoCanonicalUrl: z.string().optional(),
  // Gallery images
  resimler: z.array(z.object({
    url: z.string(),
    alt: z.string().optional(),
    description: z.string().optional()
  })).optional()
});

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

// GET - Tekil hafriyat sahası getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const saha = await db.hafriyatSaha.findUnique({
      where: { id },
      include: {        bolge: {
          select: {
            id: true,
            ad: true,
            yetkiliKisi: true,
            yetkiliTelefon: true
          }
        },        belgeler: {
          orderBy: { olusturulmaTarihi: 'desc' }        },
        resimler: {
          orderBy: { olusturulmaTarihi: 'desc' }
        },
        _count: {
          select: {
            belgeler: true,
            resimler: true
          }
        }
      }
    });

    if (!saha) {
      return NextResponse.json(
        { success: false, message: "Saha bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: saha,
      message: "Saha başarıyla getirildi"
    });
  } catch (error) {
    return handleServerError(error, 'Hafriyat sahası getirme hatası');
  }
}

// PUT - Hafriyat sahası güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Veri doğrulama
    const validatedData = HafriyatSahaUpdateSchema.parse(body);
    
    // Sahanın var olduğunu kontrol et
    const mevcutSaha = await db.hafriyatSaha.findUnique({
      where: { id }
    });

    if (!mevcutSaha) {
      return NextResponse.json(
        { success: false, message: "Saha bulunamadı" },
        { status: 404 }
      );
    }

    // Eğer bölge değişiyorsa, bölgenin var olduğunu kontrol et
    if (validatedData.bolgeId && validatedData.bolgeId !== mevcutSaha.bolgeId) {
      const bolge = await db.hafriyatBolge.findUnique({
        where: { id: validatedData.bolgeId }
      });

      if (!bolge) {
        return NextResponse.json(
          { success: false, message: "Belirtilen bölge bulunamadı" },
          { status: 404 }
        );
      }
    }

    // Aynı isimde başka saha var mı kontrol et (ad değişiyorsa)
    if (validatedData.ad && validatedData.ad !== mevcutSaha.ad) {
      const ayniAdliSaha = await db.hafriyatSaha.findFirst({
        where: { 
          ad: validatedData.ad,
          bolgeId: validatedData.bolgeId || mevcutSaha.bolgeId,
          id: { not: id },
          aktif: true
        }
      });

      if (ayniAdliSaha) {
        return NextResponse.json(
          { success: false, message: "Bu bölgede aynı isimde bir saha zaten mevcut" },
          { status: 409 }
        );
      }
    }    // Tarih dönüşümü ve bölge ilişkisi düzeltmesi
    const updateData: any = { ...validatedData };
    
    // bolgeId'yi bolge ilişkisine dönüştür
    if (validatedData.bolgeId) {
      updateData.bolge = {
        connect: { id: validatedData.bolgeId }
      };
      delete updateData.bolgeId; // bolgeId'yi kaldır
    }      // Galeri resimlerini güncelle
    if (validatedData.resimler !== undefined) {
      try {
        // Önce mevcut resimleri sil
        const deletedCount = await db.hafriyatResim.deleteMany({
          where: { sahaId: id }
        });
        console.log(`🗑️ ${deletedCount.count} mevcut resim silindi.`);
          // Yeni resimleri ekle
        if (validatedData.resimler.length > 0) {
          updateData.resimler = {
            create: validatedData.resimler.map((resim, index) => ({
              baslik: resim.alt || 'Saha Görseli',
              dosyaAdi: resim.url.split('/').pop() || 'image.jpg',
              orjinalAd: resim.alt || 'Saha Görseli',
              dosyaYolu: resim.url,
              altMetin: resim.alt || '',
              aciklama: resim.description || '',
              sira: index
            }))
          };
          console.log(`✅ ${validatedData.resimler.length} yeni galeri görseli hazırlandı.`);
        }
      } catch (galleryError) {
        console.error('❌ Galeri güncelleme hatası:', galleryError);
        // Galeri hatası ana güncellemeyi engellemez
      }
      
      // Validation'dan gelen resimler array'ini kaldır - ancak sadece update data'da nested create yoksa
      if (!updateData.resimler) {
        delete updateData.resimler;
      }
    }
    
    if (validatedData.baslangicTarihi) {
      updateData.baslangicTarihi = new Date(validatedData.baslangicTarihi);
    }
    if (validatedData.tahminibitisTarihi) {
      updateData.tahminibitisTarihi = new Date(validatedData.tahminibitisTarihi);
    }const guncellenenSaha = await db.hafriyatSaha.update({
      where: { id },
      data: updateData,
      include: {
        bolge: {
          select: {
            id: true,
            ad: true,
            yetkiliKisi: true,
            yetkiliTelefon: true
          }        },
        resimler: {
          orderBy: { sira: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: guncellenenSaha,
      message: "Saha başarıyla güncellendi"
    });
  } catch (error) {
    return handleServerError(error, 'Hafriyat sahası güncelleme hatası');
  }
}

// DELETE - Hafriyat sahası sil (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Sahanın var olduğunu kontrol et
    const mevcutSaha = await db.hafriyatSaha.findUnique({
      where: { id }
    });

    if (!mevcutSaha) {
      return NextResponse.json(
        { success: false, message: "Saha bulunamadı" },
        { status: 404 }
      );
    }

    // Soft delete
    await db.hafriyatSaha.update({
      where: { id },
      data: { aktif: false }
    });

    return NextResponse.json({
      success: true,
      message: "Saha başarıyla silindi"
    });
  } catch (error) {
    return handleServerError(error, 'Hafriyat sahası silme hatası');
  }
}
