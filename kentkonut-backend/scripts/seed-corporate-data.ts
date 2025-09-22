import { PrismaClient, HighlightSourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCorporateData() {
  try {
    console.log('🌱 Kurumsal veriler seed başlıyor...');

    // Yönetim Kadrosu Seed Verisi
    console.log('👥 Yönetim kadrosu ekleniyor...');
    
    const executives = [
      {
        name: 'Ahmet YILMAZ',
        title: 'Genel Müdür',
        email: 'ahmet.yilmaz@kentkonut.com.tr',
        phone: '0262 331 0700',
        order: 1,
        isActive: true,
        biography: 'Kent Konut A.Ş. Genel Müdürü olarak görev yapmaktadır.',
        imageUrl: '/images/executives/genel-mudur.jpg'
      },
      {
        name: 'Mehmet KAYA',
        title: 'Genel Müdür Yardımcısı',
        email: 'mehmet.kaya@kentkonut.com.tr',
        phone: '0262 331 0701',
        order: 2,
        isActive: true,
        biography: 'Genel Müdür Yardımcısı olarak stratejik planlama ve koordinasyon görevlerini yürütmektedir.',
        imageUrl: '/images/executives/genel-mudur-yardimcisi.jpg'
      },
      {
        name: 'Fatma ÖZKAN',
        title: 'Mali İşler Müdürü',
        email: 'fatma.ozkan@kentkonut.com.tr',
        phone: '0262 331 0702',
        order: 3,
        isActive: true,
        biography: 'Mali İşler Müdürü olarak şirketin finansal yönetiminden sorumludur.',
        imageUrl: '/images/executives/mali-isler-muduru.jpg'
      },
      {
        name: 'Ali DEMIR',
        title: 'İnsan Kaynakları Müdürü',
        email: 'ali.demir@kentkonut.com.tr',
        phone: '0262 331 0703',
        order: 4,
        isActive: true,
        biography: 'İnsan Kaynakları Müdürü olarak personel yönetimi ve gelişimi konularında çalışmaktadır.',
        imageUrl: '/images/executives/ik-muduru.jpg'
      }
    ];

    for (const executive of executives) {
      // Slug oluştur
      const slug = executive.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      await prisma.executive.upsert({
        where: { slug: slug },
        update: {
          name: executive.name,
          title: executive.title,
          email: executive.email,
          phone: executive.phone,
          order: executive.order,
          isActive: executive.isActive,
          biography: executive.biography,
          imageUrl: executive.imageUrl
        },
        create: {
          ...executive,
          slug: slug
        }
      });
    }

    // Birimler Seed Verisi
    console.log('🏢 Birimler ekleniyor...');
    
    const departments = [
      {
        name: 'Genel Müdürlük',
        services: ['Stratejik Planlama', 'Koordinasyon', 'Yönetim'],
        order: 1,
        isActive: true,
        imageUrl: '/images/departments/genel-mudurluk.jpg'
      },
      {
        name: 'Mali İşler Müdürlüğü',
        services: ['Muhasebe', 'Bütçe Yönetimi', 'Mali Raporlama'],
        order: 2,
        isActive: true,
        imageUrl: '/images/departments/mali-isler.jpg'
      },
      {
        name: 'İnsan Kaynakları Müdürlüğü',
        services: ['Personel Yönetimi', 'Eğitim', 'Gelişim'],
        order: 3,
        isActive: true,
        imageUrl: '/images/departments/insan-kaynaklari.jpg'
      },
      {
        name: 'Proje Geliştirme Müdürlüğü',
        services: ['Proje Planlama', 'Uygulama', 'Takip'],
        order: 4,
        isActive: true,
        imageUrl: '/images/departments/proje-gelistirme.jpg'
      },
      {
        name: 'Satış ve Pazarlama Müdürlüğü',
        services: ['Satış', 'Pazarlama', 'Müşteri İlişkileri'],
        order: 5,
        isActive: true,
        imageUrl: '/images/departments/satis-pazarlama.jpg'
      }
    ];

    for (const department of departments) {
      // Slug oluştur
      const slug = department.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      await prisma.department.upsert({
        where: { slug: slug },
        update: {
          name: department.name,
          services: department.services,
          order: department.order,
          isActive: department.isActive,
          imageUrl: department.imageUrl
        },
        create: {
          ...department,
          slug: slug
        }
      });
    }

    // Öne Çıkanlar Seed Verisi
    console.log('⭐ Öne çıkanlar ekleniyor...');
    
    const highlights = [
      {
        order: 1,
        isActive: true,
        sourceType: HighlightSourceType.CUSTOM,
        titleOverride: 'Yeni Konut Projesi: Körfez Evleri',
        subtitleOverride: 'Kocaeli Körfez bölgesinde modern yaşam alanları sunan yeni konut projemiz.',
        imageUrl: '/images/highlights/korfez-evleri.jpg',
        redirectUrl: '/projeler/korfez-evleri'
      },
      {
        order: 2,
        isActive: true,
        sourceType: HighlightSourceType.CUSTOM,
        titleOverride: 'Kentsel Dönüşüm Projeleri',
        subtitleOverride: 'Kocaeli genelinde yürütülen kentsel dönüşüm projelerimiz ile şehrin çehresini değiştiriyoruz.',
        imageUrl: '/images/highlights/kentsel-donusum.jpg',
        redirectUrl: '/projeler/kentsel-donusum'
      },
      {
        order: 3,
        isActive: true,
        sourceType: HighlightSourceType.CUSTOM,
        titleOverride: 'Sosyal Konut Uygulamaları',
        subtitleOverride: 'Dar gelirli vatandaşlarımız için uygun fiyatlı konut çözümleri sunuyoruz.',
        imageUrl: '/images/highlights/sosyal-konut.jpg',
        redirectUrl: '/hizmetlerimiz/sosyal-konut'
      },
      {
        order: 4,
        isActive: true,
        sourceType: HighlightSourceType.CUSTOM,
        titleOverride: 'Çevre Dostu Yapılar',
        subtitleOverride: 'Sürdürülebilir mimari anlayışı ile çevre dostu konut projeleri geliştiriyoruz.',
        imageUrl: '/images/highlights/cevre-dostu.jpg',
        redirectUrl: '/kurumsal/cevre-politikasi'
      }
    ];

    for (const highlight of highlights) {
      await prisma.highlight.upsert({
        where: { id: `highlight-${highlight.order}` },
        update: {
          order: highlight.order,
          isActive: highlight.isActive,
          sourceType: highlight.sourceType,
          titleOverride: highlight.titleOverride,
          subtitleOverride: highlight.subtitleOverride,
          imageUrl: highlight.imageUrl,
          redirectUrl: highlight.redirectUrl
        },
        create: {
          id: `highlight-${highlight.order}`,
          ...highlight
        }
      });
    }

    console.log('✅ Kurumsal veriler başarıyla eklendi');
    console.log(`📊 ${executives.length} yönetici`);
    console.log(`📊 ${departments.length} birim`);
    console.log(`📊 ${highlights.length} öne çıkan`);

  } catch (error) {
    console.error('❌ Kurumsal veri seed hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Node.js modül kontrolü
if (typeof require !== 'undefined' && require.main === module) {
  seedCorporateData()
    .then(() => {
      console.log('🎉 Kurumsal veri seed tamamlandı');
      if (typeof process !== 'undefined') {
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('💥 Kurumsal veri seed başarısız:', error);
      if (typeof process !== 'undefined') {
        process.exit(1);
      }
    });
}

export { seedCorporateData };
