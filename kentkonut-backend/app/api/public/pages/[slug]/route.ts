import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/public/pages/[slug] - Get single published page by slug
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const { slug } = params;    const page = await prisma.page.findFirst({
      where: {
        slug,
        isActive: true // Sadece aktif sayfalar
      }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Sayfa bulunamadı' },
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    // Parse content blocks from page.content if it exists
    let contentBlocks = [];
    if (page.content) {
      try {
        const contentData = JSON.parse(page.content);
        if (contentData.blocks && Array.isArray(contentData.blocks)) {
          // Filter active blocks and sort by order
          contentBlocks = contentData.blocks
            .filter((block: any) => block.isActive)
            .sort((a: any, b: any) => a.order - b.order);
        }
      } catch (error) {
        console.error('Error parsing content blocks:', error);
        // Fallback: treat content as plain text/HTML
        contentBlocks = [];
      }
    }

    // Add content blocks to page data
    const pageWithBlocks = {
      ...page,
      contents: contentBlocks
    };

    // Update page view statistics
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day

      // Check if there's already a metric record for today
      const existingMetric = await prisma.pageSeoMetrics.findFirst({
        where: {
          pageId: page.id,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // End of day
          }
        }
      });

      if (existingMetric) {
        // Update existing record
        await prisma.pageSeoMetrics.update({
          where: { id: existingMetric.id },
          data: { views: existingMetric.views + 1 }
        });
      } else {
        // Create new record for today
        await prisma.pageSeoMetrics.create({
          data: {
            pageId: page.id,
            date: today,
            views: 1,
            uniqueVisitors: 1
          }
        });
      }
    } catch (error) {
      console.error('Error updating page view statistics:', error);
      // Don't fail the request if statistics update fails
    }

    return NextResponse.json({
      success: true,
      data: pageWithBlocks
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Error fetching public page:', error);    return NextResponse.json(
      { success: false, error: 'Sayfa yüklenirken hata oluştu' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}
