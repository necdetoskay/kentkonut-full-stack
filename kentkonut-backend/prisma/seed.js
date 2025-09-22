const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { seedHafriyat } = require('./seeds/hafriyat');
const { seedExecutivesAndDepartments } = require('./seeds/executives-departments');

// Create a new PrismaClient instance for the seed script
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...')

  // Mevcut banner gruplarını kontrol et
  const existingGroups = await prisma.bannerGroup.findMany()
  console.log(`📊 Found ${existingGroups.length} existing banner groups`)

  // Banner pozisyonları için sabit UUID'ler
  const BANNER_POSITIONS = [
    {
      positionUUID: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Ana Sayfa Üst Banner',
      description: 'Ana sayfanın en üstünde gösterilen banner alanı',
      priority: 1
    },
    {
      positionUUID: '550e8400-e29b-41d4-a716-446655440002', 
      name: 'Yan Menü Banner',
      description: 'Sayfa yan menüsünde gösterilen banner alanı',
      priority: 2
    },
    {
      positionUUID: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Alt Banner', 
      description: 'Sayfanın alt kısmında gösterilen banner alanı',
      priority: 3
    },
    {
      positionUUID: '550e8400-e29b-41d4-a716-446655440004',
      name: 'Popup Banner',
      description: 'Popup olarak gösterilen banner alanı',
      priority: 4
    },
    {
      positionUUID: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Bildirim Banner',
      description: 'Bildirim olarak gösterilen banner alanı', 
      priority: 5
    }
  ]

  // Banner pozisyonlarını oluştur
  for (const position of BANNER_POSITIONS) {
    const existingPosition = await prisma.bannerPosition.findUnique({
      where: { positionUUID: position.positionUUID }
    })

    if (!existingPosition) {
      await prisma.bannerPosition.create({
              data: {
          ...position,
          isActive: true
        }
      })
      console.log(`✅ Created banner position: ${position.name}`)
    } else {
      console.log(`⏭️  Banner position already exists: ${position.name}`)
    }
  }

  // Mevcut banner gruplarını pozisyonlarla eşleştir
  if (existingGroups.length > 0) {
    const heroGroup = existingGroups.find(g => g.name.includes('Ana Sayfa Üst Banner') || g.name.includes('HERO'))
    const sidebarGroup = existingGroups.find(g => g.name.includes('Yan') || g.name.includes('SIDEBAR'))
    const footerGroup = existingGroups.find(g => g.name.includes('Alt') || g.name.includes('FOOTER'))

    // Hero pozisyonunu güncelle
    if (heroGroup) {
      await prisma.bannerPosition.update({
        where: { positionUUID: '550e8400-e29b-41d4-a716-446655440001' },
        data: { bannerGroupId: heroGroup.id }
      })
      console.log(`🔗 Linked hero position to group: ${heroGroup.name}`)
    }

    // Sidebar pozisyonunu güncelle
    if (sidebarGroup) {
      await prisma.bannerPosition.update({
        where: { positionUUID: '550e8400-e29b-41d4-a716-446655440002' },
        data: { bannerGroupId: sidebarGroup.id }
      })
      console.log(`🔗 Linked sidebar position to group: ${sidebarGroup.name}`)
    }

    // Footer pozisyonunu güncelle
    if (footerGroup) {
      await prisma.bannerPosition.update({
        where: { positionUUID: '550e8400-e29b-41d4-a716-446655440003' },
        data: { bannerGroupId: footerGroup.id }
      })
      console.log(`🔗 Linked footer position to group: ${footerGroup.name}`)
    }
  }

  // Kullanıcı oluştur veya mevcut ilk kullanıcıyı al
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: 'seed-user-1',
        name: 'Seed User',
        email: 'seeduser@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'admin',
      }
    });
    console.log('✅ Seed user created');
  } else {
    console.log('⏭️  Seed user already exists');
  }

  // --- ÖRNEK DEVAM EDEN PROJELER ---
  const ongoingProjects = [
    {
      title: 'Kent Park Evleri',
      slug: 'kent-park-evleri',
      summary: 'Modern mimarisiyle huzurlu bir yaşam.',
      content: 'Kent Park Evleri, doğayla iç içe modern bir yaşam sunar.',
      status: 'ONGOING',
      published: true,
      publishedAt: new Date(),
      province: 'İstanbul',
      district: 'Zekeriyaköy',
      address: 'Zekeriyaköy Mahallesi, Sarıyer',
      readingTime: 3,
      authorId: user.id
    },
    {
      title: 'Kent Panorama',
      slug: 'kent-panorama',
      summary: 'Boğaz manzaralı elit yaşam.',
      content: 'Kent Panorama, İstanbul Beşiktaş’ta prestijli bir konut projesidir.',
      status: 'ONGOING',
      published: true,
      publishedAt: new Date(),
      province: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Beşiktaş Mahallesi',
      readingTime: 3,
      authorId: user.id
    },
    {
      title: 'Kent Bahçe Konakları',
      slug: 'kent-bahce-konaklari',
      summary: 'Deniz kenarında ayrıcalıklı yaşam.',
      content: 'Kent Bahçe Konakları, İzmir Çeşme’de deniz kenarında müstakil konaklardan oluşur.',
      status: 'ONGOING',
      published: true,
      publishedAt: new Date(),
      province: 'İzmir',
      district: 'Çeşme',
      address: 'Çeşme Mahallesi',
      readingTime: 3,
      authorId: user.id
    }
  ];

  for (const project of ongoingProjects) {
    const exists = await prisma.project.findUnique({ where: { slug: project.slug } });
    if (!exists) {
      await prisma.project.create({ data: project });
      console.log(`✅ Proje eklendi: ${project.title}`);
    } else {
      console.log(`⏭️  Proje zaten var: ${project.title}`);
    }
  }

  // Hafriyat module seed
  await seedHafriyat();

  // Executives and departments seed
  await seedExecutivesAndDepartments();

  console.log('🎉 Database seed completed successfully!')
}

