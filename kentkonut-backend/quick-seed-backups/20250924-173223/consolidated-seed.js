const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Consolidated Seed Data Management System
 * This file contains all seed data for the KentKonut system
 * Safe to run multiple times (idempotent)
 */

async function seedUsers() {
  console.log('👤 Seeding users...');
  
  // Admin kullanıcısı
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        id: 'admin-user-1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123!', 10),
        role: 'ADMIN',
      }
    });
    console.log('✅ Admin user created');
  } else {
    console.log('⏭️  Admin user already exists');
  }

  return adminExists || await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });
}

async function seedHafriyatData() {
  console.log('🏗️ Seeding hafriyat data...');

  // Hafriyat Bölgeleri
  const hafriyatBolgeler = [
    {
      id: 'bolge-gebze',
      ad: 'Gebze Bölgesi',
      aciklama: 'Gebze ilçesi ve çevresindeki hafriyat sahalarını kapsayan bölge. İlçenin gelişen sanayi ve konut projelerine hizmet vermektedir.',
      yetkiliKisi: 'Şevki Uzun',
      yetkiliTelefon: '0533 453 8269'
    },
    {
      id: 'bolge-izmit',
      ad: 'İzmit Bölgesi',
      aciklama: 'İzmit ilçesi ve çevresindeki hafriyat sahalarını kapsayan bölge. Merkezi konumu ile büyük projelere hizmet vermektedir.',
      yetkiliKisi: 'Tahir Aslan',
      yetkiliTelefon: '0545 790 9577'
    },
    {
      id: 'bolge-korfez',
      ad: 'Körfez Bölgesi',
      aciklama: 'Körfez ilçesi ve çevresindeki hafriyat sahalarını kapsayan bölge. Deniz kenarındaki projeler için stratejik konumda bulunmaktadır.',
      yetkiliKisi: 'Serkan Küçük',
      yetkiliTelefon: '0541 723 2479'
    }
  ];

  for (const bolge of hafriyatBolgeler) {
    const existing = await prisma.hafriyatBolge.findUnique({
      where: { ad: bolge.ad }
    });

    if (!existing) {
      await prisma.hafriyatBolge.create({ data: bolge });
      console.log(`✅ Hafriyat bölgesi oluşturuldu: ${bolge.ad}`);
    } else {
      console.log(`⏭️  Hafriyat bölgesi zaten var: ${bolge.ad}`);
    }
  }

  // Hafriyat Sahaları
  const hafriyatSahalar = [
    {
      ad: 'Saha 1',
      konumAdi: 'Gebze Taşçıoğlu',
      enlem: 40.8023,
      boylam: 29.4313,
      durum: 'DEVAM_EDIYOR',
      ilerlemeyuzdesi: 85,
      tonBasiUcret: 12.50,
      kdvOrani: 20,
      bolgeId: 'bolge-gebze',
      aciklama: 'Gebze Taşçıoğlu mevkiinde bulunan ana hafriyat sahası.',
      baslangicTarihi: new Date('2024-01-15'),
      tahminibitisTarihi: new Date('2025-06-30'),
      tamamlananTon: 45000,
      toplamTon: 53000
    },
    {
      ad: 'Saha 2',
      konumAdi: 'Gebze Çayırova',
      enlem: 40.8156,
      boylam: 29.3789,
      durum: 'DEVAM_EDIYOR',
      ilerlemeyuzdesi: 60,
      tonBasiUcret: 11.75,
      kdvOrani: 20,
      bolgeId: 'bolge-gebze',
      aciklama: 'Çayırova sınırlarında bulunan orta ölçekli hafriyat sahası.',
      baslangicTarihi: new Date('2024-03-01'),
      tahminibitisTarihi: new Date('2025-08-15'),
      tamamlananTon: 18000,
      toplamTon: 30000
    },
    {
      ad: 'Saha 1',
      konumAdi: 'İzmit Merkez',
      enlem: 40.7648,
      boylam: 29.9208,
      durum: 'DEVAM_EDIYOR',
      ilerlemeyuzdesi: 45,
      tonBasiUcret: 13.25,
      kdvOrani: 20,
      bolgeId: 'bolge-izmit',
      aciklama: 'İzmit merkez bölgesinde bulunan stratejik konumdaki hafriyat sahası.',
      baslangicTarihi: new Date('2024-02-10'),
      tahminibitisTarihi: new Date('2025-12-20'),
      tamamlananTon: 22500,
      toplamTon: 50000
    },
    {
      ad: 'Saha 2',
      konumAdi: 'İzmit Yahyakaptan',
      enlem: 40.7891,
      boylam: 29.8945,
      durum: 'TAMAMLANDI',
      ilerlemeyuzdesi: 100,
      tonBasiUcret: 12.00,
      kdvOrani: 20,
      bolgeId: 'bolge-izmit',
      aciklama: 'Yahyakaptan mevkiinde tamamlanmış hafriyat sahası.',
      baslangicTarihi: new Date('2023-05-15'),
      tahminibitisTarihi: new Date('2024-11-30'),
      tamamlananTon: 35000,
      toplamTon: 35000
    },
    {
      ad: 'Saha 1',
      konumAdi: 'Körfez Taşlıçiftlik',
      enlem: 40.7234,
      boylam: 29.7856,
      durum: 'DEVAM_EDIYOR',
      ilerlemeyuzdesi: 70,
      tonBasiUcret: 14.00,
      kdvOrani: 20,
      bolgeId: 'bolge-korfez',
      aciklama: 'Taşlıçiftlik mevkiinde bulunan deniz kenarındaki hafriyat sahası.',
      baslangicTarihi: new Date('2024-01-20'),
      tahminibitisTarihi: new Date('2025-09-10'),
      tamamlananTon: 28000,
      toplamTon: 40000
    },
    {
      ad: 'Saha 2',
      konumAdi: 'Körfez Madeni',
      enlem: 40.7445,
      boylam: 29.8123,
      durum: 'DEVAM_EDIYOR',
      ilerlemeyuzdesi: 30,
      tonBasiUcret: 13.50,
      kdvOrani: 20,
      bolgeId: 'bolge-korfez',
      aciklama: 'Madeni mevkiinde yeni açılan hafriyat sahası.',
      baslangicTarihi: new Date('2024-04-05'),
      tahminibitisTarihi: new Date('2026-01-15'),
      tamamlananTon: 9000,
      toplamTon: 30000
    }
  ];

  for (const saha of hafriyatSahalar) {
    const existing = await prisma.hafriyatSaha.findFirst({
      where: {
        ad: saha.ad,
        bolgeId: saha.bolgeId
      }
    });

    if (!existing) {
      await prisma.hafriyatSaha.create({ data: saha });
      console.log(`✅ Hafriyat sahası oluşturuldu: ${saha.konumAdi} - ${saha.ad}`);
    } else {
      console.log(`⏭️  Hafriyat sahası zaten var: ${saha.konumAdi} - ${saha.ad}`);
    }
  }

  // Belge kategorileri
  const belgeKategorileri = [
    { ad: 'Çevre İzinleri', ikon: 'leaf', sira: 1 },
    { ad: 'İnşaat Ruhsatları', ikon: 'building', sira: 2 },
    { ad: 'Güvenlik Belgeleri', ikon: 'shield', sira: 3 },
    { ad: 'Teknik Raporlar', ikon: 'document-text', sira: 4 },
    { ad: 'Fotoğraflar', ikon: 'camera', sira: 5 }
  ];

  for (const kategori of belgeKategorileri) {
    const existing = await prisma.hafriyatBelgeKategori.findUnique({
      where: { ad: kategori.ad }
    });

    if (!existing) {
      await prisma.hafriyatBelgeKategori.create({ data: kategori });
      console.log(`✅ Belge kategorisi oluşturuldu: ${kategori.ad}`);
    } else {
      console.log(`⏭️  Belge kategorisi zaten var: ${kategori.ad}`);
    }
  }
}

