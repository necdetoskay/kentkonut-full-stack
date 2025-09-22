import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generatePlaceholderUrl(text: string): string {
  const encodedText = encodeURIComponent(text);
  return `https://placehold.co/600x400/e2e8f0/64748b?text=${encodedText}`;
}

async function main() {
  console.log('🛠️ Geçersiz medya URL\'lerini düzeltme işlemi başlıyor...');

  try {
    const invalidMedia = await prisma.media.findMany({
      where: {
        url: {
          startsWith: '/media/placeholders/',
        },
      },
    });

    if (invalidMedia.length === 0) {
      console.log('✅ Düzeltilecek geçersiz medya URL\'si bulunamadı.');
      return;
    }

    console.log(`🖼️ ${invalidMedia.length} adet düzeltilecek medya kaydı bulundu.`);

    let updatedCount = 0;
    for (const media of invalidMedia) {
      const newUrl = generatePlaceholderUrl(media.originalName || 'Proje Resmi');
      await prisma.media.update({
        where: { id: media.id },
        data: {
          url: newUrl,
          path: newUrl, // Path'i de URL olarak ayarlıyoruz çünkü bu artık bir dış kaynak.
        },
      });
      console.log(`🎨 Medya güncellendi: ${media.filename} -> ${newUrl}`);
      updatedCount++;
    }

    console.log(`
🎉 Düzeltme işlemi tamamlandı!`);
    console.log(`✨ ${updatedCount} adet medya kaydının URL'si güncellendi.`);

  } catch (error) {
    console.error('❌ Düzeltme işlemi sırasında bir hata oluştu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Veritabanı bağlantısı kapatıldı.');
  }
}

main();
