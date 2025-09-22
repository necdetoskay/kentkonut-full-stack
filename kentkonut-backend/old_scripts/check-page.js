const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: 'cmev8379a0000jvlvdj8yuyza' }
    });
    
    if (page) {
      console.log('Sayfa bulundu:');
      console.log('ID:', page.id);
      console.log('Başlık:', page.title);
      console.log('Slug:', page.slug);
    } else {
      console.log('Bu ID ile sayfa bulunamadı');
    }
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
})();