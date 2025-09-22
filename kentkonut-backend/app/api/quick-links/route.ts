import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ExecutiveQuickLinkValidationSchema } from '@/utils/corporateValidation';
import { handleApiError } from '@/utils/corporateApi';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Quick Links API - GET request started');

    const { searchParams } = new URL(request.url);
    const executiveId = searchParams.get('executiveId');

    console.log('🔍 Quick Links API - Executive ID:', executiveId);

    if (!executiveId) {
      return NextResponse.json(
        { error: 'Executive ID is required' },
        { status: 400 }
      );
    }

    const quickLinks = await db.executiveQuickLink.findMany({
      where: {
        executiveId: executiveId
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    console.log('📊 Quick Links API - Database query completed');
    console.log('📊 Found links count:', quickLinks.length);

    return NextResponse.json(quickLinks);
  } catch (error) {
    console.error('❌ Quick Links API - GET error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Quick Links API - POST request started');

    const body = await request.json();
    console.log('📝 Quick Links API - Request body:', body);

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

    // Get executiveId from request body (not part of validation schema)
    const { executiveId } = body;

    if (!executiveId) {
      return NextResponse.json(
        { error: 'Executive ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Quick Links API - Starting database write...');
    const quickLink = await db.executiveQuickLink.create({
      data: {
        title: validatedData.title,
        url: validatedData.url,
        description: validatedData.description,
        icon: validatedData.icon || 'link',
        order: validatedData.order || 0,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
        executiveId: executiveId,
      },
    });

    console.log('✅ Quick Links API - New link created:', quickLink);
    return NextResponse.json(quickLink, { status: 201 });
  } catch (error) {
    console.error('❌ Quick Links API - POST error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: 500 }
    );
  }
}
