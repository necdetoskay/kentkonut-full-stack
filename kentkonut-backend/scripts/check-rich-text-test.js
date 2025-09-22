const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRichTextTestPage() {
  try {
    console.log('Rich Text Editor Test sayfası kontrol ediliyor...');

    const page = await prisma.page.findUnique({
      where: { slug: 'rich-text-test' },
      include: {
        contents: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!page) {
      console.log('Rich Text Editor Test sayfası bulunamadı');
      return;
    }

    console.log('\n--- Rich Text Editor Test Sayfası ---');
    console.log('ID:', page.id);
    console.log('Başlık:', page.title);
    console.log('Slug:', page.slug);
    console.log('İçerik sayısı:', page.contents.length);
    
    console.log('\n--- İçerikler ---');
    page.contents.forEach((content, index) => {
      console.log(`${index + 1}. İçerik:`);
      console.log(`   ID: ${content.id}`);
      console.log(`   Tip: ${content.type}`);
      console.log(`   Başlık: ${content.title || 'Başlık yok'}`);
      console.log(`   Aktif: ${content.isActive}`);
      console.log(`   Sıra: ${content.order}`);
      console.log(`   İçerik uzunluğu: ${content.content ? content.content.length : 0} karakter`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRichTextTestPage();