async function seedNewsData(user) {
  console.log('📰 Seeding news data...');

  // Haber Kategorileri
  const newsCategories = [
    {
      name: 'Hafriyat Haberleri',
      slug: 'hafriyat-haberleri',
      description: 'Hafriyat sahalarıyla ilgili güncel haberler',
      order: 1
    },
    {
      name: 'Çevre ve Sürdürülebilirlik',
      slug: 'cevre-surdurulebilirlik',
      description: 'Çevre koruma ve sürdürülebilir kalkınma haberleri',
      order: 2
    },
    {
      name: 'Teknik Gelişmeler',
      slug: 'teknik-gelismeler',
      description: 'Teknik yenilikler ve gelişmeler',
      order: 3
    }
  ];

  for (const category of newsCategories) {
    const existing = await prisma.newsCategory.findUnique({
      where: { slug: category.slug }
    });

    if (!existing) {
      await prisma.newsCategory.create({ data: category });
      console.log(`✅ Haber kategorisi oluşturuldu: ${category.name}`);
    } else {
      console.log(`⏭️  Haber kategorisi zaten var: ${category.name}`);
    }
  }

  // Get category IDs dynamically
  const hafriyatCategory = await prisma.newsCategory.findFirst({
    where: { name: 'Hafriyat Haberleri' }
  });
  const cevreSurdurulebilirlikCategory = await prisma.newsCategory.findFirst({
    where: { name: 'Çevre ve Sürdürülebilirlik' }
  });
  const teknikGelisimlerCategory = await prisma.newsCategory.findFirst({
    where: { name: 'Teknik Gelişmeler' }
  });

  if (!hafriyatCategory || !cevreSurdurulebilirlikCategory || !teknikGelisimlerCategory) {
    throw new Error('News categories not found. Please ensure categories are created first.');
  }

  // Haberler
  const newsArticles = [
    {
      title: 'Gebze Bölgesi Yeni Hafriyat Sahası Açıldı',
      slug: 'gebze-bolgesi-yeni-hafriyat-sahasi-acildi',
      summary: 'Gebze bölgesinde çevre dostu teknolojilerle donatılmış yeni hafriyat sahası hizmete girdi.',
      content: 'Gebze bölgesinde modern teknoloji ve çevre dostu yaklaşımlarla tasarlanan yeni hafriyat sahası resmi olarak açıldı. Saha, günlük 500 ton kapasiteye sahip olup, çevre koruma standartlarına tam uyum sağlamaktadır. Yeni sahada kullanılan teknolojiler sayesinde gürültü seviyesi minimum düzeyde tutulurken, toz emisyonu da kontrol altına alınmıştır.',
      categoryId: hafriyatCategory.id,
      authorId: user.id,
      published: true,
      publishedAt: new Date('2024-12-01'),
      readingTime: 3
    },
    {
      title: 'Sürdürülebilir Hafriyat Yönetimi Projesi Başladı',
      slug: 'surdurulebilir-hafriyat-yonetimi-projesi-basladi',
      summary: 'Çevre dostu hafriyat teknikleri ve geri dönüşüm odaklı yeni proje hayata geçirildi.',
      content: 'Kent Konut Müdürlüğü tarafından başlatılan Sürdürülebilir Hafriyat Yönetimi Projesi kapsamında, hafriyat malzemelerinin %80\'inin geri dönüştürülmesi hedefleniyor. Proje, AB standartlarına uygun olarak tasarlanmış olup, 2025 yılı sonuna kadar tamamlanması planlanıyor.',
      categoryId: cevreSurdurulebilirlikCategory.id,
      authorId: user.id,
      published: true,
      publishedAt: new Date('2024-11-15'),
      readingTime: 4
    },
    {
      title: 'Dijital Hafriyat Takip Sistemi Devreye Girdi',
      slug: 'dijital-hafriyat-takip-sistemi-devreye-girdi',
      summary: 'Tüm hafriyat sahalarında GPS ve IoT teknolojileri kullanılarak gerçek zamanlı takip sistemi kuruldu.',
      content: 'Teknolojik altyapı yatırımları kapsamında geliştirilen Dijital Hafriyat Takip Sistemi, tüm sahalarda 7/24 izleme imkanı sunuyor. Sistem sayesinde hafriyat miktarları, araç hareketleri ve çevre parametreleri anlık olarak takip edilebiliyor. Bu teknoloji ile operasyonel verimlilik %30 artırıldı.',
      categoryId: teknikGelisimlerCategory.id,
      authorId: user.id,
      published: true,
      publishedAt: new Date('2024-10-20'),
      readingTime: 5
    },
    {
      title: 'Körfez Bölgesi Çevre Koruma Önlemleri Güçlendirildi',
      slug: 'korfez-bolgesi-cevre-koruma-onlemleri-guclendirildi',
      summary: 'Deniz ekosistemini korumak için Körfez bölgesinde ek çevre koruma tedbirleri alındı.',
      content: 'Körfez bölgesindeki hafriyat sahalarında deniz ekosistemini korumak amacıyla yeni çevre koruma önlemleri devreye alındı. Bu kapsamda su kalitesi sürekli izleniyor, sediment kontrolleri yapılıyor ve deniz canlıları için koruma alanları oluşturuluyor.',
      categoryId: cevreSurdurulebilirlikCategory.id,
      authorId: user.id,
      published: true,
      publishedAt: new Date('2024-09-10'),
      readingTime: 3
    },
    {
      title: 'İzmit Merkez Sahası Kapasite Artırımı Tamamlandı',
      slug: 'izmit-merkez-sahasi-kapasite-artirimi-tamamlandi',
      summary: 'İzmit merkez hafriyat sahasının kapasitesi %50 artırılarak günlük 750 ton seviyesine çıkarıldı.',
      content: 'İzmit merkez hafriyat sahasında gerçekleştirilen kapasite artırım çalışmaları başarıyla tamamlandı. Yeni ekipmanlar ve genişletilmiş çalışma alanı ile sahanın günlük kapasitesi 500 tondan 750 tona çıkarıldı. Bu artış, bölgedeki artan inşaat faaliyetlerine daha iyi hizmet verilmesini sağlayacak.',
      categoryId: hafriyatCategory.id,
      authorId: user.id,
      published: true,
      publishedAt: new Date('2024-08-25'),
      readingTime: 4
    }
  ];

  for (const article of newsArticles) {
    const existing = await prisma.news.findUnique({
      where: { slug: article.slug }
    });

    if (!existing) {
      await prisma.news.create({ data: article });
      console.log(`✅ Haber oluşturuldu: ${article.title}`);
    } else {
      console.log(`⏭️  Haber zaten var: ${article.title}`);
    }
  }
}

