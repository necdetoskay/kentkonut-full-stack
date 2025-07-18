import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const corporateContentSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  content: z.string().min(1, "İçerik gerekli"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  icon: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true)
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    
    // Validate type
    const validTypes = ['VISION', 'MISSION', 'STRATEGY', 'GOALS', 'ABOUT'];
    if (!validTypes.includes(type.toUpperCase())) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }
    
    const contents = await db.corporateContent.findMany({
      where: { 
        type: type.toUpperCase() as any
      },
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json(contents);
  } catch (error) {
    console.error('Corporate content fetch error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const body = await request.json();
    
    // Validate type
    const validTypes = ['VISION', 'MISSION', 'STRATEGY', 'GOALS', 'ABOUT'];
    if (!validTypes.includes(type.toUpperCase())) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }
    
    // Validate input
    const validatedData = corporateContentSchema.parse(body);
    
    const content = await db.corporateContent.upsert({
      where: { 
        type: type.toUpperCase() as any
      },
      update: validatedData,
      create: {
        ...validatedData,
        type: type.toUpperCase() as any
      }
    });

    return NextResponse.json(content);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Corporate content update error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    
    // Validate type
    const validTypes = ['VISION', 'MISSION', 'STRATEGY', 'GOALS', 'ABOUT'];
    if (!validTypes.includes(type.toUpperCase())) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }
    
    await db.corporateContent.deleteMany({
      where: { 
        type: type.toUpperCase() as any
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Corporate content delete error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
