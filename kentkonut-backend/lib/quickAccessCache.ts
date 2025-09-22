// Quick Access Links Caching System
import { QuickAccessLink } from '@prisma/client';

interface CacheEntry {
  data: QuickAccessLink[];
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class QuickAccessCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  // Generate cache key
  private getCacheKey(moduleType: string, moduleId: string | number): string {
    return `quick-access:${moduleType}:${moduleId}`;
  }

  // Check if cache entry is valid
  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Get from cache
  get(moduleType: string, moduleId: string | number): QuickAccessLink[] | null {
    const key = this.getCacheKey(moduleType, moduleId);
    const entry = this.cache.get(key);
    
    if (entry && this.isValid(entry)) {
      return entry.data;
    }
    
    // Remove expired entry
    if (entry) {
      this.cache.delete(key);
    }
    
    return null;
  }

  // Set cache entry
  set(
    moduleType: string, 
    moduleId: string | number, 
    data: QuickAccessLink[], 
    ttl: number = this.defaultTTL
  ): void {
    const key = this.getCacheKey(moduleType, moduleId);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    this.cache.set(key, entry);
  }

  // Invalidate cache for specific module
  invalidate(moduleType: string, moduleId: string | number): void {
    const key = this.getCacheKey(moduleType, moduleId);
    this.cache.delete(key);
  }

  // Invalidate all cache entries for a module type
  invalidateModuleType(moduleType: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`quick-access:${moduleType}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Cleanup expired entries
  cleanup(): void {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance
export const quickAccessCache = new QuickAccessCache();

// Auto cleanup every 10 minutes
setInterval(() => {
  quickAccessCache.cleanup();
}, 10 * 60 * 1000);

// Cache invalidation helpers
export const invalidateQuickAccessCache = {
  // Invalidate when a quick access link is created, updated, or deleted
  onLinkChange: (moduleType: string, moduleId: string | number) => {
    quickAccessCache.invalidate(moduleType, moduleId);
  },
  
  // Invalidate when a module's hasQuickAccess status changes
  onModuleUpdate: (moduleType: string, moduleId: string | number) => {
    quickAccessCache.invalidate(moduleType, moduleId);
  },
  
  // Invalidate when a module is deleted
  onModuleDelete: (moduleType: string, moduleId: string | number) => {
    quickAccessCache.invalidate(moduleType, moduleId);
  }
};

// Performance monitoring
export const cacheMetrics = {
  hits: 0,
  misses: 0,
  
  recordHit: () => {
    cacheMetrics.hits++;
  },
  
  recordMiss: () => {
    cacheMetrics.misses++;
  },
  
  getHitRate: (): number => {
    const total = cacheMetrics.hits + cacheMetrics.misses;
    return total > 0 ? (cacheMetrics.hits / total) * 100 : 0;
  },
  
  reset: () => {
    cacheMetrics.hits = 0;
    cacheMetrics.misses = 0;
  }
};
