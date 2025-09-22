import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ReorderRequest {
  cardIds: number[];
}

// POST /api/hizmetlerimiz/reorder - Reorder service cards
export async function POST(request: NextRequest) {
  try {
    const body: ReorderRequest = await request.json();

    if (!body.cardIds || !Array.isArray(body.cardIds)) {
      return NextResponse.json(
        { success: false, error: 'Card IDs array is required' },
        { status: 400 }
      );
    }

    if (body.cardIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one card ID is required' },
        { status: 400 }
      );
    }

    // Validate that all IDs are numbers
    const invalidIds = body.cardIds.filter(id => typeof id !== 'number' || isNaN(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'All card IDs must be valid numbers' },
        { status: 400 }
      );
    }

    console.log(`[HIZMETLERIMIZ_REORDER] Reordering ${body.cardIds.length} service cards`);

    // Check if all cards exist
    const existingCards = await db.serviceCard.findMany({
      where: {
        id: { in: body.cardIds }
      },
      select: { id: true, title: true }
    });

    if (existingCards.length !== body.cardIds.length) {
      const foundIds = existingCards.map(card => card.id);
      const missingIds = body.cardIds.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { 
          success: false, 
          error: `Service cards not found: ${missingIds.join(', ')}` 
        },
        { status: 404 }
      );
    }

    // Update display order for each card
    const updatePromises = body.cardIds.map((cardId, index) => {
      return db.serviceCard.update({
        where: { id: cardId },
        data: { displayOrder: index + 1 }
      });
    });

    await Promise.all(updatePromises);

    console.log(`[HIZMETLERIMIZ_REORDER] Successfully reordered service cards: ${body.cardIds.join(', ')}`);

    return NextResponse.json({
      success: true,
      message: 'Service cards reordered successfully',
      data: {
        reorderedIds: body.cardIds,
        count: body.cardIds.length
      }
    });

  } catch (error) {
    console.error('[HIZMETLERIMIZ_REORDER] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
