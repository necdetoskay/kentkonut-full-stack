import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import { analyticsQueue } from '@/lib/queue/analytics-queue'; // Temporarily disabled

interface BatchTrackingRequest {
  events: Array<{
    bannerId: number;
    eventType: 'impression' | 'view' | 'click' | 'conversion' | 'bounce' | 'engagement';
    sessionId: string;
    visitorId: string;
    timestamp: string;
    pageUrl: string;
    referrer?: string;
    userAgent: string;
    engagementDuration?: number;
    scrollDepth?: number;
    clickPosition?: { x: number; y: number };
    viewportPosition?: { top: number; left: number };
    conversionType?: string;
    conversionValue?: number;
    campaignId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    consentGiven: boolean;
    dataProcessingConsent: boolean;
  }>;
  sessionId: string;
  batchId: string;
  timestamp: string;
}

interface BatchTrackingResponse {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
  batchId: string;
}

// POST /api/analytics/track/batch - Batch event tracking
export async function POST(request: NextRequest): Promise<NextResponse<BatchTrackingResponse>> {
  try {
    const body: BatchTrackingRequest = await request.json();

    // Validate batch request
    const validation = validateBatchRequest(body);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        processedCount: 0,
        failedCount: body.events?.length || 0,
        errors: [{ index: -1, error: validation.error! }],
        batchId: body.batchId || 'unknown'
      }, { status: 400 });
    }

    const errors: Array<{ index: number; error: string }> = [];
    const validEvents: any[] = [];

    // Validate and process each event
    for (let i = 0; i < body.events.length; i++) {
      const event = body.events[i];
      
      try {
        // Validate individual event
        const eventValidation = validateSingleEvent(event);
        if (!eventValidation.valid) {
          errors.push({ index: i, error: eventValidation.error! });
          continue;
        }

        // Check consent
        if (!event.consentGiven) {
          errors.push({ index: i, error: 'User consent required' });
          continue;
        }

        // Verify banner exists (batch check for performance)
        const banner = await prisma.banner.findUnique({
          where: { id: event.bannerId },
          select: { id: true, isActive: true }
        });

        if (!banner || !banner.isActive) {
          errors.push({ index: i, error: 'Banner not found or inactive' });
          continue;
        }

        // Enrich event data
        const enrichedEvent = await enrichBatchEventData(event, request, i);
        validEvents.push(enrichedEvent);

      } catch (error) {
        console.error(`Error processing event ${i}:`, error);
        errors.push({ index: i, error: 'Event processing failed' });
      }
    }

    // Process valid events
    if (validEvents.length > 0) {
      // Separate high-priority events for immediate processing
      const highPriorityEvents = validEvents.filter(e => 
        ['click', 'conversion'].includes(e.eventType)
      );
      const normalPriorityEvents = validEvents.filter(e => 
        !['click', 'conversion'].includes(e.eventType)
      );

      // Process high-priority events immediately
      if (highPriorityEvents.length > 0) {
        await processBatchEventsImmediate(highPriorityEvents);
      }

      // Queue normal priority events for batch processing
      if (normalPriorityEvents.length > 0) {
        // TODO: Implement queue system
        // await analyticsQueue.add('process-events', {
        //   events: normalPriorityEvents,
        //   batchId: body.batchId,
        //   timestamp: body.timestamp
        // }, {
        //   priority: 1, // Lower priority than individual events
        //   delay: 1000 // Small delay to allow batching
        // });

        // For now, process immediately
        await processBatchEventsImmediate(normalPriorityEvents);
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: validEvents.length,
      failedCount: errors.length,
      errors,
      batchId: body.batchId
    });

  } catch (error) {
    console.error('Batch analytics tracking error:', error);
    return NextResponse.json({
      success: false,
      processedCount: 0,
      failedCount: 0,
      errors: [{ index: -1, error: 'Internal server error' }],
      batchId: 'unknown'
    }, { status: 500 });
  }
}

function validateBatchRequest(body: BatchTrackingRequest): { valid: boolean; error?: string } {
  if (!body.events || !Array.isArray(body.events)) {
    return { valid: false, error: 'Events array is required' };
  }

  if (body.events.length === 0) {
    return { valid: false, error: 'Events array cannot be empty' };
  }

  if (body.events.length > 100) {
    return { valid: false, error: 'Batch size cannot exceed 100 events' };
  }

  if (!body.sessionId || typeof body.sessionId !== 'string') {
    return { valid: false, error: 'Session ID is required' };
  }

  if (!body.batchId || typeof body.batchId !== 'string') {
    return { valid: false, error: 'Batch ID is required' };
  }

  if (!body.timestamp || typeof body.timestamp !== 'string') {
    return { valid: false, error: 'Timestamp is required' };
  }

  return { valid: true };
}

