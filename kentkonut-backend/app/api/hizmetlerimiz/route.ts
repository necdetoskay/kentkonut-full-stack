import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ServiceCardFormData } from '@/types';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.serviceCard.findFirst({
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

// GET /api/hizmetlerimiz - Get all service cards with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');
    const isFeatured = searchParams.get('isFeatured');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    // Get total count for pagination
    const total = await db.serviceCard.count({ where });

    // Get service cards
    const serviceCards = await db.serviceCard.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    });

    const totalPages = Math.ceil(total / limit);

    console.log(`[HIZMETLERIMIZ_GET] Found ${serviceCards.length} service cards (page ${page}/${totalPages})`);

    return NextResponse.json({
      success: true,
      data: serviceCards,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('[HIZMETLERIMIZ_GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/hizmetlerimiz - Create new service card
export async function POST(request: NextRequest) {
  try {
    const body: ServiceCardFormData = await request.json();

    // Validation
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service card title is required' },
        { status: 400 }
      );
    }

    if (!body.imageUrl || body.imageUrl.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service card image is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let slug = body.slug?.trim();
    if (!slug) {
      slug = generateSlug(body.title);
    } else {
      slug = generateSlug(slug);
    }

    // Ensure slug is unique
    slug = await ensureUniqueSlug(slug);

    // Get next display order if not provided
    let displayOrder = body.displayOrder;
    if (displayOrder === undefined || displayOrder === null) {
      const lastCard = await db.serviceCard.findFirst({
        orderBy: { displayOrder: 'desc' }
      });
      displayOrder = (lastCard?.displayOrder || 0) + 1;
    }

    // Create service card
    const serviceCard = await db.serviceCard.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim(),
        shortDescription: body.shortDescription?.trim(),
        slug,
        imageUrl: body.imageUrl.trim(),
        altText: body.altText?.trim(),
        targetUrl: body.targetUrl?.trim(),
        isExternal: body.isExternal ?? false,
        color: body.color || '#4F772D',
        backgroundColor: body.backgroundColor?.trim(),
        textColor: body.textColor?.trim(),
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        displayOrder,
        metaTitle: body.metaTitle?.trim(),
        metaDescription: body.metaDescription?.trim()
      }
    });

    console.log(`[HIZMETLERIMIZ_POST] Created service card: ${serviceCard.title} (ID: ${serviceCard.id})`);

    return NextResponse.json({
      success: true,
      data: serviceCard,
      message: 'Service card created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('[HIZMETLERIMIZ_POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
