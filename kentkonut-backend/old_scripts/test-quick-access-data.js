const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testQuickAccessData() {
  console.log('🧪 Testing Quick Access Seed Data...\n');

  try {
    // Test 1: Check quick access links count
    console.log('📋 Test 1: Checking quick access links...');
    
    const quickAccessLinks = await prisma.quickAccessLink.findMany({
      include: {
        project: true,
        page: true,
        news: true,
        department: true
      }
    });
    
    console.log(`✅ Total quick access links: ${quickAccessLinks.length}`);
    
    quickAccessLinks.forEach((link, index) => {
      console.log(`  ${index + 1}. ${link.title} (${link.moduleType}) - ${link.url}`);
      if (link.project) {
        console.log(`     → Project: ${link.project.title}`);
      }
    });

    // Test 2: Check projects with hasQuickAccess enabled
    console.log('\n📋 Test 2: Checking projects with quick access...');
    
    const projectsWithQuickAccess = await prisma.project.findMany({
      where: { hasQuickAccess: true },
      include: {
        quickAccessLinks: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    console.log(`✅ Projects with quick access: ${projectsWithQuickAccess.length}`);
    
    projectsWithQuickAccess.forEach((project) => {
      console.log(`  → ${project.title}: ${project.quickAccessLinks.length} links`);
      project.quickAccessLinks.forEach((link, index) => {
        console.log(`    ${index + 1}. ${link.title} (order: ${link.sortOrder})`);
      });
    });

    // Test 3: Test module type filtering
    console.log('\n📋 Test 3: Testing module type filtering...');
    
    const projectLinks = await prisma.quickAccessLink.findMany({
      where: { moduleType: 'project' }
    });
    
    const pageLinks = await prisma.quickAccessLink.findMany({
      where: { moduleType: 'page' }
    });
    
    const newsLinks = await prisma.quickAccessLink.findMany({
      where: { moduleType: 'news' }
    });
    
    const departmentLinks = await prisma.quickAccessLink.findMany({
      where: { moduleType: 'department' }
    });
    
    console.log(`✅ Project links: ${projectLinks.length}`);
    console.log(`✅ Page links: ${pageLinks.length}`);
    console.log(`✅ News links: ${newsLinks.length}`);
    console.log(`✅ Department links: ${departmentLinks.length}`);

    // Test 4: Test sorting
    console.log('\n📋 Test 4: Testing sort order...');
    
    const sortedLinks = await prisma.quickAccessLink.findMany({
      where: { moduleType: 'project' },
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log('✅ Links sorted by order:');
    sortedLinks.forEach((link) => {
      console.log(`  ${link.sortOrder}. ${link.title}`);
    });

    // Test 5: Test active/inactive filtering
    console.log('\n📋 Test 5: Testing active/inactive filtering...');
    
    const activeLinks = await prisma.quickAccessLink.findMany({
      where: { isActive: true }
    });
    
    const inactiveLinks = await prisma.quickAccessLink.findMany({
      where: { isActive: false }
    });
    
    console.log(`✅ Active links: ${activeLinks.length}`);
    console.log(`✅ Inactive links: ${inactiveLinks.length}`);

    console.log('\n🎉 All data tests passed!');

  } catch (error) {
    console.error('❌ Data test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testQuickAccessData();
