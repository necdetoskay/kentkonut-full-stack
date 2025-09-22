import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  checkAdminAuth,
  handleServerError,
  createSuccessResponse,
  createErrorResponse,
  sanitizeUrl,
} from '@/utils/corporate-cards-utils'

// Validation schemas
const highlightCreateSchema = z.object({
  // order is optional; when omitted, we will append to the end
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
  sourceType: z.enum([
    'PRESIDENT',
    'GENERAL_MANAGER',
    'DEPARTMENTS',
    'MISSION',
    'VISION',
    'CUSTOM',
  ]),
  sourceRefId: z.string().optional().nullable(),
  titleOverride: z.string().optional().nullable(),
  subtitleOverride: z.string().optional().nullable(),
  imageMode: z.enum(['AUTO', 'CUSTOM']).default('AUTO'),
  imageUrl: z.string().optional().nullable(),
  routeOverride: z.string().optional().nullable(),
  redirectUrl: z.string().optional().nullable(),
})

const highlightUpdateSchema = highlightCreateSchema.partial()

// GET /api/admin/highlights - list highlights (admin)
export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.success) return authResult.response!

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const search = searchParams.get('search')?.trim()
    const orderByParam = searchParams.get('orderBy') || 'order'
    const orderDirection = (searchParams.get('orderDirection') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'

    const where: any = {}
    if (!includeInactive) where.isActive = true
    if (search && search.length > 0) {
      where.OR = [
        { titleOverride: { contains: search, mode: 'insensitive' } },
        { subtitleOverride: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Only allow ordering by safe fields
    const allowedOrderFields = new Set(['order', 'createdAt', 'updatedAt', 'sourceType', 'isActive'])
    const orderBy = allowedOrderFields.has(orderByParam) ? orderByParam : 'order'

    const items = await db.highlight.findMany({
      where,
      orderBy: [{ [orderBy]: orderDirection }, { order: 'asc' }, { createdAt: 'desc' }],
    })

    return createSuccessResponse({ items, count: items.length }, 'Öne çıkanlar başarıyla alındı')
  } catch (error) {
    return handleServerError(error, 'Admin highlights list error')
  }
}

// POST /api/admin/highlights - create highlight (admin)
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.success) return authResult.response!

    const body = await request.json()
    const parsed = highlightCreateSchema.parse(body)

    // Determine order: if not provided, append to the end (max + 1)
    let desiredOrder = parsed.order
    if (desiredOrder === undefined) {
      const last = await db.highlight.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      })
      desiredOrder = (last?.order ?? -1) + 1
    }

    const data = {
      ...parsed,
      order: desiredOrder,
      imageUrl: sanitizeUrl(parsed.imageUrl ?? undefined),
      redirectUrl: parsed.redirectUrl !== undefined ? sanitizeUrl(parsed.redirectUrl) : null,
      routeOverride:
        parsed.routeOverride !== undefined
          ? (parsed.routeOverride && parsed.routeOverride.trim().startsWith('/')
              ? parsed.routeOverride.trim()
              : sanitizeUrl(parsed.routeOverride))
          : null,
    }

    const created = await db.highlight.create({ data })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse('Doğrulama hatası', error.errors, 400)
    }
    return handleServerError(error, 'Admin highlight create error')
  }
}