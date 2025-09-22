import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const slug = params?.slug;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parametresi gerekli' },
        { status: 400 }
      );
    }
    
    // Slug ile sayfayı getir    // Decode slug ve sayfa sorgulama
    const decodedSlug = decodeURIComponent(slug);
      const page = await prisma.page.findUnique({
      where: {
        slug: decodedSlug,
        isActive: true,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    return NextResponse.json(
      { error: 'Sayfa getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
