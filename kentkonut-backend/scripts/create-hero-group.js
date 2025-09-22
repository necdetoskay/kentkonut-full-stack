const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createHeroGroup() {
  try {
    // Önce HERO grubunun var olup olmadığını usageType veya isim varyantlarıyla kontrol et
    const nameVariants = [
      'Ana Sayfa Hero Banner',
      'Ana Sayfa Hero',
      'Ana Sayfa Üst Banner',
      'Hero Section',
    ];

    let existingHero = await prisma.bannerGroup.findFirst({
      where: {
        OR: [
          { usageType: 'HERO' },
          { name: { in: nameVariants } },
        ],
      },
    });

    if (existingHero) {
      console.log('HERO group already exists:', existingHero.id, '-', existingHero.name);
      return;
    }

    // HERO grubunu oluştur (Prisma şemasına uygun alanlar)
    const heroGroup = await prisma.bannerGroup.create({
      data: {
        name: 'Ana Sayfa Hero Banner',
        description: 'Ana sayfa hero banner grubu - SİLİNEMEZ',
        usageType: 'HERO',
        deletable: false,
        isActive: true,
        // Diğer alanlarda şema varsayılanlarını kullanıyoruz
      },
    });

    console.log('HERO group created successfully:', heroGroup.id);

    // Örnek hero bannerlar ekle (Prisma şemasına uygun alan adları)
    const bannersData = [
      {
        title: 'Kent Konut İnşaat - Yeni Projeler',
        description: 'Modern yaşam alanları ile geleceği inşa ediyoruz',
        imageUrl: 'https://via.placeholder.com/1200x400/0277bd/ffffff?text=Kent+Konut+Yeni+Projeler',
        link: '/projeler',
        isActive: true,
        order: 1,
        bannerGroupId: heroGroup.id,
      },
      {
        title: 'Kentsel Dönüşüm Hizmetleri',
        description: 'Şehrin yenilenmesinde güvenilir ortağınız',
        imageUrl: 'https://via.placeholder.com/1200x400/2e7d32/ffffff?text=Kentsel+Dönüşüm',
        link: '/hizmetler',
        isActive: true,
        order: 2,
        bannerGroupId: heroGroup.id,
      },
      {
        title: 'Kaliteli Yaşam Alanları',
        description: 'Her detayı özenle tasarlanmış konut projeleri',
        imageUrl: 'https://via.placeholder.com/1200x400/ff6f00/ffffff?text=Kaliteli+Yaşam+Alanları',
        link: '/hakkimizda',
        isActive: true,
        order: 3,
        bannerGroupId: heroGroup.id,
      },
    ];

    for (const data of bannersData) {
      const banner = await prisma.banner.create({ data });
      console.log('Hero banner created successfully:', banner.id, '-', banner.title);
    }
  } catch (error) {
    console.error('Error creating hero group:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createHeroGroup();
