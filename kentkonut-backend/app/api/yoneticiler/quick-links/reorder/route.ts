import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/yoneticiler/quick-links/reorder - Reorder quick links
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Items must be an array' },
        { status: 400 }
      );
    }

    // Update the order of each quick link
    const updatePromises = items.map((item: { id: string; order: number }) =>
      db.executiveQuickLink.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Quick links reordered successfully'
    });
  } catch (error) {
    console.error('Executive quick links reorder error:', error);
    return NextResponse.json(
      { success: false, error: 'Quick links could not be reordered' },
      { status: 500 }
    );
  }
}
