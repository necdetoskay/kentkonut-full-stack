import { db } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

/**
 * Utility functions for handling corporate card reordering
 * Handles unique constraint issues and ensures data consistency
 */

export interface ReorderResult {
  success: boolean;
  updatedCards: any[];
  error?: string;
  details?: any;
}

/**
 * Safely reorder corporate cards using a two-phase approach
 * to avoid unique constraint violations on displayOrder
 */
export async function reorderCorporateCards(cardIds: string[]): Promise<ReorderResult> {
  try {
    // Validate input
    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return {
        success: false,
        updatedCards: [],
        error: 'Invalid cardIds array provided'
      };
    }

    // Check for duplicates in input
    const uniqueIds = new Set(cardIds);
    if (uniqueIds.size !== cardIds.length) {
      return {
        success: false,
        updatedCards: [],
        error: 'Duplicate card IDs found in input'
      };
    }

    // Verify all cards exist
    const existingCards = await db.corporateCard.findMany({
      where: { id: { in: cardIds } },
      select: { id: true, title: true, displayOrder: true }
    });

    if (existingCards.length !== cardIds.length) {
      const foundIds = existingCards.map((card: any) => card.id);
      const missingIds = cardIds.filter(id => !foundIds.includes(id));
      
      return {
        success: false,
        updatedCards: [],
        error: 'Some cards not found',
        details: { missingIds, foundCount: existingCards.length, requestedCount: cardIds.length }
      };
    }

    // Perform the reordering in a transaction
    const updatedCards = await db.$transaction(async (tx: any) => {
      // Phase 1: Set temporary negative values to avoid unique constraint conflicts
      // We use negative values starting from -1000 to ensure no conflicts
      const tempUpdatePromises = cardIds.map((cardId, index) =>
        tx.corporateCard.update({
          where: { id: cardId },
          data: {
            displayOrder: -(index + 1000),
            updatedAt: new Date()
          }
        })
      );

      await Promise.all(tempUpdatePromises);

      // Phase 2: Set the final displayOrder values (1, 2, 3, ...)
      const finalUpdatePromises = cardIds.map((cardId, index) =>
        tx.corporateCard.update({
          where: { id: cardId },
          data: {
            displayOrder: index + 1,
            updatedAt: new Date()
          }
        })
      );

      const results = await Promise.all(finalUpdatePromises);

      // Return all cards in the new order
      return tx.corporateCard.findMany({
        orderBy: { displayOrder: 'asc' }
      });
    });

    return {
      success: true,
      updatedCards
    };

  } catch (error) {
    console.error('Card reordering error:', error);
    
    return {
      success: false,
      updatedCards: [],
      error: error instanceof Error ? error.message : 'Unknown reordering error',
      details: process.env.NODE_ENV === 'development' ? { stack: error instanceof Error ? error.stack : undefined } : undefined
    };
  }
}

/**
 * Validate and fix any ordering issues in the corporate cards table
 * This can be used as a maintenance function to ensure data integrity
 */
export async function validateAndFixCardOrdering(): Promise<{
  success: boolean;
  issues: string[];
  fixed: boolean;
  cardCount: number;
}> {
  try {
    const cards = await db.corporateCard.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, title: true, displayOrder: true }
    });

    const issues: string[] = [];
    let needsFix = false;

    // Check for duplicates
    const orderCounts = new Map<number, number>();
    cards.forEach((card: any) => {
      const count = orderCounts.get(card.displayOrder) || 0;
      orderCounts.set(card.displayOrder, count + 1);
    });

    orderCounts.forEach((count, order) => {
      if (count > 1) {
        issues.push(`Duplicate displayOrder ${order} found (${count} cards)`);
        needsFix = true;
      }
    });

    // Check for gaps or non-sequential ordering
    const expectedOrders = Array.from({ length: cards.length }, (_, i) => i + 1);
    const actualOrders = cards.map((card: any) => card.displayOrder).sort((a: any, b: any) => a - b);
    
    if (JSON.stringify(expectedOrders) !== JSON.stringify(actualOrders)) {
      issues.push('Non-sequential or gapped ordering detected');
      needsFix = true;
    }

    // Fix issues if found
    if (needsFix) {
      await db.$transaction(async (tx: any) => {
        // First, set temporary values
        const tempPromises = cards.map((card: any, index: any) =>
          tx.corporateCard.update({
            where: { id: card.id },
            data: { displayOrder: -(index + 1000) }
          })
        );
        await Promise.all(tempPromises);

        // Then set correct sequential values
        const finalPromises = cards.map((card: any, index: any) =>
          tx.corporateCard.update({
            where: { id: card.id },
            data: { displayOrder: index + 1 }
          })
        );
        await Promise.all(finalPromises);
      });
    }

    return {
      success: true,
      issues,
      fixed: needsFix,
      cardCount: cards.length
    };

  } catch (error) {
    console.error('Card ordering validation error:', error);
    return {
      success: false,
      issues: [error instanceof Error ? error.message : 'Unknown validation error'],
      fixed: false,
      cardCount: 0
    };
  }
}

/**
 * Get the next available display order for a new card
 */
export async function getNextDisplayOrder(): Promise<number> {
  try {
    const maxOrder = await db.corporateCard.aggregate({
      _max: { displayOrder: true }
    });

    return (maxOrder._max.displayOrder || 0) + 1;
  } catch (error) {
    console.error('Error getting next display order:', error);
    return 1; // Default to 1 if there's an error
  }
}
