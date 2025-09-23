import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  console.log('🌱 15 adet haber için seed işlemi başlıyor...');

  try {
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
      console.log(`👤 Haberler "${author.name}" adlı yazara atanacak.`);
    }

    let newsCategory = await prisma.newsCategory.findUnique({
      where: { slug: 'genel-duyurular' },
    });

    if (!newsCategory) {
      console.log('⚠️ "Genel Duyurular" kategorisi bulunamadı, oluşturuluyor...');
      newsCategory = await prisma.newsCategory.create({
        data: {
          name: 'Genel Duyurular',
          slug: 'genel-duyurular',
          description: 'Genel nitelikli haberler ve duyurular.',
        },
      });
      console.log('✅ "Genel Duyurular" kategorisi oluşturuldu.');
    } else {
        console.log('📂 Haberler "Genel Duyurular" kategorisine atanacak.');
    }

    const newsTitles = [
      "Kocaeli Teknoloji Vadisi projesinde temel atma töreni gerçekleşti.",
      "Gölkay Park Evleri 2. Etap için ön talepler alınmaya başlandı.",
      "İzmit Körfez Manzara Konutları'nda yaşam bu yaz başlıyor.",
      "Kartepe Zirve Villaları'nın örnek villası ziyarete açıldı.",
      "Başiskele Sahil Düzenlemesi halkın büyük beğenisini topladı.",
      "Plajyolu Kentsel Dönüşüm Projesi'nde anahtar teslimleri tamamlandı.",
      "Yahya Kaptan Konutları sakinleri için yeni sosyal tesis hizmete girdi.",
      "Umuttepe Öğrenci Yurtları yeni eğitim-öğretim yılına hazır.",
      "Sekapark Kültür Merkezi'nde yaz etkinlikleri programı açıklandı.",
      "Derince Liman Lojistik Alanı tam kapasiteyle faaliyete geçti.",
      "Gölcük Denizcilik Müzesi, ziyaretçi rekoru kırdı.",
      "Kandıra Gıda OSB, bölge ekonomisine büyük katkı sağlıyor.",
      "Gebze Bilişim Vadisi 1. Etap firmaları uluslararası başarılar elde ediyor.",
      "Darıca Millet Bahçesi, hafta sonları ailelerin akınına uğruyor.",
      "Yuvacık Barajı Sosyal Tesisleri yenilenen yüzüyle misafirlerini ağırlıyor."
    ];

    let createdCount = 0;
    for (const title of newsTitles) {
      const slug = generateSlug(title);
      const existingNews = await prisma.news.findUnique({ where: { slug } });

      if (existingNews) {
        console.log(`⏭️ Haber zaten mevcut, atlanıyor: ${title}`);
        continue;
      }

      await prisma.news.create({
        data: {
          title,
          slug,
          summary: `${title} hakkında daha fazla bilgi ve detaylar...`,
          content: `<p>Bu, <strong>${title}</strong> başlıklı haberin detaylı içeriğidir. Gelişmeler ve güncel bilgiler için takipte kalın.</p>`,
          categoryId: newsCategory.id,
          authorId: author.id,
          published: true,
          publishedAt: new Date(),
          readingTime: 3,
        },
      });
      console.log(`✅ Haber oluşturuldu: ${title}`);
      createdCount++;
    }

    console.log(`
🎉 Haber seed işlemi tamamlandı!
`);
    console.log(`✨ ${createdCount} adet yeni haber oluşturuldu.
`);

  } catch (error) {
    console.error('❌ Seed işlemi sırasında bir hata oluştu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Veritabanı bağlantısı kapatıldı.');
  }
}

main();
