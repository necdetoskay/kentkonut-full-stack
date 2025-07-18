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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, chiefId: string }> }
) {
  try {
    const { id, chiefId } = await params;
    
    // Verify that the department exists
    const department = await db.department.findUnique({
      where: { id },
      include: {
        chiefs: true
      }
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // Verify that the chief is in the department
    const isChiefInDepartment = department.chiefs.some(chief => chief.id === chiefId);
    if (!isChiefInDepartment) {
      return NextResponse.json({ error: "Chief not found in department" }, { status: 404 });
    }

    // Remove the chief from the department
    await db.department.update({
      where: { id },
      data: {
        chiefs: {
          disconnect: { id: chiefId }
        }
      }
    });

    // Invalidate cache
    invalidateCache.departments();

    return NextResponse.json({ message: "Chief removed from department successfully" });
  } catch (error) {
    return handleServerError(error, 'Department chief removal error');
  }
}