async function seedTagsData() {
  console.log('🏷️ Seeding tags data...');

  const tags = [
    { name: 'Kentsel Dönüşüm', slug: 'kentsel-donusum' },
    { name: 'Hafriyat', slug: 'hafriyat' },
    { name: 'Altyapı', slug: 'altyapi' },
    { name: 'Çevre Dostu', slug: 'cevre-dostu' },
    { name: 'Modern Teknoloji', slug: 'modern-teknoloji' },
    { name: 'Sürdürülebilirlik', slug: 'surdurulebilirlik' },
    { name: 'İnşaat', slug: 'insaat' },
    { name: 'Liman', slug: 'liman' },
    { name: 'Sahil', slug: 'sahil' },
    { name: 'Yol', slug: 'yol' },
    { name: 'Konut', slug: 'konut' },
    { name: 'Rekreasyon', slug: 'rekreasyon' }
  ];

  for (const tag of tags) {
    try {
      await prisma.tag.upsert({
        where: { slug: tag.slug },
        update: { name: tag.name },
        create: tag
      });
      console.log(`✅ Tag hazırlandı: ${tag.name}`);
    } catch (error) {
      console.log(`⚠️  Tag oluşturulurken hata: ${tag.name} - ${error.message}`);
    }
  }
}

async function seedMediaCategoriesData() {
  console.log('📁 Seeding media categories data...');

  const mediaCategories = [
    { name: 'Proje Görselleri', icon: 'image', order: 1, isBuiltIn: true },
    { name: 'Teknik Çizimler', icon: 'document', order: 2, isBuiltIn: true },
    { name: 'Havadan Görüntüler', icon: 'camera', order: 3, isBuiltIn: true },
    { name: 'İnşaat Aşamaları', icon: 'building', order: 4, isBuiltIn: true },
    { name: 'Çevre Fotoğrafları', icon: 'leaf', order: 5, isBuiltIn: true }
  ];

  for (const category of mediaCategories) {
    try {
      await prisma.mediaCategory.upsert({
        where: { name: category.name },
        update: { 
          icon: category.icon, 
          order: category.order, 
          isBuiltIn: category.isBuiltIn 
        },
        create: category
      });
      console.log(`✅ Media kategorisi hazırlandı: ${category.name}`);
    } catch (error) {
      console.log(`⚠️  Media kategorisi oluşturulurken hata: ${category.name} - ${error.message}`);
    }
  }
}

async function seedProjectsData(user) {
  console.log('🏗️ Seeding projects data...');

  const projects = [
    {
      title: 'Gebze Kentsel Dönüşüm Projesi',
      slug: 'gebze-kentsel-donusum-projesi',
      summary: 'Gebze ilçesinde 500 konutluk kentsel dönüşüm projesi.',
      content: 'Gebze ilçesi Cumhuriyet Mahallesi\'nde gerçekleştirilen kentsel dönüşüm projesi kapsamında 500 adet modern konut inşa edilmektedir. Proje, depreme dayanıklı yapılar ve yeşil alanlarla donatılmış sosyal tesisler içermektedir. Toplam 150.000 m² alan üzerinde gerçekleştirilen proje, 2025 yılı sonunda tamamlanacaktır.',
      status: 'ONGOING',
      latitude: 40.8023,
      longitude: 29.4313,
      locationName: 'Gebze Cumhuriyet Mahallesi',
      province: 'Kocaeli',
      district: 'Gebze',
      address: 'Cumhuriyet Mahallesi, Atatürk Caddesi No:45',
      authorId: user.id,
      published: true,
      publishedAt: new Date('2024-01-15'),
      readingTime: 5
    },
    {
      title: 'İzmit Sahil Düzenleme Projesi',
      slug: 'izmit-sahil-duzenleme-projesi',
      summary: 'İzmit sahil şeridinin modern rekreasyon alanına dönüştürülmesi.',
      content: 'İzmit sahil şeridinde 3 km uzunluğunda modern bir rekreasyon alanı oluşturulmaktadır. Proje kapsamında yürüyüş ve bisiklet yolları, çocuk oyun alanları, spor tesisleri ve sosyal alanlar inşa edilmektedir. Ayrıca mevcut yeşil alanlar genişletilmekte ve peyzaj düzenlemeleri yapılmaktadır.',
      status: 'ONGOING',
      latitude: 40.7648,
      longitude: 29.9208,
      locationName: 'İzmit Sahil Şeridi',
      province: 'Kocaeli',
      district: 'İzmit',
      address: 'Sahil Mahallesi, Atatürk Bulvarı',
      authorId: user.id,
      published: true,
      publishedAt: new Date('2024-03-01'),
      readingTime: 4
    },
    {
      title: 'Körfez Liman Genişletme Projesi',
      slug: 'korfez-liman-genisletme-projesi',
      summary: 'Körfez limanının kapasitesinin artırılması ve modernizasyonu.',
      content: 'Körfez ilçesindeki limanın kapasitesinin 2 katına çıkarılması amacıyla gerçekleştirilen genişletme projesi devam etmektedir. Yeni rıhtım inşaatı, konteyner sahaları ve lojistik merkezleri ile limanın yıllık kapasitesi 1 milyon TEU\'ya çıkarılacaktır.',
      status: 'ONGOING',
      latitude: 40.7234,
      longitude: 29.7856,
      locationName: 'Körfez Liman Bölgesi',
      province: 'Kocaeli',
      district: 'Körfez',
      address: 'Liman Mahallesi, Tersane Caddesi',
      authorId: user.id,
      published: true,
      publishedAt: new Date('2024-02-20'),
      readingTime: 6
    },
    {
      title: 'Kocaeli Çevre Yolu Projesi',
      slug: 'kocaeli-cevre-yolu-projesi',
      summary: 'Kocaeli ilini çevreleyen 45 km\'lik çevre yolu inşaatı.',
      content: 'Kocaeli ilinin trafik yoğunluğunu azaltmak amacıyla planlanan 45 km uzunluğundaki çevre yolu projesi tamamlandı. 4 şeritli otoyol standardında inşa edilen yol, şehir merkezindeki trafik yükünü %40 oranında azaltmıştır. Proje kapsamında 12 köprü, 8 alt geçit ve 15 üst geçit inşa edilmiştir.',
      status: 'COMPLETED',
      latitude: 40.8500,
      longitude: 29.8800,
      locationName: 'Kocaeli Çevre Yolu',
      province: 'Kocaeli',
      district: 'Merkez',
      address: 'Çevre Yolu Güzergahı',
      authorId: user.id,
      published: true,
      publishedAt: new Date('2023-06-15'),
      readingTime: 7
    }
  ];

  for (const project of projects) {
    const existing = await prisma.project.findUnique({
      where: { slug: project.slug }
    });

    if (!existing) {
      await prisma.project.create({ data: project });
      console.log(`✅ Proje oluşturuldu: ${project.title}`);
    } else {
      console.log(`⏭️  Proje zaten var: ${project.title}`);
    }
  }
}

