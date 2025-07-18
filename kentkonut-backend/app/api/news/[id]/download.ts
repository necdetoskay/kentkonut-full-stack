import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await db.news.update({
      where: { id: parseInt(id) },
      data: { downloadCount: { increment: 1 } }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Download count update failed" }, { status: 500 });
  }
} 