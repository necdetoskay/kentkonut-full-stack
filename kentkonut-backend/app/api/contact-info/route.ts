import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildCacheKey, getCache, setCache, delByPattern } from '@/lib/cache';

// GET /api/contact-info - Public: returns active contact info (single or list)
export async function GET(req: NextRequest) {
  try {
    const cacheKey = buildCacheKey('contact:info', { scope: 'all' });
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const records = await db.contactInfo.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    const payload = {
      success: true,
      data: records,
      count: records.length,
    };

    await setCache(cacheKey, payload, 300);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[CONTACT_INFO_GET]', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
