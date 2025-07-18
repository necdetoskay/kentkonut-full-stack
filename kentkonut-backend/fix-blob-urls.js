const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBlobUrls() {
  try {
    // Blob URL içeren içerikleri bul
    const contents = await prisma.pageContent.findMany({
      where: {
        content: {
          contains: 'blob:'
        }
      }
    });
    
    console.log(`${contents.length} adet blob URL içeren içerik bulundu`);
    
    for (const content of contents) {
      console.log(`\nDüzeltiliyor: ${content.title || 'Başlıksız'}`);
      console.log('Mevcut içerik:', content.content?.substring(0, 200) + '...');
      
      // Blob URL'yi kaldır ve basit img tag'ine dönüştür
      let fixedContent = content.content || '';
      
      // Blob URL'li img taglerini geçici olarak kaldır
      fixedContent = fixedContent.replace(
        /<div class="tiptap-image-container[^>]*>[\s\S]*?blob:http[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
        '<p><em>[Resim kaldırıldı - tekrar yükleyin]</em></p>'
      );
      
      // Güncelle
      await prisma.pageContent.update({
        where: { id: content.id },
        data: { content: fixedContent }
      });
      
      console.log('Düzeltildi!');
    }
    
    console.log('\nTüm blob URL\'ler temizlendi. Lütfen resimleri tekrar yükleyin.');
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBlobUrls();
