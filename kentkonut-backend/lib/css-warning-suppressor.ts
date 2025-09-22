/**
 * CSS Warning Suppressor Utility
 * 
 * Provides comprehensive CSS preload warning suppression for development environment.
 * This utility can be imported and used in various parts of the application.
 */

// Global flag to track if suppression is active
let isSuppressionActive = false;
let originalConsole: {
  warn: typeof console.warn;
  error: typeof console.error;
} | null = null;

// Comprehensive CSS warning patterns
const CSS_WARNING_PATTERNS = [
  /was preloaded using link preload but not used within a few seconds/i,
  /Please make sure it has an appropriate.*as.*value and it is preloaded intentionally/i,
  /_next\/static\/css\/.*\.css.*was preloaded/i,
  /The resource.*\.css.*was preloaded using link preload but not used/i,
  /styles\.css.*was preloaded using link preload but not used/i,
  /app\/layout\.css.*was preloaded using link preload but not used/i,
  /preload.*css.*not used within a few seconds/i,
  /link preload.*css.*not used/i,
  /preloaded.*css.*but not used/i,
  /Resource.*css.*was preloaded/i,
  /localhost.*css.*was preloaded using link preload but not used/i
];

/**
 * Check if a message is a CSS preload warning
 */
export function isCSSPreloadWarning(message: string): boolean {
  if (typeof message !== 'string') {
    message = String(message);
  }
  return CSS_WARNING_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Activate CSS warning suppression
 */
export function activateCSSWarningSuppression(): () => void {
  if (isSuppressionActive || process.env.NODE_ENV !== 'development') {
    return () => {}; // Return no-op function
  }

  // Store original console methods
  originalConsole = {
    warn: console.warn,
    error: console.error
  };

  // Override console.warn
  console.warn = function(...args: any[]) {
    const message = args.join(' ');
    if (!isCSSPreloadWarning(message)) {
      originalConsole!.warn.apply(console, args);
    }
  };

  // Override console.error
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    if (!isCSSPreloadWarning(message)) {
      originalConsole!.error.apply(console, args);
    }
  };

  isSuppressionActive = true;

  // Return deactivation function
  return deactivateCSSWarningSuppression;
}

/**
 * Deactivate CSS warning suppression
 */
export function deactivateCSSWarningSuppression(): void {
  if (!isSuppressionActive || !originalConsole) {
    return;
  }

  // Restore original console methods
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;

  isSuppressionActive = false;
  originalConsole = null;
}

/**
 * Clean up unused CSS preload links
 */
export function cleanupCSSPreloadLinks(): number {
  if (typeof document === 'undefined') {
    return 0;
  }

  try {
    const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
    let removedCount = 0;

    preloadLinks.forEach((link) => {
      const href = (link as HTMLLinkElement).href;

      // Check if there's a corresponding stylesheet
      const hasStylesheet = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);

      // Check if CSS is loaded in styleSheets
      const isLoaded = Array.from(document.styleSheets).some(sheet => {
        try {
          return sheet.href === href;
        } catch (e) {
          return false;
        }
      });

      // Remove if stylesheet exists or CSS is loaded
      if (hasStylesheet || isLoaded) {
        link.remove();
        removedCount++;
      }
    });

    return removedCount;
  } catch (error) {
    return 0;
  }
}

/**
 * Initialize comprehensive CSS warning suppression
 * Call this once in your application root
 */
export function initializeCSSWarningSuppression(): () => void {
  if (process.env.NODE_ENV !== 'development') {
    return () => {}; // Return no-op function for production
  }

  // Activate console suppression
  const deactivateConsole = activateCSSWarningSuppression();

  // Set up periodic cleanup
  const cleanupInterval = setInterval(() => {
    const removedCount = cleanupCSSPreloadLinks();
    if (removedCount > 0 && process.env.DEBUG_CSS_WARNINGS === 'true') {
      console.log(`🧹 Cleaned up ${removedCount} CSS preload links`);
    }
  }, 3000);

  // Set up page load cleanup
  const handlePageLoad = () => {
    cleanupCSSPreloadLinks();
  };

  if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
      document.addEventListener('DOMContentLoaded', handlePageLoad);
    }
  }

  // Return cleanup function
  return () => {
    deactivateConsole();
    clearInterval(cleanupInterval);
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('load', handlePageLoad);
      document.removeEventListener('DOMContentLoaded', handlePageLoad);
    }
  };
}

/**
 * Check if CSS warning suppression is currently active
 */
export function isSuppressionActiveStatus(): boolean {
  return isSuppressionActive;
}

// Auto-initialize if in browser environment and development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    initializeCSSWarningSuppression();
  }, 100);
}
