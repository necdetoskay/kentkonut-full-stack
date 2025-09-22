import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Tüm sayfaları getir
export async function GET(request: NextRequest) {
  try {    const pages = await prisma.page.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(pages);
  } catch (error) {
    console.error("Sayfaları getirme hatası:", error);
    return NextResponse.json(
      { error: "Sayfalar yüklenemedi" },
      { status: 500 }
    );
  }
}

// POST - Yeni sayfa oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Gerekli alanları kontrol et
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: "Başlık ve slug alanları zorunludur" },
        { status: 400 }
      );
    }
      // Slug'ın benzersiz olup olmadığını kontrol et
    const existingPage = await prisma.page.findUnique({
      where: { slug: body.slug }
    });
    
    if (existingPage) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      );
    }    // Sayfa oluştur
    const page = await prisma.page.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content || "",
        isActive: body.isActive ?? true,
        metaTitle: body.metaTitle || body.title,
        metaDescription: body.metaDescription || "",
        imageUrl: body.imageUrl || null,
        order: body.order || 0,
        excerpt: body.excerpt || null
      }
    });
    
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Sayfa oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Sayfa oluşturulamadı" },
      { status: 500 }
    );
  }
}
