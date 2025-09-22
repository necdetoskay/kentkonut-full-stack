import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DataAnonymizer } from '@/lib/privacy/data-anonymization';
import { withCors, handleCorsPreflightRequest } from '@/lib/cors';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic'; // Force dynamic rendering, bypass RSC issues

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

// OPTIONS /api/analytics/track - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// POST /api/analytics/track - Single event tracking
export const POST = withCors(async (request: NextRequest) => {
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

    // Verify banner exists
    const banner = await prisma.banner.findUnique({
      where: { id: body.bannerId },
      select: { id: true, isActive: true }
    });

    if (!banner || !banner.isActive) {
      return NextResponse.json(
        { success: false, error: 'Banner not found or inactive' },
        { status: 404 }
      );
    }

    // Enrich and sanitize event data
    const enrichedEvent = await enrichEventData(body, request);

    // Process event immediately (we'll implement queuing later)
    const createdEvent = await processEventImmediate(enrichedEvent);

    return NextResponse.json({
      success: true,
      eventId: createdEvent.id.toString(),
      eventType: body.eventType,
      timestamp: createdEvent.createdAt,
      processed: true
    });

  } catch (error) {
    logger.error('Analytics tracking error', { context: 'Analytics API', details: error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

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

// Validation is now handled by DataAnonymizer.validateEventData

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

async function processEventImmediate(event: any) {
  try {
    // Check if prisma is available
    if (!prisma || !prisma.bannerAnalyticsEvents) {
      console.error('Prisma client not available or bannerAnalyticsEvents model not found');
      throw new Error('Database connection not available');
    }
    
    // Process event immediately
    const createdEvent = await prisma.bannerAnalyticsEvents.create({
      data: event
    });

    // Update real-time counters
    await updateRealtimeCounters(event);

    return createdEvent;
  } catch (error) {
    console.error('Error processing analytics event:', error);
    throw error;
  }
}

async function updateRealtimeCounters(event: any) {
  // Update banner counters based on event type
  const updateData: any = {};
  
  switch (event.eventType) {
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
      where: { id: event.bannerId },
      data: updateData
    });
  }
}

// Helper functions are now in DataAnonymizer class
