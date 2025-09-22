import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/analytics/banners/:id - Get banner analytics summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const bannerId = parseInt(idParam);
    
    if (isNaN(bannerId)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz banner ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const granularity = searchParams.get('granularity') || 'daily';

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get banner basic info
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
      select: {
        id: true,
        title: true,
        viewCount: true,
        clickCount: true,
        impressionCount: true,
        uniqueViewCount: true,
        conversionCount: true,
        bounceCount: true,
        avgEngagementTime: true,
        createdAt: true
      }
    });

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner bulunamadı' },
        { status: 404 }
      );
    }

    // Get detailed analytics for the period
    const analytics = await prisma.bannerAnalyticsEvents.findMany({
      where: {
        bannerId,
        eventTimestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        eventTimestamp: 'asc'
      }
    });

    // Get performance summary for the period
    const performanceSummary = await prisma.bannerPerformanceSummaries.findMany({
      where: {
        bannerId,
        date: {
          gte: startDate,
          lte: endDate
        },
        hour: granularity === 'hourly' ? { not: null } : null
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Calculate metrics
    const totalImpressions = analytics.filter(a => a.eventType === 'impression').length;
    const totalViews = analytics.filter(a => a.eventType === 'view').length;
    const totalClicks = analytics.filter(a => a.eventType === 'click').length;
    const totalConversions = analytics.filter(a => a.eventType === 'conversion').length;
    const totalBounces = analytics.filter(a => a.eventType === 'bounce').length;

    const uniqueUsers = new Set(analytics.map(a => a.sessionId)).size;
    const engagementEvents = analytics.filter(a => a.engagementDuration && a.engagementDuration > 0);
    const avgEngagementTime = engagementEvents.reduce((sum, a) => sum + (a.engagementDuration || 0), 0) /
      Math.max(1, engagementEvents.length);

    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const bounceRate = totalViews > 0 ? (totalBounces / totalViews) * 100 : 0;

    // Device breakdown
    const deviceBreakdown = analytics.reduce((acc, a) => {
      if (a.deviceType) {
        acc[a.deviceType] = (acc[a.deviceType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Country breakdown
    const countryBreakdown = analytics.reduce((acc, a) => {
      if (a.countryName) {
        acc[a.countryName] = (acc[a.countryName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Top referrers
    const referrerBreakdown = analytics.reduce((acc, a) => {
      if (a.referrerDomain) {
        acc[a.referrerDomain] = (acc[a.referrerDomain] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Time series data for charts
    const timeSeriesData = performanceSummary.map(ps => ({
      date: ps.date,
      hour: ps.hour,
      impressions: ps.impressions,
      views: ps.views,
      clicks: ps.clicks,
      conversions: ps.conversions,
      ctr: ps.clickThroughRate,
      conversionRate: ps.conversionRate,
      bounceRate: ps.bounceRate,
      avgEngagementTime: ps.avgEngagementTime
    }));

    const response = {
      success: true,
      data: {
        banner: {
          id: banner.id,
          title: banner.title,
          createdAt: banner.createdAt
        },
        period: {
          start: startDate,
          end: endDate,
          granularity
        },
        metrics: {
          totalImpressions,
          totalViews,
          totalClicks,
          totalConversions,
          totalBounces,
          uniqueUsers,
          clickThroughRate: Math.round(clickThroughRate * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
          bounceRate: Math.round(bounceRate * 100) / 100,
          avgEngagementTime: Math.round(avgEngagementTime * 100) / 100
        },
        breakdowns: {
          devices: deviceBreakdown,
          countries: countryBreakdown,
          referrers: Object.entries(referrerBreakdown)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        },
        timeSeries: timeSeriesData,
        rawAnalytics: analytics.length > 1000 ? 
          analytics.slice(0, 1000) : analytics // Limit for performance
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      }
    });

  } catch (error) {
    console.error('Banner analytics getirilirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Analytics verileri getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/analytics/banners/:id - Track banner event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const bannerId = parseInt(idParam);
    
    if (isNaN(bannerId)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz banner ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      eventType, 
      sessionId, 
      userId, 
      deviceInfo, 
      pageInfo, 
      engagementTime, 
      scrollDepth, 
      clickPosition, 
      conversionValue 
    } = body;

    // Validate required fields
    if (!eventType || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'eventType ve sessionId zorunludur' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create analytics record
    const analyticsRecord = await prisma.bannerAnalyticsEvents.create({
      data: {
        bannerId,
        sessionId,
        visitorId: sessionId, // Use sessionId as visitor ID if not provided
        userId,
        eventType,
        eventTimestamp: new Date(),
        ipAddressHash: null, // We'll implement hashing later
        userAgentHash: null,
        pageUrl: pageInfo?.url || 'unknown',
        referrerDomain: pageInfo?.referrer,
        deviceType: deviceInfo?.deviceType,
        browserName: deviceInfo?.browserName,
        osName: deviceInfo?.osName,
        countryCode: deviceInfo?.countryCode,
        countryName: deviceInfo?.country,
        engagementDuration: engagementTime || 0,
        scrollDepth: scrollDepth || 0,
        clickPosition: clickPosition || null,
        conversionValue: conversionValue || null,
        conversionType: conversionValue ? 'purchase' : null,
        consentGiven: true, // Default for now
        dataProcessingConsent: true // Default for now
      }
    });

    // Update banner counters based on event type
    const updateData: any = {};
    switch (eventType) {
      case 'impression':
        updateData.impressionCount = { increment: 1 };
        break;
      case 'view':
        updateData.viewCount = { increment: 1 };
        break;
      case 'click':
        updateData.clickCount = { increment: 1 };
        break;
      case 'conversion':
        updateData.conversionCount = { increment: 1 };
        break;
      case 'bounce':
        updateData.bounceCount = { increment: 1 };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.banner.update({
        where: { id: bannerId },
        data: updateData
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: analyticsRecord.id,
        eventType,
        timestamp: analyticsRecord.eventTimestamp
      }
    });

  } catch (error) {
    console.error('Banner analytics kaydedilirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Analytics verisi kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
