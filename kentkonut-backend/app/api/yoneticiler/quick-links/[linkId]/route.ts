import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ExecutiveQuickLinkValidationSchema } from '@/utils/corporateValidation';

// PUT /api/yoneticiler/quick-links/[linkId] - Update a quick link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;
    const body = await request.json();
    
    // Validate the request body
    const validationResult = ExecutiveQuickLinkValidationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Update the quick link
    const quickLink = await db.executiveQuickLink.update({
      where: { id: linkId },
      data: {
        title: validatedData.title,
        url: validatedData.url,
        description: validatedData.description || null,
        icon: validatedData.icon || 'link',
        order: validatedData.order,
        isActive: validatedData.isActive
      }
    });

    return NextResponse.json({
      success: true,
      data: quickLink
    });
  } catch (error) {
    console.error('Executive quick link update error:', error);
    return NextResponse.json(
      { success: false, error: 'Quick link could not be updated' },
      { status: 500 }
    );
  }
}

// DELETE /api/yoneticiler/quick-links/[linkId] - Delete a quick link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;
    
    // Delete the quick link
    await db.executiveQuickLink.delete({
      where: { id: linkId }
    });

    return NextResponse.json({
      success: true,
      message: 'Quick link deleted successfully'
    });
  } catch (error) {
    console.error('Executive quick link deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Quick link could not be deleted' },
      { status: 500 }
    );
  }
}
