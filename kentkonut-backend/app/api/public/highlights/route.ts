import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSuccessResponse, handleServerError } from '@/utils/corporate-cards-utils'

// GET /api/public/highlights - list active highlights for public consumption
export async function GET() {
  try {
    const items = await db.highlight.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    return createSuccessResponse({ items, count: items.length }, 'Aktif öne çıkanlar başarıyla alındı')
  } catch (error) {
    return handleServerError(error, 'Public highlights list error')
  }
}