async function seedProjectTagsData() {
  console.log('🏷️ Seeding project tags relationships...');

  // Get all projects and tags
  const projects = await prisma.project.findMany();
  const tags = await prisma.tag.findMany();

  if (projects.length === 0 || tags.length === 0) {
    console.log('⏭️  No projects or tags found, skipping project tags seeding');
    return;
  }

  // Define project-tag relationships
  const projectTagMappings = {
    'gebze-kentsel-donusum-projesi': ['kentsel-donusum', 'konut', 'cevre-dostu'],
    'izmit-sahil-duzenleme-projesi': ['sahil', 'rekreasyon', 'cevre-dostu'],
    'korfez-liman-genisletme-projesi': ['liman', 'altyapi', 'modern-teknoloji'],
    'kocaeli-cevre-yolu-projesi': ['yol', 'altyapi', 'insaat']
  };

  for (const project of projects) {
    const tagSlugs = projectTagMappings[project.slug] || [];
    
    for (const tagSlug of tagSlugs) {
      const tag = tags.find(t => t.slug === tagSlug);
      if (tag) {
        const existing = await prisma.projectTag.findFirst({
          where: {
            projectId: project.id,
            tagId: tag.id
          }
        });

        if (!existing) {
          await prisma.projectTag.create({
            data: {
              projectId: project.id,
              tagId: tag.id
            }
          });
          console.log(`✅ Proje-tag ilişkisi oluşturuldu: ${project.title} - ${tag.name}`);
        }
      }
    }
  }
}

async function seedProjectRelationsData() {
  console.log('🔗 Seeding project relations...');

  const projects = await prisma.project.findMany();
  
  if (projects.length < 2) {
    console.log('⏭️  Not enough projects for relations, skipping');
    return;
  }

  // Define project relationships
  const relations = [
    {
      projectSlug: 'gebze-kentsel-donusum-projesi',
      relatedSlug: 'izmit-sahil-duzenleme-projesi'
    },
    {
      projectSlug: 'korfez-liman-genisletme-projesi',
      relatedSlug: 'kocaeli-cevre-yolu-projesi'
    }
  ];

  for (const relation of relations) {
    const project = projects.find(p => p.slug === relation.projectSlug);
    const relatedProject = projects.find(p => p.slug === relation.relatedSlug);

    if (project && relatedProject) {
      const existing = await prisma.projectRelation.findFirst({
        where: {
          projectId: project.id,
          relatedProjectId: relatedProject.id
        }
      });

      if (!existing) {
        await prisma.projectRelation.create({
          data: {
            projectId: project.id,
            relatedProjectId: relatedProject.id
          }
        });
        console.log(`✅ Proje ilişkisi oluşturuldu: ${project.title} ↔ ${relatedProject.title}`);
      }
    }
  }
}

async function seedProjectGalleriesData() {
  console.log('🖼️ Seeding project galleries...');

  const projects = await prisma.project.findMany();
  
  if (projects.length === 0) {
    console.log('⏭️  No projects found, skipping galleries');
    return;
  }

  for (const project of projects) {
    // Create main gallery for each project
    const existingGallery = await prisma.projectGallery.findFirst({
      where: {
        projectId: project.id,
        parentId: null
      }
    });

    if (!existingGallery) {
      const gallery = await prisma.projectGallery.create({
        data: {
          projectId: project.id,
          title: `${project.title} - Ana Galeri`,
          description: `${project.title} projesine ait görseller ve dokümanlar`,
          order: 0,
          isActive: true
        }
      });

      console.log(`✅ Proje galerisi oluşturuldu: ${project.title}`);

      // Create sub-galleries
      const subGalleries = [
        {
          title: 'İnşaat Aşamaları',
          description: 'Projenin inşaat sürecindeki görseller',
          order: 1
        },
        {
          title: 'Teknik Çizimler',
          description: 'Proje teknik çizimleri ve planları',
          order: 2
        },
        {
          title: 'Çevre Görselleri',
          description: 'Proje çevresindeki görseller',
          order: 3
        }
      ];

      for (const subGallery of subGalleries) {
        await prisma.projectGallery.create({
          data: {
            projectId: project.id,
            parentId: gallery.id,
            title: subGallery.title,
            description: subGallery.description,
            order: subGallery.order,
            isActive: true
          }
        });
        console.log(`✅ Alt galeri oluşturuldu: ${project.title} - ${subGallery.title}`);
      }
    }
  }
}

async function seedQuickAccessLinksData() {
  console.log('⚡ Seeding quick access links...');

  const projects = await prisma.project.findMany();
  
  if (projects.length === 0) {
    console.log('⏭️  No projects found, skipping quick access links');
    return;
  }

  const quickAccessLinks = [
    {
      title: 'Proje Detayları',
      url: '/projeler',
      icon: 'building',
      moduleType: 'project',
      sortOrder: 1
    },
    {
      title: 'Hafriyat Sahaları',
      url: '/hafriyat',
      icon: 'truck',
      moduleType: 'hafriyat',
      sortOrder: 2
    },
    {
      title: 'Haberler',
      url: '/haberler',
      icon: 'newspaper',
      moduleType: 'news',
      sortOrder: 3
    },
    {
      title: 'Kurumsal',
      url: '/kurumsal',
      icon: 'office-building',
      moduleType: 'corporate',
      sortOrder: 4
    }
  ];

  for (const link of quickAccessLinks) {
    const existing = await prisma.quickAccessLink.findFirst({
      where: {
        title: link.title,
        moduleType: link.moduleType
      }
    });

    if (!existing) {
      await prisma.quickAccessLink.create({
        data: {
          ...link,
          isActive: true
        }
      });
      console.log(`✅ Hızlı erişim linki oluşturuldu: ${link.title}`);
    } else {
      console.log(`⏭️  Hızlı erişim linki zaten var: ${link.title}`);
    }
  }

  // Add project-specific quick access links
  for (const project of projects.slice(0, 2)) { // Only for first 2 projects
    const existing = await prisma.quickAccessLink.findFirst({
      where: {
        projectId: project.id,
        title: `${project.title} - Detaylar`
      }
    });

    if (!existing) {
      await prisma.quickAccessLink.create({
        data: {
          title: `${project.title} - Detaylar`,
          url: `/projeler/${project.slug}`,
          icon: 'eye',
          moduleType: 'project',
          projectId: project.id,
          sortOrder: 10,
          isActive: true
        }
      });
      console.log(`✅ Proje hızlı erişim linki oluşturuldu: ${project.title}`);
    }
  }
}

