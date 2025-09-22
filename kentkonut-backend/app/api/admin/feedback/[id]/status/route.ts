import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const bodySchema = z.object({
  status: z.enum(['NEW', 'IN_REVIEW', 'RESOLVED', 'CLOSED']),
});

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const id = context.params?.id;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const json = await req.json();
    const parsed = bodySchema.parse(json);

    const updated = await db.feedback.update({
      where: { id },
      data: { status: parsed.status },
      select: { id: true, status: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('[ADMIN_FEEDBACK_STATUS_PATCH]', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
