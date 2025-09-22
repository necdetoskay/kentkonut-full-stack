import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET all site settings
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const settings = await db.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST (update) site settings
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { settings } = body;

    if (!Array.isArray(settings)) {
      return new NextResponse("Invalid data format", { status: 400 });
    }

    // Use a transaction to update all settings at once
    const updateTransactions = settings.map(setting =>
      db.siteSetting.update({
        where: { key: setting.key },
        data: { value: setting.value },
      })
    );

    await db.$transaction(updateTransactions);

    return new NextResponse("Settings updated successfully", { status: 200 });

  } catch (error) {
    console.error("[SETTINGS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
