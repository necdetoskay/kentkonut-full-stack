import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  createSuccessResponse,
  createErrorResponse,
  handleServerError
} from '@/utils/corporate-cards-utils';

/**
 * GET /api/public/kurumsal/sayfa
 * 
 * Public endpoint for fetching the complete corporate page data
 * Returns both page configuration and active cards
 * Used by the frontend to render the full corporate page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Fetch corporate page configuration
    const corporatePage = await db.corporatePage.findUnique({
      where: { slug: 'kurumsal' },
      select: {
        id: true,
        title: true,
        metaTitle: true,
        metaDescription: true,
        headerImage: true,
        introText: true,
        showBreadcrumb: true,
        customCss: true,
        slug: true,
        isActive: true
      }
    });

    if (!corporatePage) {
      return createErrorResponse(
        'Kurumsal sayfa bulunamadı',
        { slug: 'kurumsal' },
        404
      );
    }

    if (!corporatePage.isActive) {
      return createErrorResponse(
        'Kurumsal sayfa şu anda aktif değil',
        { isActive: false },
        503
      );
    }

    // Fetch corporate cards
    const whereClause: any = {};
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const cards = await db.corporateCard.findMany({
      where: whereClause,
      orderBy: { displayOrder: 'asc' },
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
        isActive: true,
        targetUrl: true,
        openInNewTab: true,
        content: true,
        customData: true,
        imagePosition: true,
        cardSize: true,
        borderRadius: true
      }
    });

    // Prepare response data
    const responseData = {
      page: corporatePage,
      cards: cards
    };

    return createSuccessResponse(
      responseData,
      undefined, // No message for public API
      {
        pageActive: corporatePage.isActive,
        totalCards: cards.length,
        activeCards: cards.filter((card: { isActive: boolean }) => card.isActive).length,
        lastUpdated: new Date().toISOString()
      }
    );

  } catch (error) {
    return handleServerError(error, 'Public corporate page fetch error');
  }
}

/**
 * HEAD /api/public/kurumsal/sayfa
 * 
 * Get metadata about the corporate page without full data
 * Useful for caching and checking if content has changed
 */
export async function HEAD(request: NextRequest) {
  try {
    // Check if page exists and is active
    const page = await db.corporatePage.findUnique({
      where: { slug: 'kurumsal' },
      select: { 
        isActive: true, 
        updatedAt: true 
      }
    });

    if (!page || !page.isActive) {
      return new NextResponse(null, { status: 404 });
    }

    // Get card counts and last update
    const [totalCards, activeCards, lastCardUpdate] = await Promise.all([
      db.corporateCard.count(),
      db.corporateCard.count({ where: { isActive: true } }),
      db.corporateCard.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      })
    ]);

    // Determine the most recent update time
    const pageUpdated = page.updatedAt;
    const cardsUpdated = lastCardUpdate?.updatedAt || new Date(0);
    const lastUpdated = pageUpdated > cardsUpdated ? pageUpdated : cardsUpdated;

    const response = new NextResponse(null, { status: 200 });
    
    // Add metadata headers
    response.headers.set('X-Page-Active', 'true');
    response.headers.set('X-Total-Cards', totalCards.toString());
    response.headers.set('X-Active-Cards', activeCards.toString());
    response.headers.set('X-Last-Updated', lastUpdated.toISOString());
    response.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    response.headers.set('ETag', `"${lastUpdated.getTime()}"`);
    
    return response;

  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
