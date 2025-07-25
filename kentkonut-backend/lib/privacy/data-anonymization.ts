import crypto from 'crypto';

export class DataAnonymizer {
  private static readonly SALT = process.env.ANALYTICS_SALT || 'kentkonut-analytics-salt-2025';

  /**
   * Hash IP addresses for privacy compliance
   */
  static hashIP(ip: string): string {
    if (!ip || ip === 'unknown') return 'unknown';
    
    return crypto
      .createHash('sha256')
      .update(ip + this.SALT)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Hash user agents for privacy compliance
   */
  static hashUserAgent(userAgent: string): string {
    if (!userAgent || userAgent === 'unknown') return 'unknown';
    
    return crypto
      .createHash('sha256')
      .update(userAgent + this.SALT)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Extract domain from referrer URL for privacy
   */
  static extractReferrerDomain(referrer: string): string | null {
    if (!referrer) return null;
    
    try {
      const url = new URL(referrer);
      return url.hostname;
    } catch {
      return null;
    }
  }

  /**
   * Anonymize geographic data (keep country/region, remove city)
   */
  static anonymizeLocation(location: { 
    country?: string; 
    region?: string; 
    city?: string;
    countryCode?: string;
  }) {
    return {
      countryCode: location.countryCode,
      countryName: location.country,
      region: location.region,
      // city removed for privacy
    };
  }

  /**
   * Generate anonymous visitor ID
   */
  static generateAnonymousId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Clean sensitive data from events
   */
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
    
    // Extract domain from referrer
    if (sanitized.referrer) {
      sanitized.referrerDomain = this.extractReferrerDomain(sanitized.referrer);
      delete sanitized.referrer;
    }
    
    return sanitized;
  }

  /**
   * Validate consent requirements
   */
  static validateConsent(consentGiven: boolean, dataProcessingConsent: boolean): boolean {
    // Both consents must be given for analytics tracking
    return consentGiven && dataProcessingConsent;
  }

  /**
   * Generate session ID
   */
  static generateSessionId(): string {
    return `sess_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate visitor ID
   */
  static generateVisitorId(): string {
    return `visitor_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Detect device type from user agent
   */
  static detectDevice(userAgent: string) {
    if (!userAgent) {
      return {
        deviceType: 'unknown',
        browserName: 'unknown',
        browserVersion: 'unknown',
        osName: 'unknown',
        osVersion: 'unknown'
      };
    }

    // Device type detection
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(userAgent);
    
    let deviceType = 'desktop';
    if (isTablet) deviceType = 'tablet';
    else if (isMobile) deviceType = 'mobile';

    // Browser detection
    let browserName = 'unknown';
    let browserVersion = 'unknown';
    
    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      if (match) browserVersion = match[1].split('.')[0];
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      if (match) browserVersion = match[1].split('.')[0];
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari';
      const match = userAgent.match(/Version\/([0-9.]+)/);
      if (match) browserVersion = match[1].split('.')[0];
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge';
      const match = userAgent.match(/Edge\/([0-9.]+)/);
      if (match) browserVersion = match[1].split('.')[0];
    }

    // OS detection
    let osName = 'unknown';
    let osVersion = 'unknown';
    
    if (userAgent.includes('Windows')) {
      osName = 'Windows';
      if (userAgent.includes('Windows NT 10.0')) osVersion = '10';
      else if (userAgent.includes('Windows NT 6.3')) osVersion = '8.1';
      else if (userAgent.includes('Windows NT 6.2')) osVersion = '8';
      else if (userAgent.includes('Windows NT 6.1')) osVersion = '7';
    } else if (userAgent.includes('Mac OS X')) {
      osName = 'macOS';
      const match = userAgent.match(/Mac OS X ([0-9_]+)/);
      if (match) osVersion = match[1].replace(/_/g, '.');
    } else if (userAgent.includes('Linux')) {
      osName = 'Linux';
    } else if (userAgent.includes('Android')) {
      osName = 'Android';
      const match = userAgent.match(/Android ([0-9.]+)/);
      if (match) osVersion = match[1];
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      osName = 'iOS';
      const match = userAgent.match(/OS ([0-9_]+)/);
      if (match) osVersion = match[1].replace(/_/g, '.');
    }

    return {
      deviceType,
      browserName,
      browserVersion,
      osName,
      osVersion
    };
  }

  /**
   * Get geographic data from IP (mock implementation)
   * In production, this would integrate with a geolocation service
   */
  static async getGeographicData(ip: string) {
    // Mock implementation - in production, integrate with MaxMind, IPinfo, etc.
    return {
      countryCode: 'TR',
      countryName: 'Turkey',
      region: 'Istanbul',
      timezone: 'Europe/Istanbul'
    };
  }

  /**
   * Validate event data structure
   */
  static validateEventData(event: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!event.bannerId || !Number.isInteger(event.bannerId)) {
      errors.push('Invalid bannerId');
    }

    if (!event.eventType || !['impression', 'view', 'click', 'conversion', 'bounce', 'engagement'].includes(event.eventType)) {
      errors.push('Invalid eventType');
    }

    if (!event.sessionId || typeof event.sessionId !== 'string') {
      errors.push('Invalid sessionId');
    }

    if (!event.visitorId || typeof event.visitorId !== 'string') {
      errors.push('Invalid visitorId');
    }

    if (!event.pageUrl || typeof event.pageUrl !== 'string') {
      errors.push('Invalid pageUrl');
    }

    if (typeof event.consentGiven !== 'boolean') {
      errors.push('Consent status required');
    }

    // Optional field validation
    if (event.engagementDuration !== undefined && (!Number.isInteger(event.engagementDuration) || event.engagementDuration < 0)) {
      errors.push('Invalid engagementDuration');
    }

    if (event.scrollDepth !== undefined && (!Number.isInteger(event.scrollDepth) || event.scrollDepth < 0 || event.scrollDepth > 100)) {
      errors.push('Invalid scrollDepth');
    }

    if (event.conversionValue !== undefined && (!Number.isFinite(event.conversionValue) || event.conversionValue < 0)) {
      errors.push('Invalid conversionValue');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
