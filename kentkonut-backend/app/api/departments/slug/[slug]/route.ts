import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug gerekli' }, { status: 400 });
    }

    const department = await prisma.department.findUnique({
      where: { slug },
      include: {
        director: true,
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Birim bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: department });
  } catch (error) {
    console.error('Birim getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Birim getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
