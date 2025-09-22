import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/public/pages - List published pages
export async function GET(request: NextRequest) {  try {
    const { searchParams } = new URL(request.url);

    const whereClause: any = {
      isActive: true // Sadece aktif sayfalar
    };

    const pages = await prisma.page.findMany({
      where: whereClause,select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        isActive: true,
        order: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        imageUrl: true,
        publishedAt: true,
        updatedAt: true
      },
      orderBy: [
        { order: 'asc' },
        { updatedAt: 'desc' }
      ]
    });    return NextResponse.json({
      success: true,
      data: pages,
      count: pages.length
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Error fetching public pages:', error);    return NextResponse.json(
      { success: false, error: 'Sayfalar yüklenirken hata oluştu' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}
