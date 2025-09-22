import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Page validation schema - Updated to match database model
const pageSchema = z.object({
  title: z.string()
    .min(1, 'Sayfa başlığı gereklidir')
    .min(3, 'Sayfa başlığı en az 3 karakter olmalıdır')
    .max(100, 'Sayfa başlığı en fazla 100 karakter olabilir'),
  slug: z.string()
    .min(1, 'URL slug gereklidir')
    .min(2, 'Slug en az 2 karakter olmalıdır')
    .max(50, 'Slug en fazla 50 karakter olabilir')
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, sayı ve tire içerebilir'),
  content: z.string()
    .min(1, 'İçerik gereklidir'), // Required field in database
  excerpt: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number().min(0, 'Sıra negatif olamaz').default(0),
  isActive: z.boolean().default(true),
  metaTitle: z.string().max(60, 'Meta başlık en fazla 60 karakter olabilir').optional(),
  metaDescription: z.string().max(160, 'Meta açıklama en fazla 160 karakter olabilir').optional(),
  metaKeywords: z.array(z.string()).optional().default([]), // Array type to match database
  categoryId: z.string().optional(),
  publishedAt: z.string().optional(), // ISO date string
  hasQuickAccess: z.boolean().default(false), // Hızlı erişim aktif mi?
  isDeletable: z.boolean().default(true), // Sayfa silinebilir mi?
});

// GET /api/pages - List all pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const categoryId = searchParams.get('categoryId');

    const whereClause: any = {};
    
    if (isActive !== null) whereClause.isActive = isActive === 'true';
    if (categoryId) whereClause.categoryId = categoryId;

    const pages = await prisma.page.findMany({
      where: whereClause,
      include: {
        category: true,
        quickAccessLinks: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            seoMetrics: true,
            quickAccessLinks: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: pages,
      count: pages.length
    });

  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { success: false, error: 'Sayfalar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create new page
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [API] POST /api/pages - Starting page creation');

    const body = await request.json();
    console.log('🔍 [API] Request body:', JSON.stringify(body, null, 2));

    const validatedData = pageSchema.parse(body);
    console.log('🔍 [API] Validation successful:', JSON.stringify(validatedData, null, 2));

    // Slug uniqueness check
    console.log('🔍 [API] Checking slug uniqueness:', validatedData.slug);
    const existingPage = await prisma.page.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingPage) {
      console.log('🔍 [API] Slug already exists:', validatedData.slug);
      return NextResponse.json(
        { success: false, error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Process publishedAt and categoryId if provided
    const pageData: any = {
      ...validatedData,
      publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : null,
      categoryId: validatedData.categoryId && validatedData.categoryId.trim() !== '' ? validatedData.categoryId : null
    };

    console.log('🔍 [API] Creating page with data:', JSON.stringify(pageData, null, 2));

    const page = await prisma.page.create({
      data: pageData,
      include: {
        category: true,
        quickAccessLinks: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            seoMetrics: true,
            quickAccessLinks: true
          }
        }
      }
    });

    console.log('🔍 [API] Page created successfully:', page.id);

    return NextResponse.json({
      success: true,
      data: page,
      message: 'Sayfa başarıyla oluşturuldu'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('🔍 [API] Validation error:', error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz veri',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('🔍 [API] Error creating page:', error);
    console.error('🔍 [API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // More specific error messages
    let errorMessage = 'Sayfa oluşturulurken hata oluştu';
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'Bu slug zaten kullanılıyor';
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Geçersiz kategori seçimi';
      } else if (error.message.includes('Required field')) {
        errorMessage = 'Zorunlu alanlar eksik';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}
