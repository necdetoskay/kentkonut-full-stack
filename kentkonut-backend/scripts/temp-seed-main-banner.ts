import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const HERO_BANNER_UUID = '550e8400-e29b-41d4-a716-446655440001';

async function main() {
  console.log('🌱 Ana sayfa banner seed işlemi başlıyor...');

  try {
    // 1. Banner pozisyonunu bul veya oluştur
    let position = await prisma.bannerPosition.findUnique({
      where: { positionUUID: HERO_BANNER_UUID },
    });

    if (!position) {
      console.log('⚠️ Ana Sayfa Üst Banner pozisyonu bulunamadı, oluşturuluyor...');
      position = await prisma.bannerPosition.create({
        data: {
          positionUUID: HERO_BANNER_UUID,
          name: 'Ana Sayfa Üst Banner',
          description: 'Sitenin ana sayfasında en üstte gösterilen hero banner alanı.',
        },
      });
      console.log('✅ Pozisyon oluşturuldu.');
    } else {
      console.log('ℹ️ Ana Sayfa Üst Banner pozisyonu zaten mevcut.');
    }

    // 2. Yeni bir Banner Grubu oluştur
    console.log('➕ Yeni "Ana Sayfa Banner Grubu" oluşturuluyor...');
    const bannerGroup = await prisma.bannerGroup.create({
      data: {
        name: 'Ana Sayfa Banner Grubu',
        description: 'Ana sayfada gösterilen dinamik bannerlar',
        width: 1920,
        height: 600,
        isActive: true,
      },
    });
    console.log(`✅ "${bannerGroup.name}" oluşturuldu (ID: ${bannerGroup.id}).`);

    // 3. Grubu pozisyona bağla
    await prisma.bannerPosition.update({
      where: { id: position.id },
      data: { bannerGroupId: bannerGroup.id },
    });
    console.log(`🔗 Grup, "${position.name}" pozisyonuna başarıyla bağlandı.`);

    // 4. Gruba 3 adet banner ekle
    console.log('🖼️ Gruba 3 adet banner ekleniyor...');
    const bannersToCreate = [
      {
        title: 'Kentimiz İçin Çalışıyoruz',
        description: 'Daha modern ve yaşanabilir bir kent için projelerimiz devam ediyor.',
        imageUrl: 'https://placehold.co/1920x600/31343C/FFF?text=Kentimiz+%C4%B0%C3%A7in+%C3%87al%C4%B1%C5%9F%C4%B1yoruz',
        altText: 'Kentsel dönüşüm projesi',
        order: 1,
        isActive: true,
        bannerGroupId: bannerGroup.id,
      },
      {
        title: 'Yeşil Alanları Koruyor, Geleceği Büyütüyoruz',
        description: 'Yeni parklar ve rekreasyon alanları ile şehrimize nefes aldırıyoruz.',
        imageUrl: 'https://placehold.co/1920x600/4F772D/FFF?text=Ye%C5%9Fil+Alanlar%C4%B1+Koruyoruz',
        altText: 'Park ve yeşil alan projesi',
        order: 2,
        isActive: true,
        bannerGroupId: bannerGroup.id,
      },
      {
        title: 'Teknoloji ve İnovasyonla Geleceğe Yatırım',
        description: 'Akıllı şehir çözümleri ve teknoloji vadisi projelerimizle tanışın.',
        imageUrl: 'https://placehold.co/1920x600/0B5394/FFF?text=Teknoloji+ve+%C4%B0novasyon',
        altText: 'Teknoloji projesi',
        order: 3,
        isActive: true,
        bannerGroupId: bannerGroup.id,
      },
    ];

    await prisma.banner.createMany({
      data: bannersToCreate,
    });
    console.log(`✅ ${bannersToCreate.length} adet banner başarıyla eklendi.`);
    
    console.log('Banner seed işlemi başarıyla tamamlandı!');

  } catch (error) {
    console.error('❌ Banner seed işlemi sırasında bir hata oluştu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Veritabanı bağlantısı kapatıldı.');
  }
}

main();
