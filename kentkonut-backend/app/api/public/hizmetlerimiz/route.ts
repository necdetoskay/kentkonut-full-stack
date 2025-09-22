import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCors, handleCorsPreflightRequest } from '@/lib/cors';

// OPTIONS /api/public/hizmetlerimiz - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// GET /api/public/hizmetlerimiz - Get active service cards (CORS enabled)
export const GET = withCors(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    console.log('[HIZMETLERIMIZ_PUBLIC_GET] Fetching active service cards');

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Build query options
    const queryOptions: any = {
      where,
      orderBy: {
        displayOrder: 'asc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        shortDescription: true,
        slug: true,
        imageUrl: true,
        altText: true,
        targetUrl: true,
        isExternal: true,
        color: true,
        backgroundColor: true,
        textColor: true,
        isFeatured: true,
        displayOrder: true,
        viewCount: true,
        clickCount: true,
        createdAt: true,
        updatedAt: true
      }
    };

    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        queryOptions.take = limitNum;
      }
    }

    const serviceCards = await db.serviceCard.findMany(queryOptions);

    console.log(`[HIZMETLERIMIZ_PUBLIC_GET] Found ${serviceCards.length} active service cards`);

    return NextResponse.json({
      success: true,
      data: serviceCards,
      count: serviceCards.length
    });

  } catch (error) {
    console.error('[HIZMETLERIMIZ_PUBLIC_GET] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        data: []
      },
      { status: 500 }
    );
  }
});
