import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Proje istatistikleri hesaplanıyor...');

    // Tamamlanan projelerin konut sayısı toplamı
    const completedKonutTotal = await prisma.project.aggregate({
      where: {
        status: 'COMPLETED',
        konutSayisi: {
          not: null,
          gt: 0
        }
      },
      _sum: {
        konutSayisi: true
      }
    });

    // Tamamlanan projelerin ticari ünite sayısı toplamı
    const completedTicariTotal = await prisma.project.aggregate({
      where: {
        status: 'COMPLETED',
        ticariUnite: {
          not: null,
          gt: 0
        }
      },
      _sum: {
        ticariUnite: true
      }
    });

    // Devam eden projelerin konut + ticari ünite toplamı
    const ongoingTotal = await prisma.project.aggregate({
      where: {
        status: 'ONGOING',
        OR: [
          { konutSayisi: { not: null, gt: 0 } },
          { ticariUnite: { not: null, gt: 0 } }
        ]
      },
      _sum: {
        konutSayisi: true,
        ticariUnite: true
      }
    });

    // İstatistikleri hesapla
    const stats = {
      devamEdenKonutIsyeri: (ongoingTotal._sum.konutSayisi || 0) + (ongoingTotal._sum.ticariUnite || 0),
      tamamlananKonut: completedKonutTotal._sum.konutSayisi || 0,
      tamamlananIsyeri: completedTicariTotal._sum.ticariUnite || 0
    };

    console.log('📊 İstatistikler:', stats);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ İstatistik hesaplama hatası:', error);
    return NextResponse.json(
      { success: false, error: 'İstatistikler hesaplanırken hata oluştu' },
      { status: 500 }
    );
  }
}
