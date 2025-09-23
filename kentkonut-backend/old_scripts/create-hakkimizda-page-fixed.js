const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createHakkimizdaPage() {
  try {
    console.log('Hakkımızda sayfası oluşturuluyor...');

    let page;

    // First, check if the page already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug: 'hakkimizda' }
    });

    if (existingPage) {
      console.log('Hakkımızda sayfası zaten mevcut. Güncelleniyor...');
      
      // Update the existing page
      page = await prisma.page.update({
        where: { slug: 'hakkimizda' },
        data: {
          title: 'Hakkımızda',
          subtitle: 'Kent Konut ile tanışın',
          description: '24 Şubat 2006\'da faaliyete geçirilen Kent Konut, bir belediye iktisadi teşekkülüdür.',
          metaTitle: 'Hakkımızda | Kent Konut',
          metaDescription: 'Kent Konut hakkında bilgi edinin. Kocaeli Büyükşehir Belediyesi\'nin Kocaeli halkına modern ve kaliteli konut sunduğu kurum.',
          metaKeywords: 'kent konut, hakkımızda, kocaeli, belediye, konut',
          headerImage: '/images/antet_kurumsal.jpg',
          isActive: true,
          showInNavigation: true,
          order: 2,
          pageType: 'ABOUT'
        }
      });

      console.log('Sayfa güncellendi:', page.id);
      
      // Delete existing content blocks
      await prisma.pageContent.deleteMany({
        where: { pageId: page.id }
      });
      console.log('Mevcut içerikler silindi.');
    } else {
      // Create the page
      page = await prisma.page.create({
        data: {
          slug: 'hakkimizda',
          title: 'Hakkımızda',
          subtitle: 'Kent Konut ile tanışın',
          description: '24 Şubat 2006\'da faaliyete geçirilen Kent Konut, bir belediye iktisadi teşekkülüdür.',
          metaTitle: 'Hakkımızda | Kent Konut',
          metaDescription: 'Kent Konut hakkında bilgi edinin. Kocaeli Büyükşehir Belediyesi\'nin Kocaeli halkına modern ve kaliteli konut sunduğu kurum.',
          metaKeywords: 'kent konut, hakkımızda, kocaeli, belediye, konut',
          headerImage: '/images/antet_kurumsal.jpg',
          isActive: true,
          showInNavigation: true,
          order: 2,
          pageType: 'ABOUT'
        }
      });

      console.log('Sayfa oluşturuldu:', page.id);
    }

    // Create content blocks
    const contents = [
      {
        type: 'TEXT',
        title: 'Kent Konut Kimdir?',
        content: `<p>24 Şubat 2006'da faaliyete geçirilen Kent Konut, bir belediye iktisadi teşekkülüdür. Kocaeli Büyükşehir Belediyesi'nin Kocaeli halkına modern ve kaliteli konut sunduğu bir kurumdur.</p>
        
        <p>Toplu konut üretiminde lider, kentsel dönüşüm projelerinde örnek uygulamalar geliştirip uygulayan, sosyal ihtiyaç ve değerleri gözeterek halkın konut ihtiyacını karşılayan, şehri ulusal ve uluslararası pazarlarda temsil kabiliyeti olan güvenilir bir marka haline gelmiştir.</p>`,
        order: 1,
        isActive: true,
        fullWidth: false
      },
      {
        type: 'TEXT',
        title: 'Sosyal Sorumluluk',
        content: `<p>Kent Konut bir kamu kurumu olmanın bilinci ile hareket eder. Sosyal belediyeciliğin gereği olarak, piyasa şartlarında konut sahibi olamayacak alt gelir gruplarına ve engelli hemşerilerimize öncelikli hak sahibi olabilecekleri sosyal konut projeleri sunar.</p>
        
        <p>Bankalarla yapılan anlaşmalar sonucu uygun ödeme seçenekleri sağlar. Alt gelir grubuna uygun taksit imkânı sağlayan projelerinde engelli kimseler için kontenjan ayırarak onların ev sahibi olmasının mutluluğuna ortak olur.</p>`,
        order: 2,
        isActive: true,
        fullWidth: false
      },
      {
        type: 'TEXT',
        title: 'Yaşanabilir Bir Şehir!',
        content: `<p>Kent Konut düzenli kentleşmeyi sağlamak, çarpık kentleşmenin önüne geçmek, çağdaş bir kentsel dönüşüm yapmak, artan nüfusun getirdiği sosyal donatı eksikliğini gidermek konuları, sanayi ve ticaret alanı ihtiyacını karşılamak amacıyla projeler yapar ve hayata geçirir.</p>
        
        <p>Tarihsel dokuyu koruyarak, şehrin eskiyen yüzünü yeniler. Bu amaçla Kocaeli halkı için planlı, alt yapısı tamamlanmış, yeşil alanlar ve sosyal donatılar ile zenginleştirilmiş yaşam alanları üretir.</p>`,
        order: 3,
        isActive: true,
        fullWidth: false
      },
      {
        type: 'TEXT',
        title: 'Misyon',
        content: `<p><strong>Misyonumuz:</strong> Kocaeli halkına modern, kaliteli ve uygun fiyatlı konut imkânları sunarak yaşam kalitesini artırmak ve sürdürülebilir kentsel gelişime katkıda bulunmaktır.</p>`,
        order: 4,
        isActive: true,
        fullWidth: false
      },
      {
        type: 'TEXT',
        title: 'Vizyon',
        content: `<p><strong>Vizyonumuz:</strong> Kocaeli'nin kentsel dönüşümüne öncülük ederek, çağdaş yaşam standartlarında konut üretiminde örnek bir kurum olmaktır.</p>`,
        order: 5,
        isActive: true,
        fullWidth: false
      }
    ];

    console.log('İçerik blokları oluşturuluyor...');

    for (const content of contents) {
      const createdContent = await prisma.pageContent.create({
        data: {
          ...content,
          pageId: page.id
        }
      });
      console.log(`İçerik oluşturuldu: ${createdContent.title} (${createdContent.id})`);
    }

    console.log('Hakkımızda sayfası başarıyla oluşturuldu!');

    // Fetch and display the complete page
    const completePage = await prisma.page.findUnique({
      where: { id: page.id },
      include: {
        contents: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    console.log('\n--- Oluşturulan Sayfa ---');
    console.log('Başlık:', completePage.title);
    console.log('Slug:', completePage.slug);
    console.log('İçerik Sayısı:', completePage.contents.length);
    console.log('İçerikler:');
    completePage.contents.forEach(content => {
      console.log(`- ${content.title} (${content.type})`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createHakkimizdaPage();
