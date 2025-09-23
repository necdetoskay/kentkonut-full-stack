const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Static service data from ServicesSection.tsx
const staticServices = [
  {
    id: 1,
    title: 'Konut Hizmetleri',
    imageSrc: '/images/services/1_24022021034916.jpg',
    color: '#4F772D'
  },
  {
    id: 2,
    title: 'Hafriyat Hizmetleri',
    imageSrc: '/images/services/2_24022021040848.jpg',
    color: '#31708E'
  },
  {
    id: 3,
    title: 'Mimari Projelendirme',
    imageSrc: '/images/services/3_24022021034931.jpg',
    color: '#5B4E77'
  },
  {
    id: 4,
    title: 'Kentsel Dönüşüm',
    imageSrc: '/images/services/4_24022021034938.jpg',
    color: '#754043'
  }
];

// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function migrateServiceCards() {
  try {
    console.log('🔄 Starting service cards migration...');

    // Check if service cards already exist
    const existingCards = await prisma.serviceCard.findMany();
    console.log(`📊 Found ${existingCards.length} existing service cards`);

    if (existingCards.length > 0) {
      console.log('⚠️  Service cards already exist. Skipping migration.');
      console.log('   Existing cards:');
      existingCards.forEach(card => {
        console.log(`   - ${card.title} (${card.slug})`);
      });
      return;
    }

    console.log('📝 Migrating static service data to database...');

    // Migrate each static service
    for (const service of staticServices) {
      const slug = generateSlug(service.title);
      
      const serviceCard = await prisma.serviceCard.create({
        data: {
          title: service.title,
          slug: slug,
          imageUrl: service.imageSrc,
          color: service.color,
          displayOrder: service.id,
          isActive: true,
          isFeatured: true, // All original services are featured
          shortDescription: `${service.title} hizmetlerimiz hakkında detaylı bilgi`,
          description: `Kent Konut olarak ${service.title.toLowerCase()} alanında profesyonel hizmetler sunmaktayız. Deneyimli ekibimiz ve modern teknolojilerimizle kaliteli çözümler üretiyoruz.`,
          altText: `${service.title} - Kent Konut`,
          metaTitle: `${service.title} | Kent Konut`,
          metaDescription: `Kent Konut ${service.title.toLowerCase()} hizmetleri. Profesyonel ekip, kaliteli hizmet.`,
          // Note: targetUrl will be set later when service detail pages are created
          targetUrl: null,
          isExternal: false
        }
      });

      console.log(`✅ Migrated: ${serviceCard.title} (ID: ${serviceCard.id}, Slug: ${serviceCard.slug})`);
    }

    // Final verification
    const finalCount = await prisma.serviceCard.count();
    console.log(`🎉 Migration completed! Created ${finalCount} service cards.`);

    // Display created cards
    const createdCards = await prisma.serviceCard.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    console.log('\n📋 Created service cards:');
    createdCards.forEach(card => {
      console.log(`   ${card.displayOrder}. ${card.title}`);
      console.log(`      Slug: ${card.slug}`);
      console.log(`      Color: ${card.color}`);
      console.log(`      Image: ${card.imageUrl}`);
      console.log(`      Active: ${card.isActive}`);
      console.log(`      Featured: ${card.isFeatured}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error during service cards migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateServiceCards();
