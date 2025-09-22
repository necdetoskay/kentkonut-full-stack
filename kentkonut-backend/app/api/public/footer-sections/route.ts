
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const sections = await db.footerSection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        items: {
          // FooterItem model'ında isActive alanı yok; sadece sıralama uygula
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("[PUBLIC_FOOTER_SECTIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
