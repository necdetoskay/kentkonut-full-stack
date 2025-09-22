import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// Force Node.js runtime for this API route
// runtime kept internal to avoid Next.js type issues
const runtime = 'nodejs';

// Tüm kullanıcıları getir
export async function GET() {
  try {
    const session = await auth();
    console.log("[API] Users GET request, session:", !!session, session?.user?.email);

    // Authentication check
    if (!session) {
      console.log("[API] Users GET - No session found, returning 401");
      return NextResponse.json(
        { error: "Unauthorized - Please log in to access this resource" },
        { status: 401 }
      );
    }

    // Optional: Add role-based access control
    if (session.user?.role !== "ADMIN" && session.user?.role !== "admin") {
      console.log("[API] Users GET - Insufficient permissions for user:", session.user?.email);
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Users API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Yeni kullanıcı ekle
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Yetkilendirme kontrolü
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, email, password } = await request.json();

    const requiredFields = ["name", "email", "password"];
    const missingFields = requiredFields.filter(
      (field) => !eval(field)
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        id: uuidv4(), // Generate a unique UUID for the user
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Users API Error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
