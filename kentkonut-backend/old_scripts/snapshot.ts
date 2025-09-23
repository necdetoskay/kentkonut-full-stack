import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const SEED_DATA_PATH = path.join(__dirname, '../prisma/seed-data.json');

// JSON.stringify'da BigInt ve Decimal'i işlemek için custom replacer
const replacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  // Prisma Decimal'i string olarak döndürür, bu yüzden onu sayıya çeviriyoruz.
  if (value && typeof value === 'object' && value.constructor.name === 'Decimal') {
    return Number(value);
  }
  return value;
};

async function snapshot() {
  console.log('📸 Veritabanı anlık görüntüsü oluşturuluyor...');

  try {
    const data = {
      // Önce ilişkisel olarak bağımsız veya daha az bağımlı olanları çekiyoruz
      users: await prisma.user.findMany(),
      mediaCategories: await prisma.mediaCategory.findMany(),
      media: await prisma.media.findMany(),
      pageCategories: await prisma.pageCategory.findMany(),
      pages: await prisma.page.findMany(),
      newsCategories: await prisma.newsCategory.findMany(),
      news: await prisma.news.findMany(),
      tags: await prisma.tag.findMany(),
      projects: await prisma.project.findMany(),
      hafriyatBolgeler: await prisma.hafriyatBolge.findMany(),
      hafriyatSahalar: await prisma.hafriyatSaha.findMany(),
      hafriyatBelgeKategoriler: await prisma.hafriyatBelgeKategori.findMany(),
      hafriyatBelgeler: await prisma.hafriyatBelge.findMany(),
      hafriyatResimler: await prisma.hafriyatResim.findMany(),
      bannerGroups: await prisma.bannerGroup.findMany(),
      banners: await prisma.banner.findMany(),
      bannerPositions: await prisma.bannerPosition.findMany(),
      menuItems: await prisma.menuItem.findMany(),
      executives: await prisma.executive.findMany(),
      departments: await prisma.department.findMany(),
      personnel: await prisma.personnel.findMany(),
      corporateContents: await prisma.corporateContent.findMany(),
      serviceCards: await prisma.serviceCard.findMany(),
      corporateLayoutSettings: await prisma.corporateLayoutSettings.findMany(),
      highlights: await prisma.highlight.findMany(),
      hizliErisimSayfalar: await prisma.hizliErisimSayfa.findMany(),
      hizliErisimOgeleri: await prisma.hizliErisimOgesi.findMany(),
      sayfaArkaPlanlar: await prisma.sayfaArkaPlan.findMany(),

      // İlişki tabloları
      newsTags: await prisma.newsTag.findMany(),
      projectTags: await prisma.projectTag.findMany(),
      // Diğer ilişki tabloları buraya eklenebilir...
    };

    console.log('💾 Veriler JSON dosyasına yazılıyor...');
    fs.writeFileSync(SEED_DATA_PATH, JSON.stringify(data, replacer, 2));

    console.log(`✅ Anlık görüntü başarıyla oluşturuldu: ${SEED_DATA_PATH}`);

  } catch (error) {
    console.error('❌ Anlık görüntü oluşturulurken hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

snapshot();
