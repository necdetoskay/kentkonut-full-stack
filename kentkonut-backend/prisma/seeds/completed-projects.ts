import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate SEO-friendly slug
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

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export async function seedCompletedProjects() {
  console.log('🏗️ Seeding completed projects...');

  // Get or create a user for authoring projects
  let author = await prisma.user.findFirst();
  if (!author) {
    console.log('⚠️ No user found, creating seed user for projects...');
    author = await prisma.user.create({
      data: {
        id: 'project-seed-user',
        name: 'Proje Yöneticisi',
        email: 'proje@kentkonut.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
      }
    });
    console.log('✅ Created project author user');
  }

  // Get available media files for projects
  const availableMedia = await prisma.media.findMany({
    where: {
      type: 'IMAGE',
      OR: [
        { url: { contains: '/media/projeler/' } },
        { url: { contains: '/banners/' } }
      ]
    },
    take: 5,
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`📁 Found ${availableMedia.length} available media files for projects`);

  // Create placeholder media if not enough available
  const neededMedia = 5 - availableMedia.length;
  if (neededMedia > 0) {
    console.log(`📷 Creating ${neededMedia} placeholder media files...`);

    for (let i = 0; i < neededMedia; i++) {
      const placeholderMedia = await prisma.media.create({
        data: {
          filename: `project-placeholder-${i + 1}.jpg`,
          originalName: `Project Placeholder ${i + 1}`,
          url: `/media/projeler/project-placeholder-${i + 1}.jpg`,
          path: `/media/projeler/project-placeholder-${i + 1}.jpg`,
          type: 'IMAGE',
          size: 150000,
          mimeType: 'image/jpeg'
        }
      });
      availableMedia.push(placeholderMedia);
    }
  }

  // Sample completed projects with realistic Turkish content
  const completedProjects = [
    {
      title: 'Yeşil Vadi Konutları',
      summary: 'Ankara Çankaya\'da tamamlanan 450 konutluk modern yaşam projesi.',
      content: `<div class="project-content">
        <p>Yeşil Vadi Konutları, Ankara'nın prestijli Çankaya ilçesinde 2019-2022 yılları arasında gerçekleştirilen kapsamlı bir kentsel dönüşüm projesidir.</p>
        
        <h3>Proje Özellikleri:</h3>
        <ul>
          <li>450 konut birimi (2+1, 3+1, 4+1 seçenekleri)</li>
          <li>25.000 m² yeşil alan ve peyzaj</li>
          <li>Kapalı otopark (600 araç kapasiteli)</li>
          <li>Sosyal tesisler ve spor alanları</li>
          <li>Çocuk oyun alanları ve kreş</li>
          <li>Güvenlik sistemi ve 7/24 güvenlik</li>
        </ul>
        
        <p>Proje, LEED Gold sertifikalı yeşil bina standartlarında inşa edilmiş olup, enerji verimliliği ve çevre dostu teknolojiler kullanılmıştır.</p>
        
        <h3>Teslim Edilen Hizmetler:</h3>
        <ul>
          <li>Merkezi ısıtma sistemi</li>
          <li>Fiber internet altyapısı</li>
          <li>Akıllı ev sistemleri</li>
          <li>Yağmur suyu toplama sistemi</li>
          <li>Güneş enerjisi panelleri</li>
        </ul>
        
        <p>Proje 2022 yılında başarıyla tamamlanmış ve tüm konutlar sahiplerine teslim edilmiştir. Sakinler memnuniyeti %95 seviyesindedir.</p>
      </div>`,
      province: 'Ankara',
      district: 'Çankaya',
      address: 'Çankaya Mahallesi, Atatürk Bulvarı No: 125',
      locationName: 'Çankaya Merkez',
      latitude: 39.9208,
      longitude: 32.8541,
      completedAt: new Date('2022-12-15'),
      tags: ['kentsel dönüşüm', 'yeşil bina', 'modern konut', 'çevre dostu']
    },
    {
      title: 'Mavi Deniz Sitesi',
      summary: 'İzmir Karşıyaka\'da deniz manzaralı 280 konutluk tamamlanmış proje.',
      content: `<div class="project-content">
        <p>Mavi Deniz Sitesi, İzmir Karşıyaka'da deniz kenarında konumlanan prestijli bir konut projesidir. 2020-2023 yılları arasında tamamlanan proje, modern mimari ve deniz manzarası ile dikkat çekmektedir.</p>
        
        <h3>Proje Detayları:</h3>
        <ul>
          <li>280 konut birimi (1+1'den 4+1'e kadar)</li>
          <li>Deniz manzaralı teraslar</li>
          <li>Marina ve yat limanı erişimi</li>
          <li>Özel plaj alanı</li>
          <li>Spa ve wellness merkezi</li>
          <li>Restoran ve kafe alanları</li>
        </ul>
        
        <p>Proje, İzmir'in en prestijli bölgelerinden birinde konumlanmış olup, şehir merkezine kolay ulaşım imkanı sunmaktadır.</p>
        
        <h3>Sosyal Tesisler:</h3>
        <ul>
          <li>Yüzme havuzu kompleksi</li>
          <li>Fitness merkezi</li>
          <li>Tenis kortu</li>
          <li>Çocuk kulübü</li>
          <li>Toplantı salonları</li>
          <li>Barbekü alanları</li>
        </ul>
        
        <p>2023 yılında teslim edilen proje, İzmir'in en başarılı konut projelerinden biri olarak kabul edilmektedir.</p>
      </div>`,
      province: 'İzmir',
      district: 'Karşıyaka',
      address: 'Karşıyaka Sahil, Atatürk Caddesi No: 45',
      locationName: 'Karşıyaka Sahil',
      latitude: 38.4615,
      longitude: 27.1286,
      completedAt: new Date('2023-06-30'),
      tags: ['deniz manzarası', 'lüks konut', 'marina', 'spa']
    },
    {
      title: 'Altın Tepeler Villaları',
      summary: 'Bursa Nilüfer\'de tamamlanan 120 villalık prestijli yaşam alanı.',
      content: `<div class="project-content">
        <p>Altın Tepeler Villaları, Bursa Nilüfer ilçesinde doğal güzellikler içinde konumlanan müstakil villa projesidir. 2021-2024 yılları arasında tamamlanan proje, aile yaşamı için ideal bir ortam sunmaktadır.</p>
        
        <h3>Villa Özellikleri:</h3>
        <ul>
          <li>120 müstakil villa (3+1, 4+1, 5+1 seçenekleri)</li>
          <li>Özel bahçe ve havuz imkanı</li>
          <li>Kapalı garaj (2-3 araç kapasiteli)</li>
          <li>Geniş teraslar ve balkonlar</li>
          <li>Şömine ve jakuzi seçenekleri</li>
          <li>Akıllı ev teknolojileri</li>
        </ul>
        
        <p>Proje alanı, Uludağ'ın eteklerinde konumlanmış olup, doğal yaşamı şehir konforuyla birleştirmektedir.</p>
        
        <h3>Ortak Alanlar:</h3>
        <ul>
          <li>Merkezi park ve yürüyüş yolları</li>
          <li>Spor alanları ve çocuk parkı</li>
          <li>Sosyal tesis binası</li>
          <li>Güvenlik kulübesi ve kontrol sistemi</li>
          <li>Misafirhane ve etkinlik alanı</li>
        </ul>
        
        <p>2024 yılında teslim edilen villalar, Bursa'nın en prestijli yaşam alanlarından biri haline gelmiştir.</p>
      </div>`,
      province: 'Bursa',
      district: 'Nilüfer',
      address: 'Nilüfer Belediyesi, Uludağ Etekleri Mevkii',
      locationName: 'Uludağ Etekleri',
      latitude: 40.2669,
      longitude: 28.9641,
      completedAt: new Date('2024-03-20'),
      tags: ['villa', 'müstakil', 'doğa', 'prestij']
    },
    {
      title: 'Şehir Merkezi Rezidansları',
      summary: 'İstanbul Kadıköy\'de tamamlanan 350 konutluk merkezi konum projesi.',
      content: `<div class="project-content">
        <p>Şehir Merkezi Rezidansları, İstanbul Kadıköy'ün kalbinde konumlanan modern bir yaşam projesidir. 2019-2023 yılları arasında tamamlanan proje, şehir merkezinde konforlu yaşam sunmaktadır.</p>
        
        <h3>Konum Avantajları:</h3>
        <ul>
          <li>Metro istasyonuna 5 dakika yürüme mesafesi</li>
          <li>Kadıköy çarşısına 10 dakika</li>
          <li>Boğaz manzaralı üst katlar</li>
          <li>Alışveriş merkezlerine yakınlık</li>
          <li>Eğitim kurumlarına kolay erişim</li>
          <li>Sağlık tesislerine yakınlık</li>
        </ul>
        
        <p>350 konut biriminden oluşan proje, farklı yaşam tarzlarına uygun seçenekler sunmaktadır.</p>
        
        <h3>Proje İçeriği:</h3>
        <ul>
          <li>Studio'dan 3+1'e kadar konut seçenekleri</li>
          <li>Ticari alanlar ve ofisler</li>
          <li>Kapalı otopark (400 araç kapasiteli)</li>
          <li>Çatı terası ve sosyal alanlar</li>
          <li>Concierge hizmeti</li>
          <li>24 saat güvenlik</li>
        </ul>
        
        <p>2023 yılında teslim edilen proje, İstanbul'un en değerli konut projelerinden biri olarak kabul edilmektedir.</p>
      </div>`,
      province: 'İstanbul',
      district: 'Kadıköy',
      address: 'Kadıköy Merkez, Bahariye Caddesi No: 78',
      locationName: 'Kadıköy Merkez',
      latitude: 40.9900,
      longitude: 29.0244,
      completedAt: new Date('2023-09-15'),
      tags: ['merkezi konum', 'metro', 'rezidans', 'boğaz manzarası']
    },
    {
      title: 'Aile Bahçeleri Kooperatifi',
      summary: 'Antalya Muratpaşa\'da tamamlanan 200 konutluk aile dostu proje.',
      content: `<div class="project-content">
        <p>Aile Bahçeleri Kooperatifi, Antalya Muratpaşa'da aile yaşamına odaklanan bir konut projesidir. 2020-2023 yılları arasında tamamlanan proje, çocuklu aileler için ideal yaşam alanları sunmaktadır.</p>
        
        <h3>Aile Dostu Özellikler:</h3>
        <ul>
          <li>200 konut birimi (2+1, 3+1, 4+1 seçenekleri)</li>
          <li>Geniş çocuk oyun alanları</li>
          <li>Kreş ve anaokulu</li>
          <li>Aile sağlık merkezi</li>
          <li>Spor alanları ve yürüyüş parkurları</li>
          <li>Organik bahçe alanları</li>
        </ul>
        
        <p>Proje, Antalya'nın ılıman ikliminden faydalanarak açık hava yaşamını destekleyen tasarımlar içermektedir.</p>
        
        <h3>Sosyal Yaşam Alanları:</h3>
        <ul>
          <li>Açık hava sinema alanı</li>
          <li>Barbekü ve piknik alanları</li>
          <li>Yüzme havuzu ve çocuk havuzu</li>
          <li>Kütüphane ve çalışma alanları</li>
          <li>Hobi atölyeleri</li>
          <li>Yaşlılar için dinlenme alanları</li>
        </ul>
        
        <p>2023 yılında teslim edilen proje, Antalya'da aile yaşamı için en ideal konut projelerinden biri olmuştur.</p>
      </div>`,
      province: 'Antalya',
      district: 'Muratpaşa',
      address: 'Muratpaşa Belediyesi, Lara Yolu Üzeri',
      locationName: 'Lara Bölgesi',
      latitude: 36.8969,
      longitude: 30.7133,
      completedAt: new Date('2023-11-10'),
      tags: ['aile dostu', 'çocuk', 'organik bahçe', 'sosyal yaşam']
    }
  ];

  console.log(`🏗️ Creating ${completedProjects.length} completed projects...`);

  for (let i = 0; i < completedProjects.length; i++) {
    const project = completedProjects[i];
    const slug = generateSlug(project.title);
    
    // Check if project already exists
    const existingProject = await prisma.project.findUnique({
      where: { slug }
    });

    if (existingProject) {
      console.log(`⏭️ Completed project already exists: ${project.title}`);
      continue;
    }

    // Create completed project
    const readingTime = calculateReadingTime(project.content);

    // Assign media ID if available
    const mediaId = availableMedia[i % availableMedia.length]?.id || null;

    const newProject = await prisma.project.create({
      data: {
        title: project.title,
        slug,
        summary: project.summary,
        content: project.content,
        status: 'COMPLETED',
        province: project.province,
        district: project.district,
        address: project.address,
        locationName: project.locationName,
        latitude: project.latitude,
        longitude: project.longitude,
        mediaId,
        authorId: author.id,
        published: true,
        publishedAt: project.completedAt,
        readingTime,
        viewCount: Math.floor(Math.random() * 500) + 100, // Random view count between 100-600
        hasQuickAccess: i < 2 // First 2 projects have quick access
      }
    });

    // Add tags
    if (project.tags && project.tags.length > 0) {
      for (const tagName of project.tags) {
        // Create or find tag
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: generateSlug(tagName)
          }
        });

        // Create project-tag relation
        await prisma.projectTag.create({
          data: {
            projectId: newProject.id,
            tagId: tag.id
          }
        });
      }
    }

    console.log(`✅ Created completed project: ${project.title}`);
  }

  console.log('🎉 Completed projects seeding finished!');
}
