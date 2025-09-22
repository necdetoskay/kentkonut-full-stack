import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCors, handleCorsPreflightRequest } from '@/lib/cors';

// OPTIONS /api/public/hizmetlerimiz/[id]/track-click - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// POST /api/public/hizmetlerimiz/[id]/track-click - Track service card click (CORS enabled)
export const POST = withCors(async (request: NextRequest) => {
  try {
    // Extract ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const idIndex = pathSegments.findIndex(segment => segment === 'hizmetlerimiz') + 1;
    const idParam = pathSegments[idIndex];
    
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service card ID' },
        { status: 400 }
      );
    }

    console.log(`[HIZMETLERIMIZ_CLICK_TRACK] Tracking click for service card ID: ${id}`);

    // Check if service card exists and is active
    const serviceCard = await db.serviceCard.findFirst({
      where: {
        id: id,
        isActive: true
      }
    });

    if (!serviceCard) {
      return NextResponse.json(
        { success: false, error: 'Service card not found or inactive' },
        { status: 404 }
      );
    }

    // Increment click count
    await db.serviceCard.update({
      where: { id: id },
      data: {
        clickCount: {
          increment: 1
        }
      }
    });

    console.log(`[HIZMETLERIMIZ_CLICK_TRACK] Click tracked successfully for service card: ${serviceCard.title}`);

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully'
    });

  } catch (error) {
    console.error('[HIZMETLERIMIZ_CLICK_TRACK] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
