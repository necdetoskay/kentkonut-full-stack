import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Sayfa detaylarını getir
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const page = await prisma.page.findUnique({
      where: { id: params.id }
    });
    
    if (!page) {
      return NextResponse.json(
        { error: "Sayfa bulunamadı" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(page);
  } catch (error) {
    console.error("Sayfa detayı getirme hatası:", error);
    return NextResponse.json(
      { error: "Sayfa detayları yüklenemedi" },
      { status: 500 }
    );
  }
}

// PUT - Sayfayı güncelle
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    
    // Gerekli alanları kontrol et
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: "Başlık ve slug alanları zorunludur" },
        { status: 400 }
      );
    }
    
    // Slug'ın benzersiz olup olmadığını kontrol et (kendi ID'si dışındaki kayıtlarda)
    const existingPage = await prisma.page.findFirst({
      where: {
        slug: body.slug,
        id: { not: params.id }
      }
    });
    
    if (existingPage) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      );
    }
      // Sayfayı güncelle
    const updatedPage = await prisma.page.update({
      where: { id: params.id },
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        isActive: body.isActive,
        metaTitle: body.metaTitle || body.title,
        metaDescription: body.metaDescription,
        imageUrl: body.imageUrl || null,
        order: body.order || 0,
        excerpt: body.excerpt || null
      }
    });
    
    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Sayfa güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Sayfa güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE - Sayfayı sil
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await prisma.page.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sayfa silme hatası:", error);
    return NextResponse.json(
      { error: "Sayfa silinemedi" },
      { status: 500 }
    );
  }
}
