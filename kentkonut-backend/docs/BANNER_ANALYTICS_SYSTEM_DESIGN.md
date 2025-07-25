# Banner Analytics System Design Document

## Overview
This document outlines the comprehensive banner analytics system for the kentkonut-backend platform, designed to provide detailed insights into banner performance, user behavior, and conversion tracking.

## 1. Analytics Data Structure

### 1.1 Core Metrics Tracked

#### Basic Metrics
- **Impressions**: Total number of times a banner is loaded/displayed
- **Views**: Number of times a banner is actually viewed (in viewport)
- **Clicks**: Number of times a banner is clicked
- **Unique Views**: Number of unique users who viewed the banner
- **Conversions**: Number of desired actions completed after banner interaction

#### Advanced Metrics
- **Click-Through Rate (CTR)**: (Clicks / Views) × 100
- **Conversion Rate**: (Conversions / Clicks) × 100
- **Bounce Rate**: Percentage of users who left immediately after viewing
- **Engagement Time**: Average time users spend viewing the banner
- **Scroll Depth**: How far users scroll when banner is visible

### 1.2 User Behavior Analytics

#### Device & Browser Tracking
- **Device Type**: Desktop, Mobile, Tablet
- **Browser Name**: Chrome, Firefox, Safari, Edge, etc.
- **Operating System**: Windows, macOS, iOS, Android, Linux
- **Screen Resolution**: For responsive design optimization

#### Geographic Analytics
- **Country**: User's country based on IP
- **City**: User's city (if available)
- **Time Zone**: For temporal analysis

#### Session Analytics
- **Session ID**: Unique session identifier
- **User ID**: Registered user identifier (if available)
- **Referrer**: Source website/page that led to banner view
- **Landing Page**: Page where banner was viewed

### 1.3 Interaction Analytics

#### Click Analytics
- **Click Position**: X,Y coordinates of click on banner
- **Click Timestamp**: Exact time of click
- **Time to Click**: Time between view and click
- **Multiple Clicks**: Track if user clicks multiple times

#### Engagement Analytics
- **View Duration**: How long banner was in viewport
- **Scroll Behavior**: User scroll patterns during banner view
- **Hover Time**: Time spent hovering over banner
- **Exit Intent**: Detection of user leaving page

## 2. Database Schema Implementation

### 2.1 Enhanced Banner Table
```sql
-- Added to existing banners table
ALTER TABLE banners ADD COLUMN startDate TIMESTAMP(3);
ALTER TABLE banners ADD COLUMN endDate TIMESTAMP(3);
ALTER TABLE banners ADD COLUMN impressionCount INTEGER DEFAULT 0;
ALTER TABLE banners ADD COLUMN uniqueViewCount INTEGER DEFAULT 0;
ALTER TABLE banners ADD COLUMN conversionCount INTEGER DEFAULT 0;
ALTER TABLE banners ADD COLUMN bounceCount INTEGER DEFAULT 0;
ALTER TABLE banners ADD COLUMN avgEngagementTime INTEGER DEFAULT 0;
```

