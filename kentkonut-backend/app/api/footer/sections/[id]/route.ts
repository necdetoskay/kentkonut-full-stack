import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const section = await db.footerSection.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: { order: "asc" } } },
    });
    if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(section);
  } catch (error) {
    console.error("[FOOTER_SECTION_GET_ONE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
