import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DepartmentQuickLinkValidationSchema } from '@/utils/corporateValidation';
import { ZodError } from 'zod';

// Server-side error handler
function handleServerError(error: unknown, context: string) {
  console.error(`${context}:`, error);
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation error", details: error.errors },
      { status: 400 }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    const where: any = {};
    
    if (departmentId) {
      where.departmentId = departmentId;
    }

    const quickLinks = await db.departmentQuickLink.findMany({
      where,
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json(quickLinks);
  } catch (error) {
    return handleServerError(error, 'Quick links fetch error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = DepartmentQuickLinkValidationSchema.parse(body);
    
    const quickLink = await db.departmentQuickLink.create({
      data: validatedData
    });

    return NextResponse.json(quickLink);
  } catch (error) {
    return handleServerError(error, 'Quick link creation error');
  }
}
