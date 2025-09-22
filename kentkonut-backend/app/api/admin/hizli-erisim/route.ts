import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Tüm Hızlı Erişim menülerini getiren GET metodu
export async function GET() {
  try {
    const hizliErisimSayfalari = await db.hizliErisimSayfa.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        // Her bir menüye ait link sayısını da alalım
        _count: {
          select: { linkler: true },
        },
      },
    });
    return NextResponse.json(hizliErisimSayfalari);
  } catch (error) {
    console.error('[ADMIN_HIZLI_ERISIM_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Yeni bir Hızlı Erişim menüsü oluşturan POST metodu
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sayfaUrl, baslik } = body;

    if (!sayfaUrl) {
      return new NextResponse("Sayfa URL'si zorunludur", { status: 400 });
    }

    // Aynı URL'den var mı diye kontrol edelim
    const existing = await db.hizliErisimSayfa.findUnique({
      where: { sayfaUrl },
    });

    if (existing) {
      return new NextResponse('Bu URL için zaten bir menü mevcut', { status: 409 }); // 409 Conflict
    }

    const yeniHizliErisimSayfasi = await db.hizliErisimSayfa.create({
      data: {
        sayfaUrl,
        baslik,
        // aktif, createdAt, updatedAt Prisma tarafından otomatik yönetilir
      },
    });

    return NextResponse.json(yeniHizliErisimSayfasi);
  } catch (error) {
    console.error('[ADMIN_HIZLI_ERISIM_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
