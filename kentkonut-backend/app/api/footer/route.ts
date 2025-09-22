import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET all footer columns and links
export async function GET(req: Request) {
  console.log("--- /api/footer GET request received ---");
  console.log("Request Headers:", req.headers);
  const session = await auth();
  console.log("Session object:", session);

  const role = typeof session?.user?.role === 'string' ? session.user.role.toLowerCase() : undefined;
  if (!session?.user || role !== 'admin') {
    console.log("Unauthorized access attempt. Session:", session);
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const columns = await db.footerColumn.findMany({
      orderBy: { order: 'asc' },
      include: {
        links: {
          orderBy: { order: 'asc' },
        },
      },
    });
    return NextResponse.json(columns);
  } catch (error) {
    console.error("[FOOTER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST a new footer column
export async function POST(req: Request) {
  const session = await auth();
  const role = typeof session?.user?.role === 'string' ? session.user.role.toLowerCase() : undefined;
  if (!session?.user || role !== 'admin') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, order } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const newColumn = await db.footerColumn.create({
      data: { title, order },
    });

    return NextResponse.json(newColumn);
  } catch (error) {
    console.error("[FOOTER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE a footer column
export async function DELETE(req: Request) {
  const session = await auth();
  const role = typeof session?.user?.role === 'string' ? session.user.role.toLowerCase() : undefined;
  if (!session?.user || role !== 'admin') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    // First, delete child links to avoid FK constraint errors
    await db.footerLink.deleteMany({ where: { columnId: parseInt(id) } });
    // Then delete the column itself
    await db.footerColumn.delete({ where: { id: parseInt(id) } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FOOTER_DELETE]", error);
    // Provide more specific error message if possible
    return NextResponse.json({ error: 'Footer column delete failed', message: (error as Error)?.message }, { status: 500 });
  }
}
