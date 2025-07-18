const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestContents() {
  try {
    // Önce hakkimizda sayfasının ID'sini al
    const page = await prisma.page.findUnique({
      where: { slug: 'hakkimizda' }
    });

    if (!page) {
      console.log('Hakkimizda sayfası bulunamadı');
      return;
    }

    console.log('Found page:', page.id);

    // TEXT içerik oluştur
    const textContent = await prisma.pageContent.create({
      data: {
        pageId: page.id,
        type: 'TEXT',
        title: 'Kent Konut Hakkında',
        subtitle: 'Güvenilir Emlak Danışmanlığı',
        content: '<p>Kent Konut, yılların verdiği tecrübe ile emlak sektöründe güvenilir hizmet sunan bir firmadır. Müşteri memnuniyetini ön planda tutan yaklaşımımızla...</p>',
        order: 1,
        isActive: true,
        fullWidth: false
      }
    });

    console.log('Text content created:', textContent.id);

    // IMAGE içerik oluştur
    const imageContent = await prisma.pageContent.create({
      data: {
        pageId: page.id,
        type: 'IMAGE',
        title: 'Ofisimiz',
        imageUrl: 'https://picsum.photos/800/400?random=2',
        alt: 'Kent Konut Ofis Görünümü',
        caption: 'Modern ve konforlu ofisimizde size daha iyi hizmet veriyoruz',
        order: 2,
        isActive: true,
        fullWidth: true
      }
    });

    console.log('Image content created:', imageContent.id);

    // CTA içerik oluştur
    const ctaContent = await prisma.pageContent.create({
      data: {
        pageId: page.id,
        type: 'CTA',
        title: 'Hayalinizdeki Evi Bulun',
        content: '{"buttonText": "İletişime Geç", "buttonUrl": "/iletisim", "description": "Uzman ekibimizle hayalinizdeki eve kavuşun"}',
        order: 3,
        isActive: true,
        fullWidth: false,
        config: {
          buttonColor: 'primary',
          buttonSize: 'large',
          alignment: 'center'
        }
      }
    });

    console.log('CTA content created:', ctaContent.id);

    console.log('All test contents created successfully!');

  } catch (error) {
    console.error('Error creating test contents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestContents();
