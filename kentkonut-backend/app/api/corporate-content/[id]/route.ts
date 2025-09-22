import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdminAuth } from '@/utils/corporate-cards-utils';

// GET /api/corporate-content/[id] - Get specific corporate content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const content = await db.corporateContent.findUnique({
      where: { id }
    });

    if (!content) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Corporate content fetch error:', error);
    return NextResponse.json(
      { error: 'İçerik yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/corporate-content/[id] - Update corporate content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const authResult = await checkAdminAuth();
    if (!authResult.success) {
      return authResult.response!;
    }

    const { id } = await params;
    const body = await request.json();

    // Check if content exists
    const existingContent = await db.corporateContent.findUnique({
      where: { id }
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      );
    }

    // Update content
    const updatedContent = await db.corporateContent.update({
      where: { id },
      data: {
        title: body.title?.trim() || existingContent.title,
        content: body.content?.trim() || existingContent.content,
        imageUrl: body.imageUrl?.trim() || existingContent.imageUrl,
        icon: body.icon?.trim() || existingContent.icon,
        order: body.order !== undefined ? body.order : existingContent.order,
        isActive: body.isActive !== undefined ? body.isActive : existingContent.isActive,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Corporate content update error:', error);
    return NextResponse.json(
      { error: 'İçerik güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/corporate-content/[id] - Delete corporate content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const authResult = await checkAdminAuth();
    if (!authResult.success) {
      return authResult.response!;
    }

    const { id } = await params;

    // Check if content exists
    const existingContent = await db.corporateContent.findUnique({
      where: { id }
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      );
    }

    // Delete content
    await db.corporateContent.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'İçerik başarıyla silindi' });
  } catch (error) {
    console.error('Corporate content deletion error:', error);
    return NextResponse.json(
      { error: 'İçerik silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
