import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { delByPattern } from '@/lib/cache';

const createSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  address: z.string().min(5).max(2000),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  mapUrl: z.string().url().optional().nullable(),
  phonePrimary: z.string().max(30).optional().nullable(),
  phoneSecondary: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().nullable(),
  workingHours: z.string().max(500).optional().nullable(),
  socialLinks: z.any().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const items = await db.contactInfo.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ success: true, data: items, count: items.length });
  } catch (error) {
    console.error('[ADMIN_CONTACT_INFO_LIST]', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const json = await req.json();
    const data = createSchema.parse(json);

    const created = await db.contactInfo.create({
      data: {
        title: data.title ?? undefined,
        address: data.address,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        mapUrl: data.mapUrl ?? undefined,
        phonePrimary: data.phonePrimary ?? undefined,
        phoneSecondary: data.phoneSecondary ?? undefined,
        email: data.email ?? undefined,
        workingHours: data.workingHours ?? undefined,
        socialLinks: data.socialLinks ?? undefined,
        isActive: data.isActive ?? true,
      },
    });

    try { await delByPattern('contact:info:*'); } catch {}
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('[ADMIN_CONTACT_INFO_POST]', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
