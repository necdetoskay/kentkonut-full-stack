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
  { params }: { params: Promise<{ id: string, personnelId: string }> }
) {
  try {
    const { id, personnelId } = await params;
    
    // Find the personnel to determine their type
    const personnel = await db.personnel.findUnique({
      where: { id: personnelId }
    });

    if (!personnel) {
      return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
    }

    // Verify that the department exists
    const department = await db.department.findUnique({
      where: { id }
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // Remove personnel based on their type
    if (personnel.type === 'DIRECTOR' && department.directorId === personnelId) {
      // Remove director
      await db.department.update({
        where: { id },
        data: {
          directorId: null
        }
      });
    } else if (personnel.type === 'CHIEF') {
      // Remove chief
      await db.department.update({
        where: { id },
        data: {
          chiefs: {
            disconnect: { id: personnelId }
          }
        }
      });
    } else {
      return NextResponse.json({ 
        error: "Personnel is not associated with this department" 
      }, { status: 400 });
    }

    // Invalidate cache
    invalidateCache.departments();

    return NextResponse.json({ message: "Personnel removed from department successfully" });
  } catch (error) {
    return handleServerError(error, 'Department personnel removal error');
  }
}
