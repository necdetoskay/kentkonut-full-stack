/**
 * CSS Warning Suppressor for Development
 * 
 * This script can be added to suppress CSS preload warnings during development.
 * It should only be used in development environment.
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;

  // CSS preload warning patterns to suppress
  const CSS_WARNING_PATTERNS = [
    /was preloaded using link preload but not used within a few seconds/,
    /Please make sure it has an appropriate `as` value and it is preloaded intentionally/,
    /_next\/static\/css\/.*\.css.*was preloaded/,
    /The resource.*\.css.*was preloaded using link preload but not used/,
  ];

  // Enhanced console.warn that filters CSS warnings
  console.warn = function(...args) {
    const message = args.join(' ');
    
    // Check if this is a CSS preload warning
    const isCSSWarning = CSS_WARNING_PATTERNS.some(pattern => pattern.test(message));
    
    if (isCSSWarning) {
      // Optionally log a simplified message instead of the full warning
      if (process.env.DEBUG_CSS_WARNINGS === 'true') {
        console.log('🎨 CSS preload warning suppressed:', message.substring(0, 100) + '...');
      }
      return;
    }
    
    // Allow other warnings through
    originalWarn.apply(console, args);
  };

  // Enhanced console.error that filters CSS errors
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Check if this is a CSS-related error we want to suppress
    const isCSSError = CSS_WARNING_PATTERNS.some(pattern => pattern.test(message));
    
    if (isCSSError) {
      // Convert CSS errors to warnings or suppress them
      if (process.env.DEBUG_CSS_WARNINGS === 'true') {
        console.log('🎨 CSS error suppressed:', message.substring(0, 100) + '...');
      }
      return;
    }
    
    // Allow other errors through
    originalError.apply(console, args);
  };

  // Function to clean up unused CSS preloads
  function cleanupCSSPreloads() {
    const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
    let cleanedCount = 0;

    preloadLinks.forEach((link) => {
      const href = link.href;
      
      // Check if there's a corresponding stylesheet
      const hasStylesheet = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
      
      if (!hasStylesheet) {
        // Check if the CSS file actually exists and is being used
        const isUsed = Array.from(document.styleSheets).some(sheet => {
          try {
            return sheet.href === href;
          } catch (e) {
            return false;
          }
        });

        if (!isUsed) {
          link.remove();
          cleanedCount++;
        }
      }
    });

    if (cleanedCount > 0 && process.env.DEBUG_CSS_WARNINGS === 'true') {
      console.log(`🧹 Cleaned up ${cleanedCount} unused CSS preload links`);
    }
  }

  // Run cleanup after page load
  if (document.readyState === 'complete') {
    cleanupCSSPreloads();
  } else {
    window.addEventListener('load', cleanupCSSPreloads);
  }

  // Periodic cleanup for dynamic content
  setInterval(cleanupCSSPreloads, 5000);

  // Restore original console methods when needed
  window.__restoreConsole = function() {
    console.warn = originalWarn;
    console.error = originalError;
    console.log('🔧 Console methods restored to original state');
  };

  console.log('🎨 CSS warning suppressor activated for development');
}
