# Comprehensive Banner Analytics & Statistics System Architecture

## Executive Summary

This document outlines a comprehensive, scalable, and privacy-compliant banner analytics system for the kentkonut-backend platform. The system is designed to provide real-time insights into banner performance while maintaining optimal page load speeds and adhering to modern privacy regulations.

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client-Side   │    │   API Gateway    │    │   Database      │
│   Tracking      │───▶│   & Processing   │───▶│   Layer         │
│   (JavaScript)  │    │   (Next.js API)  │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Events   │    │   Data           │    │   Analytics     │
│   Collection    │    │   Aggregation    │    │   Dashboard     │
│   (Non-blocking)│    │   & Validation   │    │   (React UI)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 1.2 Data Flow Architecture

```
User Interaction → Event Capture → Validation → Storage → Aggregation → Visualization
      ↓               ↓              ↓           ↓           ↓            ↓
   Click/View    JavaScript     API Layer   Raw Events   Summary     Dashboard
   Detection     Tracking       Validation   Table        Tables      Components
```

### 1.3 Core Components

1. **Event Collection Layer**: Client-side JavaScript for non-intrusive data capture
2. **API Processing Layer**: Server-side validation, enrichment, and storage
3. **Data Storage Layer**: Optimized database schema for real-time and historical data
4. **Aggregation Engine**: Batch processing for performance summaries
5. **Analytics Dashboard**: React-based visualization interface
6. **Privacy Management**: GDPR-compliant consent and data handling

## 2. Enhanced Database Schema Design

### 2.1 Core Analytics Tables

#### Banner Analytics Events (Raw Data)
```sql
CREATE TABLE banner_analytics_events (
    id BIGSERIAL PRIMARY KEY,
    banner_id INTEGER NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
    
    -- Session & User Tracking
    session_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64), -- Hashed user identifier
    visitor_id VARCHAR(64) NOT NULL, -- Anonymous visitor tracking
    
    -- Event Details
    event_type VARCHAR(20) NOT NULL, -- 'impression', 'view', 'click', 'conversion', 'bounce'
    event_timestamp TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Technical Context
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT NOT NULL,
    
    -- Device & Browser
    device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
    browser_name VARCHAR(50),
    browser_version VARCHAR(20),
    os_name VARCHAR(50),
    os_version VARCHAR(20),
    screen_resolution VARCHAR(20), -- '1920x1080'
    viewport_size VARCHAR(20), -- '1200x800'
    
    -- Geographic Data
    country_code CHAR(2),
    country_name VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Interaction Metrics
    engagement_duration INTEGER DEFAULT 0, -- milliseconds
    scroll_depth INTEGER DEFAULT 0, -- percentage (0-100)
    click_position JSONB, -- {x: number, y: number}
    viewport_position JSONB, -- {top: number, left: number}
    
    -- Conversion Tracking
    conversion_type VARCHAR(50),
    conversion_value DECIMAL(10,2),
    conversion_currency CHAR(3) DEFAULT 'TRY',
    
    -- Privacy & Compliance
    consent_given BOOLEAN DEFAULT false,
    data_processing_consent BOOLEAN DEFAULT false,
    
    -- Additional Context
    campaign_id VARCHAR(100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP(3),
    
    -- Constraints
    CONSTRAINT valid_event_type CHECK (event_type IN ('impression', 'view', 'click', 'conversion', 'bounce', 'engagement')),
    CONSTRAINT valid_device_type CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
    CONSTRAINT valid_scroll_depth CHECK (scroll_depth >= 0 AND scroll_depth <= 100)
);
```

