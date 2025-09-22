import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { delByPattern } from '@/lib/cache';

const updateSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  address: z.string().min(5).max(2000).optional(),
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

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const id = context.params?.id;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const json = await req.json();
    const data = updateSchema.parse(json);

    const updated = await db.contactInfo.update({
      where: { id },
      data: {
        title: data.title ?? undefined,
        address: data.address ?? undefined,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        mapUrl: data.mapUrl ?? undefined,
        phonePrimary: data.phonePrimary ?? undefined,
        phoneSecondary: data.phoneSecondary ?? undefined,
        email: data.email ?? undefined,
        workingHours: data.workingHours ?? undefined,
        socialLinks: data.socialLinks ?? undefined,
        isActive: data.isActive ?? undefined,
      },
    });

    try { await delByPattern('contact:info:*'); } catch {}
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('[ADMIN_CONTACT_INFO_PUT]', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const id = context.params?.id;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    await db.contactInfo.delete({ where: { id } });

    try { await delByPattern('contact:info:*'); } catch {}
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_CONTACT_INFO_DELETE]', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
