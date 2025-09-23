const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testQuickAccessSchema() {
  console.log('🧪 Testing Quick Access Schema...\n');

  try {
    // Test 1: Check if hasQuickAccess fields exist
    console.log('📋 Test 1: Checking hasQuickAccess fields...');
    
    const pageCount = await prisma.page.count();
    const newsCount = await prisma.news.count();
    const projectCount = await prisma.project.count();
    const departmentCount = await prisma.department.count();
    
    console.log(`✅ Pages table accessible: ${pageCount} records`);
    console.log(`✅ News table accessible: ${newsCount} records`);
    console.log(`✅ Projects table accessible: ${projectCount} records`);
    console.log(`✅ Departments table accessible: ${departmentCount} records`);

    // Test 2: Check QuickAccessLink table
    console.log('\n📋 Test 2: Checking QuickAccessLink table...');
    
    const quickAccessCount = await prisma.quickAccessLink.count();
    console.log(`✅ QuickAccessLink table accessible: ${quickAccessCount} records`);

    // Test 3: Create a test quick access link
    console.log('\n📋 Test 3: Creating test quick access link...');
    
    // First, get a page to link to
    const testPage = await prisma.page.findFirst();
    if (testPage) {
      const testLink = await prisma.quickAccessLink.create({
        data: {
          title: 'Test Hızlı Erişim',
          url: '/test-link',
          icon: 'test-icon',
          moduleType: 'page',
          pageId: testPage.id,
          sortOrder: 1
        }
      });
      console.log(`✅ Test link created: ${testLink.id}`);

      // Test 4: Query with relations
      console.log('\n📋 Test 4: Testing relations...');
      
      const linkWithPage = await prisma.quickAccessLink.findUnique({
        where: { id: testLink.id },
        include: {
          page: true
        }
      });
      
      console.log(`✅ Relation test successful: ${linkWithPage.page?.title}`);

      // Test 5: Update page hasQuickAccess field
      console.log('\n📋 Test 5: Testing hasQuickAccess field...');
      
      await prisma.page.update({
        where: { id: testPage.id },
        data: { hasQuickAccess: true }
      });
      
      const updatedPage = await prisma.page.findUnique({
        where: { id: testPage.id },
        include: {
          quickAccessLinks: true
        }
      });
      
      console.log(`✅ hasQuickAccess updated: ${updatedPage.hasQuickAccess}`);
      console.log(`✅ Quick access links count: ${updatedPage.quickAccessLinks.length}`);

      // Cleanup
      await prisma.quickAccessLink.delete({
        where: { id: testLink.id }
      });
      
      await prisma.page.update({
        where: { id: testPage.id },
        data: { hasQuickAccess: false }
      });
      
      console.log('🧹 Test data cleaned up');
    } else {
      console.log('⚠️ No pages found for testing');
    }

    console.log('\n🎉 All schema tests passed!');

  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testQuickAccessSchema();
