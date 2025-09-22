const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateHafriyatPageUndeletable() {
  try {
    // Hafriyat sayfasını silinemez olarak işaretle
    const updatedPage = await prisma.page.update({
      where: {
        slug: 'hafriyat'
      },
      data: {
        isDeletable: false
      }
    });

    console.log('Hafriyat sayfası başarıyla silinemez olarak işaretlendi:', updatedPage.title);
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHafriyatPageUndeletable();