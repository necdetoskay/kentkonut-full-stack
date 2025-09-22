import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Tüm departmanların hızlı erişim linklerini getir
    const quickLinks = await prisma.departmentQuickLink.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        url: true,
        icon: true,
        order: true,
        department: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(quickLinks);
  } catch (error) {
    console.error('Frontend hızlı erişim linkleri yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Hızlı erişim linkleri yüklenemedi' },
      { status: 500 }
    );
  }
}
