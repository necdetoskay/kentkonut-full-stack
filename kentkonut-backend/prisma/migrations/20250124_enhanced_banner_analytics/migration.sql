-- Enhanced Banner Analytics Migration
-- This migration creates comprehensive analytics tables for banner tracking

-- First, add new fields to existing banners table if they don't exist
DO $$ 
BEGIN
    -- Add analytics fields to banners table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'impressioncount') THEN
        ALTER TABLE "banners" ADD COLUMN "impressionCount" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'uniqueviewcount') THEN
        ALTER TABLE "banners" ADD COLUMN "uniqueViewCount" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'conversioncount') THEN
        ALTER TABLE "banners" ADD COLUMN "conversionCount" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'bouncecount') THEN
        ALTER TABLE "banners" ADD COLUMN "bounceCount" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'avgengagementtime') THEN
        ALTER TABLE "banners" ADD COLUMN "avgEngagementTime" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Create banner analytics events table (partitioned by month)
CREATE TABLE IF NOT EXISTS "banner_analytics_events" (
    "id" BIGSERIAL NOT NULL,
    "bannerId" INTEGER NOT NULL,
    
    -- Session & User Tracking
    "sessionId" VARCHAR(64) NOT NULL,
    "visitorId" VARCHAR(64) NOT NULL,
    "userId" VARCHAR(64),
    
    -- Event Details
    "eventType" VARCHAR(20) NOT NULL,
    "eventTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Technical Context (Anonymized)
    "ipAddressHash" VARCHAR(64),
    "userAgentHash" VARCHAR(64),
    "referrerDomain" TEXT,
    "pageUrl" TEXT NOT NULL,
    
    -- Device & Browser
    "deviceType" VARCHAR(20),
    "browserName" VARCHAR(50),
    "browserVersion" VARCHAR(20),
    "osName" VARCHAR(50),
    "osVersion" VARCHAR(20),
    "screenResolution" VARCHAR(20),
    "viewportSize" VARCHAR(20),
    
    -- Geographic Data (Anonymized)
    "countryCode" CHAR(2),
    "countryName" VARCHAR(100),
    "region" VARCHAR(100),
    "timezone" VARCHAR(50),
    
    -- Interaction Metrics
    "engagementDuration" INTEGER DEFAULT 0,
    "scrollDepth" INTEGER DEFAULT 0,
    "clickPosition" JSONB,
    "viewportPosition" JSONB,
    
    -- Conversion Tracking
    "conversionType" VARCHAR(50),
    "conversionValue" DECIMAL(10,2),
    "conversionCurrency" CHAR(3) DEFAULT 'TRY',
    
    -- Privacy & Compliance
    "consentGiven" BOOLEAN DEFAULT false,
    "dataProcessingConsent" BOOLEAN DEFAULT false,
    
    -- Campaign Tracking
    "campaignId" VARCHAR(100),
    "utmSource" VARCHAR(100),
    "utmMedium" VARCHAR(100),
    "utmCampaign" VARCHAR(100),
    "utmContent" VARCHAR(100),
    "utmTerm" VARCHAR(100),
    
    -- Metadata
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    
    CONSTRAINT "banner_analytics_events_pkey" PRIMARY KEY ("id", "eventTimestamp"),
    CONSTRAINT "valid_event_type" CHECK ("eventType" IN ('impression', 'view', 'click', 'conversion', 'bounce', 'engagement')),
    CONSTRAINT "valid_device_type" CHECK ("deviceType" IN ('desktop', 'mobile', 'tablet', 'unknown')),
    CONSTRAINT "valid_scroll_depth" CHECK ("scrollDepth" >= 0 AND "scrollDepth" <= 100)
) PARTITION BY RANGE ("eventTimestamp");

-- Create banner performance summaries table
CREATE TABLE IF NOT EXISTS "banner_performance_summaries" (
    "id" BIGSERIAL PRIMARY KEY,
    "bannerId" INTEGER NOT NULL,
    
    -- Time Dimensions
    "date" DATE NOT NULL,
    "hour" INTEGER,
    "weekOfYear" INTEGER,
    "month" INTEGER,
    "quarter" INTEGER,
    "year" INTEGER,
    
    -- Core Metrics
    "impressions" BIGINT DEFAULT 0,
    "uniqueImpressions" BIGINT DEFAULT 0,
    "views" BIGINT DEFAULT 0,
    "uniqueViews" BIGINT DEFAULT 0,
    "clicks" BIGINT DEFAULT 0,
    "uniqueClicks" BIGINT DEFAULT 0,
    "conversions" BIGINT DEFAULT 0,
    "bounces" BIGINT DEFAULT 0,
    
    -- Calculated Metrics
    "clickThroughRate" DECIMAL(8,4) DEFAULT 0,
    "conversionRate" DECIMAL(8,4) DEFAULT 0,
    "bounceRate" DECIMAL(8,4) DEFAULT 0,
    "viewRate" DECIMAL(8,4) DEFAULT 0,
    
    -- Engagement Metrics
    "totalEngagementTime" BIGINT DEFAULT 0,
    "avgEngagementTime" DECIMAL(10,2) DEFAULT 0,
    "maxEngagementTime" INTEGER DEFAULT 0,
    "avgScrollDepth" DECIMAL(5,2) DEFAULT 0,
    
    -- Revenue Metrics
    "totalConversionValue" DECIMAL(12,2) DEFAULT 0,
    "avgConversionValue" DECIMAL(10,2) DEFAULT 0,
    "revenuePerImpression" DECIMAL(10,4) DEFAULT 0,
    "revenuePerClick" DECIMAL(10,2) DEFAULT 0,
    
    -- Breakdown Data (JSON)
    "deviceBreakdown" JSONB,
    "browserBreakdown" JSONB,
    "countryBreakdown" JSONB,
    "referrerBreakdown" JSONB,
    "hourBreakdown" JSONB,
    
    -- Quality Metrics
    "dataQualityScore" DECIMAL(3,2) DEFAULT 1.0,
    "sampleSize" INTEGER DEFAULT 0,
    
    -- Metadata
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "valid_hour" CHECK ("hour" IS NULL OR ("hour" >= 0 AND "hour" <= 23)),
    CONSTRAINT "valid_rates" CHECK (
        "clickThroughRate" >= 0 AND "clickThroughRate" <= 100 AND
        "conversionRate" >= 0 AND "conversionRate" <= 100 AND
        "bounceRate" >= 0 AND "bounceRate" <= 100 AND
        "viewRate" >= 0 AND "viewRate" <= 100
    )
);

