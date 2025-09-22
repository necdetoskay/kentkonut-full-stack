/**
 * Consent Management Utility
 * 
 * Handles user consent for analytics tracking and data processing
 */

export interface ConsentStatus {
  consentGiven: boolean;
  dataProcessingConsent: boolean;
  timestamp?: string;
  version?: string;
}

export class ConsentManager {
  private static readonly CONSENT_KEY = 'analytics_consent';
  private static readonly CONSENT_VERSION = '1.0';

  /**
   * Get current consent status
   */
  static getConsent(): ConsentStatus {
    if (typeof window === 'undefined') {
      return { consentGiven: false, dataProcessingConsent: false };
    }

    try {
      const stored = localStorage.getItem(this.CONSENT_KEY);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Handle legacy string format
        if (typeof parsed === 'string') {
          const granted = parsed === 'true' || parsed === 'granted';
          return {
            consentGiven: granted,
            dataProcessingConsent: granted,
            timestamp: new Date().toISOString(),
            version: this.CONSENT_VERSION
          };
        }
        
        // Handle object format
        if (typeof parsed === 'object' && parsed !== null) {
          return {
            consentGiven: Boolean(parsed.consentGiven),
            dataProcessingConsent: Boolean(parsed.dataProcessingConsent),
            timestamp: parsed.timestamp || new Date().toISOString(),
            version: parsed.version || this.CONSENT_VERSION
          };
        }
      }
    } catch (error) {
      console.warn('Error reading consent from localStorage:', error);
    }

    // For development, auto-grant consent
    if (process.env.NODE_ENV === 'development') {
      const autoConsent = {
        consentGiven: true,
        dataProcessingConsent: true,
        timestamp: new Date().toISOString(),
        version: this.CONSENT_VERSION
      };
      
      this.setConsent(autoConsent);
      console.log('🔒 Analytics consent auto-granted for development');
      return autoConsent;
    }

    // Default: no consent
    return { consentGiven: false, dataProcessingConsent: false };
  }

  /**
   * Set consent status
   */
  static setConsent(consent: Partial<ConsentStatus>): void {
    if (typeof window === 'undefined') return;

    const consentData: ConsentStatus = {
      consentGiven: Boolean(consent.consentGiven),
      dataProcessingConsent: Boolean(consent.dataProcessingConsent),
      timestamp: consent.timestamp || new Date().toISOString(),
      version: consent.version || this.CONSENT_VERSION
    };

    try {
      localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consentData));
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('consentChanged', {
        detail: consentData
      }));
      
      console.log('🔒 Analytics consent updated:', consentData);
    } catch (error) {
      console.error('Error saving consent to localStorage:', error);
    }
  }

  /**
   * Grant full consent
   */
  static grantConsent(): void {
    this.setConsent({
      consentGiven: true,
      dataProcessingConsent: true
    });
  }

  /**
   * Revoke consent
   */
  static revokeConsent(): void {
    this.setConsent({
      consentGiven: false,
      dataProcessingConsent: false
    });
  }

  /**
   * Check if consent is required (based on environment or user location)
   */
  static isConsentRequired(): boolean {
    // In development, consent is not required
    if (process.env.NODE_ENV === 'development') {
      return false;
    }

    // In production, always require consent (GDPR compliance)
    return true;
  }

  /**
   * Check if current consent is valid for analytics
   */
  static isConsentValid(): boolean {
    const consent = this.getConsent();
    return consent.consentGiven && consent.dataProcessingConsent;
  }

  /**
   * Clear all consent data
   */
  static clearConsent(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.CONSENT_KEY);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('consentChanged', {
        detail: { consentGiven: false, dataProcessingConsent: false }
      }));
      
      console.log('🔒 Analytics consent cleared');
    } catch (error) {
      console.error('Error clearing consent from localStorage:', error);
    }
  }

  /**
   * Get consent banner message based on current status
   */
  static getConsentMessage(): string | null {
    if (!this.isConsentRequired()) return null;
    
    const consent = this.getConsent();
    if (consent.consentGiven) return null;

    return 'Bu site, deneyiminizi geliştirmek için çerezler ve analitik veriler kullanır. Devam ederek kullanımı kabul etmiş olursunuz.';
  }

  /**
   * Listen for consent changes
   */
  static onConsentChange(callback: (consent: ConsentStatus) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('consentChanged', handler as EventListener);

    // Return cleanup function
    return () => {
      window.removeEventListener('consentChanged', handler as EventListener);
    };
  }

  /**
   * Initialize consent management
   */
  static initialize(): ConsentStatus {
    const consent = this.getConsent();
    
    // Log current status
    console.log('🔒 Consent Manager initialized:', {
      consentGiven: consent.consentGiven,
      dataProcessingConsent: consent.dataProcessingConsent,
      isRequired: this.isConsentRequired(),
      isValid: this.isConsentValid()
    });

    return consent;
  }
}
