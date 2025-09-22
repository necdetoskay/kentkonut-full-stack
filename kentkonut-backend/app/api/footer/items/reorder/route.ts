import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ReorderSchema = z.object({
  sectionId: z.string().cuid(),
  items: z.array(z.object({ id: z.string().cuid(), order: z.number().int().nonnegative() }))
});

function ensureAdmin(session: any) {
  const role = typeof session?.user?.role === "string" ? session.user.role.toLowerCase() : undefined;
  return !!(session?.user && role === "admin");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!ensureAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = ReorderSchema.parse(body);

    // Ensure all items belong to the given section
    const existing = await db.footerItem.findMany({
      where: { id: { in: parsed.items.map(i => i.id) } },
      select: { id: true, sectionId: true },
    });
    const allBelong = existing.every(e => e.sectionId === parsed.sectionId);
    if (!allBelong) {
      return NextResponse.json({ error: 'Item listesi belirtilen bölüme ait değil.' }, { status: 400 });
    }

    await db.$transaction(
      parsed.items.map((item) =>
        db.footerItem.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[FOOTER_ITEMS_REORDER]", error);
    return NextResponse.json({ error: error?.message || "Invalid request" }, { status: 400 });
  }
}
