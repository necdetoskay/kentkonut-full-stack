import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyTurnstile } from '@/lib/turnstile';
import { rateLimitStrict } from '@/lib/rate-limit';
import { sendFeedbackEmail } from '@/lib/notify';
import { redis } from '@/lib/redis';

const feedbackSchema = z.object({
  category: z.enum(['REQUEST', 'SUGGESTION', 'COMPLAINT']),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  nationalId: z.string().min(6).max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(7).max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  message: z.string().min(10).max(4000),
  kvkkAccepted: z.boolean().refine(v => v === true, 'KVKK onayı zorunludur'),
  captchaToken: z.string().min(10).optional().nullable(),
  captchaId: z.string().optional().nullable(),
  captchaAnswer: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 req / 60 sec / IP
    const rl = await rateLimitStrict(req, 'feedback', 60, 3);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests', resetAt: rl.resetAt }, { status: 429 });
    }

    const body = await req.json();
    const data = feedbackSchema.parse(body);

    const useTurnstile = process.env.USE_TURNSTILE !== 'false';
    if (useTurnstile) {
      if (!data.captchaToken) {
        return NextResponse.json({ success: false, error: 'Captcha token missing' }, { status: 400 });
      }
      const verify = await verifyTurnstile(data.captchaToken, req);
      if (!verify.success) {
        return NextResponse.json({ success: false, error: 'Captcha verification failed' }, { status: 400 });
      }
    } else {
      // Self-hosted simple captcha via Redis
      const id = data.captchaId?.toString();
      const answer = (data.captchaAnswer || '').toString().trim().toLowerCase();
      if (!id || !answer) {
        return NextResponse.json({ success: false, error: 'Captcha required' }, { status: 400 });
      }
      try {
        const key = `captcha:${id}`;
        const expected = await redis.get(key);
        if (!expected || expected.toLowerCase() !== answer) {
          return NextResponse.json({ success: false, error: 'Captcha incorrect' }, { status: 400 });
        }
        await redis.del(key);
      } catch (e) {
        return NextResponse.json({ success: false, error: 'Captcha verification unavailable' }, { status: 400 });
      }
    }

    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || undefined;
    const ua = req.headers.get('user-agent') || undefined;

    const created = await db.feedback.create({
      data: {
        category: data.category,
        firstName: data.firstName,
        lastName: data.lastName,
        nationalId: data.nationalId || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        message: data.message,
        ipAddress: (Array.isArray(ip) ? ip[0] : ip) || null,
        userAgent: ua,
        status: 'NEW',
      },
    });

    // Fire-and-forget mock email notification
    try {
      await sendFeedbackEmail({
        id: created.id,
        category: created.category,
        firstName: created.firstName,
        lastName: created.lastName,
        email: created.email,
        phone: created.phone,
        message: created.message,
        createdAt: created.createdAt?.toISOString?.() ?? undefined,
      });
    } catch {}

    return NextResponse.json({ success: true, id: created.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('[FEEDBACK_POST]', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