#### Performance Summaries (Aggregated Data)
```sql
CREATE TABLE banner_performance_summaries (
    id BIGSERIAL PRIMARY KEY,
    banner_id INTEGER NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
    
    -- Time Dimensions
    date DATE NOT NULL,
    hour INTEGER, -- 0-23 for hourly summaries, NULL for daily
    week_of_year INTEGER,
    month INTEGER,
    quarter INTEGER,
    year INTEGER,
    
    -- Core Metrics
    impressions BIGINT DEFAULT 0,
    unique_impressions BIGINT DEFAULT 0,
    views BIGINT DEFAULT 0,
    unique_views BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    unique_clicks BIGINT DEFAULT 0,
    conversions BIGINT DEFAULT 0,
    bounces BIGINT DEFAULT 0,
    
    -- Calculated Metrics
    click_through_rate DECIMAL(8,4) DEFAULT 0, -- CTR percentage
    conversion_rate DECIMAL(8,4) DEFAULT 0, -- Conversion percentage
    bounce_rate DECIMAL(8,4) DEFAULT 0, -- Bounce percentage
    view_rate DECIMAL(8,4) DEFAULT 0, -- Views/Impressions
    
    -- Engagement Metrics
    total_engagement_time BIGINT DEFAULT 0, -- Total milliseconds
    avg_engagement_time DECIMAL(10,2) DEFAULT 0, -- Average milliseconds
    max_engagement_time INTEGER DEFAULT 0,
    avg_scroll_depth DECIMAL(5,2) DEFAULT 0,
    
    -- Revenue Metrics
    total_conversion_value DECIMAL(12,2) DEFAULT 0,
    avg_conversion_value DECIMAL(10,2) DEFAULT 0,
    revenue_per_impression DECIMAL(10,4) DEFAULT 0, -- RPI
    revenue_per_click DECIMAL(10,2) DEFAULT 0, -- RPC
    
    -- Breakdown Data (JSON for flexibility)
    device_breakdown JSONB, -- {"desktop": 150, "mobile": 200, "tablet": 50}
    browser_breakdown JSONB,
    country_breakdown JSONB,
    referrer_breakdown JSONB,
    hour_breakdown JSONB, -- For daily summaries
    
    -- Quality Metrics
    data_quality_score DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0
    sample_size INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraints
    UNIQUE(banner_id, date, hour),
    
    -- Constraints
    CONSTRAINT valid_hour CHECK (hour IS NULL OR (hour >= 0 AND hour <= 23)),
    CONSTRAINT valid_rates CHECK (
        click_through_rate >= 0 AND click_through_rate <= 100 AND
        conversion_rate >= 0 AND conversion_rate <= 100 AND
        bounce_rate >= 0 AND bounce_rate <= 100 AND
        view_rate >= 0 AND view_rate <= 100
    )
);
```

#### User Sessions (Privacy-Compliant)
```sql
CREATE TABLE banner_user_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL UNIQUE,
    visitor_id VARCHAR(64) NOT NULL,
    
    -- Session Context
    first_seen TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_duration INTEGER DEFAULT 0, -- seconds
    page_views INTEGER DEFAULT 0,
    banner_interactions INTEGER DEFAULT 0,
    
    -- Technical Details
    ip_address_hash VARCHAR(64), -- Hashed for privacy
    user_agent_hash VARCHAR(64), -- Hashed for privacy
    device_fingerprint VARCHAR(64), -- For bot detection
    
    -- Geographic (Anonymized)
    country_code CHAR(2),
    region_code VARCHAR(10),
    
    -- Privacy & Consent
    consent_timestamp TIMESTAMP(3),
    consent_version VARCHAR(10),
    data_retention_until DATE,
    
    -- Quality Indicators
    is_bot BOOLEAN DEFAULT false,
    quality_score DECIMAL(3,2) DEFAULT 1.0,
    
    -- Metadata
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Optimized Indexing Strategy

```sql
-- Primary Performance Indexes
CREATE INDEX CONCURRENTLY idx_banner_analytics_events_banner_timestamp 
ON banner_analytics_events(banner_id, event_timestamp DESC);

CREATE INDEX CONCURRENTLY idx_banner_analytics_events_session 
ON banner_analytics_events(session_id, event_timestamp);

CREATE INDEX CONCURRENTLY idx_banner_analytics_events_type_timestamp 
ON banner_analytics_events(event_type, event_timestamp DESC);

-- Geographic and Device Analysis
CREATE INDEX CONCURRENTLY idx_banner_analytics_events_country 
ON banner_analytics_events(country_code, event_timestamp DESC);

CREATE INDEX CONCURRENTLY idx_banner_analytics_events_device 
ON banner_analytics_events(device_type, browser_name, event_timestamp DESC);

-- Performance Summary Indexes
CREATE INDEX CONCURRENTLY idx_banner_performance_summaries_banner_date 
ON banner_performance_summaries(banner_id, date DESC, hour);

CREATE INDEX CONCURRENTLY idx_banner_performance_summaries_date_range 
ON banner_performance_summaries(date, hour) WHERE hour IS NOT NULL;