### 2.2 Detailed Analytics Table
```sql
CREATE TABLE banner_analytics (
  id SERIAL PRIMARY KEY,
  bannerId INTEGER REFERENCES banners(id),
  sessionId TEXT,
  userId TEXT,
  ipAddress TEXT,
  userAgent TEXT,
  referrer TEXT,
  deviceType TEXT,
  browserName TEXT,
  osName TEXT,
  country TEXT,
  city TEXT,
  eventType TEXT, -- 'impression', 'view', 'click', 'conversion', 'bounce'
  eventData JSONB,
  timestamp TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  engagementTime INTEGER DEFAULT 0,
  scrollDepth INTEGER DEFAULT 0,
  clickPosition JSONB,
  conversionValue DECIMAL(10,2),
  createdAt TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 Performance Summary Table
```sql
CREATE TABLE banner_performance_summary (
  id SERIAL PRIMARY KEY,
  bannerId INTEGER REFERENCES banners(id),
  date DATE,
  hour INTEGER, -- 0-23 for hourly, NULL for daily
  impressions INTEGER DEFAULT 0,
  uniqueViews INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  totalEngagementTime INTEGER DEFAULT 0,
  avgEngagementTime DECIMAL(10,2) DEFAULT 0,
  clickThroughRate DECIMAL(5,4) DEFAULT 0,
  conversionRate DECIMAL(5,4) DEFAULT 0,
  bounceRate DECIMAL(5,4) DEFAULT 0,
  topReferrers JSONB,
  topDevices JSONB,
  topCountries JSONB,
  createdAt TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
```

## 3. Analytics API Endpoints

### 3.1 Data Collection Endpoints
```typescript
// Track banner impression
POST /api/analytics/banners/{id}/impression
{
  sessionId: string,
  userId?: string,
  deviceInfo: DeviceInfo,
  pageInfo: PageInfo
}

// Track banner view
POST /api/analytics/banners/{id}/view
{
  sessionId: string,
  viewDuration: number,
  scrollDepth: number
}

// Track banner click
POST /api/analytics/banners/{id}/click
{
  sessionId: string,
  clickPosition: { x: number, y: number },
  timeToClick: number
}

// Track conversion
POST /api/analytics/banners/{id}/conversion
{
  sessionId: string,
  conversionType: string,
  conversionValue?: number
}
```

### 3.2 Analytics Reporting Endpoints
```typescript
// Get banner performance summary
GET /api/analytics/banners/{id}/summary?period=7d&granularity=daily

// Get detailed analytics
GET /api/analytics/banners/{id}/details?startDate=2025-01-01&endDate=2025-01-31

// Get comparative analytics
GET /api/analytics/banners/compare?bannerIds=1,2,3&period=30d

// Get real-time analytics
GET /api/analytics/banners/{id}/realtime
```

## 4. Frontend Analytics Integration

### 4.1 Analytics Tracking Script
```javascript
// Banner Analytics Tracker
class BannerAnalytics {
  constructor(bannerId, sessionId) {
    this.bannerId = bannerId;
    this.sessionId = sessionId;
    this.viewStartTime = null;
    this.hasBeenViewed = false;
  }

  // Track impression when banner loads
  trackImpression() {
    fetch(`/api/analytics/banners/${this.bannerId}/impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        deviceInfo: this.getDeviceInfo(),
        pageInfo: this.getPageInfo()
      })
    });
  }

  // Track view when banner enters viewport
  trackView() {
    if (!this.hasBeenViewed) {
      this.hasBeenViewed = true;
      this.viewStartTime = Date.now();
      
      // Use Intersection Observer for accurate view tracking
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.onViewStart();
          } else {
            this.onViewEnd();
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(document.getElementById(`banner-${this.bannerId}`));
    }
  }

  // Track click with position
  trackClick(event) {
    const rect = event.target.getBoundingClientRect();
    const clickPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    const timeToClick = this.viewStartTime ? 
      Date.now() - this.viewStartTime : 0;

    fetch(`/api/analytics/banners/${this.bannerId}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        clickPosition,
        timeToClick
      })
    });
  }
}
```

### 4.2 Analytics Dashboard Components
```typescript
// Banner Performance Chart Component
interface BannerPerformanceChartProps {
  bannerId: number;
  period: '7d' | '30d' | '90d';
  metrics: ('impressions' | 'views' | 'clicks' | 'conversions')[];
}

// Real-time Analytics Widget
interface RealTimeAnalyticsProps {
  bannerId: number;
  refreshInterval: number; // milliseconds
}

// Comparative Analytics Table
interface ComparativeAnalyticsProps {
  bannerIds: number[];
  period: string;
  sortBy: 'ctr' | 'conversions' | 'views';
}
```

## 5. Analytics Dashboard Features

### 5.1 Overview Dashboard
- **Key Performance Indicators (KPIs)**
  - Total impressions, views, clicks, conversions
  - CTR, conversion rate, bounce rate
  - Top performing banners
  - Revenue attribution (if e-commerce)

### 5.2 Detailed Banner Analytics
- **Performance Trends**: Line charts showing metrics over time
- **Geographic Distribution**: World map showing performance by location
- **Device Breakdown**: Pie charts for device types, browsers, OS
- **Time-based Analysis**: Heatmaps showing performance by hour/day
- **User Journey**: Flow charts showing user paths after banner interaction

### 5.3 A/B Testing Integration
- **Test Setup**: Create A/B tests between banner variants
- **Statistical Significance**: Calculate confidence levels
- **Winner Declaration**: Automatic winner selection based on performance
- **Test History**: Archive of past A/B tests and results

## 6. Implementation Recommendations

### 6.1 Phase 1: Basic Analytics (Week 1-2)
1. Implement basic tracking (impressions, views, clicks)
2. Create simple analytics API endpoints
3. Add basic dashboard with key metrics
4. Implement date range filtering for banners

### 6.2 Phase 2: Enhanced Analytics (Week 3-4)
1. Add device and geographic tracking
2. Implement engagement time and scroll depth
3. Create detailed analytics dashboard
4. Add comparative analytics features

### 6.3 Phase 3: Advanced Features (Week 5-6)
1. Implement A/B testing system
2. Add real-time analytics
3. Create automated reporting
4. Implement conversion tracking

### 6.4 Phase 4: Optimization (Week 7-8)
1. Performance optimization for large datasets
2. Data aggregation and archiving
3. Advanced visualization features
4. Machine learning insights (optional)

## 7. Privacy and Compliance

### 7.1 Data Privacy
- **GDPR Compliance**: Implement consent management
- **Data Anonymization**: Hash IP addresses and personal identifiers
- **Data Retention**: Automatic cleanup of old analytics data
- **User Rights**: Provide data export and deletion capabilities

### 7.2 Performance Considerations
- **Asynchronous Tracking**: Non-blocking analytics calls
- **Data Batching**: Batch analytics requests to reduce server load
- **Caching**: Cache frequently accessed analytics data
- **Database Optimization**: Proper indexing and query optimization

This comprehensive analytics system will provide valuable insights into banner performance while maintaining user privacy and system performance.
