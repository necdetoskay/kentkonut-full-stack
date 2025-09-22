import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PersonnelValidationSchema } from '@/utils/corporateValidation';
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;    const personnel = await db.personnel.findUnique({
      where: { id },
      include: {
        galleryItems: {
          include: {
            media: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        directedDept: true,
        chiefInDepts: true
      }
    });

    if (!personnel) {
      return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
    }
    
    return NextResponse.json(personnel);
  } catch (error) {
    return handleServerError(error, 'Personnel fetch error');
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
    const validatedData = PersonnelValidationSchema.parse(body);
    
    // Extract department relations and gallery items from validated data
    const { directorDeptId, chiefDeptIds, galleryItems, ...personnelData } = validatedData;
    
    // Start a transaction to ensure consistency
    const personnel = await db.$transaction(async (tx: typeof db) => {
      // Update personnel data
      const updatedPersonnel = await tx.personnel.update({
        where: { id },
        data: {
          ...personnelData,
          // Handle director department relation
          ...(directorDeptId && directorDeptId !== "" && {
            directedDept: {
              connect: { id: directorDeptId }
            }
          }),
          // Handle chief departments relation
          ...(chiefDeptIds && chiefDeptIds.length > 0 && {
            chiefInDepts: {
              set: chiefDeptIds.map(deptId => ({ id: deptId }))
            }
          })
        }
      });

      // Handle gallery items if provided
      if (galleryItems && galleryItems.length > 0) {
        // First, delete existing gallery items
        await tx.personnelGallery.deleteMany({
          where: { personnelId: id }
        });

        // Then, create new gallery items
        await tx.personnelGallery.createMany({
          data: galleryItems.map((item, index) => ({
            personnelId: id,
            mediaId: item.mediaId,
            type: item.type,
            title: item.title || '',
            description: item.description || '',
            order: item.order ?? index
          }))
        });
      }

      // Return updated personnel with all relations
      return await tx.personnel.findUnique({
        where: { id },
        include: {
          directedDept: true,
          chiefInDepts: true,
          galleryItems: {
            include: {
              media: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      });
    });

    return NextResponse.json(personnel);
  } catch (error) {
    return handleServerError(error, 'Personnel update error');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.personnel.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Personnel deleted successfully" });
  } catch (error) {
    return handleServerError(error, 'Personnel deletion error');
  }
}
