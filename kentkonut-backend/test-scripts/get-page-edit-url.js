const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getPageEditUrl() {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: 'test-onizleme' }
    });
    
    if (page) {
      console.log('Sayfa düzenleme URL:');
      console.log('http://localhost:3000/dashboard/pages/' + page.id + '/edit');
    }
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getPageEditUrl();
