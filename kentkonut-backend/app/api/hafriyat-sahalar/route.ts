import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from 'zod';
import { addCorsHeaders } from '@/lib/cors';

// Hafriyat Saha validasyon şeması
const HafriyatSahaSchema = z.object({
  ad: z.string().min(1, "Saha adı gereklidir"),
  konumAdi: z.string().min(1, "Konum adı gereklidir"),
  enlem: z.number().min(-90).max(90, "Geçerli bir enlem değeri giriniz"),
  boylam: z.number().min(-180).max(180, "Geçerli bir boylam değeri giriniz"),
  anaResimUrl: z.string().url().optional(),
  durum: z.enum(["DEVAM_EDIYOR", "TAMAMLANDI"]).default("DEVAM_EDIYOR"),
  ilerlemeyuzdesi: z.number().min(0).max(100, "İlerleme yüzdesi 0-100 arasında olmalıdır").default(0),
  tonBasiUcret: z.number().positive("Ton başı ücret pozitif olmalıdır"),
  kdvOrani: z.number().min(0).max(100, "KDV oranı 0-100 arasında olmalıdır").default(20),
  bolgeId: z.union([z.string(), z.number()]).transform(val => String(val)).refine(val => val.length > 0, "Bölge seçimi gereklidir"),
  baslangicTarihi: z.string().datetime().optional(),
  tahminibitisTarihi: z.string().datetime().optional(),  toplamTon: z.number().min(0, "Toplam ton negatif olamaz").default(0).optional(),
  tamamlananTon: z.number().min(0, "Tamamlanan ton negatif olamaz").default(0).optional(),  aciklama: z.string().optional(),
  aktif: z.boolean().default(true),
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

// Server-side error handler
function handleServerError(error: unknown, context: string, origin?: string | null) {
  console.error(`${context}:`, error);
  
  if (error instanceof z.ZodError) {
    const response = NextResponse.json(
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
    addCorsHeaders(response.headers, origin);
    return response;
  }
  
  if (error instanceof Error) {
    const response = NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
    addCorsHeaders(response.headers, origin);
    return response;
  }
  
  const response = NextResponse.json(
    { 
      success: false,
      message: "Sunucu hatası", 
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined 
    },
    { status: 500 }
  );
  addCorsHeaders(response.headers, origin);
  return response;
}

// OPTIONS - CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  addCorsHeaders(response.headers, request.headers.get('origin'));
  return response;
}

// GET - Tüm hafriyat sahalarını listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aktif = searchParams.get('aktif');
    const durum = searchParams.get('durum');
    const bolgeId = searchParams.get('bolgeId');
    const arama = searchParams.get('arama');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Filtreler
    if (aktif !== null) {
      where.aktif = aktif === 'true';
    }
    
    if (durum) {
      where.durum = durum;
    }
    
    if (bolgeId) {
      where.bolgeId = bolgeId;
    }
    
    if (arama) {
      where.OR = [
        { ad: { contains: arama, mode: 'insensitive' } },
        { konumAdi: { contains: arama, mode: 'insensitive' } },
        { bolge: { ad: { contains: arama, mode: 'insensitive' } } }
      ];
    }

    // Toplam kayıt sayısını al
    const toplamKayit = await db.hafriyatSaha.count({ where });

    const sahalarRaw = await db.hafriyatSaha.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        ad: true,
        konumAdi: true,
        enlem: true,
        boylam: true,
        anaResimUrl: true,
        durum: true,
        tonBasiUcret: true,
        kdvOrani: true,
        aktif: true,
        olusturulmaTarihi: true,
        guncellemeTarihi: true,
        aciklama: true,
        baslangicTarihi: true,
        tahminibitisTarihi: true,
        tamamlananTon: true,
        toplamTon: true,
        // SEO alanları
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        seoLink: true,
        seoCanonicalUrl: true,
        bolge: {
          select: {
            id: true,
            ad: true,
            yetkiliKisi: true,
            yetkiliTelefon: true
          }
        },
        belgeler: {
          select: {
            id: true,
            baslik: true
          }
        },
        resimler: {
          select: {
            id: true,
            baslik: true,
            dosyaYolu: true
          },
          take: 3,
          orderBy: { olusturulmaTarihi: 'desc' }
        },
        _count: {
          select: {
            belgeler: true,
            resimler: true
          }
        }
      },
      orderBy: { guncellemeTarihi: 'desc' }
    });

    // İlerleme yüzdesini hesapla ve sahalar verisini zenginleştir
    const sahalar = sahalarRaw.map(saha => {
      const tamamlananTon = parseFloat(saha.tamamlananTon || '0');
      const toplamTon = parseFloat(saha.toplamTon || '1');
      const ilerlemeyuzdesi = toplamTon > 0 ? Math.round((tamamlananTon / toplamTon) * 100) : 0;
      
      return {
        ...saha,
        ilerlemeyuzdesi,
        konum: saha.konumAdi // Frontend'in beklediği alan adı
      };
    });

    const response = NextResponse.json({
      success: true,
      data: {
        sahalar,
        sayfalama: {
          mevcutSayfa: page,
          toplamSayfa: Math.ceil(toplamKayit / limit),
          toplamKayit,
          sayfaBasiKayit: limit
        }
      },
      message: "Sahalar başarıyla getirildi"
    });
    
    addCorsHeaders(response.headers, request.headers.get('origin'));
    return response;
  } catch (error) {
    return handleServerError(error, 'Hafriyat sahaları getirme hatası', request.headers.get('origin'));
  }
}

