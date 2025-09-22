const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixHeroGroup() {
  try {
    console.log('🔧 Fixing HERO banner group...');

    const nameVariants = [
      'Ana Sayfa Hero Banner',
      'Ana Sayfa Hero',
      'Ana Sayfa Üst Banner',
      'Hero Section',
    ];

    // 1) Mevcut HERO veya isim varyantlarından birini bul
    let heroGroup = await prisma.bannerGroup.findFirst({
      where: {
        OR: [
          { usageType: 'HERO' },
          { name: { in: nameVariants } },
        ],
      },
      include: { banners: true }
    });

    if (!heroGroup) {
      console.log('➡️ No existing HERO or variant-named group. Creating a new one...');
      heroGroup = await prisma.bannerGroup.create({
        data: {
          name: 'Ana Sayfa Hero Banner',
          description: 'Ana sayfa hero banner grubu - SİLİNEMEZ',
          usageType: 'HERO',
          deletable: false,
          isActive: true,
        },
        include: { banners: true }
      });
      console.log('✅ Created new HERO group:', heroGroup.id, '-', heroGroup.name);
    } else {
      // 2) usageType ve aktiflik bilgilerini düzelt
      if (heroGroup.usageType !== 'HERO' || !heroGroup.isActive) {
        heroGroup = await prisma.bannerGroup.update({
          where: { id: heroGroup.id },
          data: {
            usageType: 'HERO',
            isActive: true,
            deletable: false,
          },
          include: { banners: true }
        });
        console.log('🛠️ Updated existing group to HERO & active:', heroGroup.id, '-', heroGroup.name);
      } else {
        console.log('ℹ️ Existing HERO group found:', heroGroup.id, '-', heroGroup.name);
      }
    }

    // 3) Eğer hiç banner yoksa örnek bannerlar ekle
    if (!heroGroup.banners || heroGroup.banners.length === 0) {
      console.log('➡️ No banners found in HERO group. Creating samples...');
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
        console.log('🧩 Created banner:', banner.id, '-', banner.title);
      }
    } else {
      console.log(`ℹ️ HERO group already has ${heroGroup.banners.length} banners.`);
    }

    // 4) Son durumu yazdır
    const final = await prisma.bannerGroup.findUnique({
      where: { id: heroGroup.id },
      include: { banners: { orderBy: { order: 'asc' } } }
    });

    console.log(`\n✅ Final HERO group state: #${final.id} - ${final.name} | usageType=${final.usageType} | active=${final.isActive} | banners=${final.banners.length}`);
    final.banners.forEach(b => console.log(`   • [${b.id}] order=${b.order} active=${b.isActive} title="${b.title}"`));

  } catch (e) {
    console.error('❌ Error fixing hero group:', e);
  } finally {
    await prisma.$disconnect();
  }
}

fixHeroGroup();