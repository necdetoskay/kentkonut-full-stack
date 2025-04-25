import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bannerSchema } from "@/lib/validations/banner";
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

    const banner = await db.banner.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        statistics: true
      }
    });

    if (!banner) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("[BANNER_GET]", error);
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

    const json = await req.json();
    const body = bannerSchema.parse(json);

    const banner = await db.banner.update({
      where: {
        id: parseInt(params.id)
      },
      data: body
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("[BANNER_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
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

    await db.banner.delete({
      where: {
        id: parseInt(params.id)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BANNER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 