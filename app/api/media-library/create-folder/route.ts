import { NextResponse } from "next/server";
import { join, resolve } from "path";
import { mkdir } from "fs/promises";
import { auth } from "@/lib/auth";

const UPLOADS_DIR = join(process.cwd(), "public", "uploads");

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { parentPath, name } = await request.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Klasör adı gerekli" }, { status: 400 });
    }
    // Güvenlik: parentPath'in uploads altında olduğundan emin ol
    const base = resolve(UPLOADS_DIR);
    const target = resolve(UPLOADS_DIR, ".", parentPath || "", name);
    if (!target.startsWith(base)) {
      return NextResponse.json({ error: "Geçersiz yol" }, { status: 400 });
    }
    await mkdir(target, { recursive: true });
    return NextResponse.json({ success: true, message: "Klasör oluşturuldu" });
  } catch (error) {
    console.error("Klasör oluşturma hatası:", error);
    return NextResponse.json({ error: "Klasör oluşturulamadı" }, { status: 500 });
  }
} 