import React, { useState, useEffect, useRef, useCallback } from 'react';

// Lazy loading hook
export const useLazyLoading = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible] as const;
};

// Image optimization hook
export const useImageOptimization = (src: string, options: {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  width?: number;
  height?: number;
} = {}) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    quality = 80,
    format = 'webp',
    width,
    height
  } = options;

  useEffect(() => {
    if (!src) {
      setOptimizedSrc('');
      setIsLoading(false);
      return;
    }

    // If it's already an external URL, use as is
    if (src.startsWith('http')) {
      setOptimizedSrc(src);
      setIsLoading(false);
      return;
    }

    // Build optimized URL
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3021';
    let optimizedUrl = `${baseUrl}${src}`;

    // Add optimization parameters if needed
    const params = new URLSearchParams();
    if (quality !== 80) params.append('q', quality.toString());
    if (format !== 'webp') params.append('f', format);
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());

    if (params.toString()) {
      optimizedUrl += `?${params.toString()}`;
    }

    setOptimizedSrc(optimizedUrl);
    setIsLoading(false);
  }, [src, quality, format, width, height]);

  return { optimizedSrc, isLoading, error };
};

// Debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Virtual scrolling hook for large lists
export const useVirtualScrolling = (
  items: any[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0
  });

  const startTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    return () => {
      const mountDuration = performance.now() - mountTime.current;
      setMetrics(prev => ({
        ...prev,
        mountTime: mountDuration
      }));
    };
  }, []);

  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime.current;
      setMetrics(prev => ({
        ...prev,
        renderTime,
        updateCount: prev.updateCount + 1
      }));
    };
  });

  // Log performance metrics in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && metrics.updateCount > 0) {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${metrics.renderTime.toFixed(2)}ms`,
        mountTime: `${metrics.mountTime.toFixed(2)}ms`,
        updateCount: metrics.updateCount
      });
    }
  }, [componentName, metrics]);

  return metrics;
};

// Memory usage hook
export const useMemoryUsage = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Image preloading utility
export const preloadImages = (urls: string[]): Promise<void[]> => {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  });

  return Promise.all(promises);
};

// Batch processing utility
export const batchProcess = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
};

// Cache utility
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; ttl: number }>();

  set(key: string, value: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const galleryCache = new SimpleCache<any>();

// Performance optimization constants
export const PERFORMANCE_CONFIG = {
  LAZY_LOADING_THRESHOLD: 0.1,
  IMAGE_QUALITY: 80,
  IMAGE_FORMAT: 'webp' as const,
  DEBOUNCE_DELAY: 300,
  VIRTUAL_SCROLLING_OVERSCAN: 5,
  BATCH_SIZE: 10,
  CACHE_TTL: 300000, // 5 minutes
  MAX_CACHE_SIZE: 100
};
