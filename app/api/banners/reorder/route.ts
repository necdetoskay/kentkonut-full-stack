import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import * as z from "zod";

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.number(),
    order: z.number(),
  })),
});

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = reorderSchema.parse(json);

    // Her banner'ın sırasını güncelle
    const updates = body.items.map((item) =>
      db.banner.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );

    await db.$transaction(updates);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BANNERS_REORDER]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 