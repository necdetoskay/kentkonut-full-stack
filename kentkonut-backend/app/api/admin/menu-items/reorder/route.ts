import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Reorder validation schema
const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    orderIndex: z.number(),
    parentId: z.string().nullable().optional()
  }))
});

// PUT /api/admin/menu-items/reorder - Reorder menu items
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 Reordering menu items:', body);

    // Validate input
    const validatedData = reorderSchema.parse(body);

    // Start transaction for atomic updates
    const result = await prisma.$transaction(async (tx) => {
      const updatedItems = [];

      for (const item of validatedData.items) {
        // Check if menu item exists
        const existingItem = await tx.menuItem.findUnique({
          where: { id: item.id }
        });

        if (!existingItem) {
          throw new Error(`Menu item with id ${item.id} not found`);
        }

        // Update order and parent
        const updatedItem = await tx.menuItem.update({
          where: { id: item.id },
          data: {
            orderIndex: item.orderIndex,
            ...(item.parentId !== undefined && { parentId: item.parentId })
          }
        });

        updatedItems.push(updatedItem);
      }

      return updatedItems;
    });

    console.log(`✅ Reordered ${result.length} menu items`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Menu items reordered successfully'
    });

  } catch (error) {
    console.error('❌ Error reordering menu items:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Menu items could not be reordered',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
