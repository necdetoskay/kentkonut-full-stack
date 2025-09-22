import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildCacheKey, getCache, setCache, delByPattern } from "@/lib/cache";
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    if (type) {
      where.type = type;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const cacheKey = buildCacheKey('personnel:list', { type: type || 'all', isActive, search });
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const personnel = await db.personnel.findMany({
      where,
      orderBy: { order: 'asc' },
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
    });
    
    await setCache(cacheKey, personnel);
    return NextResponse.json(personnel);
  } catch (error) {
    return handleServerError(error, 'Personnel fetch error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = PersonnelValidationSchema.parse(body);
    
    // Extract galleryItems for separate handling
    const { galleryItems, ...personnelData } = validatedData;
    
    const personnel = await db.personnel.create({
      data: {
        ...personnelData,
        galleryItems: galleryItems ? {
          create: galleryItems.map((item, index) => ({
            type: item.type,
            mediaId: item.mediaId,
            order: item.order || index,
            title: item.title,
            description: item.description,
          }))
        } : undefined,
      },
    });

    // Invalidate cache
    try {
      await delByPattern('personnel:list:*');
    } catch {}

    return NextResponse.json(personnel);
  } catch (error) {
    return handleServerError(error, 'Personnel creation error');
  }
}
