import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// In-memory store (not for production, use Redis or similar for distributed environments)
const rateLimitStore = new Map<string, { count: number; expires: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

// In-memory fallback store
const memoryStore = new Map<string, { count: number; expires: number }>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for') ||
    (req as any).ip ||
    'unknown'
  );
}

export function rateLimit(req: NextRequest): NextResponse | undefined {
  // NextRequest does not have 'ip' property, use x-forwarded-for header
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const key = `${ip}`;
  const entry = rateLimitStore.get(key);

  if (entry && entry.expires > now) {
    if (entry.count >= MAX_REQUESTS) {
      return new NextResponse('Too many requests', { status: 429 });
    }
    entry.count += 1;
    rateLimitStore.set(key, entry);
  } else {
    // Yeni pencere başlat
    rateLimitStore.set(key, { count: 1, expires: now + WINDOW_MS });
  }
  // Limit aşılmadıysa undefined dön (devam et)
  return undefined;
}

// Redis-based strict rate limit with in-memory fallback
export async function rateLimitStrict(
  req: NextRequest,
  keySuffix: string,
  windowSec: number,
  max: number
): Promise<RateLimitResult> {
  const ip = getClientIp(req);
  const baseKey = `ratelimit:${keySuffix}:ip=${ip}`;
  const nowSec = Math.floor(Date.now() / 1000);

  // Try Redis path
  try {
    // Use INCR with TTL semantics
    const count = await redis.incr(baseKey);
    if (count === 1) {
      await redis.expire(baseKey, windowSec);
    }
    const ttl = await redis.ttl(baseKey);
    const remaining = Math.max(0, max - count);
    return {
      allowed: count <= max,
      remaining,
      resetAt: Date.now() + Math.max(ttl, 0) * 1000,
    };
  } catch {
    // Fallback to in-memory
    const key = `${baseKey}`;
    const nowMs = Date.now();
    const entry = memoryStore.get(key);
    if (entry && entry.expires > nowMs) {
      entry.count += 1;
      memoryStore.set(key, entry);
      const remaining = Math.max(0, max - entry.count);
      return { allowed: entry.count <= max, remaining, resetAt: entry.expires };
    }
    const expires = nowMs + windowSec * 1000;
    memoryStore.set(key, { count: 1, expires });
    return { allowed: 1 <= max, remaining: Math.max(0, max - 1), resetAt: expires };
  }
}

// Not: Production ortamında bu helper yerine Redis, Memcached veya benzeri bir merkezi store kullanılmalıdır. 