async function seedCommentsData(user) {
  console.log('💬 Seeding comments data...');

  const projects = await prisma.project.findMany();
  
  if (projects.length === 0) {
    console.log('⏭️  No projects found, skipping comments');
    return;
  }

  const comments = [
    {
      content: 'Bu proje gerçekten çok etkileyici! Çevre dostu yaklaşımı takdire şayan.',
      projectId: projects[0]?.id,
      approved: true
    },
    {
      content: 'İnşaat kalitesi ve güvenlik önlemleri çok iyi görünüyor.',
      projectId: projects[0]?.id,
      approved: true
    },
    {
      content: 'Projenin tamamlanma tarihi hakkında daha detaylı bilgi alabilir miyiz?',
      projectId: projects[1]?.id,
      approved: false
    },
    {
      content: 'Sahil düzenleme projesi şehrimize çok değer katacak.',
      projectId: projects[1]?.id,
      approved: true
    }
  ];

  for (const comment of comments) {
    if (comment.projectId) {
      const existing = await prisma.comment.findFirst({
        where: {
          content: comment.content,
          projectId: comment.projectId,
          userId: user.id
        }
      });

      if (!existing) {
        await prisma.comment.create({
          data: {
            ...comment,
            userId: user.id
          }
        });
        console.log(`✅ Yorum oluşturuldu: ${comment.content.substring(0, 50)}...`);
      }
    }
  }
}

async function seedDepartmentsData() {
  console.log('🏢 Seeding departments data...');

  const departments = [
    {
      name: 'Hafriyat Yönetimi Birimi',
      imageUrl: '/media/kurumsal/birimler/hafriyat-yonetimi.jpg',
      services: [
        'Hafriyat sahalarının planlanması ve yönetimi',
        'Hafriyat izin ve ruhsat işlemleri',
        'Saha güvenliği ve denetimi',
        'Hafriyat malzemesi kalite kontrolü',
        'Çevre koruma önlemleri'
      ],
      order: 1,
      content: 'Hafriyat Yönetimi Birimi, şehrimizin hafriyat ihtiyaçlarını karşılamak üzere kurulmuş uzman bir birimdir. Modern teknoloji ve çevre dostu yaklaşımlarla hafriyat sahalarını yönetir.',
      slug: 'hafriyat-yonetimi-birimi'
    },
    {
      name: 'Teknik İşler Birimi',
      imageUrl: '/media/kurumsal/birimler/teknik-isler.jpg',
      services: [
        'Teknik proje hazırlama ve onaylama',
        'İnşaat denetimi ve kontrolü',
        'Altyapı planlama ve koordinasyon',
        'Jeoteknik araştırmalar',
        'Yapı denetim hizmetleri'
      ],
      order: 2,
      content: 'Teknik İşler Birimi, tüm teknik projelerin planlanması, uygulanması ve denetlenmesinden sorumludur. Uzman mühendis kadrosuyla kaliteli hizmet sunar.',
      slug: 'teknik-isler-birimi'
    },
    {
      name: 'Çevre ve Sürdürülebilirlik Birimi',
      imageUrl: '/media/kurumsal/birimler/cevre-surdurulebilirlik.jpg',
      services: [
        'Çevre etki değerlendirmesi',
        'Sürdürülebilirlik raporları',
        'Çevre koruma önlemleri',
        'Yeşil teknoloji uygulamaları',
        'Ekolojik denge korunması'
      ],
      order: 3,
      content: 'Çevre ve Sürdürülebilirlik Birimi, tüm faaliyetlerin çevre dostu şekilde yürütülmesini sağlar. Gelecek nesillere yaşanabilir bir çevre bırakma misyonuyla çalışır.',
      slug: 'cevre-surdurulebilirlik-birimi'
    },
    {
      name: 'Mali İşler Birimi',
      imageUrl: '/media/kurumsal/birimler/mali-isler.jpg',
      services: [
        'Bütçe planlama ve takibi',
        'Mali denetim ve kontrol',
        'Muhasebe ve raporlama',
        'Satın alma işlemleri',
        'Mali analiz ve değerlendirme'
      ],
      order: 4,
      content: 'Mali İşler Birimi, kurumun mali kaynaklarının etkin ve verimli kullanılmasını sağlar. Şeffaf mali yönetim anlayışıyla hizmet verir.',
      slug: 'mali-isler-birimi'
    },
    {
      name: 'İnsan Kaynakları Birimi',
      imageUrl: '/media/kurumsal/birimler/insan-kaynaklari.jpg',
      services: [
        'Personel işe alım süreçleri',
        'Eğitim ve gelişim programları',
        'Performans yönetimi',
        'Özlük işleri',
        'İş sağlığı ve güvenliği'
      ],
      order: 5,
      content: 'İnsan Kaynakları Birimi, kurumun en değerli varlığı olan insan kaynağının gelişimi ve yönetiminden sorumludur. Çalışan memnuniyeti odaklı politikalar uygular.',
      slug: 'insan-kaynaklari-birimi'
    }
  ];

  for (const department of departments) {
    const existing = await prisma.department.findUnique({
      where: { slug: department.slug }
    });

    if (!existing) {
      await prisma.department.create({ data: department });
      console.log(`✅ Birim oluşturuldu: ${department.name}`);
    } else {
      console.log(`⏭️  Birim zaten var: ${department.name}`);
    }
  }
}

