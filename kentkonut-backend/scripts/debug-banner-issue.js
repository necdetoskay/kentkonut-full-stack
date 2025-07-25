const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugBannerIssue() {
  console.log('🔍 Debugging banner data flow issue...\n');

  try {
    // 1. Check banner positions
    console.log('1️⃣ Checking banner positions:');
    const positions = await prisma.bannerPosition.findMany({
      include: {
        bannerGroup: {
          include: {
            banners: {
              where: { isActive: true }
            }
          }
        },
        fallbackGroup: {
          include: {
            banners: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    console.log(`   Found ${positions.length} banner positions`);
    positions.forEach(pos => {
      console.log(`   - ${pos.name} (UUID: ${pos.positionUUID})`);
      console.log(`     Active: ${pos.isActive}`);
      console.log(`     Primary Group: ${pos.bannerGroup?.name || 'None'}`);
      console.log(`     Fallback Group: ${pos.fallbackGroup?.name || 'None'}`);
      if (pos.bannerGroup) {
        console.log(`     Primary Group Banners: ${pos.bannerGroup.banners.length}`);
      }
      if (pos.fallbackGroup) {
        console.log(`     Fallback Group Banners: ${pos.fallbackGroup.banners.length}`);
      }
      console.log('');
    });

    // 2. Check banner groups
    console.log('2️⃣ Checking banner groups:');
    const groups = await prisma.bannerGroup.findMany({
      include: {
        banners: {
          where: { isActive: true }
        }
      }
    });

    console.log(`   Found ${groups.length} banner groups`);
    groups.forEach(group => {
      console.log(`   - ${group.name} (ID: ${group.id})`);
      console.log(`     Active: ${group.isActive}`);
      console.log(`     Banners: ${group.banners.length}`);
      group.banners.forEach(banner => {
        console.log(`       * ${banner.title} (Active: ${banner.isActive})`);
      });
      console.log('');
    });

    // 3. Check all banners
    console.log('3️⃣ Checking all banners:');
    const banners = await prisma.banner.findMany({
      include: {
        bannerGroup: true
      }
    });

    console.log(`   Found ${banners.length} total banners`);
    const activeBanners = banners.filter(b => b.isActive);
    console.log(`   Active banners: ${activeBanners.length}`);

    activeBanners.forEach(banner => {
      console.log(`   - ${banner.title}`);
      console.log(`     Group: ${banner.bannerGroup.name}`);
      console.log(`     Image: ${banner.imageUrl}`);
      console.log(`     Order: ${banner.order}`);
      console.log('');
    });

    // 4. Test specific hero banner position
    console.log('4️⃣ Testing hero banner position (Ana Sayfa Üst Banner):');
    const heroUUID = '550e8400-e29b-41d4-a716-446655440001';
    const heroPosition = await prisma.bannerPosition.findUnique({
      where: { positionUUID: heroUUID },
      include: {
        bannerGroup: {
          include: {
            banners: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          }
        },
        fallbackGroup: {
          include: {
            banners: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (heroPosition) {
      console.log(`   ✅ Hero position found: ${heroPosition.name}`);
      console.log(`   Active: ${heroPosition.isActive}`);
      
      if (heroPosition.bannerGroup) {
        console.log(`   Primary group: ${heroPosition.bannerGroup.name}`);
        console.log(`   Primary group active: ${heroPosition.bannerGroup.isActive}`);
        console.log(`   Primary group banners: ${heroPosition.bannerGroup.banners.length}`);
        
        heroPosition.bannerGroup.banners.forEach(banner => {
          console.log(`     - ${banner.title} (Order: ${banner.order})`);
        });
      } else {
        console.log(`   ❌ No primary banner group assigned`);
      }

      if (heroPosition.fallbackGroup) {
        console.log(`   Fallback group: ${heroPosition.fallbackGroup.name}`);
        console.log(`   Fallback group banners: ${heroPosition.fallbackGroup.banners.length}`);
      } else {
        console.log(`   ⚠️  No fallback banner group assigned`);
      }
    } else {
      console.log(`   ❌ Hero position not found with UUID: ${heroUUID}`);
    }

    // 5. Test API endpoint simulation
    console.log('5️⃣ Simulating API endpoint response:');
    if (heroPosition) {
      let bannerGroup = heroPosition.bannerGroup;
      
      if (!bannerGroup || !bannerGroup.isActive) {
        bannerGroup = heroPosition.fallbackGroup;
        console.log(`   Using fallback group: ${bannerGroup?.name || 'None'}`);
      }

      if (bannerGroup && bannerGroup.isActive) {
        console.log(`   ✅ Would return banner group: ${bannerGroup.name}`);
        console.log(`   Banners to display: ${bannerGroup.banners.length}`);
        
        const response = {
          position: {
            id: heroPosition.id,
            positionUUID: heroPosition.positionUUID,
            name: heroPosition.name,
            isActive: heroPosition.isActive
          },
          bannerGroup: {
            id: bannerGroup.id,
            name: bannerGroup.name,
            isActive: bannerGroup.isActive
          },
          banners: bannerGroup.banners.map(banner => ({
            id: banner.id,
            title: banner.title,
            description: banner.description,
            imageUrl: banner.imageUrl,
            link: banner.link,
            order: banner.order,
            isActive: banner.isActive
          }))
        };
        
        console.log('   API Response would be:');
        console.log(JSON.stringify(response, null, 2));
      } else {
        console.log(`   ❌ No active banner group available`);
      }
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugBannerIssue();
