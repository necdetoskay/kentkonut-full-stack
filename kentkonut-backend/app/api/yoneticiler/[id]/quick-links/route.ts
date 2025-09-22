import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ExecutiveQuickLinkValidationSchema } from '@/utils/corporateValidation';
import { handleApiError } from '@/utils/corporateApi';

// GET /api/yoneticiler/[id]/quick-links - Get all quick links for an executive
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const quickLinks = await db.executiveQuickLink.findMany({
      where: { executiveId: id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: quickLinks
    });
  } catch (error) {
    console.error('Executive quick links fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Quick links could not be fetched' },
      { status: 500 }
    );
  }
}

// POST /api/yoneticiler/[id]/quick-links - Create a new quick link for an executive
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Create the quick link
    const quickLink = await db.executiveQuickLink.create({
      data: {
        title: validatedData.title,
        url: validatedData.url,
        description: validatedData.description || null,
        icon: validatedData.icon || 'link',
        order: validatedData.order,
        isActive: validatedData.isActive,
        executiveId: id
      }
    });

    return NextResponse.json({
      success: true,
      data: quickLink
    }, { status: 201 });
  } catch (error) {
    console.error('Executive quick link creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Quick link could not be created' },
      { status: 500 }
    );
  }
}
