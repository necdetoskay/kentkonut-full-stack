import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Page update schema
const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  imageUrl: z.string().nullable().optional().transform((val) => (val === null || val === '' ? undefined : val)),
  isActive: z.boolean().optional(),
  categoryId: z.string().nullable().optional().transform(val => val === '' ? null : val),
  order: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  publishedAt: z.string().nullable().optional().transform(val => val === '' ? null : val),
  hasQuickAccess: z.boolean().optional(), // Hızlı erişim aktif mi?
  isDeletable: z.boolean().optional(), // Sayfa silinebilir mi?
});

// GET /api/pages/[id] - Get single page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        category: true,
        quickAccessLinks: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        seoMetrics: {
          orderBy: { date: 'desc' },
          take: 1
        },
        _count: {
          select: {
            seoMetrics: true,
            quickAccessLinks: true
          }
        }
      }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page
    });

  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { success: false, error: 'Sayfa yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[id] - Update page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 [API PUT] Starting page update for ID:', id);

    const body = await request.json();
    console.log('🔍 [API PUT] Request body:', JSON.stringify(body, null, 2));
    console.log('🔍 [API PUT] hasQuickAccess in request:', body.hasQuickAccess);
    console.log('🔍 [API PUT] Type of hasQuickAccess:', typeof body.hasQuickAccess);

    const validatedData = updatePageSchema.parse(body);
    console.log('🔍 [API PUT] Validation successful:', JSON.stringify(validatedData, null, 2));

    // Sayfa var mı kontrol et
    console.log('🔍 [API PUT] Checking if page exists with ID:', id);
    const existingPage = await prisma.page.findUnique({
      where: { id }
    });

    if (!existingPage) {
      console.log('🔍 [API PUT] Page not found with ID:', id);
      return NextResponse.json(
        { success: false, error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    console.log('🔍 [API PUT] Existing page found:', existingPage.title);

    // Slug değiştiriliyorsa uniqueness kontrolü
    if (validatedData.slug && validatedData.slug !== existingPage.slug) {
      console.log('🔍 [API PUT] Checking slug uniqueness:', validatedData.slug);
      const slugExists = await prisma.page.findUnique({
        where: { slug: validatedData.slug }
      });

      if (slugExists) {
        console.log('🔍 [API PUT] Slug already exists:', validatedData.slug);
        return NextResponse.json(
          { success: false, error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // Process data before database update
    const processedData = {
      ...validatedData,
      publishedAt: validatedData.publishedAt && typeof validatedData.publishedAt === 'string' && validatedData.publishedAt.trim() !== ''
        ? new Date(validatedData.publishedAt)
        : null,
      categoryId: validatedData.categoryId && typeof validatedData.categoryId === 'string' && validatedData.categoryId.trim() !== ''
        ? validatedData.categoryId
        : null
    };

    console.log('🔍 [API PUT] Updating page with processed data:', JSON.stringify(processedData, null, 2));

    const updatedPage = await prisma.page.update({
      where: { id },
      data: processedData,
      include: {
        category: true,
        seoMetrics: {
          orderBy: { date: 'desc' },
          take: 1
        },
        _count: {
          select: {
            seoMetrics: true
          }
        }
      }
    });

    console.log('🔍 [API PUT] Page updated successfully:', updatedPage.id);
    console.log('🔍 [API PUT] Updated hasQuickAccess:', updatedPage.hasQuickAccess);

    return NextResponse.json({
      success: true,
      data: updatedPage,
      message: 'Sayfa başarıyla güncellendi'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('🔍 [API PUT] Validation error:', error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz veri',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('🔍 [API PUT] Error updating page:', error);
    console.error('🔍 [API PUT] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: false,
        error: 'Sayfa güncellenirken hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[id] - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await prisma.page.findUnique({
      where: { id }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    // Check if page is deletable
    if (!page.isDeletable) {
      return NextResponse.json(
        { success: false, error: 'Bu sayfa silinemez olarak işaretlenmiştir' },
        { status: 403 }
      );
    }

    await prisma.page.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Sayfa başarıyla silindi'
    });

  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { success: false, error: 'Sayfa silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