-- Conversion Tracking
CREATE INDEX CONCURRENTLY idx_banner_analytics_events_conversions 
ON banner_analytics_events(banner_id, event_timestamp) 
WHERE event_type = 'conversion';

-- Privacy and Compliance
CREATE INDEX CONCURRENTLY idx_banner_analytics_events_consent 
ON banner_analytics_events(consent_given, created_at);

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY idx_banner_analytics_events_recent 
ON banner_analytics_events(banner_id, event_type, event_timestamp DESC) 
WHERE event_timestamp > CURRENT_TIMESTAMP - INTERVAL '30 days';
```

### 2.3 Data Partitioning Strategy

```sql
-- Partition by month for better performance
CREATE TABLE banner_analytics_events_y2025m01 PARTITION OF banner_analytics_events
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE banner_analytics_events_y2025m02 PARTITION OF banner_analytics_events
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Automated partition creation function
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_y' || EXTRACT(year FROM start_date) || 'm' || LPAD(EXTRACT(month FROM start_date)::text, 2, '0');
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format('CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

## 3. API Architecture & Endpoints

### 3.1 Data Collection APIs

#### Event Tracking Endpoint
```typescript
// POST /api/analytics/track
interface TrackingRequest {
  bannerId: number;
  eventType: 'impression' | 'view' | 'click' | 'conversion' | 'bounce' | 'engagement';
  sessionId: string;
  visitorId: string;
  timestamp: string; // ISO 8601
  
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

interface TrackingResponse {
  success: boolean;
  eventId?: string;
  error?: string;
  debugInfo?: {
    processed: boolean;
    enriched: boolean;
    stored: boolean;
  };
}
```

#### Batch Tracking Endpoint
```typescript
// POST /api/analytics/track/batch
interface BatchTrackingRequest {
  events: TrackingRequest[];
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
}
```

### 3.2 Analytics Reporting APIs

#### Banner Performance Summary
```typescript
// GET /api/analytics/banners/{bannerId}/performance
interface PerformanceQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[]; // Filter specific metrics
  groupBy?: 'device' | 'country' | 'browser' | 'referrer';
  timezone?: string; // For proper time grouping
}

interface PerformanceResponse {
  success: boolean;
  data: {
    summary: {
      totalImpressions: number;
      totalViews: number;
      totalClicks: number;
      totalConversions: number;
      clickThroughRate: number;
      conversionRate: number;
      bounceRate: number;
      avgEngagementTime: number;
      totalRevenue: number;
    };
    timeSeries: Array<{
      timestamp: string;
      impressions: number;
      views: number;
      clicks: number;
      conversions: number;
      ctr: number;
      conversionRate: number;
      revenue: number;
    }>;
    breakdowns: {
      devices?: Record<string, number>;
      countries?: Record<string, number>;
      browsers?: Record<string, number>;
      referrers?: Record<string, number>;
    };
    metadata: {
      dataQuality: number;
      sampleSize: number;
      lastUpdated: string;
    };
  };
}
```

## 4. Client-Side Tracking Implementation

### 4.1 High-Performance Tracking Library

```typescript
// lib/analytics/BannerTracker.ts
class BannerTracker {
  private sessionId: string;
  private visitorId: string;
  private eventQueue: TrackingEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private consentGiven = false;

  constructor(config: TrackerConfig) {
    this.sessionId = this.generateSessionId();
    this.visitorId = this.getOrCreateVisitorId();
    this.initializeTracker(config);
  }

  // Initialize tracker with consent check
  private async initializeTracker(config: TrackerConfig) {
    // Check for existing consent
    this.consentGiven = this.checkConsent();

    // Initialize device detection
    await this.detectDevice();

    // Setup intersection observers for view tracking
    this.setupViewTracking();

    // Setup performance monitoring
    this.setupPerformanceTracking();

    this.isInitialized = true;
  }

  // Track banner impression (when banner loads)
  trackImpression(bannerId: number, element: HTMLElement) {
    if (!this.consentGiven) return;

    const event: TrackingEvent = {
      bannerId,
      eventType: 'impression',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      consentGiven: this.consentGiven,
      dataProcessingConsent: this.consentGiven
    };

    this.queueEvent(event);
    this.setupElementTracking(bannerId, element);
  }

  // Track banner view (when banner enters viewport)
  private setupViewTracking() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const bannerId = parseInt(entry.target.getAttribute('data-banner-id') || '0');

          if (entry.isIntersecting) {
            this.startViewTracking(bannerId, entry.target as HTMLElement);
          } else {
            this.endViewTracking(bannerId);
          }
        });
      },
      {
        threshold: 0.5, // 50% visibility required
        rootMargin: '0px'
      }
    );

    // Observe all banner elements
    document.querySelectorAll('[data-banner-id]').forEach(el => {
      observer.observe(el);
    });
  }

  // Start tracking view engagement
  private startViewTracking(bannerId: number, element: HTMLElement) {
    const startTime = Date.now();
    const startScrollPosition = window.pageYOffset;

    // Store tracking data
    element.setAttribute('data-view-start', startTime.toString());
    element.setAttribute('data-scroll-start', startScrollPosition.toString());

    // Track view event
    const viewEvent: TrackingEvent = {
      bannerId,
      eventType: 'view',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      viewportPosition: this.getViewportPosition(element),
      consentGiven: this.consentGiven,
      dataProcessingConsent: this.consentGiven
    };

    this.queueEvent(viewEvent);
  }

  // End view tracking and calculate engagement
  private endViewTracking(bannerId: number) {
    const element = document.querySelector(`[data-banner-id="${bannerId}"]`) as HTMLElement;
    if (!element) return;

    const startTime = parseInt(element.getAttribute('data-view-start') || '0');
    const startScroll = parseInt(element.getAttribute('data-scroll-start') || '0');

    if (startTime === 0) return;

    const engagementDuration = Date.now() - startTime;
    const scrollDepth = this.calculateScrollDepth(startScroll);

    // Only track meaningful engagement (>1 second)
    if (engagementDuration > 1000) {
      const engagementEvent: TrackingEvent = {
        bannerId,
        eventType: 'engagement',
        sessionId: this.sessionId,
        visitorId: this.visitorId,
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href,
        engagementDuration,
        scrollDepth,
        consentGiven: this.consentGiven,
        dataProcessingConsent: this.consentGiven
      };

      this.queueEvent(engagementEvent);
    }

    // Clean up tracking attributes
    element.removeAttribute('data-view-start');
    element.removeAttribute('data-scroll-start');
  }

  // Track banner click
  trackClick(bannerId: number, event: MouseEvent) {
    if (!this.consentGiven) return;

    const clickPosition = {
      x: event.offsetX,
      y: event.offsetY
    };

    const clickEvent: TrackingEvent = {
      bannerId,
      eventType: 'click',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      clickPosition,
      consentGiven: this.consentGiven,
      dataProcessingConsent: this.consentGiven
    };

    this.queueEvent(clickEvent);

    // Send immediately for click events (important for attribution)
    this.flushEvents();
  }

  // Track conversion
  trackConversion(bannerId: number, conversionData: ConversionData) {
    if (!this.consentGiven) return;

    const conversionEvent: TrackingEvent = {
      bannerId,
      eventType: 'conversion',
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      conversionType: conversionData.type,
      conversionValue: conversionData.value,
      campaignId: conversionData.campaignId,
      consentGiven: this.consentGiven,
      dataProcessingConsent: this.consentGiven
    };

    this.queueEvent(conversionEvent);
    this.flushEvents(); // Send immediately
  }

  // Queue event for batch processing
  private queueEvent(event: TrackingEvent) {
    this.eventQueue.push(event);

    // Auto-flush when queue gets large
    if (this.eventQueue.length >= 10) {
      this.flushEvents();
    } else {
      // Schedule batch send
      this.scheduleBatchSend();
    }
  }

  // Schedule batch send
  private scheduleBatchSend() {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.flushEvents();
    }, 5000); // Send every 5 seconds
  }

  // Send queued events
  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      await this.sendEvents(events);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
      // Re-queue events for retry (with limit)
      if (events.length < 50) {
        this.eventQueue.unshift(...events);
      }
    }
  }

  // Send events to API
  private async sendEvents(events: TrackingEvent[]) {
    const endpoint = events.length === 1 ? '/api/analytics/track' : '/api/analytics/track/batch';
    const payload = events.length === 1 ? events[0] : {
      events,
      sessionId: this.sessionId,
      batchId: this.generateBatchId(),
      timestamp: new Date().toISOString()
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      keepalive: true // Ensure delivery even if page unloads
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    return response.json();
  }

  // Utility methods
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOrCreateVisitorId(): string {
    const stored = localStorage.getItem('banner_visitor_id');
    if (stored) return stored;

    const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('banner_visitor_id', visitorId);
    return visitorId;
  }

  private checkConsent(): boolean {
    // Check for GDPR consent
    const consent = localStorage.getItem('analytics_consent');
    return consent === 'granted';
  }

  private calculateScrollDepth(startScroll: number): number {
    const currentScroll = window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = Math.max(0, currentScroll - startScroll);
    return Math.min(100, Math.round((scrolled / documentHeight) * 100));
  }

  private getViewportPosition(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left
    };
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}

// Initialize global tracker
let globalTracker: BannerTracker | null = null;

export function initializeBannerTracking(config: TrackerConfig = {}) {
  if (typeof window === 'undefined') return null;

  if (!globalTracker) {
    globalTracker = new BannerTracker(config);
  }

  return globalTracker;
}

export function getBannerTracker(): BannerTracker | null {
  return globalTracker;
}
```

### 4.2 React Banner Component with Tracking

```typescript
// components/public/TrackedBanner.tsx
import React, { useEffect, useRef } from 'react';
import { getBannerTracker } from '@/lib/analytics/BannerTracker';

interface TrackedBannerProps {
  banner: {
    id: number;
    title: string;
    imageUrl: string;
    altText?: string;
    link?: string;
  };
  campaignId?: string;
  className?: string;
}

export function TrackedBanner({ banner, campaignId, className }: TrackedBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const tracker = getBannerTracker();

  useEffect(() => {
    if (!tracker || !bannerRef.current) return;

    // Track impression when component mounts
    tracker.trackImpression(banner.id, bannerRef.current);

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [banner.id, tracker]);

  const handleClick = (event: React.MouseEvent) => {
    if (!tracker) return;

    // Track click
    tracker.trackClick(banner.id, event.nativeEvent);

    // Handle navigation
    if (banner.link) {
      // Allow default navigation or handle programmatically
      if (event.ctrlKey || event.metaKey) {
        // Let browser handle new tab
        return;
      }

      // Optional: Add delay for tracking
      event.preventDefault();
      setTimeout(() => {
        window.location.href = banner.link!;
      }, 100);
    }
  };

  return (
    <div
      ref={bannerRef}
      data-banner-id={banner.id}
      data-campaign-id={campaignId}
      className={`banner-container ${className || ''}`}
      onClick={handleClick}
      style={{ cursor: banner.link ? 'pointer' : 'default' }}
    >
      <img
        src={banner.imageUrl}
        alt={banner.altText || banner.title}
        className="banner-image"
        loading="lazy"
      />
    </div>
  );
}
```

## 5. Analytics Dashboard Components

### 5.1 Performance Overview Dashboard

```typescript
// components/analytics/BannerPerformanceDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Eye, MousePointer, Target, Clock, Users, DollarSign } from 'lucide-react';

interface PerformanceMetrics {
  impressions: number;
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  bounceRate: number;
  avgEngagementTime: number;
  revenue: number;
  uniqueUsers: number;
}

interface DashboardProps {
  bannerId: number;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

export function BannerPerformanceDashboard({ bannerId, dateRange, onDateRangeChange }: DashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [previousMetrics, setPreviousMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [bannerId, dateRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [currentResponse, previousResponse] = await Promise.all([
        fetch(`/api/analytics/banners/${bannerId}/performance?period=${dateRange}`),
        fetch(`/api/analytics/banners/${bannerId}/performance?period=${getPreviousPeriod(dateRange)}`)
      ]);

      const currentData = await currentResponse.json();
      const previousData = await previousResponse.json();

      if (currentData.success) {
        setMetrics(currentData.data.summary);
      }
      if (previousData.success) {
        setPreviousMetrics(previousData.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = milliseconds / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  const MetricCard = ({
    title,
    value,
    previousValue,
    icon: Icon,
    formatter = formatNumber,
    suffix = ''
  }: {
    title: string;
    value: number;
    previousValue?: number;
    icon: React.ElementType;
    formatter?: (value: number) => string;
    suffix?: string;
  }) => {
    const change = previousValue !== undefined ? calculateChange(value, previousValue) : null;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatter(value)}{suffix}
          </div>
          {change && (
            <div className="flex items-center text-xs text-muted-foreground">
              {change.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={change.isPositive ? 'text-green-500' : 'text-red-500'}>
                {change.value.toFixed(1)}%
              </span>
              <span className="ml-1">vs previous period</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Overview</h2>
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Impressions"
          value={metrics.impressions}
          previousValue={previousMetrics?.impressions}
          icon={Eye}
        />
        <MetricCard
          title="Clicks"
          value={metrics.clicks}
          previousValue={previousMetrics?.clicks}
          icon={MousePointer}
        />
        <MetricCard
          title="Conversions"
          value={metrics.conversions}
          previousValue={previousMetrics?.conversions}
          icon={Target}
        />
        <MetricCard
          title="Revenue"
          value={metrics.revenue}
          previousValue={previousMetrics?.revenue}
          icon={DollarSign}
          formatter={formatCurrency}
        />
        <MetricCard
          title="Click-Through Rate"
          value={metrics.ctr}
          previousValue={previousMetrics?.ctr}
          icon={TrendingUp}
          formatter={(v) => v.toFixed(2)}
          suffix="%"
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics.conversionRate}
          previousValue={previousMetrics?.conversionRate}
          icon={Target}
          formatter={(v) => v.toFixed(2)}
          suffix="%"
        />
        <MetricCard
          title="Avg. Engagement"
          value={metrics.avgEngagementTime}
          previousValue={previousMetrics?.avgEngagementTime}
          icon={Clock}
          formatter={formatTime}
        />
        <MetricCard
          title="Unique Users"
          value={metrics.uniqueUsers}
          previousValue={previousMetrics?.uniqueUsers}
          icon={Users}
        />
      </div>

      {/* Performance Quality Indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Score</span>
                <span>{calculatePerformanceScore(metrics)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculatePerformanceScore(metrics)}%` }}
                ></div>
              </div>
            </div>
            <Badge variant={getPerformanceBadgeVariant(calculatePerformanceScore(metrics))}>
              {getPerformanceLabel(calculatePerformanceScore(metrics))}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getPreviousPeriod(period: string): string {
  // Implementation to calculate previous period
  const periodMap: Record<string, string> = {
    '24h': '48h',
    '7d': '14d',
    '30d': '60d',
    '90d': '180d'
  };
  return periodMap[period] || '14d';
}

