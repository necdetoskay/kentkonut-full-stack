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

// GET /api/hizmetlerimiz/[id] - Get specific service card
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service card ID' },
        { status: 400 }
      );
    }

    const serviceCard = await db.serviceCard.findUnique({
      where: { id }
    });

    if (!serviceCard) {
      return NextResponse.json(
        { success: false, error: 'Service card not found' },
        { status: 404 }
      );
    }

    console.log(`[HIZMETLERIMIZ_GET] Retrieved service card: ${serviceCard.title} (ID: ${serviceCard.id})`);

    return NextResponse.json({
      success: true,
      data: serviceCard
    });

  } catch (error) {
    console.error('[HIZMETLERIMIZ_GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/hizmetlerimiz/[id] - Update service card
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service card ID' },
        { status: 400 }
      );
    }

    const body: ServiceCardFormData = await request.json();

    // Check if service card exists
    const existingCard = await db.serviceCard.findUnique({
      where: { id }
    });

    if (!existingCard) {
      return NextResponse.json(
        { success: false, error: 'Service card not found' },
        { status: 404 }
      );
    }

    // Validation
    if (body.title && body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service card title cannot be empty' },
        { status: 400 }
      );
    }

    if (body.imageUrl && body.imageUrl.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service card image cannot be empty' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim();
    }

    if (body.shortDescription !== undefined) {
      updateData.shortDescription = body.shortDescription?.trim();
    }

    if (body.slug !== undefined) {
      let slug = body.slug?.trim();
      if (!slug && body.title) {
        slug = generateSlug(body.title);
      } else if (slug) {
        slug = generateSlug(slug);
      }
      
      if (slug) {
        // Ensure slug is unique (excluding current record)
        updateData.slug = await ensureUniqueSlug(slug, id);
      }
    }

    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl.trim();
    }

    if (body.altText !== undefined) {
      updateData.altText = body.altText?.trim();
    }

    if (body.targetUrl !== undefined) {
      updateData.targetUrl = body.targetUrl?.trim();
    }

    if (body.isExternal !== undefined) {
      updateData.isExternal = body.isExternal;
    }

    if (body.color !== undefined) {
      updateData.color = body.color || '#4F772D';
    }

    if (body.backgroundColor !== undefined) {
      updateData.backgroundColor = body.backgroundColor?.trim();
    }

    if (body.textColor !== undefined) {
      updateData.textColor = body.textColor?.trim();
    }

    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    if (body.isFeatured !== undefined) {
      updateData.isFeatured = body.isFeatured;
    }

    if (body.displayOrder !== undefined) {
      updateData.displayOrder = body.displayOrder;
    }

    if (body.metaTitle !== undefined) {
      updateData.metaTitle = body.metaTitle?.trim();
    }

    if (body.metaDescription !== undefined) {
      updateData.metaDescription = body.metaDescription?.trim();
    }

    // Update service card
    const updatedCard = await db.serviceCard.update({
      where: { id },
      data: updateData
    });

    console.log(`[HIZMETLERIMIZ_PUT] Updated service card: ${updatedCard.title} (ID: ${updatedCard.id})`);

    return NextResponse.json({
      success: true,
      data: updatedCard,
      message: 'Service card updated successfully'
    });

  } catch (error) {
    console.error('[HIZMETLERIMIZ_PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/hizmetlerimiz/[id] - Delete service card
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service card ID' },
        { status: 400 }
      );
    }

    // Check if service card exists
    const existingCard = await db.serviceCard.findUnique({
      where: { id }
    });

    if (!existingCard) {
      return NextResponse.json(
        { success: false, error: 'Service card not found' },
        { status: 404 }
      );
    }

    // Delete service card
    await db.serviceCard.delete({
      where: { id }
    });

    console.log(`[HIZMETLERIMIZ_DELETE] Deleted service card: ${existingCard.title} (ID: ${existingCard.id})`);

    return NextResponse.json({
      success: true,
      message: 'Service card deleted successfully'
    });

  } catch (error) {
    console.error('[HIZMETLERIMIZ_DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
