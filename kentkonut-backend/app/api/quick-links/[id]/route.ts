import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ExecutiveQuickLinkValidationSchema } from '@/utils/corporateValidation';
import { handleApiError } from '@/utils/corporateApi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quickLink = await db.executiveQuickLink.findUnique({
      where: { id },
    });

    if (!quickLink) {
      return NextResponse.json(
        { error: 'Hızlı erişim linki bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(quickLink);
  } catch (error) {
    console.error('Quick Link GET error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate using Zod schema
    const validationResult = ExecutiveQuickLinkValidationSchema.safeParse(body);

    if (!validationResult.success) {
      console.log('❌ Quick Links API - Validation failed:', validationResult.error);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path[0],
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    const quickLink = await db.executiveQuickLink.update({
      where: { id },
      data: {
        title: validatedData.title,
        url: validatedData.url,
        description: validatedData.description,
        icon: validatedData.icon,
        order: validatedData.order,
        isActive: validatedData.isActive,
        // executiveId is not updated - it's set when the record is created
      },
    });

    return NextResponse.json(quickLink);
  } catch (error) {
    console.error('Quick Link PUT error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.executiveQuickLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quick Link DELETE error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: 500 }
    );
  }
}
