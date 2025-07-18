import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { bannerGroupId, bannerOrders } = body

    // Validasyon
    if (!bannerGroupId || !Array.isArray(bannerOrders)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz parametreler' },
        { status: 400 }
      )
    }

    // Banner grubunun varlığını kontrol et
    const bannerGroup = await db.bannerGroup.findUnique({
      where: { id: parseInt(bannerGroupId) }
    })

    if (!bannerGroup) {
      return NextResponse.json(
        { success: false, error: 'Banner grubu bulunamadı' },
        { status: 404 }
      )
    }

    // Transaction ile sıralama güncellemesi
    await db.$transaction(async (tx: any) => {
      for (const { id, order } of bannerOrders) {
        await tx.banner.update({
          where: { id: parseInt(id) },
          data: { order: parseInt(order) }
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Banner sıralaması güncellendi'
    })

  } catch (error) {
    console.error('Banner sıralama hatası:', error)
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
} 