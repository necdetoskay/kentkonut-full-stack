import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

interface DailyStats {
  date: string;
  views: number;
  clicks: number;
  clickRate: string;
}

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parametreleri al
    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "all";
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Tarih aralığını belirle
    let dateFilter = {};
    if (period === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = {
        createdAt: {
          gte: today,
        },
      };
    } else if (period === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = {
        createdAt: {
          gte: weekAgo,
        },
      };
    } else if (period === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = {
        createdAt: {
          gte: monthAgo,
        },
      };
    } else if (period === "custom" && startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    // İstatistikleri getir
    const viewStats = await db.statistics.count({
      where: {
        type: "VIEW",
        ...dateFilter,
      },
    });

    const clickStats = await db.statistics.count({
      where: {
        type: "CLICK",
        ...dateFilter,
      },
    });

    // Banner bazlı istatistikler
    const bannerStats = await db.banner.findMany({
      select: {
        id: true,
        title: true,
        bannerGroup: {
          select: {
            name: true,
          },
        },
        statistics: {
          where: {
            ...dateFilter,
          },
        },
      },
    });

    // Her banner için görüntüleme ve tıklama sayılarını hesapla
    const processedBannerStats = bannerStats.map(banner => {
      const views = banner.statistics.filter(stat => stat.type === "VIEW").length;
      const clicks = banner.statistics.filter(stat => stat.type === "CLICK").length;
      const clickRate = views > 0 ? (clicks / views * 100).toFixed(2) : "0.00";
      
      return {
        id: banner.id,
        title: banner.title,
        groupName: banner.bannerGroup.name,
        views,
        clicks,
        clickRate: `${clickRate}%`,
      };
    });

    // Grup bazlı istatistikler
    const groupStats = await db.bannerGroup.findMany({
      select: {
        id: true,
        name: true,
        banners: {
          select: {
            statistics: {
              where: {
                ...dateFilter,
              },
            },
          },
        },
      },
    });

    // Her grup için görüntüleme ve tıklama sayılarını hesapla
    const processedGroupStats = groupStats.map(group => {
      let totalViews = 0;
      let totalClicks = 0;
      
      group.banners.forEach(banner => {
        totalViews += banner.statistics.filter(stat => stat.type === "VIEW").length;
        totalClicks += banner.statistics.filter(stat => stat.type === "CLICK").length;
      });
      
      const clickRate = totalViews > 0 ? (totalClicks / totalViews * 100).toFixed(2) : "0.00";
      
      return {
        id: group.id,
        name: group.name,
        views: totalViews,
        clicks: totalClicks,
        clickRate: `${clickRate}%`,
      };
    });

    // Günlük istatistikler
    let dailyStats: DailyStats[] = [];
    if (["week", "month", "custom"].includes(period)) {
      // Tarih aralığını belirle
      const startDateObj = period === "custom" && startDate 
        ? new Date(startDate) 
        : period === "week" 
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const endDateObj = period === "custom" && endDate 
        ? new Date(endDate) 
        : new Date();
      
      const dateRange: Date[] = [];
      let currentDate = new Date(startDateObj);
      
      while (currentDate <= endDateObj) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Her gün için istatistikleri hesapla
      dailyStats = await Promise.all(dateRange.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const views = await db.statistics.count({
          where: {
            type: "VIEW",
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });
        
        const clicks = await db.statistics.count({
          where: {
            type: "CLICK",
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });
        
        return {
          date: dayStart.toISOString().split("T")[0],
          views,
          clicks,
          clickRate: views > 0 ? (clicks / views * 100).toFixed(2) : "0.00",
        };
      }));
    }

    return NextResponse.json({
      overview: {
        totalViews: viewStats,
        totalClicks: clickStats,
        clickRate: viewStats > 0 ? (clickStats / viewStats * 100).toFixed(2) : "0.00",
      },
      banners: processedBannerStats,
      groups: processedGroupStats,
      daily: dailyStats,
    });
  } catch (error) {
    console.error("[STATISTICS_API]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 