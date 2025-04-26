import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // URL'den periyot bilgisini al
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'week';
    
    // Periyoda göre başlangıç tarihini hesapla
    const startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    // Banner grubunu kontrol et
    const bannerGroup = await db.bannerGroup.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        banners: true
      }
    });
    
    if (!bannerGroup) {
      return new NextResponse("Banner grubu bulunamadı", { status: 404 });
    }
    
    // Banner ID'lerini al
    const bannerIds = bannerGroup.banners.map(banner => banner.id);
    
    // Toplam görüntülenme ve tıklama sayılarını al
    const viewStats = await db.statistics.count({
      where: {
        bannerId: { in: bannerIds },
        type: "VIEW",
        createdAt: { gte: startDate }
      }
    });
    
    const clickStats = await db.statistics.count({
      where: {
        bannerId: { in: bannerIds },
        type: "CLICK",
        createdAt: { gte: startDate }
      }
    });
    
    // Günlük istatistikleri oluştur (Gerçek veritabanı sorgusu yerine örnek veri üretiyoruz)
    const dailyStats = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyStats.unshift({
        date: date.toLocaleDateString(),
        views: Math.floor(Math.random() * 100),
        clicks: Math.floor(Math.random() * 30)
      });
    }
    
    // Banner bazında istatistikleri al
    const bannerStats = await Promise.all(
      bannerGroup.banners.map(async (banner) => {
        const views = await db.statistics.count({
          where: {
            bannerId: banner.id,
            type: "VIEW",
            createdAt: { gte: startDate }
          }
        });
        
        const clicks = await db.statistics.count({
          where: {
            bannerId: banner.id,
            type: "CLICK",
            createdAt: { gte: startDate }
          }
        });
        
        return {
          id: banner.id,
          title: banner.title,
          active: banner.active,
          views,
          clicks,
          ctr: views > 0 ? (clicks / views * 100).toFixed(2) : 0
        };
      })
    );
    
    // Sonuçları döndür
    return NextResponse.json({
      totalViews: viewStats,
      totalClicks: clickStats,
      dailyStats,
      bannerStats
    });
    
  } catch (error) {
    console.error("[BANNER_GROUP_STATISTICS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 