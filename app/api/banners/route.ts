import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bannerSchema } from "@/lib/validations/banner";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    console.log("[BANNERS_POST] Gelen veri:", json);
    
    try {
      const body = bannerSchema.parse(json);
      console.log("[BANNERS_POST] Doğrulanmış veri:", body);
      
      // Veri tiplerini kontrol et
      if (typeof body.groupId !== 'number' || isNaN(body.groupId)) {
        return new NextResponse(
          JSON.stringify({ error: "Grup ID geçerli bir sayı olmalıdır" }),
          { status: 400 }
        );
      }
      
      // Mevcut en yüksek sıra numarasını bul
      const maxOrder = await db.banner.findFirst({
        where: {
          groupId: body.groupId,
        },
        orderBy: {
          order: 'desc',
        },
        select: {
          order: true,
        },
      }).catch((dbError: any) => {
        console.error("[BANNERS_POST] Max order sorgu hatası:", dbError);
        return null;
      });

      console.log("[BANNERS_POST] Mevcut max sıra:", maxOrder);

      // Önce banner grubunun var olup olmadığını kontrol et
      const bannerGroup = await db.bannerGroup.findUnique({
        where: {
          id: body.groupId
        }
      });

      if (!bannerGroup) {
        return new NextResponse(
          JSON.stringify({ error: "Banner grubu bulunamadı" }),
          { status: 404 }
        );
      }

      // Yeni banner'ı oluştur
      const banner = await db.banner.create({
        data: {
          title: body.title,
          imageUrl: body.imageUrl,
          linkUrl: body.linkUrl || "",
          active: body.isActive,
          order: maxOrder ? maxOrder.order + 1 : 0,
          bannerGroup: {
            connect: {
              id: body.groupId
            }
          }
        },
      });

      return NextResponse.json(banner);
    } catch (validationError) {
      console.error("[BANNERS_POST] Doğrulama hatası:", validationError);
      return new NextResponse(
        JSON.stringify({ 
          error: "Doğrulama hatası", 
          details: validationError instanceof Error ? validationError.message : "Bilinmeyen hata" 
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[BANNERS_POST]", error);
    
    // Prisma hatalarını daha spesifik ele al
    if (error instanceof Error && error.message.includes("prisma")) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Veritabanı hatası", 
          details: error.message
        }),
        { status: 500 }
      );
    }
    
    return new NextResponse(
      JSON.stringify({ error: "Sunucu hatası" }),
      { status: 500 }
    );
  }
} 