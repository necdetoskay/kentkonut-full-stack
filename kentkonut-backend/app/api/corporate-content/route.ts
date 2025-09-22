import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdminAuth } from '@/utils/corporate-cards-utils';
import { CorporateContentType } from '@prisma/client';

// GET /api/corporate-content - Get all corporate content or filter by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as CorporateContentType | null;

    let whereClause: any = { isActive: true };
    
    if (type) {
      whereClause.type = type;
    }

    const content = await db.corporateContent.findMany({
      where: whereClause,
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Corporate content fetch error:', error);
    return NextResponse.json(
      { error: 'İçerik yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/corporate-content - Create new corporate content
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await checkAdminAuth();
    if (!authResult.success) {
      return authResult.response!;
    }

    const body = await request.json();
    const { type, title, content, imageUrl, icon, order, isActive } = body;

    // Validate required fields
    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Type, title ve content alanları zorunludur' },
        { status: 400 }
      );
    }

    // Check if content with this type already exists
    const existingContent = await db.corporateContent.findUnique({
      where: { type }
    });

    if (existingContent) {
      return NextResponse.json(
        { error: 'Bu tip için içerik zaten mevcut' },
        { status: 409 }
      );
    }

    // Create new content
    const newContent = await db.corporateContent.create({
      data: {
        type,
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl?.trim() || null,
        icon: icon?.trim() || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('Corporate content creation error:', error);
    return NextResponse.json(
      { error: 'İçerik oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