function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  // Weighted performance score calculation
  const ctrScore = Math.min(metrics.ctr * 10, 100); // CTR weight: 10x
  const conversionScore = Math.min(metrics.conversionRate * 5, 100); // Conversion weight: 5x
  const engagementScore = Math.min((metrics.avgEngagementTime / 1000) * 2, 100); // Engagement weight: 2x
  const bounceScore = Math.max(100 - metrics.bounceRate, 0); // Lower bounce = higher score

  return Math.round((ctrScore * 0.3 + conversionScore * 0.3 + engagementScore * 0.2 + bounceScore * 0.2));
}

function getPerformanceLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Needs Improvement';
}

function getPerformanceBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 60) return 'default';
  if (score >= 40) return 'secondary';
  return 'destructive';
}
```

## 6. Performance Optimization Strategies

### 6.1 Database Optimization

#### Query Optimization
```sql
-- Materialized views for common aggregations
CREATE MATERIALIZED VIEW banner_daily_stats AS
SELECT
    banner_id,
    DATE(event_timestamp) as date,
    COUNT(*) FILTER (WHERE event_type = 'impression') as impressions,
    COUNT(*) FILTER (WHERE event_type = 'view') as views,
    COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE event_type = 'conversion') as conversions,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(engagement_duration) FILTER (WHERE engagement_duration > 0) as avg_engagement,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY engagement_duration) as median_engagement
