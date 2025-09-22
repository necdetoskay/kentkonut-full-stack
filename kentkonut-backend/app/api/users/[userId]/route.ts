import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hashPassword } from "@/lib/crypto";

// Force Node.js runtime for this API route
// runtime kept internal to avoid Next.js type issues
const runtime = 'nodejs';

// Kullanıcı güncelle
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, email, role, password, emailVerified } = body;

    if (!name || !email || !role) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Temel güncelleme verilerini hazırla
    const updateData: any = {
      name,
      email,
      role,
    };

    // E-posta doğrulama durumunu ekle
    if (emailVerified !== undefined) {
      updateData.emailVerified = emailVerified ? new Date() : null;
    }

    // Eğer şifre varsa, hash'leyip ekle
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const user = await db.user.update({
      where: {
        id: userId,
      },
      data: updateData,
    });

    // Şifreyi response'dan çıkar
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Kullanıcı sil
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}