import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const corporateContentSchema = z.object({
  type: z.enum(['VISION', 'MISSION', 'STRATEGY', 'GOALS', 'ABOUT']),
  title: z.string().min(1, "Başlık gerekli"),
  content: z.string().min(1, "İçerik gerekli"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  icon: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true)
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type) {
      const content = await db.corporateContent.findFirst({
        where: { 
          type: type.toUpperCase() as any,
          isActive: true 
        }
      });
      return NextResponse.json(content);
    }
    
    const allContent = await db.corporateContent.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(allContent);
  } catch (error) {
    console.error('Corporate content fetch error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = corporateContentSchema.parse(body);
    
    // Check if content with this type already exists
    const existingContent = await db.corporateContent.findFirst({
      where: { type: validatedData.type }
    });
    
    if (existingContent) {
      return NextResponse.json(
        { error: "Bu tip için içerik zaten mevcut" }, 
        { status: 400 }
      );
    }
    
    const newContent = await db.corporateContent.create({
      data: validatedData
    });
    
    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors }, 
        { status: 400 }
      );
    }
    console.error('Corporate content creation error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
