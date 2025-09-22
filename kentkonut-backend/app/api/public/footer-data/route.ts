import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Fetch columns with their links, ordered correctly
    const footerColumns = await db.footerColumn.findMany({
      orderBy: { order: 'asc' },
      include: {
        links: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Fetch general site settings (contact info, social media)
    const siteSettings = await db.siteSetting.findMany();

    // Restructure settings into a more accessible key-value object
    const settingsMap = siteSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as { [key: string]: string });

    const responseData = {
      columns: footerColumns,
      settings: settingsMap,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("[FOOTER_DATA_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
