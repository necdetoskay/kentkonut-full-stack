import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  checkAdminAuth,
  handleServerError,
  createSuccessResponse,
  createErrorResponse,
} from '@/utils/corporate-cards-utils';

// Zod schema for query parameters validation
const querySchema = z.object({
  page: z.preprocess(Number, z.number().int().min(1).default(1)).optional(),
  limit: z.preprocess(Number, z.number().int().min(1).max(100).default(10)).optional(),
  level: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  orderBy: z.enum(['timestamp', 'level', 'context']).default('timestamp').optional(),
  orderDirection: z.enum(['asc', 'desc']).default('desc').optional(),
});

// GET /api/admin/logs - Fetch application logs
export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.success) return authResult.response!;

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const parsedQuery = querySchema.parse(query);

    const { page, limit, level, search, startDate, endDate, orderBy, orderDirection } = parsedQuery;

    const skip = (page! - 1) * limit!;

    const where: any = {};

    if (level) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { context: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate) {
      where.timestamp = { ...where.timestamp, gte: new Date(startDate) };
    }

    if (endDate) {
      where.timestamp = { ...where.timestamp, lte: new Date(endDate) };
    }

    const totalCount = await db.applicationLog.count({ where });
    const totalPages = Math.ceil(totalCount / limit!);

    const logs = await db.applicationLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [orderBy!]: orderDirection!,
      },
    });

    return createSuccessResponse(
      {
        logs,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
        },
      },
      'Loglar başarıyla getirildi',
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse('Doğrulama hatası', error.errors, 400);
    }
    return handleServerError(error, 'Admin logs fetch error');
  }
}
