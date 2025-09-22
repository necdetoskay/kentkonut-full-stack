const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateExistingPage() {
  try {
    const existingPage = await prisma.page.findUnique({
      where: { slug: 'hakkimizda' }
    });
    
    console.log('Existing page:', existingPage?.title);
    
    // Update the existing page
    const updatedPage = await prisma.page.update({
      where: { slug: 'hakkimizda' },
      data: {
        title: 'Hakkımızda',
        subtitle: 'Kent Konut Şirketimiz',
        description: 'Kent Konut olarak yılların verdiği tecrübe ile emlak sektöründe güvenilir çözümler sunuyoruz.',
        pageType: 'ABOUT',
        showInNavigation: true,
        order: 1,
        isActive: true,
        template: 'DEFAULT',
        headerType: 'IMAGE'
      }
    });
    
    console.log('Updated page:', updatedPage.title);
    
    // Create contact page with different slug
    const contactPage = await prisma.page.create({
      data: {
        slug: 'iletisim-yeni',
        title: 'İletişim',
        subtitle: 'Bizimle İletişime Geçin',
        description: 'Kent Konut ile iletişime geçmek için adres, telefon ve e-posta bilgilerimizi bulabilirsiniz.',
        pageType: 'CONTACT',
        showInNavigation: true,
        order: 2,
        isActive: true,
        template: 'DEFAULT',
        headerType: 'GRADIENT'
      }
    });
    
    console.log('Created contact page:', contactPage.title);
    
    // Add clean content
    const aboutContent = await prisma.pageContent.create({
      data: {
        pageId: updatedPage.id,
        type: 'HERO',
        title: 'Kent Konut Hakkında',
        content: '<p>Kent Konut, yılların verdiği tecrübe ile emlak sektöründe güvenilir çözümler sunuyor. Müşteri memnuniyetini önceleyerek konut alanında profesyönel hizmet veriyoruz.</p>',
        order: 1,
        isActive: true,
        fullWidth: true
      }
    });
    
    console.log('Created clean content:', aboutContent.title);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingPage();
