import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Schema for updating page content
const updateContentSchema = z.object({
  content: z.string(),
});

// GET /api/pages/[id]/content - Get page content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await prisma.page.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        isActive: true,
        updatedAt: true
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
    console.error('Error fetching page content:', error);
    return NextResponse.json(
      { success: false, error: 'İçerik yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[id]/content - Update page content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateContentSchema.parse(body);

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id }
    });

    if (!existingPage) {
      return NextResponse.json(
        { success: false, error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    // Update page content
    const updatedPage = await prisma.page.update({
      where: { id },
      data: {
        content: validatedData.content,
        updatedAt: new Date()
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedPage,
      message: 'İçerik başarıyla güncellendi'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Geçersiz veri',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Error updating page content:', error);
    return NextResponse.json(
      { success: false, error: 'İçerik güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