async function seedQuickAccessLinks() {
  console.log('🌱 Seeding quick access links...');

  // Get some projects to add quick access links
  const projects = await prisma.project.findMany({ take: 2 });

  if (projects.length > 0) {
    // Enable quick access for first project and add sample links
    const firstProject = projects[0];

    await prisma.project.update({
      where: { id: firstProject.id },
      data: { hasQuickAccess: true }
    });

    // Sample quick access links for the project
    const projectQuickLinks = [
      {
        title: 'Proje Detayları',
        url: `/projeler/${firstProject.slug}`,
        icon: 'info',
        moduleType: 'project',
        projectId: firstProject.id,
        sortOrder: 1
      },
      {
        title: 'Proje Galerisi',
        url: `/projeler/${firstProject.slug}/galeri`,
        icon: 'gallery',
        moduleType: 'project',
        projectId: firstProject.id,
        sortOrder: 2
      },
      {
        title: 'Konum Bilgisi',
        url: `/projeler/${firstProject.slug}/konum`,
        icon: 'location',
        moduleType: 'project',
        projectId: firstProject.id,
        sortOrder: 3
      },
      {
        title: 'İletişim',
        url: '/iletisim',
        icon: 'contact',
        moduleType: 'project',
        projectId: firstProject.id,
        sortOrder: 4
      }
    ];

    for (const link of projectQuickLinks) {
      const exists = await prisma.quickAccessLink.findFirst({
        where: {
          title: link.title,
          projectId: link.projectId
        }
      });

      if (!exists) {
        await prisma.quickAccessLink.create({ data: link });
        console.log(`✅ Quick access link created: ${link.title}`);
      } else {
        console.log(`⏭️  Quick access link already exists: ${link.title}`);
      }
    }
  }

  console.log('🎉 Quick access links seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
