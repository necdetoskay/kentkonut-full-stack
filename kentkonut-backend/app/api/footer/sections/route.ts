import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const SectionSchema = z.object({
  id: z.string().cuid().optional(),
  key: z.string().min(2).max(120),
  title: z.string().min(1).max(200).nullable().optional(),
  type: z.enum(["LINKS", "IMAGE", "CONTACT", "TEXT", "LEGAL"]),
  orientation: z.enum(["VERTICAL", "HORIZONTAL"]).optional().default("VERTICAL"),
  order: z.number().int().nonnegative().default(0),
  isActive: z.boolean().optional().default(true),
  layoutConfig: z.any().optional(),
});

function ensureAdmin(session: any) {
  const role = typeof session?.user?.role === "string" ? session.user.role.toLowerCase() : undefined;
  if (!session?.user || role !== "admin") {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const sections = await db.footerSection.findMany({
      orderBy: { order: "asc" },
      include: { items: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json(sections);
  } catch (error) {
    console.error("[FOOTER_SECTIONS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!ensureAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = SectionSchema.parse(body);

    // Enforce max 6 sections
    const count = await db.footerSection.count();
    if (count >= 6) {
      return NextResponse.json({ error: 'Bölüm limiti aşıldı (en fazla 6 bölüm olabilir).' }, { status: 400 });
    }

    const created = await db.footerSection.create({
      data: {
        key: parsed.key,
        title: parsed.title ?? null,
        type: parsed.type,
        orientation: parsed.orientation ?? "VERTICAL",
        order: parsed.order ?? 0,
        isActive: parsed.isActive ?? true,
        layoutConfig: parsed.layoutConfig ?? undefined,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("[FOOTER_SECTIONS_POST]", error);
    return NextResponse.json({ error: error?.message || "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!ensureAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = SectionSchema.extend({ id: z.string().cuid() }).parse(body);

    const updated = await db.footerSection.update({
      where: { id: parsed.id },
      data: {
        key: parsed.key,
        title: parsed.title ?? null,
        type: parsed.type,
        orientation: parsed.orientation ?? "VERTICAL",
        order: parsed.order ?? 0,
        isActive: parsed.isActive ?? true,
        layoutConfig: parsed.layoutConfig ?? undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[FOOTER_SECTIONS_PATCH]", error);
    return NextResponse.json({ error: error?.message || "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!ensureAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    // Cascade delete handled by relation; but ensure items removed first to be explicit
    await db.footerItem.deleteMany({ where: { sectionId: id } });
    await db.footerSection.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[FOOTER_SECTIONS_DELETE]", error);
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}