-- Create user sessions table for privacy-compliant tracking
CREATE TABLE IF NOT EXISTS "banner_user_sessions" (
    "id" BIGSERIAL PRIMARY KEY,
    "sessionId" VARCHAR(64) NOT NULL UNIQUE,
    "visitorId" VARCHAR(64) NOT NULL,
    
    -- Session Context
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionDuration" INTEGER DEFAULT 0,
    "pageViews" INTEGER DEFAULT 0,
    "bannerInteractions" INTEGER DEFAULT 0,
    
    -- Technical Details (Anonymized)
    "ipAddressHash" VARCHAR(64),
    "userAgentHash" VARCHAR(64),
    "deviceFingerprint" VARCHAR(64),
    
    -- Geographic (Anonymized)
    "countryCode" CHAR(2),
    "regionCode" VARCHAR(10),
    
    -- Privacy & Consent
    "consentTimestamp" TIMESTAMP(3),
    "consentVersion" VARCHAR(10),
    "dataRetentionUntil" DATE,
    
    -- Quality Indicators
    "isBot" BOOLEAN DEFAULT false,
    "qualityScore" DECIMAL(3,2) DEFAULT 1.0,
    
    -- Metadata
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE "banner_analytics_events" ADD CONSTRAINT "banner_analytics_events_bannerId_fkey" 
FOREIGN KEY ("bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "banner_performance_summaries" ADD CONSTRAINT "banner_performance_summaries_bannerId_fkey" 
FOREIGN KEY ("bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS "idx_banner_analytics_events_banner_timestamp" 
ON "banner_analytics_events"("bannerId", "eventTimestamp" DESC);

CREATE INDEX IF NOT EXISTS "idx_banner_analytics_events_session" 
ON "banner_analytics_events"("sessionId", "eventTimestamp");

CREATE INDEX IF NOT EXISTS "idx_banner_analytics_events_type_timestamp" 
ON "banner_analytics_events"("eventType", "eventTimestamp" DESC);

CREATE INDEX IF NOT EXISTS "idx_banner_analytics_events_country" 
ON "banner_analytics_events"("countryCode", "eventTimestamp" DESC);

CREATE INDEX IF NOT EXISTS "idx_banner_analytics_events_device" 
ON "banner_analytics_events"("deviceType", "browserName", "eventTimestamp" DESC);

CREATE INDEX IF NOT EXISTS "idx_banner_performance_summaries_banner_date" 
ON "banner_performance_summaries"("bannerId", "date" DESC, "hour");

CREATE INDEX IF NOT EXISTS "idx_banner_performance_summaries_date_range" 
ON "banner_performance_summaries"("date", "hour") WHERE "hour" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_banner_analytics_events_conversions" 
ON "banner_analytics_events"("bannerId", "eventTimestamp") 
WHERE "eventType" = 'conversion';

CREATE INDEX IF NOT EXISTS "idx_banner_analytics_events_consent" 
ON "banner_analytics_events"("consentGiven", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_banner_user_sessions_visitor" 
ON "banner_user_sessions"("visitorId", "firstSeen");

CREATE INDEX IF NOT EXISTS "idx_banner_user_sessions_session" 
ON "banner_user_sessions"("sessionId");

-- Create unique constraint for daily summaries
CREATE UNIQUE INDEX IF NOT EXISTS "banner_performance_summaries_daily_unique" 
ON "banner_performance_summaries"("bannerId", "date") WHERE "hour" IS NULL;

-- Create unique constraint for hourly summaries
CREATE UNIQUE INDEX IF NOT EXISTS "banner_performance_summaries_hourly_unique" 
ON "banner_performance_summaries"("bannerId", "date", "hour") WHERE "hour" IS NOT NULL;

-- Create initial partitions for current and next month
DO $$
DECLARE
    current_month_start DATE;
    next_month_start DATE;
    current_month_end DATE;
    next_month_end DATE;
BEGIN
    current_month_start := DATE_TRUNC('month', CURRENT_DATE);
    next_month_start := current_month_start + INTERVAL '1 month';
    current_month_end := next_month_start;
    next_month_end := next_month_start + INTERVAL '1 month';
    
    -- Create partition for current month
    EXECUTE format('CREATE TABLE IF NOT EXISTS banner_analytics_events_%s PARTITION OF banner_analytics_events FOR VALUES FROM (%L) TO (%L)',
                   TO_CHAR(current_month_start, 'YYYY_MM'),
                   current_month_start,
                   current_month_end);
    
    -- Create partition for next month
    EXECUTE format('CREATE TABLE IF NOT EXISTS banner_analytics_events_%s PARTITION OF banner_analytics_events FOR VALUES FROM (%L) TO (%L)',
                   TO_CHAR(next_month_start, 'YYYY_MM'),
                   next_month_start,
                   next_month_end);
END $$;