FROM banner_analytics_events
WHERE event_timestamp >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY banner_id, DATE(event_timestamp);

-- Refresh materialized view daily
CREATE OR REPLACE FUNCTION refresh_banner_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY banner_daily_stats;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh
SELECT cron.schedule('refresh-banner-stats', '0 1 * * *', 'SELECT refresh_banner_stats();');
```

#### Connection Pooling Configuration
```typescript
// lib/db/analytics-pool.ts
import { Pool } from 'pg';

export const analyticsPool = new Pool({
  connectionString: process.env.ANALYTICS_DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Read-only replica for analytics queries
  application_name: 'banner_analytics_readonly'
});

// Separate pool for write operations
export const analyticsWritePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Fewer connections for writes
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  application_name: 'banner_analytics_write'
});
```

### 6.2 Caching Strategy

#### Redis Caching Layer
```typescript
// lib/cache/analytics-cache.ts
import Redis from 'ioredis';

class AnalyticsCache {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  // Cache performance summaries
  async cachePerformanceSummary(bannerId: number, period: string, data: any) {
    const key = `banner:${bannerId}:performance:${period}`;
    await this.redis.setex(key, 300, JSON.stringify(data)); // 5 minute cache
  }

  async getPerformanceSummary(bannerId: number, period: string) {
    const key = `banner:${bannerId}:performance:${period}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache real-time metrics
  async incrementMetric(bannerId: number, metric: string, value: number = 1) {
    const key = `banner:${bannerId}:realtime:${metric}`;
    await this.redis.incrby(key, value);
    await this.redis.expire(key, 3600); // 1 hour expiry
  }

  async getRealtimeMetrics(bannerId: number) {
    const keys = await this.redis.keys(`banner:${bannerId}:realtime:*`);
    const pipeline = this.redis.pipeline();

    keys.forEach(key => pipeline.get(key));
    const results = await pipeline.exec();

    const metrics: Record<string, number> = {};
    keys.forEach((key, index) => {
      const metric = key.split(':').pop()!;
      metrics[metric] = parseInt(results![index][1] as string) || 0;
    });

    return metrics;
  }
}

export const analyticsCache = new AnalyticsCache();
```

### 6.3 Asynchronous Processing

#### Event Queue System
```typescript
// lib/queue/analytics-queue.ts
import Bull from 'bull';
import { analyticsWritePool } from '@/lib/db/analytics-pool';

interface AnalyticsJob {
  events: TrackingEvent[];
  batchId: string;
  timestamp: string;
}

export const analyticsQueue = new Bull<AnalyticsJob>('analytics processing', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Process analytics events
analyticsQueue.process('process-events', 10, async (job) => {
  const { events, batchId } = job.data;

  try {
    await processAnalyticsEvents(events);

    // Update real-time cache
    for (const event of events) {
      await analyticsCache.incrementMetric(event.bannerId, event.eventType);
    }

    job.progress(100);
    return { processed: events.length, batchId };
  } catch (error) {
    console.error('Analytics processing failed:', error);
    throw error;
  }
});

async function processAnalyticsEvents(events: TrackingEvent[]) {
  const client = await analyticsWritePool.connect();

  try {
    await client.query('BEGIN');

    for (const event of events) {
      // Enrich event data
      const enrichedEvent = await enrichEventData(event);

      // Insert into database
      await insertAnalyticsEvent(client, enrichedEvent);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## 7. Privacy Compliance & GDPR

### 7.1 Consent Management

```typescript
// lib/privacy/consent-manager.ts
class ConsentManager {
  private consentKey = 'banner_analytics_consent';
  private consentVersion = '1.0';

  // Check if user has given consent
  hasConsent(): boolean {
    if (typeof window === 'undefined') return false;

    const consent = localStorage.getItem(this.consentKey);
    if (!consent) return false;

    try {
      const consentData = JSON.parse(consent);
      return consentData.granted && consentData.version === this.consentVersion;
    } catch {
      return false;
    }
  }

  // Request consent from user
  async requestConsent(): Promise<boolean> {
    return new Promise((resolve) => {
      // Show consent banner/modal
      this.showConsentBanner((granted: boolean) => {
        this.setConsent(granted);
        resolve(granted);
      });
    });
  }

  // Set consent status
  setConsent(granted: boolean) {
    const consentData = {
      granted,
      version: this.consentVersion,
      timestamp: new Date().toISOString(),
      purposes: {
        analytics: granted,
        performance: granted,
        marketing: false // Separate consent for marketing
      }
    };

    localStorage.setItem(this.consentKey, JSON.stringify(consentData));

    // Trigger consent change event
    window.dispatchEvent(new CustomEvent('consentChanged', {
      detail: consentData
    }));
  }

  // Get consent details
  getConsentDetails() {
    const consent = localStorage.getItem(this.consentKey);
    return consent ? JSON.parse(consent) : null;
  }

  // Revoke consent
  revokeConsent() {
    this.setConsent(false);

    // Clear existing analytics data
    this.clearAnalyticsData();
  }

  private showConsentBanner(callback: (granted: boolean) => void) {
    // Implementation for consent UI
    // This would show a banner or modal asking for consent
    const banner = document.createElement('div');
    banner.innerHTML = `
      <div class="consent-banner">
        <p>We use analytics to improve your experience. Do you consent to analytics tracking?</p>
        <button id="consent-accept">Accept</button>
        <button id="consent-decline">Decline</button>
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector('#consent-accept')?.addEventListener('click', () => {
      document.body.removeChild(banner);
      callback(true);
    });

    banner.querySelector('#consent-decline')?.addEventListener('click', () => {
      document.body.removeChild(banner);
      callback(false);
    });
  }

  private clearAnalyticsData() {
    // Clear local storage analytics data
    localStorage.removeItem('banner_visitor_id');

    // Clear any cached analytics data
    // This would also trigger server-side data deletion if required
  }
}

export const consentManager = new ConsentManager();
```

### 7.2 Data Anonymization

```typescript
// lib/privacy/data-anonymization.ts
import crypto from 'crypto';

export class DataAnonymizer {
  private static readonly SALT = process.env.ANALYTICS_SALT || 'default-salt';

  // Hash IP addresses for privacy
  static hashIP(ip: string): string {
    return crypto
      .createHash('sha256')
      .update(ip + this.SALT)
      .digest('hex')
      .substring(0, 16);
  }

  // Hash user agents
  static hashUserAgent(userAgent: string): string {
    return crypto
      .createHash('sha256')
      .update(userAgent + this.SALT)
      .digest('hex')
      .substring(0, 16);
  }

  // Anonymize geographic data (keep country/region, remove city)
  static anonymizeLocation(location: { country?: string; region?: string; city?: string }) {
    return {
      country: location.country,
      region: location.region,
      city: undefined // Remove city for privacy
    };
  }

  // Generate anonymous visitor ID
  static generateAnonymousId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // Clean sensitive data from events
  static sanitizeEvent(event: any): any {
    const sanitized = { ...event };

    // Remove or hash sensitive fields
    if (sanitized.ipAddress) {
      sanitized.ipAddressHash = this.hashIP(sanitized.ipAddress);
      delete sanitized.ipAddress;
    }

    if (sanitized.userAgent) {
      sanitized.userAgentHash = this.hashUserAgent(sanitized.userAgent);
      delete sanitized.userAgent;
    }

    // Remove exact referrer, keep domain only
    if (sanitized.referrer) {
      try {
        const url = new URL(sanitized.referrer);
        sanitized.referrerDomain = url.hostname;
        delete sanitized.referrer;
      } catch {
        delete sanitized.referrer;
      }
    }

    return sanitized;
  }
}
```

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- ✅ Enhanced database schema implementation
- ✅ Basic API endpoints for data collection
- ✅ Client-side tracking library
- ✅ Consent management system
- ✅ Basic performance dashboard

### Phase 2: Advanced Analytics (Week 3-4)
- 📊 Real-time analytics dashboard
- 📈 Advanced visualization components
- 🔍 Detailed breakdown reports
- 📱 Device and geographic analytics
- 🎯 Conversion funnel analysis

### Phase 3: Optimization (Week 5-6)
- ⚡ Performance optimization
- 🗄️ Data archiving and cleanup
- 📊 Materialized views and caching
- 🔄 Asynchronous processing
- 📈 A/B testing framework

### Phase 4: Advanced Features (Week 7-8)
- 🤖 Machine learning insights
- 📧 Automated reporting
- 🔔 Performance alerts
- 📊 Custom dashboard builder
- 🔗 Third-party integrations

## 9. Best Practices Summary

### Performance
- ✅ Non-blocking client-side tracking
- ✅ Batch processing for efficiency
- ✅ Database partitioning and indexing
- ✅ Redis caching for real-time data
- ✅ Asynchronous event processing

### Privacy
- ✅ GDPR-compliant consent management
- ✅ Data anonymization and hashing
- ✅ Configurable data retention
- ✅ User data deletion capabilities
- ✅ Transparent privacy policies

### Scalability
- ✅ Horizontal database scaling
- ✅ Queue-based event processing
- ✅ CDN for tracking scripts
- ✅ Load balancing for APIs
- ✅ Microservice architecture ready

### Reliability
- ✅ Error handling and retry logic
- ✅ Data validation and sanitization
- ✅ Monitoring and alerting
- ✅ Backup and disaster recovery
- ✅ Graceful degradation

This comprehensive analytics system provides enterprise-grade banner tracking while maintaining optimal performance and privacy compliance.
