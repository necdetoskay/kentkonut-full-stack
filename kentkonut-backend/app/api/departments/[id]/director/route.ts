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
        }
      }
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }
    
    return NextResponse.json(department.director);
  } catch (error) {
    return handleServerError(error, 'Department director fetch error');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body.directorId) {
      return NextResponse.json(
        { error: "Director ID is required" },
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

    // Verify that the personnel exists and is a DIRECTOR
    const director = await db.personnel.findUnique({
      where: { id: body.directorId }
    });

    if (!director) {
      return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
    }

    if (director.type !== 'DIRECTOR') {
      return NextResponse.json({ error: "Personnel must be a DIRECTOR" }, { status: 400 });
    }

    // If there's already a director, clear that relationship first
    if (department.directorId) {
      const currentDirector = await db.personnel.findUnique({
        where: { id: department.directorId }
      });
      
      if (currentDirector) {
        // Update the current director to remove the directedDept relationship
        await db.department.update({
          where: { id },
          data: {
            directorId: null
          }
        });
      }
    }

    // Set the new director for the department
    await db.department.update({
      where: { id },
      data: {
        directorId: body.directorId
      }
    });

    // Invalidate cache
    invalidateCache.departments();

    return NextResponse.json({ message: "Department director updated successfully" });
  } catch (error) {
    return handleServerError(error, 'Department director update error');
  }
}
