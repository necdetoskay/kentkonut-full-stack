import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import * as z from "zod";
import { PlayMode, AnimationType } from "@/lib/constants/banner";

const bannerGroupSchema = z.object({
  name: z.string().min(2, "Grup adı en az 2 karakter olmalıdır"),
  status: z.enum(["active", "passive"]),
  playMode: z.enum([PlayMode.MANUAL, PlayMode.AUTO]),
  animationType: z.enum([AnimationType.FADE, AnimationType.SLIDE, AnimationType.ZOOM]),
  displayDuration: z.number().min(1),
  transitionDuration: z.number().min(0.1),
  width: z.number().min(1),
  height: z.number().min(1),
});

type BannerGroupInput = z.infer<typeof bannerGroupSchema>;

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bannerGroups = await db.bannerGroup.findMany({
      include: {
        _count: {
          select: { banners: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bannerGroups);
  } catch (error) {
    console.error("[BANNER_GROUPS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse(
        JSON.stringify({ message: "Oturum açmanız gerekiyor" }),
        { status: 401 }
      );
    }

    const json = await req.json();
    console.log("Gelen veri:", json);
    
    const body = bannerGroupSchema.parse(json) as BannerGroupInput;
    console.log("Doğrulanmış veri:", body);

    const bannerGroup = await db.bannerGroup.create({
      data: {
        name: body.name,
        active: body.status === "active",
        playMode: body.playMode,
        animation: body.animationType,
        duration: body.displayDuration,
        width: body.width,
        height: body.height,
      }
    });

    return NextResponse.json(bannerGroup);
  } catch (error) {
    console.error("[BANNER_GROUPS_POST]", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({
          message: "Geçersiz form verileri",
          errors: error.errors
        }),
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({ message: error.message }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "Beklenmeyen bir hata oluştu" }),
      { status: 500 }
    );
  }
} 