// POST - Yeni hafriyat sahası oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Veri doğrulama
    const validatedData = HafriyatSahaSchema.parse(body);
    
    // Bölgenin var olduğunu kontrol et
    const bolge = await db.hafriyatBolge.findUnique({
      where: { id: validatedData.bolgeId }
    });

    if (!bolge) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Belirtilen bölge bulunamadı" 
        },
        { status: 404 }
      );
    }

    // Aynı isimde saha var mı kontrol et
    const mevcutSaha = await db.hafriyatSaha.findFirst({
      where: { 
        ad: validatedData.ad,
        bolgeId: validatedData.bolgeId,
        aktif: true
      }
    });

    if (mevcutSaha) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Bu bölgede aynı isimde bir saha zaten mevcut" 
        },
        { status: 409 }
      );    }    // Tarih dönüşümü ve bölge ilişkisi düzeltmesi
    const createData: any = { ...validatedData };
    
    // bolgeId'yi bolge ilişkisine dönüştür
    if (validatedData.bolgeId) {
      createData.bolge = {
        connect: { id: validatedData.bolgeId }
      };
      delete createData.bolgeId; // bolgeId'yi kaldır
    }      // Galeri resimlerini hazırla
    if (validatedData.resimler && validatedData.resimler.length > 0) {
      try {
        createData.resimler = {
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
        console.log(`✅ ${validatedData.resimler.length} galeri görseli hazırlandı.`);
      } catch (galleryError) {
        console.error('❌ Galeri işleme hatası:', galleryError);
        // Galeri hatası ana kaydı engellemez
      }
    }
    // Validation'dan gelen resimler array'ini kaldır - ancak sadece create data'da nested create yoksa
    if (!createData.resimler) {
      delete createData.resimler;
    }
    
    if (validatedData.baslangicTarihi) {
      createData.baslangicTarihi = new Date(validatedData.baslangicTarihi);
    }
    if (validatedData.tahminibitisTarihi) {
      createData.tahminibitisTarihi = new Date(validatedData.tahminibitisTarihi);
    }

    const yeniSaha = await db.hafriyatSaha.create({
      data: createData,
      include: {
        bolge: {
          select: {
            ad: true,
            yetkiliKisi: true,
            yetkiliTelefon: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: yeniSaha,
      message: "Saha başarıyla oluşturuldu"
    }, { status: 201 });
  } catch (error) {
    return handleServerError(error, 'Hafriyat sahası oluşturma hatası');
  }
}
