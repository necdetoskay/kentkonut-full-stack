import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedMenuItems() {
  console.log('🌱 Seeding menu items...');

  // Güvenli: Silme YOK, mevcut menü öğeleri korunacak ve eksikler eklenecek
  // Ana menü itemlarını oluştur
  const menuItems = [
    {
      id: 'menu-anasayfa',
      title: 'ANASAYFA',
      url: '/',
      orderIndex: 1,
      menuLocation: 'main',
      isActive: true,
    },
    {
      id: 'menu-hakkimizda',
      title: 'HAKKIMIZDA',
      url: '/hakkimizda',
      orderIndex: 2,
      menuLocation: 'main',
      isActive: true,
    },
    {
      id: 'menu-kurumsal',
      title: 'KURUMSAL',
      url: '/kurumsal',
      orderIndex: 3,
      menuLocation: 'main',
      isActive: true,
    },
    {
      id: 'menu-projeler',
      title: 'PROJELERİMİZ',
      url: '/projeler',
      orderIndex: 4,
      menuLocation: 'main',
      isActive: true,
    },
    {
      id: 'menu-hafriyat',
      title: 'HAFRİYAT',
      url: '/hafriyat',
      orderIndex: 5,
      menuLocation: 'main',
      isActive: true,
    },
    {
      id: 'menu-iletisim',
      title: 'BİZE ULAŞIN',
      url: '/bize-ulasin',
      orderIndex: 6,
      menuLocation: 'main',
      isActive: true,
    },
  ];

  // Menu itemlarını oluştur (upsert ile güvenli)
  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        url: item.url,
        orderIndex: item.orderIndex,
        menuLocation: item.menuLocation,
        isActive: item.isActive,
        parentId: null,
      },
      create: item,
    });
    console.log(`✅ Ensured menu item: ${item.title}`);
  }

  // Alt menü örnekleri (Kurumsal menüsü için)
  const subMenuItems = [
    {
      id: 'menu-kurumsal-hakkimizda',
      title: 'Hakkımızda',
      url: '/kurumsal/hakkimizda',
      orderIndex: 1,
      menuLocation: 'main',
      parentId: 'menu-kurumsal',
      isActive: true,
    },
    {
      id: 'menu-kurumsal-vizyon',
      title: 'Vizyon & Misyon',
      url: '/kurumsal/vizyon-misyon',
      orderIndex: 2,
      menuLocation: 'main',
      parentId: 'menu-kurumsal',
      isActive: true,
    },
    {
      id: 'menu-kurumsal-yonetim',
      title: 'Yönetim',
      url: '/kurumsal/yonetim',
      orderIndex: 3,
      menuLocation: 'main',
      parentId: 'menu-kurumsal',
      isActive: true,
    },
  ];

  // Alt menü itemlarını oluştur (upsert ile güvenli)
  for (const item of subMenuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        url: item.url,
        orderIndex: item.orderIndex,
        menuLocation: item.menuLocation,
        isActive: item.isActive,
        parentId: item.parentId,
      },
      create: item,
    });
    console.log(`✅ Ensured sub menu item: ${item.title}`);
  }

  console.log('🎉 Menu items seeding completed!');
}

// Eğer bu dosya doğrudan çalıştırılırsa
if (require.main === module) {
  seedMenuItems()
    .catch((e) => {
      console.error('❌ Error seeding menu items:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
