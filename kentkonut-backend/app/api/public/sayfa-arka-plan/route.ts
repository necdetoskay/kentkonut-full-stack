import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ message: 'URL parametresi gerekli' }, { status: 400 });
  }

  try {
    const record = await prisma.sayfaArkaPlan.findUnique({
      where: {
        sayfaUrl: url,
      },
    });

    if (!record) {
      // Birimler sayfası için varsayılan arka planı kontrol et
      if (url.startsWith('/kurumsal/birimler/')) {
        const defaultBirimlerBackground = {
          sayfaUrl: url,
          resimUrl: '/images/default-kurumsal-background.jpg', // Varsayılan bir resim yolu
        };
        const headers = {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        };
        return NextResponse.json(defaultBirimlerBackground, { headers });
      }
      return NextResponse.json({ message: 'Bu URL için arka plan bulunamadı' }, { status: 404 });
    }

    const headers = {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    };

    return NextResponse.json(record, { headers });

  } catch (error) {
    console.error("Error fetching public SayfaArkaPlan:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}