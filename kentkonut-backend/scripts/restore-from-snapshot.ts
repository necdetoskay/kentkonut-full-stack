import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SeedData {
  users: any[];
  mediaCategories: any[];
  media: any[];
  pageCategories: any[];
  pages: any[];
  newsCategories: any[];
  news: any[];
  tags: any[];
  projects: any[];
  hafriyatBolgeler: any[];
  hafriyatSahalar: any[];
  hafriyatBelgeKategoriler: any[];
  hafriyatBelgeler: any[];
  hafriyatResimler: any[];
  bannerGroups: any[];
  banners: any[];
  bannerPositions: any[];
  menuItems: any[];
  executives: any[];
  departments: any[];
  personnel: any[];
  corporateContents: any[];
  serviceCards: any[];
  corporateLayoutSettings: any[];
  highlights: any[];
  hizliErisimSayfalar: any[];
  hizliErisimOgeleri: any[];
  sayfaArkaPlanlar: any[];
  newsTags: any[];
  projectTags: any[];
}

async function restoreFromSnapshot() {
  try {
    console.log('🔄 Snapshot verilerini geri yükleme başlıyor...');

    // Seed data dosyasını oku
    const seedDataPath = path.join(__dirname, '../prisma/seed-data.json');
    const seedDataContent = fs.readFileSync(seedDataPath, 'utf8');
    const seedData: SeedData = JSON.parse(seedDataContent);

    // Media Categories - upsert
    console.log('📂 Media Categories geri yükleniyor...');
    for (const category of seedData.mediaCategories) {
      await prisma.mediaCategory.upsert({
        where: { id: category.id },
        update: {
          name: category.name,
          icon: category.icon,
          order: category.order,
          isBuiltIn: category.isBuiltIn
        },
        create: {
          id: category.id,
          name: category.name,
          icon: category.icon,
          order: category.order,
          isBuiltIn: category.isBuiltIn
        }
      });
    }

    // Menu Items - upsert (önce parent'lar sonra child'lar)
    console.log('🔗 Menu Items geri yükleniyor...');
    const parentMenus = seedData.menuItems.filter(item => !item.parentId);
    const childMenus = seedData.menuItems.filter(item => item.parentId);

    // Önce parent menüleri
    for (const menu of parentMenus) {
      await prisma.menuItem.upsert({
        where: { id: menu.id },
        update: {
          title: menu.title,
          slug: menu.slug,
          url: menu.url,
          icon: menu.icon,
          description: menu.description,
          isActive: menu.isActive,
          isExternal: menu.isExternal,
          target: menu.target,
          cssClass: menu.cssClass,
          orderIndex: menu.orderIndex,
          menuLocation: menu.menuLocation
        },
        create: {
          id: menu.id,
          title: menu.title,
          slug: menu.slug,
          url: menu.url,
          icon: menu.icon,
          description: menu.description,
          isActive: menu.isActive,
          isExternal: menu.isExternal,
          target: menu.target,
          cssClass: menu.cssClass,
          orderIndex: menu.orderIndex,
          menuLocation: menu.menuLocation
        }
      });
    }

    // Sonra child menüleri
    for (const menu of childMenus) {
      await prisma.menuItem.upsert({
        where: { id: menu.id },
        update: {
          title: menu.title,
          slug: menu.slug,
          url: menu.url,
          icon: menu.icon,
          description: menu.description,
          isActive: menu.isActive,
          isExternal: menu.isExternal,
          target: menu.target,
          cssClass: menu.cssClass,
          orderIndex: menu.orderIndex,
          menuLocation: menu.menuLocation,
          parentId: menu.parentId
        },
        create: {
          id: menu.id,
          title: menu.title,
          slug: menu.slug,
          url: menu.url,
          icon: menu.icon,
          description: menu.description,
          isActive: menu.isActive,
          isExternal: menu.isExternal,
          target: menu.target,
          cssClass: menu.cssClass,
          orderIndex: menu.orderIndex,
          menuLocation: menu.menuLocation,
          parentId: menu.parentId
        }
      });
    }

    // Diğer tablolar için de benzer upsert işlemleri
    if (seedData.executives && seedData.executives.length > 0) {
      console.log('👥 Executives geri yükleniyor...');
      for (const executive of seedData.executives) {
        await prisma.executive.upsert({
          where: { id: executive.id },
          update: executive,
          create: executive
        });
      }
    }

    if (seedData.departments && seedData.departments.length > 0) {
      console.log('🏢 Departments geri yükleniyor...');
      for (const department of seedData.departments) {
        await prisma.department.upsert({
          where: { id: department.id },
          update: department,
          create: department
        });
      }
    }

    if (seedData.highlights && seedData.highlights.length > 0) {
      console.log('⭐ Highlights geri yükleniyor...');
      for (const highlight of seedData.highlights) {
        await prisma.highlight.upsert({
          where: { id: highlight.id },
          update: highlight,
          create: highlight
        });
      }
    }

    if (seedData.serviceCards && seedData.serviceCards.length > 0) {
      console.log('🎴 Service Cards geri yükleniyor...');
      for (const card of seedData.serviceCards) {
        await prisma.serviceCard.upsert({
          where: { id: card.id },
          update: card,
          create: card
        });
      }
    }

    console.log('✅ Snapshot verileri başarıyla geri yüklendi');
    console.log(`📊 ${seedData.mediaCategories.length} media category`);
    console.log(`📊 ${seedData.menuItems.length} menu item`);
    console.log(`📊 ${seedData.executives?.length || 0} executive`);
    console.log(`📊 ${seedData.departments?.length || 0} department`);
    console.log(`📊 ${seedData.highlights?.length || 0} highlight`);
    console.log(`📊 ${seedData.serviceCards?.length || 0} service card`);

  } catch (error) {
    console.error('❌ Snapshot geri yükleme hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  restoreFromSnapshot()
    .then(() => {
      console.log('🎉 Snapshot geri yükleme tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Snapshot geri yükleme başarısız:', error);
      process.exit(1);
    });
}

export { restoreFromSnapshot };
