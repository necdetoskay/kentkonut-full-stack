const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getPageId() {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: 'hakkimizda' }
    });
    
    if (page) {
      console.log('Sayfa düzenleme URL:');
      console.log('http://localhost:3001/dashboard/pages/' + page.id + '/edit');
      console.log('Sayfa ID:', page.id);
    } else {
      console.log('Sayfa bulunamadı');
    }
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getPageId();
