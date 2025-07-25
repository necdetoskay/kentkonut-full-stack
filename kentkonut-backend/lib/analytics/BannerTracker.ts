/**
 * BannerTracker - Client-side analytics tracking library
 * Provides non-blocking, privacy-compliant banner analytics tracking
 */

interface TrackerConfig {
  apiEndpoint?: string;
  batchSize?: number;
  flushInterval?: number;
  consentRequired?: boolean;
  debug?: boolean;
}

interface TrackingEvent {
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
}

interface ConversionData {
  type: string;
  value?: number;
  campaignId?: string;
}

class BannerTracker {
  private sessionId: string;
  private visitorId: string;
  private eventQueue: TrackingEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private consentGiven = false;
  private config: TrackerConfig;
  private viewTrackers = new Map<number, any>();
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(config: TrackerConfig = {}) {
    this.config = {
      apiEndpoint: '/api/analytics/track-direct',
      batchSize: 10,
      flushInterval: 5000,
      consentRequired: true,
      debug: false,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.visitorId = this.getOrCreateVisitorId();
    this.initializeTracker();
  }

  // Initialize tracker with consent check
  private async initializeTracker() {
    try {
      // Check for existing consent
      this.consentGiven = this.checkConsent();
      
      if (this.config.debug) {
        console.log('BannerTracker initialized:', {
          sessionId: this.sessionId,
          visitorId: this.visitorId,
          consentGiven: this.consentGiven
        });
      }

      // Setup intersection observer for view tracking
      this.setupIntersectionObserver();
      
      // Setup page unload handler
      this.setupUnloadHandler();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('BannerTracker initialization failed:', error);
    }
  }

  // Setup intersection observer for accurate view tracking
  private setupIntersectionObserver() {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
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
  }

  // Setup page unload handler to flush remaining events
  private setupUnloadHandler() {
    if (typeof window === 'undefined') return;

    const flushOnUnload = () => {
      this.flushEvents(true); // Synchronous flush on unload
    };

    window.addEventListener('beforeunload', flushOnUnload);
    window.addEventListener('pagehide', flushOnUnload);
  }

  // Track banner impression (when banner loads)
  trackImpression(bannerId: number, element: HTMLElement) {
    if (!this.isConsentValid()) return;

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

    if (this.config.debug) {
      console.log('Banner impression tracked:', bannerId);
    }
  }

  // Setup element tracking for views and clicks
  private setupElementTracking(bannerId: number, element: HTMLElement) {
    // Set banner ID attribute for intersection observer
    element.setAttribute('data-banner-id', bannerId.toString());
    
    // Observe element for view tracking
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element);
    }

    // Setup click tracking
    const clickHandler = (event: MouseEvent) => {
      this.trackClick(bannerId, event);
    };

    element.addEventListener('click', clickHandler);
    
    // Store cleanup function
    this.viewTrackers.set(bannerId, {
      element,
      clickHandler,
      cleanup: () => {
        element.removeEventListener('click', clickHandler);
        if (this.intersectionObserver) {
          this.intersectionObserver.unobserve(element);
        }
      }
    });
  }

  // Start tracking view engagement
  private startViewTracking(bannerId: number, element: HTMLElement) {
    if (!this.isConsentValid()) return;

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

    if (this.config.debug) {
      console.log('Banner view started:', bannerId);
    }
  }

  // End view tracking and calculate engagement
  private endViewTracking(bannerId: number) {
    const tracker = this.viewTrackers.get(bannerId);
    if (!tracker || !this.isConsentValid()) return;

    const element = tracker.element;
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

      if (this.config.debug) {
        console.log('Banner engagement tracked:', { bannerId, engagementDuration, scrollDepth });
      }
    }

    // Clean up tracking attributes
    element.removeAttribute('data-view-start');
    element.removeAttribute('data-scroll-start');
  }

  // Track banner click
  trackClick(bannerId: number, event: MouseEvent) {
    if (!this.isConsentValid()) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const clickPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
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

    if (this.config.debug) {
      console.log('Banner click tracked:', { bannerId, clickPosition });
    }
  }

  // Track conversion
  trackConversion(bannerId: number, conversionData: ConversionData) {
    if (!this.isConsentValid()) return;

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

    if (this.config.debug) {
      console.log('Banner conversion tracked:', { bannerId, conversionData });
    }
  }

  // Queue event for batch processing
  private queueEvent(event: TrackingEvent) {
    this.eventQueue.push(event);

    // Auto-flush when queue gets large
    if (this.eventQueue.length >= this.config.batchSize!) {
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
    }, this.config.flushInterval);
  }

  // Send queued events
  private async flushEvents(synchronous = false) {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      if (synchronous) {
        // Use sendBeacon for synchronous sending on page unload
        this.sendEventsSync(events);
      } else {
        await this.sendEvents(events);
      }
    } catch (error) {
      if (this.config.debug) {
        console.warn('Analytics tracking failed:', error);
      }
      // Re-queue events for retry (with limit)
      if (events.length < 50) {
        this.eventQueue.unshift(...events);
      }
    }
  }

  // Send events to API (asynchronous)
  private async sendEvents(events: TrackingEvent[]) {
    for (const event of events) {
      const response = await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event),
        keepalive: true
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }
    }
  }

  // Send events synchronously using sendBeacon
  private sendEventsSync(events: TrackingEvent[]) {
    if (!navigator.sendBeacon) return;

    for (const event of events) {
      const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
      navigator.sendBeacon(this.config.apiEndpoint!, blob);
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOrCreateVisitorId(): string {
    if (typeof window === 'undefined') return 'server_visitor';
    
    const stored = localStorage.getItem('banner_visitor_id');
    if (stored) return stored;

    const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('banner_visitor_id', visitorId);
    return visitorId;
  }

  private checkConsent(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.config.consentRequired) return true;
    
    const consent = localStorage.getItem('analytics_consent');
    return consent === 'granted';
  }

  private isConsentValid(): boolean {
    return !this.config.consentRequired || this.consentGiven;
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

  // Public methods for consent management
  setConsent(granted: boolean) {
    this.consentGiven = granted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_consent', granted ? 'granted' : 'denied');
    }

    if (this.config.debug) {
      console.log('Analytics consent updated:', granted);
    }
  }

  // Cleanup method
  destroy() {
    // Clear timers
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Flush remaining events
    this.flushEvents(true);

    // Cleanup view trackers
    this.viewTrackers.forEach(tracker => {
      tracker.cleanup();
    });
    this.viewTrackers.clear();

    // Disconnect intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    if (this.config.debug) {
      console.log('BannerTracker destroyed');
    }
  }
}

// Global tracker instance
let globalTracker: BannerTracker | null = null;

export function initializeBannerTracking(config: TrackerConfig = {}): BannerTracker | null {
  if (typeof window === 'undefined') return null;
  
  if (!globalTracker) {
    globalTracker = new BannerTracker(config);
  }
  
  return globalTracker;
}

export function getBannerTracker(): BannerTracker | null {
  return globalTracker;
}

export { BannerTracker, type TrackerConfig, type TrackingEvent, type ConversionData };
