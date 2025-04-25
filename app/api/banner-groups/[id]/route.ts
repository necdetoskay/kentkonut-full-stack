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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bannerGroup = await db.bannerGroup.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        banners: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!bannerGroup) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(bannerGroup);
  } catch (error) {
    console.error("[BANNER_GROUP_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = await Promise.resolve(params.id);
    const json = await req.json();
    const body = bannerGroupSchema.parse(json);

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

    const bannerGroup = await db.bannerGroup.update({
      where: {
        id: parseInt(id)
      },
      data: updateData
    });

    return NextResponse.json(bannerGroup);
  } catch (error) {
    console.error("[BANNER_GROUP_PUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.bannerGroup.delete({
      where: {
        id: parseInt(params.id)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BANNER_GROUP_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 