const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRichTextTestPage() {
  try {
    // Önce mevcut test sayfası var mı kontrol et
    let page = await prisma.page.findFirst({
      where: { slug: 'rich-text-test' },
      include: { contents: true }
    });

    if (!page) {      // Test sayfası oluştur
      page = await prisma.page.create({
        data: {
          title: 'Rich Text Editor Test Sayfası',
          description: 'Rich text editor fonksiyonlarını test etmek için oluşturulan sayfa',
          slug: 'rich-text-test',
          pageType: 'CUSTOM',
          isActive: true
        }
      });
      console.log('✅ Test sayfası oluşturuldu:', page.title);
    } else {
      console.log('ℹ️ Test sayfası zaten mevcut:', page.title);
    }

    // Test içeriği var mı kontrol et
    let content = await prisma.pageContent.findFirst({
      where: { 
        pageId: page.id,
        type: 'TEXT'
      }
    });

    if (!content) {
      // Test içeriği oluştur
      content = await prisma.pageContent.create({
        data: {
          pageId: page.id,
          type: 'TEXT',
          title: 'Rich Text Test İçeriği',
          subtitle: 'Rich text editor ile yazılmış test içeriği',
          content: '<p>Bu bir <strong>test içeriğidir</strong> ve <em>rich text editor</em> ile yazılmıştır.</p><p>Liste örneği:</p><ul><li>Birinci madde</li><li>İkinci madde</li></ul>',
          order: 1,
          isActive: true,
          fullWidth: false
        }
      });
      console.log('✅ Test içeriği oluşturuldu:', content.title);
    } else {
      console.log('ℹ️ Test içeriği zaten mevcut:', content.title);
    }

    console.log(`\n🔗 Test URL'leri:`);
    console.log(`📝 Edit Page: http://localhost:3001/dashboard/pages/${page.id}/edit`);
    console.log(`👁️ View Page: http://localhost:3001/pages/${page.slug}`);
    console.log(`📋 Pages List: http://localhost:3001/dashboard/pages`);
    
    return { page, content };
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createRichTextTestPage();
