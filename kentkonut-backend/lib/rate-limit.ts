import { NextRequest, NextResponse } from 'next/server';

// In-memory store (not for production, use Redis or similar for distributed environments)
const rateLimitStore = new Map<string, { count: number; expires: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

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

// Not: Production ortamında bu helper yerine Redis, Memcached veya benzeri bir merkezi store kullanılmalıdır. 