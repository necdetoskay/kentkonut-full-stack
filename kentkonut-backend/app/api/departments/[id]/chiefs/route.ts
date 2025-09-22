import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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
        }
      }
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }
    
    return NextResponse.json(department.chiefs);
  } catch (error) {
    return handleServerError(error, 'Department chiefs fetch error');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body.chiefId) {
      return NextResponse.json(
        { error: "Chief ID is required" },
        { status: 400 }
      );
    }

    // Verify that the department exists
    const department = await db.department.findUnique({
      where: { id }
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // Verify that the personnel exists and is a CHIEF
    const chief = await db.personnel.findUnique({
      where: { id: body.chiefId }
    });

    if (!chief) {
      return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
    }

    if (chief.type !== 'CHIEF') {
      return NextResponse.json({ error: "Personnel must be a CHIEF" }, { status: 400 });
    }

    // Add the chief to the department
    await db.department.update({
      where: { id },
      data: {
        chiefs: {
          connect: { id: body.chiefId }
        }
      }
    });

    // Invalidate cache
    invalidateCache.departments();

    return NextResponse.json({ message: "Chief added to department successfully" });
  } catch (error) {
    return handleServerError(error, 'Department chief addition error');
  }
}
