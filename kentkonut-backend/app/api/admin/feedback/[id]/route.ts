import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const id = context.params?.id;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const row = await db.feedback.findUnique({
      where: { id },
      include: {
        attachments: {
          include: { media: true },
        },
      },
    });

    if (!row) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('[ADMIN_FEEDBACK_DETAIL]', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