function validateSingleEvent(event: any): { valid: boolean; error?: string } {
  if (!event.bannerId || !Number.isInteger(event.bannerId)) {
    return { valid: false, error: 'Invalid bannerId' };
  }

  if (!event.eventType || !['impression', 'view', 'click', 'conversion', 'bounce', 'engagement'].includes(event.eventType)) {
    return { valid: false, error: 'Invalid eventType' };
  }

  if (!event.sessionId || typeof event.sessionId !== 'string') {
    return { valid: false, error: 'Invalid sessionId' };
  }

  if (!event.visitorId || typeof event.visitorId !== 'string') {
    return { valid: false, error: 'Invalid visitorId' };
  }

  if (!event.pageUrl || typeof event.pageUrl !== 'string') {
    return { valid: false, error: 'Invalid pageUrl' };
  }

  if (typeof event.consentGiven !== 'boolean') {
    return { valid: false, error: 'Consent status required' };
  }

  return { valid: true };
}

async function enrichBatchEventData(event: any, request: NextRequest, index: number) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || event.userAgent || '';

  // Device detection
  const deviceInfo = detectDevice(userAgent);
  
  // Geographic data
  const geoData = await getGeographicData(clientIP);

  return {
    id: `evt_batch_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
    bannerId: event.bannerId,
    sessionId: event.sessionId,
    visitorId: event.visitorId,
    eventType: event.eventType,
    eventTimestamp: new Date(event.timestamp),
    
    // Technical data (anonymized)
    ipAddressHash: hashData(clientIP),
    userAgentHash: hashData(userAgent),
    
    // Page context
    pageUrl: event.pageUrl,
    referrerDomain: event.referrer ? extractDomain(event.referrer) : null,
    
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
    
    // Interaction metrics
    engagementDuration: event.engagementDuration || 0,
    scrollDepth: event.scrollDepth || 0,
    clickPosition: event.clickPosition,
    viewportPosition: event.viewportPosition,
    
    // Conversion data
    conversionType: event.conversionType,
    conversionValue: event.conversionValue,
    
    // Campaign tracking
    campaignId: event.campaignId,
    utmSource: event.utmSource,
    utmMedium: event.utmMedium,
    utmCampaign: event.utmCampaign,
    utmContent: event.utmContent,
    utmTerm: event.utmTerm,
    
    // Privacy compliance
    consentGiven: event.consentGiven,
    dataProcessingConsent: event.dataProcessingConsent,
    
    // Metadata
    createdAt: new Date()
  };
}

async function processBatchEventsImmediate(events: any[]) {
  // Use transaction for batch insert
  await prisma.$transaction(async (tx) => {
    // Insert all events
    await tx.bannerAnalyticsEvents.createMany({
      data: events
    });

    // Update banner counters
    const bannerUpdates = new Map<number, any>();
    
    for (const event of events) {
      const bannerId = event.bannerId;
      const current = bannerUpdates.get(bannerId) || {};
      
      switch (event.eventType) {
        case 'impression':
          current.impressionCount = (current.impressionCount || 0) + 1;
          break;
        case 'view':
          current.viewCount = (current.viewCount || 0) + 1;
          break;
        case 'click':
          current.clickCount = (current.clickCount || 0) + 1;
          break;
        case 'conversion':
          current.conversionCount = (current.conversionCount || 0) + 1;
          break;
        case 'bounce':
          current.bounceCount = (current.bounceCount || 0) + 1;
          break;
      }
      
      bannerUpdates.set(bannerId, current);
    }

    // Apply banner updates
    for (const [bannerId, updates] of bannerUpdates) {
      const updateData: any = {};
      
      if (updates.impressionCount) updateData.impressionCount = { increment: updates.impressionCount };
      if (updates.viewCount) updateData.viewCount = { increment: updates.viewCount };
      if (updates.clickCount) updateData.clickCount = { increment: updates.clickCount };
      if (updates.conversionCount) updateData.conversionCount = { increment: updates.conversionCount };
      if (updates.bounceCount) updateData.bounceCount = { increment: updates.bounceCount };

      if (Object.keys(updateData).length > 0) {
        await tx.banner.update({
          where: { id: bannerId },
          data: updateData
        });
      }
    }
  });
}

// Helper functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

function detectDevice(userAgent: string) {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isTablet = /iPad|Tablet/i.test(userAgent);
  
  let deviceType = 'desktop';
  if (isTablet) deviceType = 'tablet';
  else if (isMobile) deviceType = 'mobile';

  let browserName = 'unknown';
  if (userAgent.includes('Chrome')) browserName = 'Chrome';
  else if (userAgent.includes('Firefox')) browserName = 'Firefox';
  else if (userAgent.includes('Safari')) browserName = 'Safari';
  else if (userAgent.includes('Edge')) browserName = 'Edge';

  return {
    deviceType,
    browserName,
    browserVersion: 'unknown',
    osName: 'unknown',
    osVersion: 'unknown'
  };
}

async function getGeographicData(ip: string) {
  return {
    countryCode: 'TR',
    countryName: 'Turkey',
    region: 'Istanbul'
  };
}

function hashData(data: string): string {
  // Simple hash implementation - would use crypto in production
  return Buffer.from(data).toString('base64').substring(0, 16);
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
