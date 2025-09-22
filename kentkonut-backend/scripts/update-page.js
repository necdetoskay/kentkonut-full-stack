const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateExistingPage() {
  try {
    // Mevcut hakkimizda sayfasını güncelle
    const updatedPage = await prisma.page.update({
      where: { slug: 'hakkimizda' },
      data: {
        pageType: 'ABOUT',
        showInNavigation: true
      }
    });

    console.log('Page updated successfully:', updatedPage.id);

  } catch (error) {
    console.error('Error updating page:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingPage();
