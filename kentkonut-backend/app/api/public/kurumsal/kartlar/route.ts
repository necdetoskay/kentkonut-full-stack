import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  createSuccessResponse,
  parseCardsQuery,
  handleServerError
} from '@/utils/corporate-cards-utils';

/**
 * GET /api/public/kurumsal/kartlar
 * 
 * Public endpoint for fetching active corporate cards
 * Used by the frontend to display the corporate page
 * 
 * Query parameters:
 * - active: boolean (default: true) - Only show active cards
 * - limit: number (max: 50) - Limit number of results
 * - orderBy: 'displayOrder' | 'title' | 'createdAt' (default: 'displayOrder')
 * - orderDirection: 'asc' | 'desc' (default: 'asc')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = parseCardsQuery(searchParams);

    // For public endpoint, default to active cards only
    const showActive = query.active !== false;
    
    // Limit results for public endpoint (max 50)
    const limit = query.limit ? Math.min(query.limit, 50) : undefined;

    // Build where clause
    const whereClause: any = {};
    if (showActive) {
      whereClause.isActive = true;
    }

    // Fetch cards optimized for public display
    const cards = await db.corporateCard.findMany({
      where: whereClause,
      orderBy: { [query.orderBy]: query.orderDirection },
      take: limit,
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        imageUrl: true,
        backgroundColor: true,
        textColor: true,
        accentColor: true,
        displayOrder: true,
        targetUrl: true,
        openInNewTab: true,
        content: true,
        customData: true,
        imagePosition: true,
        cardSize: true,
        borderRadius: true,
        // Exclude sensitive fields like createdBy, updatedAt for public API
      }
    });

    // Get metadata for response
    const totalActiveCards = await db.corporateCard.count({
      where: { isActive: true }
    });

    return createSuccessResponse(
      cards,
      undefined, // No message needed for public API
      {
        total: cards.length,
        totalActive: totalActiveCards,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection
      }
    );

  } catch (error) {
    return handleServerError(error, 'Public cards fetch error');
  }
}

/**
 * HEAD /api/public/kurumsal/kartlar
 * 
 * Get metadata about corporate cards without the full data
 * Useful for checking if content has changed
 */
export async function HEAD(request: NextRequest) {
  try {
    const totalActive = await db.corporateCard.count({
      where: { isActive: true }
    });

    const lastUpdated = await db.corporateCard.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });

    const response = new NextResponse(null, { status: 200 });
    
    // Add metadata headers
    response.headers.set('X-Total-Cards', totalActive.toString());
    response.headers.set('X-Last-Updated', lastUpdated?.updatedAt.toISOString() || '');
    response.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    
    return response;

  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
