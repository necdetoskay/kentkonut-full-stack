import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🛠️ Proje resimlerini düzeltme işlemi başlıyor...');

  try {
    const projectsWithoutImages = await prisma.project.findMany({
      where: { mediaId: null },
    });

    if (projectsWithoutImages.length === 0) {
      console.log('✅ Resimsiz proje bulunamadı. Tüm projelerin resmi var gibi görünüyor.');
      return;
    }

    console.log(`🖼️ ${projectsWithoutImages.length} adet resimsiz proje bulundu.`);

    let availableMedia = await prisma.media.findMany({
      where: { type: 'IMAGE' },
    });

    if (availableMedia.length === 0) {
      console.log('⚠️ Hiç resim medyası bulunamadı. 5 adet örnek resim oluşturuluyor...');
      for (let i = 0; i < 5; i++) {
        const placeholderMedia = await prisma.media.create({
          data: {
            filename: `placeholder-image-${i + 1}.jpg`,
            originalName: `Placeholder Image ${i + 1}`,
            url: `https://placehold.co/600x400/e2e8f0/64748b?text=Placeholder+${i + 1}`,
            path: `https://placehold.co/600x400/e2e8f0/64748b?text=Placeholder+${i + 1}`,
            type: 'IMAGE',
            size: 12345,
            mimeType: 'image/jpeg',
            uploadedBy: (await prisma.user.findFirst())?.id,
          },
        });
        availableMedia.push(placeholderMedia);
      }
      console.log(`✅ ${availableMedia.length} adet örnek resim oluşturuldu.`);
    }

    let updatedCount = 0;
    for (let i = 0; i < projectsWithoutImages.length; i++) {
      const project = projectsWithoutImages[i];
      const mediaToAssign = availableMedia[i % availableMedia.length];

      await prisma.project.update({
        where: { id: project.id },
        data: { mediaId: mediaToAssign.id },
      });
      console.log(`🎨 "${project.title}" projesine resim atandı: ${mediaToAssign.filename}`);
      updatedCount++;
    }

    console.log(`\n🎉 Düzeltme işlemi tamamlandı!`);
    console.log(`✨ ${updatedCount} adet projeye resim ataması yapıldı.`);

  } catch (error) {
    console.error('❌ Düzeltme işlemi sırasında bir hata oluştu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Veritabanı bağlantısı kapatıldı.');
  }
}

main();
