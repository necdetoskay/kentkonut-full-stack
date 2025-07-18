import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ExecutiveValidationSchema } from '@/utils/corporateValidation';
import { handleApiError } from '@/utils/corporateApi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    const where = type 
      ? { type: type.toUpperCase() as any, isActive: true }
      : { isActive: true };
    
    const executives = await db.executive.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(executives);
  } catch (error) {
    console.error('Executives fetch error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.message }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate using the centralized validation schema
    const validationResult = ExecutiveValidationSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation error details:', validationResult.error);
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors.map(err => ({
            field: err.path[0],
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
      const executive = await db.executive.create({
      data: {
        name: validatedData.name,
        title: validatedData.title,
        position: validatedData.position,
        slug: validatedData.slug,
        biography: validatedData.biography,
        imageUrl: validatedData.imageUrl,
        email: validatedData.email,
        phone: validatedData.phone,
        linkedIn: validatedData.linkedIn,
        order: validatedData.order || 0,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
        type: validatedData.type
      } as any
    });

    return NextResponse.json(executive);
  } catch (error) {
    console.error('Executive creation error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.message }, 
      { status: 500 }
    );
  }
}
