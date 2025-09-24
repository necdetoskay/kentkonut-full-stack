/*
  Seed menu items adapted to current schema structure.
  - Creates main navigation menu items
  - Creates sub-menu items for corporate section
  - Idempotent (clears existing data first)

  Run:
    node scripts/seed-menu-updated.js
*/

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedMenu() {
  try {
    console.log('🌱 Menu items seed başlıyor...');

    // Önce mevcut menü verilerini temizle
    await prisma.menuItem.deleteMany();
    console.log('🗑️ Existing menu items cleared');

    // Ana menü öğelerini oluştur
    const menuItems = [
      {
        title: 'ANASAYFA',
        url: '/',
        slug: 'anasayfa',
        isActive: true,
        isExternal: false,
        target: '_self',
        orderIndex: 1,
        menuLocation: 'main'
      },
      {
        title: 'KURUMSAL',
        url: '/kurumsal',
        slug: 'kurumsal',
        isActive: true,
        isExternal: false,
        target: '_self',
        orderIndex: 2,
        menuLocation: 'main'
      },
      {
        title: 'HİZMETLERİMİZ',
        url: '/hizmetlerimiz',
        slug: 'hizmetlerimiz',
        isActive: true,
        isExternal: false,
        target: '_self',
        orderIndex: 3,
        menuLocation: 'main'
      },
      {
        title: 'PROJELERİMİZ',
        url: '/projelerimiz',
        slug: 'projelerimiz',
        isActive: true,
        isExternal: false,
        target: '_self',
        orderIndex: 4,
        menuLocation: 'main'
      },
      {
        title: 'HABERLER',
        url: '/haberler',
        slug: 'haberler',
        isActive: true,
        isExternal: false,
        target: '_self',
        orderIndex: 5,
        menuLocation: 'main'
      },
      {
        title: 'İLETİŞİM',
        url: '/iletisim',
        slug: 'iletisim',
        isActive: true,
        isExternal: false,
        target: '_self',
        orderIndex: 6,
        menuLocation: 'main'
      }
    ];

    // Menü öğelerini veritabanına ekle
    console.log('📝 Creating main menu items...');
    for (const item of menuItems) {
      await prisma.menuItem.create({
        data: item
      });
      console.log(`✅ Created: ${item.title}`);
    }

    // Kurumsal alt menü öğelerini oluştur
    console.log('📝 Creating corporate sub-menu items...');
    const kurumsalParent = await prisma.menuItem.findFirst({
      where: { slug: 'kurumsal' }
    });

    if (kurumsalParent) {
      const kurumsalSubItems = [
        {
          title: 'Hakkımızda',
          url: '/kurumsal/hakkimizda',
          slug: 'hakkimizda',
          isActive: true,
          isExternal: false,
          target: '_self',
          orderIndex: 1,
          menuLocation: 'main',
          parentId: kurumsalParent.id
        },
        {
          title: 'Yönetim',
          url: '/kurumsal/yonetim',
          slug: 'yonetim',
          isActive: true,
          isExternal: false,
          target: '_self',
          orderIndex: 2,
          menuLocation: 'main',
          parentId: kurumsalParent.id
        },
        {
          title: 'Birimlerimiz',
          url: '/kurumsal/birimlerimiz',
          slug: 'birimlerimiz',
          isActive: true,
          isExternal: false,
          target: '_self',
          orderIndex: 3,
          menuLocation: 'main',
          parentId: kurumsalParent.id
        }
      ];

      for (const subItem of kurumsalSubItems) {
        await prisma.menuItem.create({
          data: subItem
        });
        console.log(`✅ Created sub-item: ${subItem.title}`);
      }
    } else {
      console.warn('⚠️ Kurumsal parent menu item not found');
    }

    console.log('✅ Menu items başarıyla oluşturuldu');
    console.log(`📊 ${menuItems.length} ana menü öğesi`);
    console.log(`📊 3 kurumsal alt menü öğesi`);

  } catch (error) {
    console.error('❌ Menu seed hatası:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedMenu();
    console.log('🎉 Menu seed tamamlandı');
  } catch (error) {
    console.error('💥 Menu seed başarısız:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
