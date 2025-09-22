'use client';

import { useEffect } from 'react';

/**
 * Enhanced CSS Optimizer Component
 *
 * This component provides comprehensive CSS preload warning suppression:
 * 1. Removes unused preload links immediately and periodically
 * 2. Suppresses CSS preload warnings at the browser level
 * 3. Optimizes CSS loading behavior for development
 * 4. Provides cleanup and restoration functions
 */
export function CSSOptimizer() {
  useEffect(() => {
    // Enhanced function to clean up unused preload links
    const cleanupUnusedPreloads = () => {
      try {
        const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
        let removedCount = 0;

        preloadLinks.forEach((link) => {
          const href = (link as HTMLLinkElement).href;

          // Check if there's a corresponding stylesheet link
          const stylesheetLink = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);

          // Check if CSS is actually loaded in styleSheets
          const isStyleSheetLoaded = Array.from(document.styleSheets).some(sheet => {
            try {
              return sheet.href === href;
            } catch (e) {
              return false;
            }
          });

          // Remove preload if stylesheet exists or CSS is loaded
          if (stylesheetLink || isStyleSheetLoaded) {
            link.remove();
            removedCount++;
          }
        });

        // Only log in development and if something was removed
        if (process.env.NODE_ENV === 'development' && removedCount > 0) {
          console.log(`🧹 Cleaned up ${removedCount} CSS preload links`);
        }
      } catch (error) {
        // Silently handle errors
      }
    };

    // Enhanced function to suppress CSS preload warnings
    const suppressCSSWarnings = () => {
      // Store original console methods
      const originalWarn = console.warn;
      const originalError = console.error;

      // Comprehensive CSS warning patterns
      const cssWarningPatterns = [
        /was preloaded using link preload but not used within a few seconds/i,
        /Please make sure it has an appropriate.*as.*value and it is preloaded intentionally/i,
        /_next\/static\/css\/.*\.css.*was preloaded/i,
        /The resource.*\.css.*was preloaded using link preload but not used/i,
        /styles\.css.*was preloaded using link preload but not used/i,
        /app\/layout\.css.*was preloaded using link preload but not used/i,
        /preload.*css.*not used within a few seconds/i,
        /link preload.*css.*not used/i,
        /preloaded.*css.*but not used/i,
        /Resource.*css.*was preloaded/i
      ];

      // Function to check if message is a CSS warning
      const isCSSPreloadWarning = (message: string) => {
        // Only suppress if it's clearly a CSS preload warning
        const isCSS = cssWarningPatterns.some(pattern => pattern.test(message));

        // Never suppress upload errors or API errors
        const isUploadError = message.toLowerCase().includes('upload') ||
                             message.toLowerCase().includes('api/') ||
                             message.toLowerCase().includes('fetch') ||
                             message.toLowerCase().includes('supervisor');

        return isCSS && !isUploadError;
      };

      // Override console.warn
      console.warn = (...args) => {
        const message = args.join(' ');
        if (!isCSSPreloadWarning(message)) {
          originalWarn.apply(console, args);
        }
      };

      // Override console.error (some CSS warnings come as errors)
      console.error = (...args) => {
        const message = args.join(' ');
        if (!isCSSPreloadWarning(message)) {
          originalError.apply(console, args);
        }
      };

      // Return restoration function
      return () => {
        console.warn = originalWarn;
        console.error = originalError;
      };
    };

    // Apply optimizations immediately and set up monitoring
    let restoreConsole: (() => void) | null = null;
    let cleanupInterval: NodeJS.Timeout | null = null;

    // Immediate cleanup
    cleanupUnusedPreloads();

    // Set up event listeners for page load
    if (document.readyState === 'complete') {
      cleanupUnusedPreloads();
    } else {
      window.addEventListener('load', cleanupUnusedPreloads);
      document.addEventListener('DOMContentLoaded', cleanupUnusedPreloads);
    }

    // Suppress warnings in development only
    if (process.env.NODE_ENV === 'development') {
      restoreConsole = suppressCSSWarnings();

      // Set up periodic cleanup for dynamic content
      cleanupInterval = setInterval(cleanupUnusedPreloads, 2000);

      // Log that suppression is active
      console.log('🎨 CSS preload warning suppression activated');
    }

    // Cleanup function
    return () => {
      window.removeEventListener('load', cleanupUnusedPreloads);
      document.removeEventListener('DOMContentLoaded', cleanupUnusedPreloads);

      // Clear interval
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }

      // Restore original console methods
      if (restoreConsole) {
        restoreConsole();
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}

/**
 * CSS Preload Manager Hook
 * 
 * Use this hook in components that dynamically load CSS
 */
export function useCSSPreloadManager() {
  useEffect(() => {
    const manageCSSPreloads = () => {
      // Get all CSS files that are actually being used
      const usedStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => (link as HTMLLinkElement).href);

      // Remove preload links for CSS that's already loaded
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
      
      preloadLinks.forEach((preloadLink) => {
        const href = (preloadLink as HTMLLinkElement).href;
        
        if (usedStylesheets.includes(href)) {
          // CSS is already loaded, remove preload
          preloadLink.remove();
        }
      });
    };

    // Run after a short delay to allow CSS to load
    const timeoutId = setTimeout(manageCSSPreloads, 1000);

    return () => clearTimeout(timeoutId);
  }, []);
}

/**
 * Utility function to preload CSS with proper cleanup
 */
export function preloadCSS(href: string): () => void {
  // Check if already preloaded
  const existingPreload = document.querySelector(`link[rel="preload"][href="${href}"]`);
  if (existingPreload) {
    return () => {}; // Already preloaded
  }

  // Create preload link
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  
  // Add to head
  document.head.appendChild(link);

  // Return cleanup function
  return () => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  };
}

/**
 * CSS Loading Status Hook
 * 
 * Tracks CSS loading status to prevent preload warnings
 */
export function useCSSLoadingStatus() {
  useEffect(() => {
    const trackCSSLoading = () => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      
      stylesheets.forEach((stylesheet) => {
        const link = stylesheet as HTMLLinkElement;
        
        // Mark as loaded when CSS is ready
        link.addEventListener('load', () => {
          link.dataset.loaded = 'true';
          
          // Remove corresponding preload link
          const preloadLink = document.querySelector(
            `link[rel="preload"][href="${link.href}"]`
          );
          if (preloadLink) {
            preloadLink.remove();
          }
        });
      });
    };

    trackCSSLoading();
  }, []);
}
