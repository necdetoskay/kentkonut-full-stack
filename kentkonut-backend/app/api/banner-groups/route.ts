import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BannerGroupFormData } from '@/types';
import { BannerAnimasyonTipi } from '@/shared/types';

// GET /api/banner-groups - Tüm banner gruplarını listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filtreleme
    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Banner gruplarını getir
    const [bannerGroups, total] = await Promise.all([
      prisma.bannerGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.bannerGroup.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: bannerGroups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Banner grupları listelenirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Banner grupları listelenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/banner-groups - Yeni banner grubu oluştur
export async function POST(request: NextRequest) {
  try {
    const body: BannerGroupFormData = await request.json();

    // Validasyon
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Banner grubu adı zorunludur' },
        { status: 400 }
      );
    }

    if (body.width <= 0 || body.height <= 0) {
      return NextResponse.json(
        { success: false, error: 'Geçerli boyutlar giriniz' },
        { status: 400 }
      );
    }

    if (body.displayDuration <= 0) {
      return NextResponse.json(
        { success: false, error: 'Geçerli gösterim süresi giriniz' },
        { status: 400 }
      );
    }

    // Banner grubunu oluştur
    const bannerGroup = await prisma.bannerGroup.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim(),
        isActive: body.isActive ?? true,
        deletable: body.deletable ?? true,
        width: body.width,
        height: body.height,
        mobileWidth: body.mobileWidth,
        mobileHeight: body.mobileHeight,
        tabletWidth: body.tabletWidth,
        tabletHeight: body.tabletHeight,
        displayDuration: body.displayDuration,
        transitionDuration: body.transitionDuration,
        animationType: body.animationType as BannerAnimasyonTipi
      }
    });

    // Eğer positionUUID belirtilmişse ve 'none' değilse, banner pozisyonunu güncelle
    if (body.positionUUID && body.positionUUID !== 'none') {
      console.log('🔧 Creating/updating banner position:', body.positionUUID, 'for group:', bannerGroup.id);
      
      await prisma.bannerPosition.upsert({
        where: {
          positionUUID: body.positionUUID
        },
        update: {
          bannerGroupId: bannerGroup.id,
          fallbackGroupId: body.fallbackGroupId || null
        },
        create: {
          positionUUID: body.positionUUID,
          name: `Banner Position ${body.positionUUID}`,
          bannerGroupId: bannerGroup.id,
          fallbackGroupId: body.fallbackGroupId || null,
          isActive: true,
          priority: 1
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: bannerGroup,
      message: 'Banner grubu başarıyla oluşturuldu'
    }, { status: 201 });

  } catch (error) {
    console.error('Banner grubu oluşturulurken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Banner grubu oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 