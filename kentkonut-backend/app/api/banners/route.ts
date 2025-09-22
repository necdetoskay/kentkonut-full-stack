import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BannerFormData } from '@/types';
import { buildCacheKey, getCache, setCache, delByPattern } from '@/lib/cache';

// GET /api/banners - Tüm bannerları listele (filtreleme ile)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bannerGroupId = searchParams.get('bannerGroupId');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filtreleme
    const where: any = {};
    if (bannerGroupId) {
      where.bannerGroupId = parseInt(bannerGroupId);
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const cacheKey = buildCacheKey('banner:list', { bannerGroupId: bannerGroupId || 'all', isActive, page, limit });
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Bannerları getir
    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        include: {
          bannerGroup: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.banner.count({ where })
    ]);

    const payload = {
      success: true,
      data: banners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    await setCache(cacheKey, payload);
    return NextResponse.json(payload);

  } catch (error) {
    console.error('Bannerlar listelenirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Bannerlar listelenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/banners - Yeni banner oluştur
export async function POST(request: NextRequest) {
  try {
    const body: BannerFormData = await request.json();

    // Validasyon
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Banner başlığı zorunludur' },
        { status: 400 }
      );
    }

    if (!body.imageUrl || body.imageUrl.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Banner görseli zorunludur' },
        { status: 400 }
      );
    }

    if (!body.bannerGroupId) {
      return NextResponse.json(
        { success: false, error: 'Banner grubu seçimi zorunludur' },
        { status: 400 }
      );
    }

    // Banner grubunun var olup olmadığını kontrol et
    const bannerGroup = await prisma.bannerGroup.findUnique({
      where: { id: body.bannerGroupId }
    });

    if (!bannerGroup) {
      return NextResponse.json(
        { success: false, error: 'Banner grubu bulunamadı' },
        { status: 404 }
      );
    }

    // Sıralama için en yüksek order'ı bul
    const maxOrder = await prisma.banner.findFirst({
      where: { bannerGroupId: body.bannerGroupId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const newOrder = (maxOrder?.order || 0) + 1;

    // Date validation
    if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      if (endDate <= startDate) {
        return NextResponse.json(
          { success: false, error: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' },
          { status: 400 }
        );
      }
    }

    // Bannerı oluştur
    const banner = await prisma.banner.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim(),
        link: body.link?.trim(),
        isActive: body.isActive ?? true,
        deletable: body.deletable ?? true,
        order: newOrder,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        imageUrl: body.imageUrl.trim(),
        altText: body.altText?.trim(),
        bannerGroupId: body.bannerGroupId
      },
      include: {
        bannerGroup: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Invalidate related caches
    try {
      await delByPattern('banner:list:*');
      await delByPattern('banner:groups:*');
    } catch {}

    return NextResponse.json({
      success: true,
      data: banner,
      message: 'Banner başarıyla oluşturuldu'
    }, { status: 201 });

  } catch (error) {
    console.error('Banner oluşturulurken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Banner oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 