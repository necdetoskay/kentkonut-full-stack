import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DepartmentValidationSchema } from '@/utils/corporateValidation';
import { generateUniqueDepartmentSlug } from '@/lib/seo-utils';
import { ZodError } from 'zod';
import { buildCacheKey, getCache, setCache, delByPattern } from '@/lib/cache';

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
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const hasDirector = searchParams.get('hasDirector');

    const where: any = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (hasDirector !== null) {
      if (hasDirector === 'true') {
        where.directorId = { not: null };
      } else {
        where.directorId = null;
      }
    }

    const cacheKey = buildCacheKey('department:list', { isActive, search, hasDirector });
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const departments = await db.department.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        director: true,
        manager: true,
        chiefs: {
          orderBy: { order: 'asc' }
        },
        quickLinks: {
          orderBy: { order: 'asc' }
        },
        quickAccessLinks: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    await setCache(cacheKey, departments);
    return NextResponse.json(departments);
  } catch (error) {
    return handleServerError(error, 'Departments fetch error');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = DepartmentValidationSchema.parse(body);

    // Generate or validate unique slug
    let slug = validatedData.slug;

    if (!slug || slug.trim() === '') {
      // Generate unique slug from name
      slug = await generateUniqueDepartmentSlug(validatedData.name);
    } else {
      // Validate provided slug is unique
      const existingDepartment = await db.department.findFirst({
        where: { slug: slug.trim() }
      });

      if (existingDepartment) {
        // If slug exists, generate a unique one
        slug = await generateUniqueDepartmentSlug(validatedData.name);
      }
    }

    const department = await db.department.create({
      data: {
        ...validatedData,
        slug
      },
      include: {
        director: true,
        manager: true,
        chiefs: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // Invalidate cache
    try {
      await delByPattern('department:list:*');
    } catch {}

    return NextResponse.json(department);
  } catch (error) {
    return handleServerError(error, 'Department creation error');
  }
}
