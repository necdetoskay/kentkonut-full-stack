import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PersonnelGalleryItemValidationSchema } from '@/utils/corporateValidation';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personnelId = searchParams.get('personnelId');
    const type = searchParams.get('type');

    const where: any = {};
    
    if (personnelId) {
      where.personnelId = personnelId;
    }
    
    if (type) {
      where.type = type;
    }

    const galleryItems = await db.personnelGallery.findMany({
      where,
      include: {
        media: true
      },
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json(galleryItems);
  } catch (error) {
    return handleServerError(error, 'Personnel gallery items fetch error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = PersonnelGalleryItemValidationSchema.parse(body);
    
    // Verify that the personnel exists
    const personnel = await db.personnel.findUnique({
      where: { id: validatedData.personnelId }
    });
    
    if (!personnel) {
      return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
    }
    
    // Verify that the media exists
    const media = await db.media.findUnique({
      where: { id: validatedData.mediaId }
    });
    
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }
    
    const galleryItem = await db.personnelGallery.create({
      data: validatedData,
      include: {
        media: true
      }
    });

    return NextResponse.json(galleryItem);
  } catch (error) {
    return handleServerError(error, 'Personnel gallery item creation error');
  }
}