async function seedExecutivesData() {
  console.log('👔 Seeding executives data...');

  const executives = [
    {
      name: 'Dr. Mehmet Özkan',
      title: 'Genel Müdür',
      biography: 'İnşaat mühendisliği alanında 25 yıllık deneyime sahip Dr. Mehmet Özkan, kentsel dönüşüm ve hafriyat yönetimi konularında uzman. İstanbul Teknik Üniversitesi İnşaat Mühendisliği bölümünden mezun, doktora derecesini kentsel planlama alanında almıştır.',
      imageUrl: '/media/kurumsal/yonetim/mehmet-ozkan.jpg',
      email: 'mehmet.ozkan@kentkonut.gov.tr',
      phone: '0262 317 1000',
      linkedIn: 'https://linkedin.com/in/mehmet-ozkan',
      order: 1,
      slug: 'mehmet-ozkan'
    },
    {
      name: 'Mimar Ayşe Demir',
      title: 'Genel Müdür Yardımcısı',
      biography: 'Mimar Ayşe Demir, şehir plancılığı ve mimarlık alanında 20 yıllık deneyime sahiptir. Mimar Sinan Güzel Sanatlar Üniversitesi Mimarlık Fakültesi mezunu. Kentsel tasarım ve sürdürülebilir kalkınma projelerinde öncü çalışmalar yapmıştır.',
      imageUrl: '/media/kurumsal/yonetim/ayse-demir.jpg',
      email: 'ayse.demir@kentkonut.gov.tr',
      phone: '0262 317 1001',
      linkedIn: 'https://linkedin.com/in/ayse-demir',
      order: 2,
      slug: 'ayse-demir'
    },
    {
      name: 'İnş. Müh. Hasan Kaya',
      title: 'Teknik İşler Müdürü',
      biography: 'İnşaat Mühendisi Hasan Kaya, hafriyat ve altyapı projeleri konusunda 18 yıllık deneyime sahiptir. Yıldız Teknik Üniversitesi İnşaat Mühendisliği bölümü mezunu. Büyük ölçekli hafriyat projelerinin yönetiminde uzmanlaşmıştır.',
      imageUrl: '/media/kurumsal/yonetim/hasan-kaya.jpg',
      email: 'hasan.kaya@kentkonut.gov.tr',
      phone: '0262 317 1002',
      order: 3,
      slug: 'hasan-kaya'
    }
  ];

  for (const executive of executives) {
    const existing = await prisma.executive.findUnique({
      where: { slug: executive.slug }
    });

    if (!existing) {
      await prisma.executive.create({ data: executive });
      console.log(`✅ Yönetici oluşturuldu: ${executive.name}`);
    } else {
      console.log(`⏭️  Yönetici zaten var: ${executive.name}`);
    }
  }
}

async function seedPersonnelData() {
  console.log('👥 Seeding personnel data...');

  const personnel = [
    {
      name: 'İnş. Müh. Selim Özdemir',
      title: 'Hafriyat Yönetimi Birim Müdürü',
      content: 'Hafriyat yönetimi alanında 18 yıllık deneyime sahip uzman mühendis. Kocaeli Üniversitesi İnşaat Mühendisliği bölümü mezunu. Çevre dostu hafriyat teknikleri konusunda sertifikalı.',
      phone: '0262 317 2001',
      email: 'selim.ozdemir@kentkonut.gov.tr',
      imageUrl: '/media/kurumsal/personel/selim-ozdemir.jpg',
      slug: 'selim-ozdemir-birim-muduru',
      order: 1,
      type: 'DIRECTOR'
    },
    {
      name: 'Maden Müh. Fatma Yılmaz',
      title: 'Teknik İşler Birim Müdürü',
      content: 'Maden mühendisliği ve jeoteknik alanında uzman. İstanbul Teknik Üniversitesi Maden Mühendisliği bölümü mezunu. Zemin mekaniği ve kaya mekaniği konularında 15 yıllık deneyim.',
      phone: '0262 317 2002',
      email: 'fatma.yilmaz@kentkonut.gov.tr',
      imageUrl: '/media/kurumsal/personel/fatma-yilmaz.jpg',
      slug: 'fatma-yilmaz-birim-muduru',
      order: 2,
      type: 'DIRECTOR'
    },
    {
      name: 'Çevre Müh. Ahmet Şen',
      title: 'Çevre ve Sürdürülebilirlik Birim Müdürü',
      content: 'Çevre koruma ve sürdürülebilir kalkınma uzmanı. Boğaziçi Üniversitesi Çevre Mühendisliği bölümü mezunu. Çevre etki değerlendirmesi ve ISO 14001 konularında sertifikalı.',
      phone: '0262 317 2003',
      email: 'ahmet.sen@kentkonut.gov.tr',
      imageUrl: '/media/kurumsal/personel/ahmet-sen.jpg',
      slug: 'ahmet-sen-birim-muduru',
      order: 3,
      type: 'DIRECTOR'
    },
    {
      name: 'Mali Müşavir Zeynep Kaya',
      title: 'Mali İşler Birim Müdürü',
      content: 'Kamu mali yönetimi alanında 20 yıllık deneyime sahip mali müşavir. Marmara Üniversitesi İktisat Fakültesi mezunu. Kamu ihale mevzuatı ve mali denetim konularında uzman.',
      phone: '0262 317 2004',
      email: 'zeynep.kaya@kentkonut.gov.tr',
      imageUrl: '/media/kurumsal/personel/zeynep-kaya.jpg',
      slug: 'zeynep-kaya-birim-muduru',
      order: 4,
      type: 'DIRECTOR'
    },
    {
      name: 'İnsan Kaynakları Uzmanı Mehmet Demir',
      title: 'İnsan Kaynakları Birim Müdürü',
      content: 'İnsan kaynakları yönetimi alanında 12 yıllık deneyime sahip uzman. Anadolu Üniversitesi İşletme bölümü mezunu. Performans yönetimi ve eğitim programları geliştirme konularında sertifikalı.',
      phone: '0262 317 2005',
      email: 'mehmet.demir@kentkonut.gov.tr',
      imageUrl: '/media/kurumsal/personel/mehmet-demir.jpg',
      slug: 'mehmet-demir-birim-muduru',
      order: 5,
      type: 'DIRECTOR'
    },
    {
      name: 'Jeolog Ayşe Özkan',
      title: 'Jeoteknik Şefi',
      content: 'Jeoloji mühendisliği alanında 10 yıllık deneyime sahip uzman. Hacettepe Üniversitesi Jeoloji Mühendisliği bölümü mezunu. Zemin araştırmaları ve jeoteknik raporlama konularında uzman.',
      phone: '0262 317 3001',
      email: 'ayse.ozkan@kentkonut.gov.tr',
      imageUrl: '/media/kurumsal/personel/ayse-ozkan.jpg',
      slug: 'ayse-ozkan-jeoteknik-sefi',
      order: 6,
      type: 'CHIEF'
    },
    {
      name: 'Güvenlik Uzmanı Mustafa Yıldız',
      title: 'İş Güvenliği Şefi',
      content: 'İş sağlığı ve güvenliği alanında 8 yıllık deneyime sahip uzman. İş Güvenliği Uzmanlığı sertifikası ve A sınıfı İSG uzmanı. Hafriyat sahalarında güvenlik yönetimi konusunda deneyimli.',
      phone: '0262 317 3002',
      email: 'mustafa.yildiz@kentkonut.gov.tr',
      imageUrl: '/media/kurumsal/personel/mustafa-yildiz.jpg',
      slug: 'mustafa-yildiz-is-guvenligi-sefi',
      order: 7,
      type: 'CHIEF'
    }
  ];

  for (const person of personnel) {
    const existing = await prisma.personnel.findUnique({
      where: { slug: person.slug }
    });

    if (!existing) {
      await prisma.personnel.create({ data: person });
      console.log(`✅ Personel oluşturuldu: ${person.name}`);
    } else {
      console.log(`⏭️  Personel zaten var: ${person.name}`);
    }
  }
}

