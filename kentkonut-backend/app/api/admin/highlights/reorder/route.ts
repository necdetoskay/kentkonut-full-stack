import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  checkAdminAuth,
  handleServerError,
  createSuccessResponse,
  createErrorResponse,
} from '@/utils/corporate-cards-utils'

// POST /api/admin/highlights/reorder
// Body: { items: Array<{ id: string; order: number }> }
const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        order: z.number().int().min(0),
      })
    )
    .min(1, 'En az bir öğe gerekli'),
})

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authResult = await checkAdminAuth()
    if (!authResult.success) {
      return authResult.response!
    }

    const body = await request.json()

    // Validate payload
    const parsed = reorderSchema.safeParse(body)
    if (!parsed.success) {
      return createErrorResponse('Geçersiz veri', parsed.error.format(), 400)
    }

    const { items } = parsed.data

    // Check for duplicate ids in payload
    const ids = items.map((i) => i.id)
    const uniqueIds = new Set(ids)
    if (uniqueIds.size !== ids.length) {
      return createErrorResponse('Tekrarlı id değerleri tespit edildi', { ids }, 400)
    }

    // Apply updates atomically
    const updatedCount = await db.$transaction(async (tx) => {
      let count = 0
      for (const item of items) {
        await tx.highlight.update({
          where: { id: item.id },
          data: { order: item.order },
        })
        count++
      }
      return count
    })

    return createSuccessResponse(
      { updated: updatedCount },
      'Highlights sıralaması başarıyla güncellendi'
    )
  } catch (error: any) {
    return handleServerError(error, 'Highlights sıralaması güncellenirken bir hata oluştu')
  }
}