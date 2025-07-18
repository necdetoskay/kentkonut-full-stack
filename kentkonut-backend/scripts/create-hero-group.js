const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createHeroGroup() {
  try {    // Önce HERO grubunun var olup olmadığını kontrol et
    const existingHero = await prisma.bannerGroup.findFirst({
      where: { name: 'Ana Sayfa Hero' }
    });

    if (existingHero) {
      console.log('HERO group already exists:', existingHero.id);
      return;
    }

    // HERO grubunu oluştur
    const heroGroup = await prisma.bannerGroup.create({
      data: {
        name: 'Ana Sayfa Hero',
        description: 'Ana sayfa hero banner grubu',
        type: 'HERO',
        deletable: false,
        active: true
      }
    });

    console.log('HERO group created successfully:', heroGroup.id);    // Örnek hero banner ekle
    const heroBanner = await prisma.banner.create({
      data: {
        title: 'Kent Konut - Güvenilir Emlak',
        description: 'Hayalinizdeki ev burada sizi bekliyor',
        imageUrl: 'https://picsum.photos/1200/400?random=1', // Geçici resim
        linkUrl: '/projeler',
        ctaLink: 'Projeleri İncele',
        active: true,
        order: 1,
        groupId: heroGroup.id
      }
    });

    console.log('Hero banner created successfully:', heroBanner.id);

  } catch (error) {
    console.error('Error creating hero group:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createHeroGroup();
