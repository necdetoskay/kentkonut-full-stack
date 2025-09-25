import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/projects/[id]/stats - Proje istatistiklerini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz proje ID' },
        { status: 400 }
      );
    }

    // Proje var mı kontrol et
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Proje bulunamadı' },
        { status: 404 }
      );
    }

    // Basit istatistikler
    const totalViews = project.viewCount || 0;
    const totalComments = await prisma.comment.count({
      where: { projectId: projectId }
    });
    
    const totalGalleryItems = await prisma.projectGalleryMedia.count({
      where: {
        gallery: {
          projectId: projectId
        }
      }
    });

    const stats = {
      totalViews,
      totalComments,
      totalGalleryItems,
      totalDownloads: 0,
      recentActivities: [],
      viewStats: [],
      seoMetrics: {
        readingTime: project.readingTime || 0,
        avgEngagementTime: 120,
        bounceRate: 0.45,
        shares: 50
      },
      projectDetails: {
        title: project.title,
        status: project.status,
        publishedAt: project.publishedAt,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        locationName: project.locationName,
        province: project.province,
        district: project.district,
        yil: project.yil,
        blokDaireSayisi: project.blokDaireSayisi,
        tags: []
      },
      galleryPreview: []
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('[PROJECT_STATS_GET]', error);
    return NextResponse.json(
      { success: false, error: 'İstatistikler alınırken hata oluştu' },
      { status: 500 }
    );
  }
}