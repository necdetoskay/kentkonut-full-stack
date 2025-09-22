import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/pages/[id]/statistics - Get page statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get statistics for the specified period
    const statistics = await prisma.pageSeoMetrics.findMany({
      where: {
        pageId: id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate totals
    const totalViews = statistics.reduce((sum, stat) => sum + stat.views, 0);
    const totalUniqueVisitors = statistics.reduce((sum, stat) => sum + stat.uniqueVisitors, 0);
    const avgBounceRate = statistics.length > 0 
      ? statistics.reduce((sum, stat) => sum + (stat.bounceRate || 0), 0) / statistics.length 
      : 0;
    const avgTimeOnPage = statistics.length > 0 
      ? statistics.reduce((sum, stat) => sum + (stat.avgTimeOnPage || 0), 0) / statistics.length 
      : 0;

    // Get recent statistics (last 7 days for comparison)
    const recentStartDate = new Date();
    recentStartDate.setDate(recentStartDate.getDate() - 7);
    
    const recentStats = await prisma.pageSeoMetrics.findMany({
      where: {
        pageId: id,
        date: {
          gte: recentStartDate,
          lte: endDate
        }
      }
    });

    const recentViews = recentStats.reduce((sum, stat) => sum + stat.views, 0);

    return NextResponse.json({
      success: true,
      data: {
        page: {
          id: page.id,
          title: page.title,
          slug: page.slug
        },
        period: {
          startDate,
          endDate,
          days
        },
        totals: {
          views: totalViews,
          uniqueVisitors: totalUniqueVisitors,
          avgBounceRate: Math.round(avgBounceRate * 100) / 100,
          avgTimeOnPage: Math.round(avgTimeOnPage)
        },
        recent: {
          views: recentViews,
          period: '7 days'
        },
        dailyStats: statistics.map(stat => ({
          date: stat.date,
          views: stat.views,
          uniqueVisitors: stat.uniqueVisitors,
          bounceRate: stat.bounceRate,
          avgTimeOnPage: stat.avgTimeOnPage,
          organicTraffic: stat.organicTraffic,
          shares: stat.shares,
          likes: stat.likes,
          comments: stat.comments
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching page statistics:', error);
    return NextResponse.json(
      { success: false, error: 'İstatistikler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/pages/[id]/statistics - Manually add/update statistics
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    const {
      date,
      views,
      uniqueVisitors,
      bounceRate,
      avgTimeOnPage,
      organicTraffic,
      shares,
      likes,
      comments
    } = body;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Check if record exists for this date
    const existingRecord = await prisma.pageSeoMetrics.findFirst({
      where: {
        pageId: id,
        date: targetDate
      }
    });

    let result;
    if (existingRecord) {
      // Update existing record
      result = await prisma.pageSeoMetrics.update({
        where: { id: existingRecord.id },
        data: {
          views: views !== undefined ? views : existingRecord.views,
          uniqueVisitors: uniqueVisitors !== undefined ? uniqueVisitors : existingRecord.uniqueVisitors,
          bounceRate: bounceRate !== undefined ? bounceRate : existingRecord.bounceRate,
          avgTimeOnPage: avgTimeOnPage !== undefined ? avgTimeOnPage : existingRecord.avgTimeOnPage,
          organicTraffic: organicTraffic !== undefined ? organicTraffic : existingRecord.organicTraffic,
          shares: shares !== undefined ? shares : existingRecord.shares,
          likes: likes !== undefined ? likes : existingRecord.likes,
          comments: comments !== undefined ? comments : existingRecord.comments
        }
      });
    } else {
      // Create new record
      result = await prisma.pageSeoMetrics.create({
        data: {
          pageId: id,
          date: targetDate,
          views: views || 0,
          uniqueVisitors: uniqueVisitors || 0,
          bounceRate: bounceRate || null,
          avgTimeOnPage: avgTimeOnPage || null,
          organicTraffic: organicTraffic || 0,
          shares: shares || 0,
          likes: likes || 0,
          comments: comments || 0
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: existingRecord ? 'İstatistik güncellendi' : 'İstatistik oluşturuldu'
    });

  } catch (error) {
    console.error('Error updating page statistics:', error);
    return NextResponse.json(
      { success: false, error: 'İstatistik güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
