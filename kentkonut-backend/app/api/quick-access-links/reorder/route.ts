import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { QuickAccessLinkReorderSchema } from '@/utils/quickAccessValidation';
import { 
  handleQuickAccessError, 
  createSuccessResponse, 
  generateRequestId,
  sanitizeInput 
} from '@/utils/quickAccessErrorHandler';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);
    
    // Validate input
    const validatedData = QuickAccessLinkReorderSchema.parse(sanitizedBody);
    
    // Update sort orders in a transaction
    await db.$transaction(async (prisma: typeof db) => {
      for (const item of validatedData.items as Array<{ id: string; sortOrder: number }>) {
        await prisma.quickAccessLink.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        });
      }
    });
    
    return createSuccessResponse(
      { updated: validatedData.items.length }, 
      "Quick access links reordered successfully"
    );
  } catch (error) {
    return handleQuickAccessError(error, 'Quick access links reorder error', requestId);
  }
}
