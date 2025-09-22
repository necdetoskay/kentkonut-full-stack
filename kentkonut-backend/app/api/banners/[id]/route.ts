import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BannerFormData } from '@/types';

// GET /api/banners/:id - Belirli bannerı getir
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

    const banner = await prisma.banner.findUnique({
      where: { id },
      include: {
        bannerGroup: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      banner: banner
    });

  } catch (error) {
    console.error('Banner getirilirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Banner getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/banners/:id - Bannerı güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Catch bloğunda loglamak için isteğe ait temel bilgileri önden tanımlayalım
  let requestId: number | undefined
  let requestBody: BannerFormData | undefined
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    requestId = id

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz ID' },
        { status: 400 }
      );
    }

    const body: BannerFormData = await request.json();
    requestBody = body

    // Bannerın var olup olmadığını kontrol et
    const existingBanner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner bulunamadı' },
        { status: 404 }
      );
    }

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

    // Prepare update data (exclude bannerGroupId from updates)
    const updateData: any = {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      link: body.link?.trim() || null,
      isActive: body.isActive,
      deletable: body.deletable,
      order: body.order,
      imageUrl: body.imageUrl.trim(),
      altText: body.altText?.trim() || null,
      updatedAt: new Date()
    };

    // Handle date fields properly
    if (body.startDate) {
      updateData.startDate = new Date(body.startDate);
    } else {
      updateData.startDate = null;
    }

    if (body.endDate) {
      updateData.endDate = new Date(body.endDate);
    } else {
      updateData.endDate = null;
    }

    // Bannerı güncelle
    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: updateData,
      include: {
        bannerGroup: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedBanner,
      message: 'Banner başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Banner güncellenirken hata:', error);
    console.error('Request body:', requestBody);
    console.error('Banner ID:', requestId);

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { success: false, error: 'Bu banner bilgileri zaten kullanımda' },
          { status: 409 }
        );
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { success: false, error: 'Geçersiz banner grubu referansı' },
          { status: 400 }
        );
      }
      if (error.message.includes('Invalid date')) {
        return NextResponse.json(
          { success: false, error: 'Geçersiz tarih formatı' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Banner güncellenirken bir hata oluştu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/banners/[id] - Banner güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const bannerId = parseInt(idParam)
    const body = await request.json()

    // Banner'ın var olup olmadığını kontrol et
    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId }
    })

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner bulunamadı' },
        { status: 404 }
      )
    }

    // Güncellenecek alanları belirle
    const updateData: any = {}
    
    if (typeof body.isActive === 'boolean') {
      updateData.isActive = body.isActive
    }
    
    if (body.title && body.title.trim().length > 0) {
      updateData.title = body.title.trim()
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }
    
    if (body.link !== undefined) {
      updateData.link = body.link?.trim() || null
    }
    
    if (typeof body.deletable === 'boolean') {
      updateData.deletable = body.deletable
    }
    
    if (body.imageUrl && body.imageUrl.trim().length > 0) {
      updateData.imageUrl = body.imageUrl.trim()
    }
    
    if (body.altText !== undefined) {
      updateData.altText = body.altText?.trim() || null
    }

    // Banner'ı güncelle
    const updatedBanner = await prisma.banner.update({
      where: { id: bannerId },
      data: updateData,
      include: {
        bannerGroup: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedBanner,
      message: 'Banner başarıyla güncellendi'
    })

  } catch (error) {
    console.error('Banner güncellenirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Banner güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE /api/banners/:id - Bannerı sil
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

    // Bannerın var olup olmadığını ve silinebilir olup olmadığını kontrol et
    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner bulunamadı' },
        { status: 404 }
      );
    }

    if (!banner.deletable) {
      return NextResponse.json(
        { success: false, error: 'Bu banner silinemez' },
        { status: 403 }
      );
    }

    // Bannerı sil
    await prisma.banner.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Banner başarıyla silindi'
    });

  } catch (error) {
    console.error('Banner silinirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Banner silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}