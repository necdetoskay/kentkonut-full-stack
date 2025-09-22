import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const isAllowedUrl = (value: string) => {
  try {
    if (!value) return false;
    if (value.startsWith('/')) return true; // relative path
    if (value.startsWith('mailto:') || value.startsWith('tel:')) return true;
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const ItemSchema = z.object({
  id: z.string().cuid().optional(),
  sectionId: z.string().cuid(),
  order: z.number().int().nonnegative().default(0),
  type: z.enum(["LINK", "EMAIL", "PHONE", "ADDRESS", "IMAGE", "TEXT"]),
  label: z.string().max(300).nullable().optional(),
  url: z
    .string()
    .max(2000)
    .refine((v) => v == null || v === '' || isAllowedUrl(v), {
      message: 'Invalid url',
    })
    .nullable()
    .optional(),
  target: z.enum(["_self", "_blank"]).optional().default("_self"),
  isExternal: z.boolean().optional().default(false),
  icon: z.string().max(100).nullable().optional(),
  imageUrl: z
    .string()
    .max(2000)
    .refine((v) => v == null || v === '' || isAllowedUrl(v), {
      message: 'Invalid url',
    })
    .nullable()
    .optional(),
  text: z.string().max(5000).nullable().optional(),
  metadata: z.any().optional(),
});

function ensureAdmin(session: any) {
  const role = typeof session?.user?.role === "string" ? session.user.role.toLowerCase() : undefined;
  if (!session?.user || role !== "admin") {
    return false;
  }
  return true;
}

// GET /api/footer/items?sectionId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");
    if (!sectionId) {
      return NextResponse.json({ error: "sectionId is required" }, { status: 400 });
    }

    const items = await db.footerItem.findMany({
      where: { sectionId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[FOOTER_ITEMS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/footer/items
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!ensureAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = ItemSchema.parse(body);

    const created = await db.footerItem.create({
      data: {
        sectionId: parsed.sectionId,
        order: parsed.order ?? 0,
        type: parsed.type,
        label: parsed.label ?? null,
        url: parsed.url ?? null,
        target: parsed.target ?? "_self",
        isExternal: parsed.isExternal ?? false,
        icon: parsed.icon ?? null,
        imageUrl: parsed.imageUrl ?? null,
        text: parsed.text ?? null,
        metadata: parsed.metadata ?? undefined,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("[FOOTER_ITEMS_POST]", error);
    return NextResponse.json({ error: error?.message || "Invalid request" }, { status: 400 });
  }
}

// PATCH /api/footer/items
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!ensureAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = ItemSchema.extend({ id: z.string().cuid() }).parse(body);

    const updated = await db.footerItem.update({
      where: { id: parsed.id },
      data: {
        sectionId: parsed.sectionId,
        order: parsed.order ?? 0,
        type: parsed.type,
        label: parsed.label ?? null,
        url: parsed.url ?? null,
        target: parsed.target ?? "_self",
        isExternal: parsed.isExternal ?? false,
        icon: parsed.icon ?? null,
        imageUrl: parsed.imageUrl ?? null,
        text: parsed.text ?? null,
        metadata: parsed.metadata ?? undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[FOOTER_ITEMS_PATCH]", error);
    return NextResponse.json({ error: error?.message || "Invalid request" }, { status: 400 });
  }
}

// DELETE /api/footer/items?id=...
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!ensureAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    await db.footerItem.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[FOOTER_ITEMS_DELETE]", error);
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}
