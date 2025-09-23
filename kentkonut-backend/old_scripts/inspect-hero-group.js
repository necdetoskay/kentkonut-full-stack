const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectHero() {
  try {
    console.log('🔍 Inspecting HERO banner group...');

    const groups = await prisma.bannerGroup.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        usageType: true,
        createdAt: true,
        updatedAt: true,
        banners: {
          select: { id: true, title: true, isActive: true, order: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (!groups.length) {
      console.log('⚠️ No banner groups found.');
      return;
    }

    for (const g of groups) {
      const bannerCount = g.banners.length;
      const activeCount = g.banners.filter(b => b.isActive).length;
      console.log(`\n— Group #${g.id}: "${g.name}" | usageType=${g.usageType ?? 'null'} | isActive=${g.isActive} | banners=${bannerCount} (active ${activeCount})`);
      if (bannerCount) {
        g.banners.forEach(b => {
          console.log(`   • [${b.id}] order=${b.order} active=${b.isActive} title="${b.title}"`);
        });
      }
    }

    const heroActive = await prisma.bannerGroup.findFirst({
      where: { usageType: 'HERO', isActive: true },
      include: { banners: true }
    });

    if (heroActive) {
      console.log(`\n✅ Active HERO group found: #${heroActive.id} - ${heroActive.name}, banners=${heroActive.banners.length}`);
    } else {
      console.log('\n❌ No active HERO group found.');
    }

  } catch (e) {
    console.error('Error inspecting hero group:', e);
  } finally {
    await prisma.$disconnect();
  }
}

inspectHero();