async function getDatabaseStatus() {
  console.log('📊 Checking database status...');

  const status = {
    users: await prisma.user.count(),
    hafriyatBolgeler: await prisma.hafriyatBolge.count(),
    hafriyatSahalar: await prisma.hafriyatSaha.count(),
    hafriyatBelgeKategorileri: await prisma.hafriyatBelgeKategori.count(),
    newsCategories: await prisma.newsCategory.count(),
    news: await prisma.news.count(),
    projects: await prisma.project.count(),
    departments: await prisma.department.count(),
    executives: await prisma.executive.count(),
    personnel: await prisma.personnel.count(),
    tags: await prisma.tag.count(),
    projectTags: await prisma.projectTag.count(),
    projectRelations: await prisma.projectRelation.count(),
    projectGalleries: await prisma.projectGallery.count(),
    projectGalleryMedia: await prisma.projectGalleryMedia.count(),
    mediaCategories: await prisma.mediaCategory.count(),
    quickAccessLinks: await prisma.quickAccessLink.count(),
    comments: await prisma.comment.count(),
    menuItems: await prisma.menuItem.count()
  };

  console.log('📈 Current database status:');
  console.log(`   👤 Users: ${status.users}`);
  console.log(`   🏗️ Hafriyat Bölgeleri: ${status.hafriyatBolgeler}`);
  console.log(`   ⛏️ Hafriyat Sahaları: ${status.hafriyatSahalar}`);
  console.log(`   📁 Belge Kategorileri: ${status.hafriyatBelgeKategorileri}`);
  console.log(`   📂 Haber Kategorileri: ${status.newsCategories}`);
  console.log(`   📰 Haberler: ${status.news}`);
  console.log(`   🏢 Projeler: ${status.projects}`);
  console.log(`   🏛️ Birimler: ${status.departments}`);
  console.log(`   👔 Yöneticiler: ${status.executives}`);
  console.log(`   👥 Personeller: ${status.personnel}`);
  console.log(`   🏷️ Tags: ${status.tags}`);
  console.log(`   🔗 Proje-Tag İlişkileri: ${status.projectTags}`);
  console.log(`   🔗 Proje İlişkileri: ${status.projectRelations}`);
  console.log(`   🖼️ Proje Galerileri: ${status.projectGalleries}`);
  console.log(`   📸 Galeri Medyaları: ${status.projectGalleryMedia}`);
  console.log(`   📁 Media Kategorileri: ${status.mediaCategories}`);
  console.log(`   ⚡ Hızlı Erişim Linkleri: ${status.quickAccessLinks}`);
  console.log(`   💬 Yorumlar: ${status.comments}`);
  console.log(`   📑 Menü Öğeleri: ${status.menuItems}`);

  return status;
}

/**
 * Admin user only seed function - for container startup
 * This function only creates the admin user account
 */
