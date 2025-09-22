const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMenuDatabase() {
  console.log('🧪 Testing Menu Database...\n');

  try {
    // Test 1: Ana menu itemlarını getir
    console.log('📋 Test 1: Fetching main menu items...');
    const mainMenuItems = await prisma.menuItem.findMany({
      where: {
        menuLocation: 'main',
        parentId: null
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    console.log(`✅ Found ${mainMenuItems.length} main menu items:`);
    mainMenuItems.forEach(item => {
      console.log(`   - ${item.title} (${item.url}) - Order: ${item.orderIndex}`);
    });

    // Test 2: Alt menu itemlarını getir
    console.log('\n📋 Test 2: Fetching sub menu items...');
    const subMenuItems = await prisma.menuItem.findMany({
      where: {
        parentId: { not: null }
      },
      include: {
        parent: true
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    console.log(`✅ Found ${subMenuItems.length} sub menu items:`);
    subMenuItems.forEach(item => {
      console.log(`   - ${item.title} (parent: ${item.parent?.title}) - Order: ${item.orderIndex}`);
    });

    // Test 3: Hiyerarşik yapıyı test et
    console.log('\n📋 Test 3: Testing hierarchical structure...');
    const menuWithChildren = await prisma.menuItem.findMany({
      where: {
        menuLocation: 'main',
        parentId: null
      },
      include: {
        children: {
          orderBy: {
            orderIndex: 'asc'
          }
        }
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    console.log('✅ Hierarchical menu structure:');
    menuWithChildren.forEach(item => {
      console.log(`📁 ${item.title}`);
      if (item.children.length > 0) {
        item.children.forEach(child => {
          console.log(`   └── ${child.title}`);
        });
      }
    });

    // Test 4: Aktif menu itemları
    console.log('\n📋 Test 4: Testing active menu items...');
    const activeItems = await prisma.menuItem.findMany({
      where: {
        isActive: true
      }
    });

    console.log(`✅ Found ${activeItems.length} active menu items`);

    // Test 5: Menu item sayısı
    console.log('\n📋 Test 5: Total menu items count...');
    const totalCount = await prisma.menuItem.count();
    console.log(`✅ Total menu items in database: ${totalCount}`);

    console.log('\n🎉 All database tests passed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMenuDatabase();
