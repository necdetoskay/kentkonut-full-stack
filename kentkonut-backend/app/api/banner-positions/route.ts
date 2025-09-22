import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/banner-positions - Tüm banner pozisyonlarını listele
export async function GET(request: NextRequest) {
  try {
    const bannerPositions = await db.bannerPosition.findMany({
      include: {
        bannerGroup: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        fallbackGroup: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      },
      orderBy: {
        priority: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: bannerPositions
    })

  } catch (error) {
    console.error('Banner pozisyonları listelenirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Banner pozisyonları listelenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 