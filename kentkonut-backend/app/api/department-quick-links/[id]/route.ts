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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const quickLink = await db.departmentQuickLink.findUnique({
      where: { id }
    });

    if (!quickLink) {
      return NextResponse.json({ error: "Quick link not found" }, { status: 404 });
    }
    
    return NextResponse.json(quickLink);
  } catch (error) {
    return handleServerError(error, 'Quick link fetch error');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validatedData = DepartmentQuickLinkValidationSchema.parse(body);
    
    const quickLink = await db.departmentQuickLink.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json(quickLink);
  } catch (error) {
    return handleServerError(error, 'Quick link update error');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.departmentQuickLink.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Quick link deleted successfully" });
  } catch (error) {
    return handleServerError(error, 'Quick link deletion error');
  }
}
