import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { DataAnonymizer } from '@/lib/privacy/data-anonymization';

// Create a direct database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

interface TrackingRequest {
  bannerId: number;
  eventType: 'impression' | 'view' | 'click' | 'conversion' | 'bounce' | 'engagement';
  sessionId: string;
  visitorId: string;
  timestamp: string;
  
  // Context Data
  pageUrl: string;
  referrer?: string;
  userAgent: string;
  
  // Interaction Data
  engagementDuration?: number;
  scrollDepth?: number;
  clickPosition?: { x: number; y: number };
  viewportPosition?: { top: number; left: number };
  
  // Conversion Data
  conversionType?: string;
  conversionValue?: number;
  
  // Campaign Data
  campaignId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  
  // Privacy
  consentGiven: boolean;
  dataProcessingConsent: boolean;
}

// POST /api/analytics/track-direct - Single event tracking (direct DB)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body: TrackingRequest = await request.json();

    // Validate required fields
    const validation = DataAnonymizer.validateEventData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Check consent
    if (!DataAnonymizer.validateConsent(body.consentGiven, body.dataProcessingConsent)) {
      return NextResponse.json(
        { success: false, error: 'User consent required for analytics tracking' },
        { status: 403 }
      );
    }

    // Get database client
    const client = await pool.connect();

    try {
      // Verify banner exists
      const bannerCheck = await client.query(
        'SELECT id, "isActive" FROM banners WHERE id = $1',
        [body.bannerId]
      );

      if (bannerCheck.rows.length === 0 || !bannerCheck.rows[0].isActive) {
        return NextResponse.json(
          { success: false, error: 'Banner not found or inactive' },
          { status: 404 }
        );
      }

      // Enrich and sanitize event data
      const enrichedEvent = await enrichEventData(body, request);

      // Insert analytics event
      const insertResult = await client.query(`
        INSERT INTO banner_analytics_events (
          "bannerId", "sessionId", "visitorId", "eventType", "eventTimestamp",
          "ipAddressHash", "userAgentHash", "referrerDomain", "pageUrl",
          "deviceType", "browserName", "browserVersion", "osName", "osVersion",
          "countryCode", "countryName", "region", "timezone",
          "engagementDuration", "scrollDepth", "clickPosition", "viewportPosition",
          "conversionType", "conversionValue", "conversionCurrency",
          "campaignId", "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm",
          "consentGiven", "dataProcessingConsent", "createdAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34
        ) RETURNING id, "eventType", "createdAt";
      `, [
        enrichedEvent.bannerId,
        enrichedEvent.sessionId,
        enrichedEvent.visitorId,
        enrichedEvent.eventType,
        enrichedEvent.eventTimestamp,
        enrichedEvent.ipAddressHash,
        enrichedEvent.userAgentHash,
        enrichedEvent.referrerDomain,
        enrichedEvent.pageUrl,
        enrichedEvent.deviceType,
        enrichedEvent.browserName,
        enrichedEvent.browserVersion,
        enrichedEvent.osName,
        enrichedEvent.osVersion,
        enrichedEvent.countryCode,
        enrichedEvent.countryName,
        enrichedEvent.region,
        enrichedEvent.timezone,
        enrichedEvent.engagementDuration,
        enrichedEvent.scrollDepth,
        enrichedEvent.clickPosition ? JSON.stringify(enrichedEvent.clickPosition) : null,
        enrichedEvent.viewportPosition ? JSON.stringify(enrichedEvent.viewportPosition) : null,
        enrichedEvent.conversionType,
        enrichedEvent.conversionValue,
        enrichedEvent.conversionCurrency,
        enrichedEvent.campaignId,
        enrichedEvent.utmSource,
        enrichedEvent.utmMedium,
        enrichedEvent.utmCampaign,
        enrichedEvent.utmContent,
        enrichedEvent.utmTerm,
        enrichedEvent.consentGiven,
        enrichedEvent.dataProcessingConsent,
        enrichedEvent.createdAt
      ]);

      // Update banner counters
      await updateBannerCounters(client, body.bannerId, body.eventType);

      client.release();

      return NextResponse.json({
        success: true,
        eventId: insertResult.rows[0].id.toString(),
        eventType: insertResult.rows[0].eventType,
        timestamp: insertResult.rows[0].createdAt,
        processed: true
      });

    } catch (dbError) {
      client.release();
      throw dbError;
    }

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (clientData.count >= RATE_LIMIT) {
    return false;
  }

  clientData.count++;
  return true;
}

async function enrichEventData(body: TrackingRequest, request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';

  // Device detection
  const deviceInfo = DataAnonymizer.detectDevice(userAgent);
  
  // Geographic data
  const geoData = await DataAnonymizer.getGeographicData(clientIP);

  // Anonymize sensitive data
  const anonymizedData = DataAnonymizer.sanitizeEvent({
    ipAddress: clientIP,
    userAgent: userAgent,
    referrer: body.referrer
  });

  return {
    bannerId: body.bannerId,
    sessionId: body.sessionId,
    visitorId: body.visitorId,
    eventType: body.eventType,
    eventTimestamp: new Date(body.timestamp),
    
    // Anonymized technical data
    ipAddressHash: anonymizedData.ipAddressHash,
    userAgentHash: anonymizedData.userAgentHash,
    
    // Page context
    pageUrl: body.pageUrl,
    referrerDomain: anonymizedData.referrerDomain,
    
    // Device information
    deviceType: deviceInfo.deviceType,
    browserName: deviceInfo.browserName,
    browserVersion: deviceInfo.browserVersion,
    osName: deviceInfo.osName,
    osVersion: deviceInfo.osVersion,
    
    // Geographic data (anonymized)
    countryCode: geoData.countryCode,
    countryName: geoData.countryName,
    region: geoData.region,
    timezone: geoData.timezone,
    
    // Interaction metrics
    engagementDuration: body.engagementDuration || 0,
    scrollDepth: body.scrollDepth || 0,
    clickPosition: body.clickPosition,
    viewportPosition: body.viewportPosition,
    
    // Conversion data
    conversionType: body.conversionType,
    conversionValue: body.conversionValue,
    conversionCurrency: 'TRY',
    
    // Campaign tracking
    campaignId: body.campaignId,
    utmSource: body.utmSource,
    utmMedium: body.utmMedium,
    utmCampaign: body.utmCampaign,
    utmContent: body.utmContent,
    utmTerm: body.utmTerm,
    
    // Privacy compliance
    consentGiven: body.consentGiven,
    dataProcessingConsent: body.dataProcessingConsent,
    
    // Metadata
    createdAt: new Date()
  };
}

async function updateBannerCounters(client: any, bannerId: number, eventType: string) {
  const updateQueries: string[] = [];
  
  switch (eventType) {
    case 'impression':
      updateQueries.push('UPDATE banners SET "impressionCount" = "impressionCount" + 1 WHERE id = $1');
      break;
    case 'view':
      updateQueries.push('UPDATE banners SET "viewCount" = "viewCount" + 1 WHERE id = $1');
      break;
    case 'click':
      updateQueries.push('UPDATE banners SET "clickCount" = "clickCount" + 1 WHERE id = $1');
      break;
    case 'conversion':
      updateQueries.push('UPDATE banners SET "conversionCount" = "conversionCount" + 1 WHERE id = $1');
      break;
    case 'bounce':
      updateQueries.push('UPDATE banners SET "bounceCount" = "bounceCount" + 1 WHERE id = $1');
      break;
  }

  for (const query of updateQueries) {
    await client.query(query, [bannerId]);
  }
}
