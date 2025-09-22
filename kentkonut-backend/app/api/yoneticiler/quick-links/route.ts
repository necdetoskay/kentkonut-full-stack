import { NextResponse } from 'next/server';

export interface QuickLink {
  id: string;
  title: string;
  href: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export async function GET() {
  try {
    // Yöneticiler sayfası için hızlı erişim linkleri
    const quickLinks: QuickLink[] = [
      {
        id: '1',
        title: 'Genel Müdür',
        href: '/dashboard/kurumsal/yoneticiler?type=GENERAL_MANAGER',
        description: 'Genel müdür bilgileri',
        icon: 'user-check',
        order: 1,
        isActive: true,
      },
      {
        id: '2',
        title: 'Birimlerimiz',
        href: '/dashboard/kurumsal/birimler',
        description: 'Şirket birimleri',
        icon: 'building-2',
        order: 2,
        isActive: true,
      },
      {
        id: '3',
        title: 'Hedefimiz',
        href: '/dashboard/kurumsal/icerik/vizyon-misyon',
        description: 'Vizyon ve misyon',
        icon: 'target',
        order: 3,
        isActive: true,
      },
      {
        id: '4',
        title: 'Stratejimiz',
        href: '/dashboard/kurumsal/strateji',
        description: 'Şirket stratejisi',
        icon: 'trending-up',
        order: 4,
        isActive: true,
      },
      {
        id: '5',
        title: 'Kurumsal Kimlik',
        href: '/dashboard/kurumsal/kimlik',
        description: 'Kurumsal kimlik bilgileri',
        icon: 'shield',
        order: 5,
        isActive: true,
      },
      {
        id: '6',
        title: 'İlkelerimiz',
        href: '/dashboard/kurumsal/ilkeler',
        description: 'Şirket ilkeleri',
        icon: 'book-open',
        order: 6,
        isActive: true,
      },
    ];

    // Aktif ve sıralı linkleri döndür
    const activeLinks = quickLinks
      .filter(link => link.isActive)
      .sort((a, b) => a.order - b.order);

    return NextResponse.json(activeLinks);
  } catch (error) {
    console.error('Hızlı erişim linkleri yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Hızlı erişim linkleri yüklenemedi' },
      { status: 500 }
    );
  }
}

// Yönetici sayfası için hızlı erişim linklerini güncelleme (gelecekte kullanılabilir)
export async function POST(request: Request) {
  try {
    const links: QuickLink[] = await request.json();
    
    // Burada veritabanına kaydedebiliriz (şimdilik mock response)
    console.log('Hızlı erişim linkleri güncellendi:', links);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Hızlı erişim linkleri başarıyla güncellendi' 
    });
  } catch (error) {
    console.error('Hızlı erişim linkleri güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Hızlı erişim linkleri güncellenemedi' },
      { status: 500 }
    );
  }
}
