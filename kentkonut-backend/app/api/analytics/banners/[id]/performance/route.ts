import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a direct database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface PerformanceQuery {
  startDate?: string;
  endDate?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
  groupBy?: 'device' | 'country' | 'browser' | 'referrer';
  timezone?: string;
}

// GET /api/analytics/banners/:id/performance - Get banner performance summary
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
    const granularity = searchParams.get('granularity') || 'day';
    const groupBy = searchParams.get('groupBy');

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

    const client = await pool.connect();

    try {
      // Get banner basic info
      const bannerQuery = await client.query(`
        SELECT id, title, "viewCount", "clickCount", "impressionCount", 
               "uniqueViewCount", "conversionCount", "bounceCount", 
               "avgEngagementTime", "createdAt"
        FROM banners 
        WHERE id = $1
      `, [bannerId]);

      if (bannerQuery.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Banner bulunamadı' },
          { status: 404 }
        );
      }

      const banner = bannerQuery.rows[0];

      // Get detailed analytics for the period
      const analyticsQuery = await client.query(`
        SELECT 
          "eventType",
          "deviceType",
          "browserName",
          "countryCode",
          "countryName",
          "referrerDomain",
          "engagementDuration",
          "scrollDepth",
          "conversionValue",
          "eventTimestamp",
          "createdAt"
        FROM banner_analytics_events
        WHERE "bannerId" = $1 
        AND "eventTimestamp" >= $2 
        AND "eventTimestamp" <= $3
        AND "consentGiven" = true
        ORDER BY "eventTimestamp" ASC
      `, [bannerId, startDate.toISOString(), endDate.toISOString()]);

      const analytics = analyticsQuery.rows;

      // Calculate metrics
      const impressions = analytics.filter(a => a.eventType === 'impression').length;
      const views = analytics.filter(a => a.eventType === 'view').length;
      const clicks = analytics.filter(a => a.eventType === 'click').length;
      const conversions = analytics.filter(a => a.eventType === 'conversion').length;
      const bounces = analytics.filter(a => a.eventType === 'bounce').length;
      const engagements = analytics.filter(a => a.eventType === 'engagement');

      const uniqueUsers = new Set(analytics.map(a => a.sessionId)).size;
      const avgEngagementTime = engagements.length > 0 ? 
        engagements.reduce((sum, a) => sum + (a.engagementDuration || 0), 0) / engagements.length : 0;

      const clickThroughRate = views > 0 ? (clicks / views) * 100 : 0;
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
      const bounceRate = views > 0 ? (bounces / views) * 100 : 0;
      const viewRate = impressions > 0 ? (views / impressions) * 100 : 0;

      // Calculate revenue metrics
      const totalRevenue = analytics
        .filter(a => a.eventType === 'conversion' && a.conversionValue)
        .reduce((sum, a) => sum + parseFloat(a.conversionValue || 0), 0);
      
      const avgConversionValue = conversions > 0 ? totalRevenue / conversions : 0;
      const revenuePerImpression = impressions > 0 ? totalRevenue / impressions : 0;
      const revenuePerClick = clicks > 0 ? totalRevenue / clicks : 0;

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

      // Browser breakdown
      const browserBreakdown = analytics.reduce((acc, a) => {
        if (a.browserName) {
          acc[a.browserName] = (acc[a.browserName] || 0) + 1;
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

      // Time series data
      const timeSeriesData = generateTimeSeries(analytics, startDate, endDate, granularity);

      // Performance comparison with previous period
      const previousStartDate = new Date(startDate);
      const previousEndDate = new Date(endDate);
      const periodDuration = endDate.getTime() - startDate.getTime();
      previousStartDate.setTime(startDate.getTime() - periodDuration);
      previousEndDate.setTime(endDate.getTime() - periodDuration);

      const previousAnalyticsQuery = await client.query(`
        SELECT "eventType"
        FROM banner_analytics_events
        WHERE "bannerId" = $1 
        AND "eventTimestamp" >= $2 
        AND "eventTimestamp" <= $3
        AND "consentGiven" = true
      `, [bannerId, previousStartDate.toISOString(), previousEndDate.toISOString()]);

      const previousAnalytics = previousAnalyticsQuery.rows;
      const previousImpressions = previousAnalytics.filter(a => a.eventType === 'impression').length;
      const previousViews = previousAnalytics.filter(a => a.eventType === 'view').length;
      const previousClicks = previousAnalytics.filter(a => a.eventType === 'click').length;
      const previousConversions = previousAnalytics.filter(a => a.eventType === 'conversion').length;

      const response = {
        success: true,
        data: {
          banner: {
            id: banner.id,
            title: banner.title,
            createdAt: banner.createdAt
          },
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            granularity
          },
          summary: {
            totalImpressions: impressions,
            totalViews: views,
            totalClicks: clicks,
            totalConversions: conversions,
            totalBounces: bounces,
            uniqueUsers,
            clickThroughRate: Math.round(clickThroughRate * 100) / 100,
            conversionRate: Math.round(conversionRate * 100) / 100,
            bounceRate: Math.round(bounceRate * 100) / 100,
            viewRate: Math.round(viewRate * 100) / 100,
            avgEngagementTime: Math.round(avgEngagementTime),
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            avgConversionValue: Math.round(avgConversionValue * 100) / 100,
            revenuePerImpression: Math.round(revenuePerImpression * 10000) / 10000,
            revenuePerClick: Math.round(revenuePerClick * 100) / 100
          },
          comparison: {
            impressions: {
              current: impressions,
              previous: previousImpressions,
              change: previousImpressions > 0 ? ((impressions - previousImpressions) / previousImpressions) * 100 : 0
            },
            views: {
              current: views,
              previous: previousViews,
              change: previousViews > 0 ? ((views - previousViews) / previousViews) * 100 : 0
            },
            clicks: {
              current: clicks,
              previous: previousClicks,
              change: previousClicks > 0 ? ((clicks - previousClicks) / previousClicks) * 100 : 0
            },
            conversions: {
              current: conversions,
              previous: previousConversions,
              change: previousConversions > 0 ? ((conversions - previousConversions) / previousConversions) * 100 : 0
            }
          },
          breakdowns: {
            devices: deviceBreakdown,
            countries: Object.entries(countryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
            browsers: Object.entries(browserBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
            referrers: Object.entries(referrerBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
          },
          timeSeries: timeSeriesData,
          metadata: {
            dataQuality: 1.0,
            sampleSize: analytics.length,
            lastUpdated: new Date().toISOString()
          }
        }
      };

      client.release();

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, max-age=300' // 5 minutes cache
        }
      });

    } catch (dbError) {
      client.release();
      throw dbError;
    }

  } catch (error) {
    console.error('Banner analytics getirilirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Analytics verileri getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

function generateTimeSeries(analytics: any[], startDate: Date, endDate: Date, granularity: string) {
  const timeSeries: any[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const periodStart = new Date(current);
    const periodEnd = new Date(current);
    
    switch (granularity) {
      case 'hour':
        periodEnd.setHours(periodEnd.getHours() + 1);
        break;
      case 'day':
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;
      case 'week':
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
      case 'month':
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        break;
    }
    
    const periodAnalytics = analytics.filter(a => {
      const eventTime = new Date(a.eventTimestamp);
      return eventTime >= periodStart && eventTime < periodEnd;
    });
    
    const impressions = periodAnalytics.filter(a => a.eventType === 'impression').length;
    const views = periodAnalytics.filter(a => a.eventType === 'view').length;
    const clicks = periodAnalytics.filter(a => a.eventType === 'click').length;
    const conversions = periodAnalytics.filter(a => a.eventType === 'conversion').length;
    
    const ctr = views > 0 ? (clicks / views) * 100 : 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    
    timeSeries.push({
      timestamp: periodStart.toISOString(),
      impressions,
      views,
      clicks,
      conversions,
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100
    });
    
    current.setTime(periodEnd.getTime());
  }
  
  return timeSeries;
}
