import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ExecutiveValidationSchema } from '@/utils/corporateValidation';
import { handleApiError } from '@/utils/corporateApi';

// Slug generation helper function
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Generate unique slug
async function generateUniqueSlug(baseName: string, excludeId?: string): Promise<string> {
  let baseSlug = generateSlug(baseName);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.executive.findFirst({
      where: {
        slug: slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    const where = type 
      ? { type: type.toUpperCase() as any, isActive: true }
      : { isActive: true };
    
    const executives = await db.executive.findMany({
      where,
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
            isActive: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(executives);
  } catch (error) {
    console.error('Executives fetch error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.message }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate using the centralized validation schema
    const validationResult = ExecutiveValidationSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation error details:', validationResult.error);
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors.map(err => ({
            field: err.path[0],
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Generate slug from name if not provided or empty
    let slug = validatedData.slug;
    if (!slug || slug.trim() === '') {
      slug = await generateUniqueSlug(validatedData.name);
    } else {
      // If slug is provided, ensure it's unique
      slug = await generateUniqueSlug(slug);
    }

    const executive = await db.executive.create({
      data: {
        name: validatedData.name,
        title: validatedData.title,
        position: validatedData.position || "",
        slug: slug,
        biography: validatedData.biography,
        imageUrl: validatedData.imageUrl,
        email: validatedData.email,
        phone: validatedData.phone,
        linkedIn: validatedData.linkedIn,
        quickAccessUrl: validatedData.quickAccessUrl || null,
        hasQuickAccessLinks: validatedData.hasQuickAccessLinks || false,
        order: validatedData.order || 0,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
        type: validatedData.type,
        pageId: (validatedData.pageId && validatedData.pageId !== "none") ? validatedData.pageId : null
      } as any,
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
            isActive: true
          }
        }
      }
    });

    return NextResponse.json(executive);
  } catch (error) {
    console.error('Executive creation error:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { error: errorResponse.message }, 
      { status: 500 }
    );
  }
}
