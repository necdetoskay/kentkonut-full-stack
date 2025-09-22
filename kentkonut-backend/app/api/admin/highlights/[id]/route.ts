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

const highlightUpdateSchema = z.object({
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  sourceType: z.enum([
    'PRESIDENT',
    'GENERAL_MANAGER',
    'DEPARTMENTS',
    'MISSION',
    'VISION',
    'CUSTOM',
  ]).optional(),
  sourceRefId: z.string().optional().nullable(),
  titleOverride: z.string().optional().nullable(),
  subtitleOverride: z.string().optional().nullable(),
  imageMode: z.enum(['AUTO', 'CUSTOM']).optional(),
  imageUrl: z.string().optional().nullable(),
  // Added to allow updating custom route from admin form
  routeOverride: z.string().optional().nullable(),
  redirectUrl: z.string().optional().nullable(),
})

// GET /api/admin/highlights/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.success) return authResult.response!

    const { id } = await params
    if (!id) return createErrorResponse('Geçersiz highlight ID', undefined, 400)

    const item = await db.highlight.findUnique({ where: { id } })
    if (!item) return createErrorResponse('Kayıt bulunamadı', undefined, 404)

    return createSuccessResponse(item, 'Kayıt başarıyla alındı')
  } catch (error) {
    return handleServerError(error, 'Admin highlight get error')
  }
}

// PATCH /api/admin/highlights/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.success) return authResult.response!

    const { id } = await params
    if (!id) return createErrorResponse('Geçersiz highlight ID', undefined, 400)

    const exists = await db.highlight.findUnique({ where: { id }, select: { id: true } })
    if (!exists) return createErrorResponse('Kayıt bulunamadı', undefined, 404)

    const body = await request.json()
    const parsed = highlightUpdateSchema.parse(body)

    const updateData: any = { ...parsed }
    if (updateData.imageUrl !== undefined) {
      updateData.imageUrl = sanitizeUrl(updateData.imageUrl)
    }
    if (updateData.redirectUrl !== undefined) {
      updateData.redirectUrl = sanitizeUrl(updateData.redirectUrl)
    }
    // Sanitize routeOverride but preserve relative URLs like "/path"
    if (updateData.routeOverride !== undefined) {
      const val = updateData.routeOverride as string | null
      if (val && !val.trim().startsWith('/')) {
        updateData.routeOverride = sanitizeUrl(val)
      } else {
        updateData.routeOverride = val?.trim() || null
      }
    }

    const updated = await db.highlight.update({ where: { id }, data: updateData })

    return createSuccessResponse(updated, 'Kayıt başarıyla güncellendi')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse('Doğrulama hatası', error.errors, 400)
    }
    return handleServerError(error, 'Admin highlight patch error')
  }
}

// DELETE /api/admin/highlights/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.success) return authResult.response!

    const { id } = await params
    if (!id) return createErrorResponse('Geçersiz highlight ID', undefined, 400)

    const exists = await db.highlight.findUnique({ where: { id }, select: { id: true } })
    if (!exists) return createErrorResponse('Kayıt bulunamadı', undefined, 404)

    await db.highlight.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { deletedId: id }, message: 'Kayıt başarıyla silindi' })
  } catch (error) {
    return handleServerError(error, 'Admin highlight delete error')
  }
}