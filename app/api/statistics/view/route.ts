import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bannerId } = body;
    
    // Gerekli alanları kontrol et
    if (!bannerId) {
      return new NextResponse("bannerId gerekli", { status: 400 });
    }
    
    // Banner'ın var olduğunu kontrol et
    const banner = await db.banner.findUnique({
      where: { id: parseInt(bannerId) }
    });
    
    if (!banner) {
      return new NextResponse("Banner bulunamadı", { status: 404 });
    }
    
    // Görüntüleme istatistiği kaydet
    const stats = await db.statistics.create({
      data: {
        bannerId: parseInt(bannerId),
        type: "VIEW"
      },
    });
    
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("[BANNER_VIEW]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 