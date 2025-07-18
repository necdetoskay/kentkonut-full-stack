import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const executiveSchema = z.object({
  name: z.string().min(1, "İsim gerekli"),
  title: z.string().min(1, "Başlık gerekli"),
  position: z.string().min(1, "Pozisyon gerekli"),
  slug: z.string().optional(),
  biography: z.string().optional(),  imageUrl: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true; // Boş string veya null/undefined için geçerli
    
    // Relative URLs (/uploads/...) kabul et
    if (val.startsWith('/')) return true;
    
    // Absolute URLs kontrol et
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, "Geçersiz URL formatı"),
  email: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true; // Boş string için geçerli
    return z.string().email().safeParse(val).success;
  }, "Geçersiz email formatı"),
  phone: z.string().optional(),  linkedIn: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true; // Boş string için geçerli
    
    // Relative URLs (/uploads/...) kabul et
    if (val.startsWith('/')) return true;
    
    // Absolute URLs kontrol et
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, "Geçersiz LinkedIn URL formatı"),
  type: z.enum(["PRESIDENT", "GENERAL_MANAGER", "DIRECTOR", "MANAGER"]),
  order: z.number().default(0),
  isActive: z.boolean().default(true)
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const executive = await db.executive.findUnique({
      where: { id }
    });    if (!executive) {
      return NextResponse.json({ error: "Executive not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: executive });
  } catch (error) {
    console.error('Executive fetch error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const validatedData = executiveSchema.parse(body);
    
    const executive = await db.executive.update({
      where: { id },
      data: {
        ...validatedData,
        type: validatedData.type as any
      }
    });

    return NextResponse.json(executive);  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error details:', error.errors);
      return NextResponse.json(
        { 
          error: "Validation error", 
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }
    
    console.error('Executive update error:', error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.executive.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Executive deleted successfully" });
  } catch (error) {
    console.error('Executive deletion error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
