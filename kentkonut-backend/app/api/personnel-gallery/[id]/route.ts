import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PersonnelGalleryItemValidationSchema } from '@/utils/corporateValidation';
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
    
    const galleryItem = await db.personnelGallery.findUnique({
      where: { id },
      include: {
        media: true
      }
    });

    if (!galleryItem) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }
    
    return NextResponse.json(galleryItem);
  } catch (error) {
    return handleServerError(error, 'Gallery item fetch error');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Make sure the gallery item exists
    const existingItem = await db.personnelGallery.findUnique({
      where: { id }
    });
    
    if (!existingItem) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }
    
    // We need to include the personnelId in validation, but we shouldn't allow changing it
    const validationData = {
      ...body,
      personnelId: existingItem.personnelId
    };
    
    // Validate input
    const validatedData = PersonnelGalleryItemValidationSchema.parse(validationData);
    
    // Remove personnelId from update data to prevent changing the relation
    const { personnelId, ...updateData } = validatedData;
    
    // Verify that the media exists if it's being changed
    if (body.mediaId && body.mediaId !== existingItem.mediaId) {
      const media = await db.media.findUnique({
        where: { id: body.mediaId }
      });
      
      if (!media) {
        return NextResponse.json({ error: "Media not found" }, { status: 404 });
      }
    }
    
    const galleryItem = await db.personnelGallery.update({
      where: { id },
      data: updateData,
      include: {
        media: true
      }
    });

    return NextResponse.json(galleryItem);
  } catch (error) {
    return handleServerError(error, 'Gallery item update error');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.personnelGallery.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Gallery item deleted successfully" });
  } catch (error) {
    return handleServerError(error, 'Gallery item deletion error');
  }
}
