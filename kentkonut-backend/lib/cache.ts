import { redisCache, redis } from './redis';

// Default TTL in seconds
const DEFAULT_TTL = Number(process.env.CACHE_TTL_SECONDS || 300);

export function buildCacheKey(prefix: string, params: Record<string, any>): string {
  const normalized: Record<string, any> = {};
  // sort keys for deterministic key
  Object.keys(params)
    .sort()
    .forEach((k) => {
      const v = params[k];
      if (v === undefined || v === null || v === '') return;
      normalized[k] = String(v);
    });
  const qs = Object.entries(normalized)
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
    .join('&');
  return qs ? `${prefix}:${qs}` : `${prefix}:all`;
}

export async function getCache<T>(key: string): Promise<T | null> {
  return await redisCache.get<T>(key);
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
  await redisCache.set(key, value, ttlSeconds);
}

// Danger: pattern scan + delete. Use carefully.
export async function delByPattern(pattern: string): Promise<number> {
  let deleted = 0;
  const iter = redis.scanIterator({ MATCH: pattern, COUNT: 200 });
  const toDelete: string[] = [];
  for await (const key of iter as AsyncIterable<string>) {
    toDelete.push(key);
    if (toDelete.length >= 500) {
      deleted += await redis.del(toDelete);
      toDelete.length = 0;
    }
  }
  if (toDelete.length) {
    deleted += await redis.del(toDelete);
  }
  return deleted;
}
