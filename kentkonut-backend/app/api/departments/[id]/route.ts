import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DepartmentValidationSchema } from '@/utils/corporateValidation';
import { invalidateCache } from '@/utils/corporateApi';
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
    
    const department = await db.department.findUnique({
      where: { id },
      include: {
        director: {
          include: {
            galleryItems: {
              include: {
                media: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        chiefs: {
          include: {
            galleryItems: {
              include: {
                media: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        quickLinks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }
    
    return NextResponse.json(department);
  } catch (error) {
    return handleServerError(error, 'Department fetch error');
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
    const validatedData = DepartmentValidationSchema.parse(body);
    
    const department = await db.department.update({
      where: { id },
      data: validatedData
    });

    // Invalidate cache
    invalidateCache.departments();    return NextResponse.json(department);
  } catch (error) {
    return handleServerError(error, 'Department update error');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Only update the fields provided in the request
    const department = await db.department.update({
      where: { id },
      data: body
    });

    // Invalidate cache
    invalidateCache.departments();
    
    return NextResponse.json(department);
  } catch (error) {
    return handleServerError(error, 'Department partial update error');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.department.delete({
      where: { id }
    });

    // Invalidate cache
    invalidateCache.departments();    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error) {
    return handleServerError(error, 'Department deletion error');
  }
}
