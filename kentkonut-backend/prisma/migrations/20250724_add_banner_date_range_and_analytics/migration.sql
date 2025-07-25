-- Add date range fields to banners table
ALTER TABLE "banners" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "banners" ADD COLUMN "endDate" TIMESTAMP(3);

-- Add analytics fields to banners table
ALTER TABLE "banners" ADD COLUMN "impressionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "banners" ADD COLUMN "uniqueViewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "banners" ADD COLUMN "conversionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "banners" ADD COLUMN "bounceCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "banners" ADD COLUMN "avgEngagementTime" INTEGER NOT NULL DEFAULT 0; -- in seconds

-- Create enhanced banner analytics table
CREATE TABLE "banner_analytics" (
    "id" SERIAL NOT NULL,
    "bannerId" INTEGER NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "deviceType" TEXT, -- 'desktop', 'mobile', 'tablet'
    "browserName" TEXT,
    "osName" TEXT,
    "country" TEXT,
    "city" TEXT,
    "eventType" TEXT NOT NULL, -- 'impression', 'view', 'click', 'conversion', 'bounce'
    "eventData" JSONB, -- Additional event-specific data
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "engagementTime" INTEGER DEFAULT 0, -- Time spent viewing banner in seconds
    "scrollDepth" INTEGER DEFAULT 0, -- Scroll depth percentage when banner was viewed
    "clickPosition" JSONB, -- X,Y coordinates of click if applicable
    "conversionValue" DECIMAL(10,2), -- Monetary value if conversion tracking
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banner_analytics_pkey" PRIMARY KEY ("id")
);

-- Create banner performance summary table for faster queries
CREATE TABLE "banner_performance_summary" (
    "id" SERIAL NOT NULL,
    "bannerId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "hour" INTEGER, -- 0-23 for hourly breakdown, NULL for daily summary
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "bounces" INTEGER NOT NULL DEFAULT 0,
    "totalEngagementTime" INTEGER NOT NULL DEFAULT 0, -- Total seconds
    "avgEngagementTime" DECIMAL(10,2) NOT NULL DEFAULT 0, -- Average seconds
    "clickThroughRate" DECIMAL(5,4) NOT NULL DEFAULT 0, -- CTR percentage
    "conversionRate" DECIMAL(5,4) NOT NULL DEFAULT 0, -- Conversion percentage
    "bounceRate" DECIMAL(5,4) NOT NULL DEFAULT 0, -- Bounce percentage
    "topReferrers" JSONB, -- Top 5 referrer URLs
    "topDevices" JSONB, -- Device type breakdown
    "topCountries" JSONB, -- Country breakdown
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banner_performance_summary_pkey" PRIMARY KEY ("id")
);

-- Create banner A/B testing table
CREATE TABLE "banner_ab_tests" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bannerGroupId" INTEGER NOT NULL,
    "variantA_bannerId" INTEGER NOT NULL,
    "variantB_bannerId" INTEGER NOT NULL,
    "trafficSplit" INTEGER NOT NULL DEFAULT 50, -- Percentage for variant A (0-100)
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "winnerBannerId" INTEGER, -- Determined winner
    "confidenceLevel" DECIMAL(5,2), -- Statistical confidence percentage
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banner_ab_tests_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "banner_analytics" ADD CONSTRAINT "banner_analytics_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "banner_performance_summary" ADD CONSTRAINT "banner_performance_summary_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "banner_ab_tests" ADD CONSTRAINT "banner_ab_tests_bannerGroupId_fkey" FOREIGN KEY ("bannerGroupId") REFERENCES "banner_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "banner_ab_tests" ADD CONSTRAINT "banner_ab_tests_variantA_bannerId_fkey" FOREIGN KEY ("variantA_bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "banner_ab_tests" ADD CONSTRAINT "banner_ab_tests_variantB_bannerId_fkey" FOREIGN KEY ("variantB_bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "banner_ab_tests" ADD CONSTRAINT "banner_ab_tests_winnerBannerId_fkey" FOREIGN KEY ("winnerBannerId") REFERENCES "banners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "banner_analytics_bannerId_idx" ON "banner_analytics"("bannerId");
CREATE INDEX "banner_analytics_eventType_idx" ON "banner_analytics"("eventType");
CREATE INDEX "banner_analytics_timestamp_idx" ON "banner_analytics"("timestamp");
CREATE INDEX "banner_analytics_deviceType_idx" ON "banner_analytics"("deviceType");
CREATE INDEX "banner_analytics_country_idx" ON "banner_analytics"("country");
CREATE INDEX "banner_analytics_sessionId_idx" ON "banner_analytics"("sessionId");

CREATE INDEX "banner_performance_summary_bannerId_idx" ON "banner_performance_summary"("bannerId");
CREATE INDEX "banner_performance_summary_date_idx" ON "banner_performance_summary"("date");
CREATE INDEX "banner_performance_summary_hour_idx" ON "banner_performance_summary"("hour");

CREATE INDEX "banner_ab_tests_bannerGroupId_idx" ON "banner_ab_tests"("bannerGroupId");
CREATE INDEX "banner_ab_tests_isActive_idx" ON "banner_ab_tests"("isActive");
CREATE INDEX "banner_ab_tests_startDate_idx" ON "banner_ab_tests"("startDate");
CREATE INDEX "banner_ab_tests_endDate_idx" ON "banner_ab_tests"("endDate");

CREATE INDEX "banners_startDate_idx" ON "banners"("startDate");
CREATE INDEX "banners_endDate_idx" ON "banners"("endDate");

-- Create unique constraint for daily summaries
CREATE UNIQUE INDEX "banner_performance_summary_daily_unique" ON "banner_performance_summary"("bannerId", "date") WHERE "hour" IS NULL;

-- Create unique constraint for hourly summaries
CREATE UNIQUE INDEX "banner_performance_summary_hourly_unique" ON "banner_performance_summary"("bannerId", "date", "hour") WHERE "hour" IS NOT NULL;
