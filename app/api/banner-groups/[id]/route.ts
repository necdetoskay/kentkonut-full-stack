import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const bannerGroupSchema = z.object({
  name: z.string().min(2),
  status: z.enum(["active", "passive"]),
  playMode: z.enum(["MANUAL", "AUTO"]),
  animationType: z.enum(["FADE", "SLIDE", "ZOOM"]),
  displayDuration: z.number().min(1000),
  transitionDuration: z.number().min(0.1),
  width: z.number().min(1),
  height: z.number().min(1),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const bannerGroup = await db.bannerGroup.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        banners: true
      }
    });

    if (!bannerGroup) {
      return new NextResponse("Banner group not found", { status: 404 });
    }

    return NextResponse.json(bannerGroup);
  } catch (error) {
    console.error("[BANNER_GROUP_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const json = await req.json();
    const body = bannerGroupSchema.parse(json);

    // Güncellemeden önce mevcut banner grubunu alalım
    const existingBannerGroup = await db.bannerGroup.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!existingBannerGroup) {
      return new NextResponse("Banner group not found", { status: 404 });
    }

    // Boyutlar değişiyorsa kontrol edelim
    const widthChanged = existingBannerGroup.width !== body.width;
    const heightChanged = existingBannerGroup.height !== body.height;
    const dimensionsChanged = widthChanged || heightChanged;

    // Prisma modeline uygun veri hazırlama
    const updateData = {
      name: body.name,
      active: body.status === "active",
      playMode: body.playMode,
      animation: body.animationType,
      duration: body.displayDuration,
      width: body.width,
      height: body.height,
      updatedAt: new Date(),
    };

    // Banner grubunu güncelle
    const bannerGroup = await db.bannerGroup.update({
      where: {
        id: parseInt(id)
      },
      data: updateData
    });

    // Eğer boyutlar değiştiyse, banner'ların hepsini pasif yap
    if (dimensionsChanged) {
      await db.banner.updateMany({
        where: {
          bannerGroupId: parseInt(id)
        },
        data: {
          active: false, // Tüm banner'ları pasif yap
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      ...bannerGroup,
      dimensionsChanged,
      message: dimensionsChanged ? 
        "Banner grubunun boyutları değiştirildi. Tüm banner'lar pasif yapıldı. Lütfen banner'ları yeniden boyutlandırın ve aktifleştirin." : 
        "Banner grubu güncellendi."
    });
  } catch (error) {
    console.error("[BANNER_GROUP_PUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const bannerGroup = await db.bannerGroup.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!bannerGroup) {
      return new NextResponse("Banner group not found", { status: 404 });
    }

    await db.bannerGroup.delete({
      where: {
        id: parseInt(id)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BANNER_GROUP_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 