import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Prisma client'ınızın yolu projenize göre farklılık gösterebilir

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sayfaUrl = searchParams.get('sayfa_url');

  if (!sayfaUrl) {
    return new NextResponse('Sayfa URL parametresi gerekli', { status: 400 });
  }

  try {
    const hizliErisimData = await db.hizliErisimSayfa.findUnique({
      where: {
        sayfaUrl: sayfaUrl,
        aktif: true, // Sadece aktif olan menüleri getir
      },
      include: {
        linkler: {
          orderBy: {
            sira: 'asc', // Linkleri sıralama numarasına göre getir
          },
        },
      },
    });

    if (!hizliErisimData) {
      // Veri bulunamadıysa boş bir array ile başarılı yanıt dönmek daha iyi bir pratik olabilir.
      // Bu, frontend'de null check yapma zorunluluğunu ortadan kaldırır.
      return NextResponse.json(null);
    }

    return NextResponse.json(hizliErisimData);
  } catch (error) {
    // Gerçek bir uygulamada burada daha detaylı loglama yapılmalıdır.
    console.error("[HIZLI_ERISIM_GET]", error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
