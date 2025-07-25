import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withCors, handleCorsPreflightRequest } from '@/lib/cors'

// OPTIONS /api/public/banners/position/[uuid] - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// GET banner by position UUID (CORS enabled)
export const GET = withCors(async (request: NextRequest) => {
  try {
    // Extract UUID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const uuid = pathSegments[pathSegments.length - 1];

    console.log(`[BANNER_POSITION_GET] Position UUID: ${uuid}`)

    // Banner pozisyonunu bul
    const bannerPosition = await db.bannerPosition.findUnique({
      where: {
        positionUUID: uuid,
        isActive: true
      },
      include: {
        bannerGroup: {
          include: {
            banners: {
              where: {
                isActive: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        fallbackGroup: {
          include: {
            banners: {
              where: {
                isActive: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    })

    if (!bannerPosition) {
      console.log(`[BANNER_POSITION_GET] Position not found: ${uuid}`)
      return NextResponse.json(
        { error: 'Banner position not found' },
        { status: 404 }
      )
    }

    // Önce ana banner grubunu kontrol et
    let bannerGroup = bannerPosition.bannerGroup

    // Ana grup yoksa veya aktif değilse fallback grubu kullan
    if (!bannerGroup || !bannerGroup.isActive) {
      bannerGroup = bannerPosition.fallbackGroup
      console.log(`[BANNER_POSITION_GET] Using fallback group for position: ${uuid}`)
    }

    if (!bannerGroup || !bannerGroup.isActive) {
      console.log(`[BANNER_POSITION_GET] No active banner group found for position: ${uuid}`)
      return NextResponse.json(
        { 
          position: bannerPosition,
          bannerGroup: null,
          banners: []
        },
        { status: 200 }
      )
    }

    console.log(`[BANNER_POSITION_GET] Found banner group: ${bannerGroup.name}, banners: ${bannerGroup.banners.length}`)

    return NextResponse.json({
      position: bannerPosition,
      bannerGroup: bannerGroup,
      banners: bannerGroup.banners
    })

  } catch (error) {
    console.error('[BANNER_POSITION_GET] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
});