import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Hero banners endpoint - Frontend Hero bileşeni için özel endpoint
// Sadece HERO tipindeki banner grubunu döner
export async function GET() {
  try {
    console.log("[HERO_BANNERS_GET] Hero banners endpoint called");

    // 1) Önce usageType = 'HERO' olan aktif grubu bul
    let heroGroup = await db.bannerGroup.findFirst({
      where: {
        usageType: 'HERO',
        isActive: true,
      },
      include: {
        banners: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    // 2) Yoksa bilinen isim varyantlarıyla aramayı dene (eski seed/script isimleri)
    if (!heroGroup) {
      const nameVariants = [
        'Ana Sayfa Üst Banner',
        'Ana Sayfa Hero Banner',
        'Ana Sayfa Hero',
        'Hero Section',
      ];

      heroGroup = await db.bannerGroup.findFirst({
        where: {
          name: { in: nameVariants },
          isActive: true,
        },
        include: {
          banners: {
            where: {
              isActive: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    }

    if (!heroGroup) {
      console.log("[HERO_BANNERS_GET] Hero banner group not found");
      return NextResponse.json({
        error: "Hero banner group not found",
        message: "HERO tipinde veya bilinen isimlerde aktif bir banner grubu bulunamadı",
      }, { status: 404 });
    }

    console.log(`[HERO_BANNERS_GET] Hero group found: ${heroGroup.name}, banners: ${heroGroup.banners.length}`);

    return NextResponse.json(heroGroup);
  } catch (error) {
    console.error("[HERO_BANNERS_GET] Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Hero banner verileri alınamadı" },
      { status: 500 }
    );
  }
}
