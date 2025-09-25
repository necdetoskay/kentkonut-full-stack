import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const project = await db.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Proje bulunamadı' },
        { status: 404 }
      );
    }

    // İstatistikleri hesapla
    const [
      totalViews,
      totalComments,
      totalGalleryItems,
      totalDownloads,
      recentActivities,
      seoMetrics
    ] = await Promise.all([
      // Toplam görüntüleme
      db.project.findUnique({
        where: { id: projectId },
        select: { viewCount: true }
      }),
      
      // Toplam yorum sayısı
      db.comment.count({
        where: { projectId: projectId }
      }),
      
      // Toplam galeri öğesi sayısı
      db.projectGalleryMedia.count({
        where: {
          gallery: {
            projectId: projectId
          }
        }
      }),
      
      // Toplam indirme sayısı (media tablosundan)
      db.media.count({
        where: {
          projectGalleryMedia: {
            some: {
              gallery: {
                projectId: projectId
              }
            }
          }
        }
      }),
      
      // Son aktiviteler (son 7 gün)
      db.$queryRaw`
        SELECT 
          'comment' as type,
          c.content as description,
          c.createdAt as timestamp,
          u.name as user_name
        FROM comments c
        JOIN users u ON c.userId = u.id
        WHERE c.projectId = ${projectId}
        AND c.createdAt >= NOW() - INTERVAL '7 days'
        
        UNION ALL
        
        SELECT 
          'gallery' as type,
          CONCAT('Galeriye ', COUNT(*), ' öğe eklendi') as description,
          MAX(pgm.createdAt) as timestamp,
          'Sistem' as user_name
        FROM project_gallery_media pgm
        JOIN project_galleries pg ON pgm.galleryId = pg.id
        WHERE pg.projectId = ${projectId}
        AND pgm.createdAt >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(pgm.createdAt)
        
        ORDER BY timestamp DESC
        LIMIT 10
      `,
      
      // SEO metrikleri
      db.project.findUnique({
        where: { id: projectId },
        select: {
          readingTime: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ]);

    // Son 30 günün görüntüleme istatistikleri
    const viewStats = await db.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views
      FROM project_views 
      WHERE project_id = ${projectId}
      AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Proje detayları
    const projectDetails = await db.project.findUnique({
      where: { id: projectId },
      select: {
        title: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        locationName: true,
        province: true,
        district: true,
        yil: true,
        blokDaireSayisi: true,
        tags: {
          select: {
            tag: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    // Galeri önizleme
    const galleryPreview = await db.projectGalleryMedia.findMany({
      where: {
        gallery: {
          projectId: projectId
        }
      },
      take: 9,
      select: {
        id: true,
        media: {
          select: {
            id: true,
            url: true,
            filename: true,
            type: true
          }
        }
      }
    });

    const stats = {
      totalViews: totalViews?.viewCount || 0,
      totalComments,
      totalGalleryItems,
      totalDownloads,
      recentActivities: recentActivities || [],
      viewStats: viewStats || [],
      seoMetrics: {
        readingTime: seoMetrics?.readingTime || 0,
        avgEngagementTime: Math.floor((totalViews?.viewCount || 0) * 3.5), // Tahmini ortalama süre
        bounceRate: 23, // Sabit değer - gerçek implementasyonda hesaplanacak
        shares: Math.floor((totalViews?.viewCount || 0) * 0.02) // Tahmini paylaşım sayısı
      },
      projectDetails,
      galleryPreview
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
