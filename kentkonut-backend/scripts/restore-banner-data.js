const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreBannerData() {
  try {
    console.log('🔄 Restoring banner data...');

    // Check if banner groups exist
    const existingGroups = await prisma.bannerGroup.findMany();
    console.log(`📊 Found ${existingGroups.length} existing banner groups`);

    let heroGroup;

    if (existingGroups.length === 0) {
      // Create Hero Section banner group
      heroGroup = await prisma.bannerGroup.create({
        data: {
          name: 'Hero Section',
          description: 'Ana sayfa hero banner grubu',
          isActive: true,
          deletable: true,
          width: 1200,
          height: 400,
          mobileWidth: 400,
          mobileHeight: 200,
          tabletWidth: 800,
          tabletHeight: 300,
          displayDuration: 5000,
          transitionDuration: 0.5,
          animationType: 'SOLUKLESTIR'
        }
      });
      console.log('✅ Created Hero Section banner group');

      // Create Test Banner Group
      const testGroup = await prisma.bannerGroup.create({
        data: {
          name: 'Test Banner Group for Workflow',
          description: 'Test group for banner detail workflow testing',
          isActive: true,
          deletable: true,
          width: 1200,
          height: 400,
          mobileWidth: 400,
          mobileHeight: 200,
          tabletWidth: 800,
          tabletHeight: 300,
          displayDuration: 5000,
          transitionDuration: 0.5,
          animationType: 'SOLUKLESTIR'
        }
      });
      console.log('✅ Created Test Banner Group');
    } else {
      heroGroup = existingGroups.find(g => g.name.includes('Hero')) || existingGroups[0];
      console.log('✅ Using existing Hero Section group');
    }

    // Check if banners exist
    const existingBanners = await prisma.banner.findMany();
    console.log(`📊 Found ${existingBanners.length} existing banners`);

    if (existingBanners.length === 0) {
      // Create sample banners
      const banner1 = await prisma.banner.create({
        data: {
          title: 'sağlık kent',
          description: null,
          link: '/hakkinda',
          isActive: true,
          deletable: true,
          order: 1,
          startDate: new Date('2025-07-23T10:42:00.000Z'),
          endDate: null,
          viewCount: 2299,
          clickCount: 19,
          impressionCount: 4,
          uniqueViewCount: 0,
          conversionCount: 1,
          bounceCount: 0,
          avgEngagementTime: 0,
          imageUrl: '/banners/1753280250995_8lmw51ldb83.png',
          altText: 'vlcsnap-2025-06-10-12h14m55s030.png',
          bannerGroupId: heroGroup.id
        }
      });

      const banner2 = await prisma.banner.create({
        data: {
          title: 'tuana',
          description: '',
          link: '',
          isActive: true,
          deletable: true,
          order: 2,
          startDate: null,
          endDate: null,
          viewCount: 2289,
          clickCount: 8,
          impressionCount: 3,
          uniqueViewCount: 0,
          conversionCount: 0,
          bounceCount: 0,
          avgEngagementTime: 0,
          imageUrl: '/banners/1753280277039_d4r0c7pw0wm.png',
          altText: '2420181460_preview_X4 Complete Universe Map Dark.png',
          bannerGroupId: heroGroup.id
        }
      });

      console.log('✅ Created sample banners');
    } else {
      console.log('✅ Banners already exist');
    }

    // Link hero position to hero group
    const heroPosition = await prisma.bannerPosition.findUnique({
      where: { positionUUID: '550e8400-e29b-41d4-a716-446655440001' }
    });

    if (heroPosition && !heroPosition.bannerGroupId) {
      await prisma.bannerPosition.update({
        where: { positionUUID: '550e8400-e29b-41d4-a716-446655440001' },
        data: { bannerGroupId: heroGroup.id }
      });
      console.log('✅ Linked hero position to hero group');
    }

    // Final check
    const finalBannerCount = await prisma.banner.count();
    const finalGroupCount = await prisma.bannerGroup.count();
    const finalPositionCount = await prisma.bannerPosition.count();

    console.log('🎉 Banner data restoration completed!');
    console.log(`📊 Final counts:`);
    console.log(`   - Banners: ${finalBannerCount}`);
    console.log(`   - Banner Groups: ${finalGroupCount}`);
    console.log(`   - Banner Positions: ${finalPositionCount}`);

  } catch (error) {
    console.error('❌ Error restoring banner data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreBannerData();
