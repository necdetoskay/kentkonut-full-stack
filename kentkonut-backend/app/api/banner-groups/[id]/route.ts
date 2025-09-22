import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BannerGroupFormData } from '@/types';

// GET /api/banner-groups/:id - Belirli banner grubunu getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    const bannerGroup = await prisma.bannerGroup.findUnique({
      where: { id },
      include: {
        primaryPositions: {
          select: {
            positionUUID: true,
            fallbackGroupId: true
          }
        }
      }
    });

    if (!bannerGroup) {
      return NextResponse.json(
        { success: false, error: 'Banner grubu bulunamadı' },
        { status: 404 }
      );
    }

    // Pozisyon bilgisini ekle
    const positionUUID = bannerGroup.primaryPositions?.[0]?.positionUUID || '';
    const fallbackGroupId = bannerGroup.primaryPositions?.[0]?.fallbackGroupId || undefined;

    const bannerGroupWithPosition = {
      ...bannerGroup,
      positionUUID,
      fallbackGroupId
    };

    return NextResponse.json({
      success: true,
      bannerGroup: bannerGroupWithPosition
    });

  } catch (error) {
    console.error('Banner grubu getirilirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Banner grubu getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/banner-groups/:id - Banner grubunu güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    const body: BannerGroupFormData = await request.json();

    // Banner grubunun var olup olmadığını kontrol et
    const existingGroup = await prisma.bannerGroup.findUnique({
      where: { id }
    });

    if (!existingGroup) {
      return NextResponse.json(
        { success: false, error: 'Banner grubu bulunamadı' },
        { status: 404 }
      );
    }

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

    // Banner grubunu güncelle
    const updatedGroup = await prisma.bannerGroup.update({
      where: { id },
      data: {
        name: body.name.trim(),
        description: body.description?.trim(),
        isActive: body.isActive,
        deletable: body.deletable,
        width: body.width,
        height: body.height,
        mobileWidth: body.mobileWidth,
        mobileHeight: body.mobileHeight,
        tabletWidth: body.tabletWidth,
        tabletHeight: body.tabletHeight,
        displayDuration: body.displayDuration,
        transitionDuration: body.transitionDuration,
        animationType: body.animationType
      }
    });

    // Eğer positionUUID belirtilmişse ve 'none' değilse, banner pozisyonunu güncelle
    if (body.positionUUID && body.positionUUID !== 'none') {
      console.log('🔧 Updating banner position:', body.positionUUID, 'for group:', updatedGroup.id);
      
      await prisma.bannerPosition.upsert({
        where: {
          positionUUID: body.positionUUID
        },
        update: {
          bannerGroupId: updatedGroup.id,
          fallbackGroupId: body.fallbackGroupId || null
        },
        create: {
          positionUUID: body.positionUUID,
          name: `Banner Position ${body.positionUUID}`,
          bannerGroupId: updatedGroup.id,
          fallbackGroupId: body.fallbackGroupId || null,
          isActive: true,
          priority: 1
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: 'Banner grubu başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Banner grubu güncellenirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Banner grubu güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/banner-groups/:id - Banner grubunu sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    // Banner grubunun var olup olmadığını ve silinebilir olup olmadığını kontrol et
    const bannerGroup = await prisma.bannerGroup.findUnique({
      where: { id }
    });

    if (!bannerGroup) {
      return NextResponse.json(
        { success: false, error: 'Banner grubu bulunamadı' },
        { status: 404 }
      );
    }

    if (!bannerGroup.deletable) {
      return NextResponse.json(
        { success: false, error: 'Bu banner grubu silinemez' },
        { status: 403 }
      );
    }

    // Banner grubunu sil
    await prisma.bannerGroup.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Banner grubu başarıyla silindi'
    });

  } catch (error) {
    console.error('Banner grubu silinirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Banner grubu silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 