import { PrismaClient, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Mevcut script'ten alınan yardımcı fonksiyon
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log('🌱 Proje seed işlemi başlıyor...');

  try {
    // Projeleri atamak için bir yazar (author) bul veya oluştur
    let author = await prisma.user.findFirst();
    if (!author) {
      console.log('⚠️ Yazar bulunamadı, yeni bir tane oluşturuluyor...');
      author = await prisma.user.create({
        data: {
          id: 'seed-user-1',
          name: 'Admin Kullanıcı',
          email: 'admin@example.com',
          role: 'admin',
        },
      });
      console.log(`✅ "${author.name}" adlı yazar oluşturuldu.`);
    } else {
      console.log(`👤 Projeler "${author.name}" adlı yazara atanacak.`);
    }

    // Resim medyasını bul veya oluştur
    let availableMedia = await prisma.media.findMany({
      where: { type: 'IMAGE' },
      take: 10,
    });

    if (availableMedia.length < 5) {
      console.log('⚠️ Yeterli resim medyası bulunamadı. 5 adet örnek resim oluşturuluyor...');
      for (let i = availableMedia.length; i < 5; i++) {
        const placeholderMedia = await prisma.media.create({
          data: {
            filename: `placeholder-seed-${i + 1}.jpg`,
            originalName: `Placeholder Seed ${i + 1}`,
            url: `https://placehold.co/600x400/e2e8f0/64748b?text=Placeholder+Seed+${i + 1}`,
            path: `https://placehold.co/600x400/e2e8f0/64748b?text=Placeholder+Seed+${i + 1}`,
            type: 'IMAGE',
            size: 12345,
            mimeType: 'image/jpeg',
            uploadedBy: author.id,
          },
        });
        availableMedia.push(placeholderMedia);
      }
      console.log(`✅ ${availableMedia.length} adet resim mevcut.`);
    } else {
      console.log(`🖼️ ${availableMedia.length} adet mevcut resim bulundu. Projeler için kullanılacak.`);
    }

    // 5 Devam Eden Proje
    const ongoingProjectTitles = [
      "Kocaeli Teknoloji Vadisi",
      "Gölkay Park Evleri 2. Etap",
      "İzmit Körfez Manzara Konutları",
      "Kartepe Zirve Villaları",
      "Başiskele Sahil Düzenlemesi",
    ];
    const ongoingProjects = ongoingProjectTitles.map((title, i) => ({
      title: title,
      slug: generateSlug(title),
      summary: `${title} projesinin özeti. Modern mimari ve sosyal donatılar...`,
      content: `<p>${title} projesi hakkında detaylı içerik. Bu proje, bölgenin gelişimine önemli katkılar sağlamaktadır.</p>`,
      status: ProjectStatus.ONGOING,
      authorId: author.id,
      published: true,
      publishedAt: new Date(),
      mediaId: availableMedia[i % availableMedia.length].id,
    }));

    // 15 Tamamlanmış Proje
    const completedProjectTitles = [
      "Plajyolu Kentsel Dönüşüm Projesi",
      "Yahya Kaptan Konutları",
      "Umuttepe Öğrenci Yurtları",
      "41 Burda AVM Genişletme",
      "Sekapark Kültür Merkezi",
      "Derince Liman Lojistik Alanı",
      "Gölcük Denizcilik Müzesi",
      "Karamürsel Sahil Konakları",
      "Kandıra Gıda OSB Altyapı Projesi",
      "Gebze Bilişim Vadisi 1. Etap",
      "Çayırova Sanayi Sitesi Yenileme",
      "Darıca Millet Bahçesi",
      "Körfez Yarış Pisti",
      "Maşukiye Doğa Evleri",
      "Yuvacık Barajı Sosyal Tesisleri",
    ];
    const completedProjects = completedProjectTitles.map((title, i) => ({
      title: title,
      slug: generateSlug(title),
      summary: `${title} projesi başarıyla tamamlanmıştır. Bölge halkının hizmetine sunulmuştur.`,
      content: `<p>${title} projesi hakkında detaylı içerik. Proje, belirlenen takvim ve bütçe dahilinde tamamlanmıştır.</p>`,
      status: ProjectStatus.COMPLETED,
      authorId: author.id,
      published: true,
      publishedAt: new Date(new Date().setFullYear(new Date().getFullYear() - (i % 3 + 1))), // 1-3 yıl önce tamamlandı
      mediaId: availableMedia[(i + ongoingProjects.length) % availableMedia.length].id,
    }));

    const allProjects = [...ongoingProjects, ...completedProjects];
    let createdCount = 0;

    for (const projectData of allProjects) {
      const existingProject = await prisma.project.findUnique({
        where: { slug: projectData.slug },
      });

      if (existingProject) {
        console.log(`⏭️ Proje zaten mevcut, atlanıyor: ${projectData.title}`);
        continue;
      }

      await prisma.project.create({
        data: projectData,
      });
      console.log(`✅ Proje oluşturuldu: ${projectData.title}`);
      createdCount++;
    }

    console.log(`
🎉 Proje seed işlemi tamamlandı!`);
    console.log(`✨ ${createdCount} adet yeni proje oluşturuldu.`);

  } catch (error) {
    console.error('❌ Seed işlemi sırasında bir hata oluştu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Veritabanı bağlantısı kapatıldı.');
  }
}


main();
