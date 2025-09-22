import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.enum(['REQUEST', 'SUGGESTION', 'COMPLAINT']).optional(),
  status: z.enum(['NEW', 'IN_REVIEW', 'RESOLVED', 'CLOSED']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.parse(Object.fromEntries(searchParams));

    const page = Math.max(1, parseInt(parsed.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(parsed.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (parsed.category) where.category = parsed.category;
    if (parsed.status) where.status = parsed.status;
    if (parsed.dateFrom || parsed.dateTo) {
      where.createdAt = {} as any;
      if (parsed.dateFrom) (where.createdAt as any).gte = new Date(parsed.dateFrom);
      if (parsed.dateTo) (where.createdAt as any).lte = new Date(parsed.dateTo);
    }
    if (parsed.search) {
      const s = parsed.search;
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
        { message: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      db.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          category: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
        },
      }),
      db.feedback.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Bad query', details: error.errors }, { status: 400 });
    }
    console.error('[ADMIN_FEEDBACK_LIST]', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