async function seedAdminUserOnly() {
  console.log('👤 Starting admin user seed...');
  console.log('📅 Timestamp:', new Date().toISOString());

  try {
    // Only create admin user
    const user = await seedUsers();

    console.log('✅ Admin user seed completed successfully!');
    console.log('📅 Completed at:', new Date().toISOString());

    return {
      success: true,
      user,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error during admin user seeding:', error);
    throw error;
  }
}

async function seedMenuItemsData() {
  console.log('📑 Seeding menu items...');
  try {
    // Clear existing menu items
    await prisma.menuItem.deleteMany({});
    console.log('🗑️ Existing menu items cleared');

    // Main menu items
    const menuItems = [
      {
        id: 'menu-anasayfa',
        title: 'ANASAYFA',
        url: '/',
        orderIndex: 1,
        menuLocation: 'main',
        isActive: true,
      },
      {
        id: 'menu-hakkimizda',
        title: 'HAKKIMIZDA',
        url: '/hakkimizda',
        orderIndex: 2,
        menuLocation: 'main',
        isActive: true,
      },
      {
        id: 'menu-kurumsal',
        title: 'KURUMSAL',
        url: '/kurumsal',
        orderIndex: 3,
        menuLocation: 'main',
        isActive: true,
      },
      {
        id: 'menu-projeler',
        title: 'PROJELERİMİZ',
        url: '/projeler',
        orderIndex: 4,
        menuLocation: 'main',
        isActive: true,
      },
      {
        id: 'menu-hafriyat',
        title: 'HAFRİYAT',
        url: '/hafriyat',
        orderIndex: 5,
        menuLocation: 'main',
        isActive: true,
      },
      {
        id: 'menu-iletisim',
        title: 'BİZE ULAŞIN',
        url: '/bize-ulasin',
        orderIndex: 6,
        menuLocation: 'main',
        isActive: true,
      },
    ];

    for (const item of menuItems) {
      await prisma.menuItem.create({ data: item });
      console.log(`✅ Created menu item: ${item.title}`);
    }

    // Sub menu items for Kurumsal
    const subMenuItems = [
      {
        id: 'menu-kurumsal-hakkimizda',
        title: 'Hakkımızda',
        url: '/kurumsal/hakkimizda',
        orderIndex: 1,
        menuLocation: 'main',
        parentId: 'menu-kurumsal',
        isActive: true,
      },
      {
        id: 'menu-kurumsal-vizyon',
        title: 'Vizyon & Misyon',
        url: '/kurumsal/vizyon-misyon',
        orderIndex: 2,
        menuLocation: 'main',
        parentId: 'menu-kurumsal',
        isActive: true,
      },
      {
        id: 'menu-kurumsal-yonetim',
        title: 'Yönetim',
        url: '/kurumsal/yonetim',
        orderIndex: 3,
        menuLocation: 'main',
        parentId: 'menu-kurumsal',
        isActive: true,
      },
    ];

    for (const item of subMenuItems) {
      await prisma.menuItem.create({ data: item });
      console.log(`✅ Created sub menu item: ${item.title}`);
    }

    console.log('🎉 Menu items seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding menu items:', error);
    throw error;
  }
}

/**
 * Application data seed function - for manual execution via admin panel
 * This function seeds all application data except admin user
 */
async function seedApplicationData() {
  console.log('🌱 Starting application data seed...');
  console.log('📅 Timestamp:', new Date().toISOString());

  try {
    // Get initial database status
    const initialStatus = await getDatabaseStatus();

    // Get admin user (should already exist)
    const user = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!user) {
      throw new Error('Admin user not found. Please ensure admin user is created first.');
    }

    // Run all application data seed operations
    await seedHafriyatData();
    await seedNewsData(user);
    await seedTagsData();
    await seedMediaCategoriesData();
    await seedProjectsData(user);
    await seedProjectTagsData();
    await seedProjectRelationsData();
    await seedProjectGalleriesData();
    await seedQuickAccessLinksData();
    await seedCommentsData(user);
    await seedDepartmentsData();
    await seedExecutivesData();
    await seedPersonnelData();

    // Get final database status
    console.log('\n🎯 Application data seed operations completed!');
    const finalStatus = await getDatabaseStatus();

    // Log summary
    console.log('\n📊 Summary of changes:');
    Object.keys(finalStatus).forEach(key => {
      const initial = initialStatus[key];
      const final = finalStatus[key];
      const change = final - initial;
      if (change > 0) {
        console.log(`   ✅ ${key}: ${initial} → ${final} (+${change})`);
      } else {
        console.log(`   ⏭️  ${key}: ${final} (no change)`);
      }
    });

    console.log('\n🎉 Application data seed completed successfully!');
    console.log('📅 Completed at:', new Date().toISOString());

    return {
      success: true,
      initialStatus,
      finalStatus,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error during application data seeding:', error);
    throw error;
  }
}

/**
 * Main seed function - Consolidates all seed operations (for backward compatibility)
 * This function is idempotent and safe to run multiple times
 */
async function main() {
  console.log('🌱 Starting consolidated database seed...');
  console.log('📅 Timestamp:', new Date().toISOString());

  try {
    // Get initial database status
    const initialStatus = await getDatabaseStatus();

    // Run all seed operations
    const user = await seedUsers();
    await seedHafriyatData();
    await seedNewsData(user);
    await seedTagsData();
    await seedMediaCategoriesData();
    await seedProjectsData(user);
    await seedProjectTagsData();
    await seedProjectRelationsData();
    await seedProjectGalleriesData();
    await seedQuickAccessLinksData();
    await seedCommentsData(user);
    await seedDepartmentsData();
    await seedExecutivesData();
    await seedPersonnelData();
    await seedMenuItemsData();

    // Get final database status
    console.log('\n🎯 Seed operations completed!');
    const finalStatus = await getDatabaseStatus();

    // Log summary
    console.log('\n📊 Summary of changes:');
    Object.keys(finalStatus).forEach(key => {
      const initial = initialStatus[key];
      const final = finalStatus[key];
      const change = final - initial;
      if (change > 0) {
        console.log(`   ✅ ${key}: ${initial} → ${final} (+${change})`);
      } else {
        console.log(`   ⏭️  ${key}: ${final} (no change)`);
      }
    });

    console.log('\n🎉 Consolidated database seed completed successfully!');
    console.log('📅 Completed at:', new Date().toISOString());

    return {
      success: true,
      initialStatus,
      finalStatus,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error during consolidated seeding:', error);
    throw error;
  }
}

/**
 * Seed verilerini JSON formatında export eder
 * Bu fonksiyon mevcut seed verilerini yedeklemek için kullanılır
 */
async function exportSeedData() {
  console.log('📤 Exporting seed data...');
  
  try {
    const status = await getDatabaseStatus();
    
    // Tüm tabloları JSON formatında export et
    const exportData = {
      timestamp: new Date().toISOString(),
      databaseStatus: status,
      tables: {}
    };

    // Her tablodan verileri al
    const tables = [
      'user', 'hafriyatBolge', 'hafriyatSaha', 'hafriyatBelgeKategori',
      'newsCategory', 'news', 'project', 'department', 'executive', 
      'personnel', 'tag', 'projectTag', 'projectRelation', 'projectGallery',
      'projectGalleryMedia', 'mediaCategory', 'quickAccessLink', 'comment', 'menuItem'
    ];

    for (const table of tables) {
      try {
        const data = await prisma[table].findMany();
        exportData.tables[table] = data;
        console.log(`✅ ${table}: ${data.length} records exported`);
      } catch (error) {
        console.log(`⚠️ ${table}: Export failed - ${error.message}`);
        exportData.tables[table] = [];
      }
    }

    return exportData;
  } catch (error) {
    console.error('❌ Error exporting seed data:', error);
    throw error;
  }
}

/**
 * JSON formatındaki seed verilerini veritabanına import eder
 * Bu fonksiyon yedeklenen verileri geri yüklemek için kullanılır
 */
async function importSeedData(exportData) {
  console.log('📥 Importing seed data...');
  
  try {
    // Veritabanını temizle
    console.log('🗑️ Clearing existing data...');
    
    // Foreign key constraint'leri geçici olarak devre dışı bırak
    await prisma.$executeRaw`SET session_replication_role = replica;`;
    
    // Tüm tabloları temizle (sıralı olarak)
    const clearOrder = [
      'comment', 'projectTag', 'projectRelation', 'projectGalleryMedia', 
      'projectGallery', 'quickAccessLink', 'menuItem', 'newsTag', 'newsRelation',
      'news', 'project', 'hafriyatBelge', 'hafriyatSaha', 'hafriyatBolge',
      'hafriyatBelgeKategori', 'newsCategory', 'tag', 'mediaCategory',
      'department', 'executive', 'personnel', 'user'
    ];

    for (const table of clearOrder) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
        console.log(`✅ ${table} cleared`);
      } catch (error) {
        console.log(`⚠️ ${table}: Clear failed - ${error.message}`);
      }
    }

    // Foreign key constraint'leri tekrar aktif et
    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;

    // Verileri import et
    console.log('📥 Importing data...');
    
    const importOrder = [
      'user', 'mediaCategory', 'tag', 'newsCategory', 'hafriyatBelgeKategori',
      'hafriyatBolge', 'hafriyatSaha', 'news', 'project', 'department', 
      'executive', 'personnel', 'projectTag', 'projectRelation', 'projectGallery',
      'projectGalleryMedia', 'quickAccessLink', 'comment', 'menuItem'
    ];

    for (const table of importOrder) {
      if (exportData.tables[table] && exportData.tables[table].length > 0) {
        try {
          await prisma[table].createMany({
            data: exportData.tables[table],
            skipDuplicates: true
          });
          console.log(`✅ ${table}: ${exportData.tables[table].length} records imported`);
        } catch (error) {
          console.log(`⚠️ ${table}: Import failed - ${error.message}`);
        }
      }
    }

    console.log('🎉 Seed data import completed!');
    return true;
  } catch (error) {
    console.error('❌ Error importing seed data:', error);
    throw error;
  }
}

/**
 * Seed verilerini dosyaya kaydeder
 */
async function saveSeedDataToFile(filename = null) {
  if (!filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    filename = `seed-backup-${timestamp}.json`;
  }

  try {
    const exportData = await exportSeedData();
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(__dirname, '..', 'backups', filename);
    
    // Backups dizinini oluştur
    const backupsDir = path.dirname(filePath);
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(exportData, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));
    console.log(`💾 Seed data saved to: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('❌ Error saving seed data:', error);
    throw error;
  }
}

/**
 * Dosyadan seed verilerini yükler
 */
async function loadSeedDataFromFile(filename) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(__dirname, '..', 'backups', filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const exportData = JSON.parse(fileContent);
    
    await importSeedData(exportData);
    console.log(`📂 Seed data loaded from: ${filePath}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error loading seed data:', error);
    throw error;
  }
}

// Export for API usage
module.exports = {
  main,
  seedAdminUserOnly,
  seedApplicationData,
  getDatabaseStatus,
  exportSeedData,
  importSeedData,
  saveSeedDataToFile,
  loadSeedDataFromFile
};

// Run if called directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Fatal error during seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
