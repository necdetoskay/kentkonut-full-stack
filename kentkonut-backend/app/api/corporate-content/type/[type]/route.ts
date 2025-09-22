import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CorporateContentType } from '@prisma/client';

// GET /api/corporate-content/type/[type] - Get corporate content by type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;

    // Validate type
    const validTypes: CorporateContentType[] = ['VISION', 'MISSION', 'STRATEGY', 'GOALS', 'ABOUT'];
    if (!validTypes.includes(type as CorporateContentType)) {
      return NextResponse.json(
        { error: 'Geçersiz içerik tipi' },
        { status: 400 }
      );
    }

    const content = await db.corporateContent.findMany({
      where: { 
        type: type as CorporateContentType,
        isActive: true 
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Corporate content fetch by type error:', error);
    return NextResponse.json(
      { error: 'İçerik yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
