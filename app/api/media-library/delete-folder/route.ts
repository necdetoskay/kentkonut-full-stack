import { NextResponse } from "next/server";
import { join, resolve } from "path";
import { rm } from "fs/promises";
import { auth } from "@/lib/auth";

const UPLOADS_DIR = join(process.cwd(), "public", "uploads");

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { path } = await request.json();
    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Klasör yolu gerekli" }, { status: 400 });
    }
    // Güvenlik: path'in uploads altında olduğundan emin ol
    const base = resolve(UPLOADS_DIR);
    const target = resolve(UPLOADS_DIR, ".", path);
    if (!target.startsWith(base)) {
      return NextResponse.json({ error: "Geçersiz yol" }, { status: 400 });
    }
    await rm(target, { recursive: true, force: true });
    return NextResponse.json({ success: true, message: "Klasör ve içeriği silindi" });
  } catch (error) {
    console.error("Klasör silme hatası:", error);
    return NextResponse.json({ error: "Klasör silinemedi" }, { status: 500 });
  }
} 