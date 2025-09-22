import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// Public statistics endpoint - banner istatistiklerini kaydetmek için
export async function POST(req: Request) {
  try {
    console.log("[PUBLIC_STATISTICS_POST] Public statistics endpoint called");

    const json = await req.json();
    const { bannerId, type } = json;

    if (!bannerId || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (!['view', 'click'].includes(type)) {
      return new NextResponse("Invalid statistic type", { status: 400 });
    }

    // Banner'ın varlığını kontrol et
    const banner = await db.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      return new NextResponse("Banner not found", { status: 404 });
    }

    // Headers'dan IP adresi ve user agent bilgilerini al
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const referrer = headersList.get('referer') || null;

    // İstatistiği kaydet
    const statistic = await db.bannerStatistics.create({
      data: {
        bannerId,
        type,
        ipAddress: ipAddress.toString(),
        userAgent: userAgent.toString(),
        referrer,
      },
    });

    // Banner'ın view/click sayısını güncelle
    if (type === 'view') {
      await db.banner.update({
        where: { id: bannerId },
        data: { viewCount: { increment: 1 } }
      });
    } else if (type === 'click') {
      await db.banner.update({
        where: { id: bannerId },
        data: { clickCount: { increment: 1 } }
      });
    }

    console.log(`[PUBLIC_STATISTICS_POST] ${type} recorded for banner ${bannerId}`);
    
    return NextResponse.json({ success: true, statistic });
  } catch (error) {
    console.error("[PUBLIC_STATISTICS_POST] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
