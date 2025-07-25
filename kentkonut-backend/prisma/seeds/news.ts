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

export async function seedNews() {
  console.log('📰 Seeding news module...');

  // Get or create a user for authoring news
  let author = await prisma.user.findFirst();
  if (!author) {
    console.log('⚠️ No user found, creating seed user for news...');
    author = await prisma.user.create({
      data: {
        id: 'news-seed-user',
        name: 'Haber Editörü',
        email: 'haber@kentkonut.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
      }
    });
    console.log('✅ Created news author user');
  }

  // Create news categories if they don't exist
  const newsCategories = [
    {
      name: 'Kentsel Dönüşüm',
      slug: 'kentsel-donusum',
      description: 'Kentsel dönüşüm projeleri ve gelişmeleri',
      order: 1
    },
    {
      name: 'Proje Duyuruları',
      slug: 'proje-duyurulari',
      description: 'Yeni proje duyuruları ve açıklamaları',
      order: 2
    },
    {
      name: 'Kurumsal Haberler',
      slug: 'kurumsal-haberler',
      description: 'Kurum ile ilgili haberler ve duyurular',
      order: 3
    },
    {
      name: 'Etkinlikler',
      slug: 'etkinlikler',
      description: 'Düzenlenen etkinlikler ve organizasyonlar',
      order: 4
    },
    {
      name: 'Basın Açıklamaları',
      slug: 'basin-aciklamalari',
      description: 'Resmi basın açıklamaları ve duyurular',
      order: 5
    }
  ];

  const createdCategories = [];
  for (const category of newsCategories) {
    const existingCategory = await prisma.newsCategory.findUnique({
      where: { slug: category.slug }
    });

    if (!existingCategory) {
      const newCategory = await prisma.newsCategory.create({
        data: category
      });
      createdCategories.push(newCategory);
      console.log(`✅ Created news category: ${category.name}`);
    } else {
      createdCategories.push(existingCategory);
      console.log(`⏭️ News category already exists: ${category.name}`);
    }
  }

  // Sample news articles with realistic Turkish content
  const newsArticles = [
    {
      title: 'Yeni Kentsel Dönüşüm Projesi Başlatıldı',
      summary: 'Şehrimizin merkezi bölgesinde kapsamlı kentsel dönüşüm projesi resmi olarak başlatıldı.',
      content: `<div class="news-content">
        <p>Şehrimizin merkezi bölgesinde bulunan eski yapıların yenilenmesi amacıyla başlatılan kentsel dönüşüm projesi, modern yaşam standartlarını karşılayacak şekilde tasarlandı.</p>
        
        <p>Proje kapsamında:</p>
        <ul>
          <li>500 konut birimi yenilenecek</li>
          <li>Yeşil alanlar %40 artırılacak</li>
          <li>Modern altyapı sistemleri kurulacak</li>
          <li>Sosyal tesisler inşa edilecek</li>
        </ul>
        
        <p>Proje, çevre dostu teknolojiler kullanılarak sürdürülebilir bir yaklaşımla hayata geçirilecek. Vatandaşlarımızın yaşam kalitesini artırmayı hedefleyen bu proje, 24 ay içerisinde tamamlanması planlanıyor.</p>
        
        <p>Proje hakkında detaylı bilgi almak isteyen vatandaşlarımız, bilgi merkezimizi ziyaret edebilir veya web sitemizden güncel gelişmeleri takip edebilirler.</p>
      </div>`,
      categorySlug: 'kentsel-donusum',
      tags: ['kentsel dönüşüm', 'yenileme', 'modern yaşam']
    },
    {
      title: 'Kent Park Evleri Projesi Ön Satışa Çıktı',
      summary: 'Doğayla iç içe modern yaşam sunan Kent Park Evleri projesi ön satış aşamasına geçti.',
      content: `<div class="news-content">
        <p>Şehrimizin prestijli bölgelerinden birinde konumlanan Kent Park Evleri projesi, modern mimarisi ve doğal yaşam alanlarıyla dikkat çekiyor.</p>
        
        <h3>Proje Özellikleri:</h3>
        <ul>
          <li>150 villa ve 300 daire seçeneği</li>
          <li>25.000 m² yeşil alan</li>
          <li>Sosyal tesisler ve spor alanları</li>
          <li>Güvenlikli site konsepti</li>
          <li>Akıllı ev teknolojileri</li>
        </ul>
        
        <p>Proje, LEED sertifikalı yeşil bina standartlarında inşa ediliyor. Enerji verimliliği ve çevre dostu malzemeler kullanılarak sürdürülebilir bir yaşam alanı oluşturuluyor.</p>
        
        <p>Ön satış kampanyası kapsamında özel fiyat avantajları sunuluyor. Detaylı bilgi için satış ofisimizi ziyaret edebilir veya online randevu alabilirsiniz.</p>
      </div>`,
      categorySlug: 'proje-duyurulari',
      tags: ['kent park evleri', 'ön satış', 'villa', 'daire']
    },
    {
      title: 'Sürdürülebilir Kentleşme Konferansı Düzenlendi',
      summary: 'Sürdürülebilir kentleşme ve çevre dostu yapı teknolojileri konulu konferans büyük ilgi gördü.',
      content: `<div class="news-content">
        <p>Şehrimizde düzenlenen "Sürdürülebilir Kentleşme ve Gelecek" konulu konferans, sektör uzmanları ve vatandaşların yoğun katılımıyla gerçekleşti.</p>
        
        <p>Konferansta ele alınan başlıca konular:</p>
        <ul>
          <li>Yeşil bina teknolojileri</li>
          <li>Enerji verimliliği</li>
          <li>Akıllı şehir uygulamaları</li>
          <li>Sürdürülebilir ulaşım sistemleri</li>
          <li>Atık yönetimi ve geri dönüşüm</li>
        </ul>
        
        <p>Konferansta konuşan uzmanlar, gelecek nesillere yaşanabilir bir çevre bırakmanın önemini vurguladı. Modern teknolojiler ve çevre bilincinin bir arada kullanılmasıyla sürdürülebilir kentler inşa edilebileceği belirtildi.</p>
        
        <p>Etkinlik sonunda katılımcılara sertifika verildi ve networking oturumu düzenlendi.</p>
      </div>`,
      categorySlug: 'etkinlikler',
      tags: ['sürdürülebilirlik', 'konferans', 'çevre', 'teknoloji']
    },
    {
      title: 'Yeni Sosyal Tesis Alanları Hizmete Açıldı',
      summary: 'Vatandaşlarımızın sosyal ihtiyaçlarını karşılamak üzere yeni tesis alanları hizmete açıldı.',
      content: `<div class="news-content">
        <p>Şehrimizin çeşitli bölgelerinde inşa edilen sosyal tesis alanları, vatandaşlarımızın hizmetine sunuldu.</p>
        
        <h3>Yeni Tesisler:</h3>
        <ul>
          <li>Çok amaçlı spor salonu</li>
          <li>Çocuk oyun alanları</li>
          <li>Fitness ve wellness merkezi</li>
          <li>Kültür ve sanat atölyeleri</li>
          <li>Kafe ve dinlenme alanları</li>
        </ul>
        
        <p>Tesisler, tüm yaş gruplarının ihtiyaçları göz önünde bulundurularak tasarlandı. Engelli vatandaşlarımız için özel erişim imkanları sağlandı.</p>
        
        <p>Sosyal tesislerden yararlanmak isteyen vatandaşlarımız, online rezervasyon sistemi üzerinden randevu alabilir veya doğrudan tesisleri ziyaret edebilirler.</p>
        
        <p>Tesisler hafta içi 08:00-22:00, hafta sonu 09:00-21:00 saatleri arasında hizmet veriyor.</p>
      </div>`,
      categorySlug: 'kurumsal-haberler',
      tags: ['sosyal tesis', 'spor', 'kültür', 'hizmet']
    },
    {
      title: 'Akıllı Şehir Teknolojileri Pilot Projesi',
      summary: 'Şehrimizde akıllı şehir teknolojilerinin test edileceği pilot proje başlatıldı.',
      content: `<div class="news-content">
        <p>Teknolojinin şehir yaşamına entegrasyonu amacıyla başlatılan akıllı şehir pilot projesi, seçilen bölgelerde uygulanmaya başlandı.</p>
        
        <p>Pilot proje kapsamında test edilecek teknolojiler:</p>
        <ul>
          <li>Akıllı trafik yönetim sistemi</li>
          <li>IoT sensörlü çevre izleme</li>
          <li>Dijital bilgi panoları</li>
          <li>Akıllı park sistemi</li>
          <li>Enerji yönetim sistemleri</li>
        </ul>
        
        <p>Proje, vatandaşların günlük yaşamını kolaylaştırmayı ve şehir kaynaklarının daha verimli kullanılmasını hedefliyor.</p>
        
        <p>6 aylık test süreci sonunda elde edilen veriler değerlendirilerek, başarılı uygulamalar şehrin diğer bölgelerine yaygınlaştırılacak.</p>
      </div>`,
      categorySlug: 'proje-duyurulari',
      tags: ['akıllı şehir', 'teknoloji', 'pilot proje', 'IoT']
    },
    {
      title: 'Çevre Dostu Yapı Malzemeleri Semineri',
      summary: 'İnşaat sektöründe çevre dostu malzemelerin kullanımı konulu seminer düzenlendi.',
      content: `<div class="news-content">
        <p>Sürdürülebilir inşaat sektörü için önemli bir adım olan çevre dostu yapı malzemeleri semineri, sektör profesyonelleri ve akademisyenlerin katılımıyla gerçekleşti.</p>

        <h3>Seminerde Ele Alınan Konular:</h3>
        <ul>
          <li>Geri dönüştürülmüş malzemeler</li>
          <li>Düşük karbon ayak izli ürünler</li>
          <li>Doğal yalıtım malzemeleri</li>
          <li>Enerji verimli cam sistemleri</li>
          <li>Sürdürülebilir beton teknolojileri</li>
        </ul>

        <p>Uzmanlar, gelecekte inşaat sektöründe çevre dostu malzemelerin standart hale geleceğini ve bu dönüşümün hem çevresel hem de ekonomik faydalar sağlayacağını belirtti.</p>

        <p>Seminer sonunda katılımcılara çevre dostu malzeme rehberi dağıtıldı ve sertifika verildi.</p>
      </div>`,
      categorySlug: 'etkinlikler',
      tags: ['çevre dostu', 'yapı malzemeleri', 'seminer', 'sürdürülebilirlik']
    },
    {
      title: 'Kentsel Dönüşümde Yeni Teşvik Paketi Açıklandı',
      summary: 'Kentsel dönüşüm projelerine katılımı artırmak için yeni teşvik paketi açıklandı.',
      content: `<div class="news-content">
        <p>Kentsel dönüşüm projelerine vatandaş katılımını artırmak amacıyla hazırlanan kapsamlı teşvik paketi açıklandı.</p>

        <h3>Teşvik Paketi Kapsamında:</h3>
        <ul>
          <li>%20 indirimli konut fiyatları</li>
          <li>5 yıl vade farksız ödeme imkanı</li>
          <li>Taşınma masrafları desteği</li>
          <li>Geçici konaklama yardımı</li>
          <li>Vergi avantajları</li>
        </ul>

        <p>Teşvik paketi, özellikle orta gelir grubu vatandaşların kentsel dönüşüm projelerine katılımını kolaylaştırmayı hedefliyor.</p>

        <p>Başvurular online sistem üzerinden yapılabiliyor. Detaylı bilgi için danışmanlık merkezlerimizi ziyaret edebilir veya çağrı merkezimizi arayabilirsiniz.</p>

        <p>Teşvik paketi 31 Aralık 2025 tarihine kadar geçerli olacak.</p>
      </div>`,
      categorySlug: 'basin-aciklamalari',
      tags: ['teşvik paketi', 'kentsel dönüşüm', 'indirim', 'destek']
    },
    {
      title: 'Yeni Nesil Konut Projeleri Tanıtıldı',
      summary: 'Gelecek nesil yaşam standartlarını karşılayan yeni konut projeleri tanıtım toplantısında açıklandı.',
      content: `<div class="news-content">
        <p>Teknoloji ve konforun buluştuğu yeni nesil konut projeleri, düzenlenen tanıtım toplantısında kamuoyuna sunuldu.</p>

        <h3>Yeni Nesil Konut Özellikleri:</h3>
        <ul>
          <li>Akıllı ev otomasyon sistemleri</li>
          <li>Güneş enerjisi panelleri</li>
          <li>Yağmur suyu toplama sistemi</li>
          <li>Elektrikli araç şarj istasyonları</li>
          <li>Hava kalitesi kontrol sistemleri</li>
        </ul>

        <p>Projeler, sıfır atık hedefi doğrultusunda tasarlandı ve BREEAM sertifikası almaya hak kazandı.</p>

        <p>İlk etapta 3 farklı lokasyonda toplam 1.200 konut inşa edilecek. Projeler 2026 yılında teslim edilmeye başlanacak.</p>

        <p>Ön talep toplama süreci başladı. İlgilenen vatandaşlar web sitemizden bilgi alabilir ve ön kayıt yaptırabilirler.</p>
      </div>`,
      categorySlug: 'proje-duyurulari',
      tags: ['yeni nesil konut', 'akıllı ev', 'teknoloji', 'çevre dostu']
    },
    {
      title: 'Kentsel Tasarım Yarışması Sonuçlandı',
      summary: 'Şehrimizin geleceğini şekillendirecek kentsel tasarım yarışması sonuçları açıklandı.',
      content: `<div class="news-content">
        <p>Şehrimizin gelecek 20 yılına yön verecek kentsel tasarım yarışması, ulusal ve uluslararası mimarların katılımıyla sonuçlandı.</p>

        <h3>Yarışma Sonuçları:</h3>
        <ul>
          <li>1. Ödül: "Yeşil Koridor" projesi</li>
          <li>2. Ödül: "Akıllı Mahalle" konsepti</li>
          <li>3. Ödül: "Sürdürülebilir Kent" tasarımı</li>
          <li>Mansiyon: "Kültür Merkezi" projesi</li>
          <li>Özel Ödül: "Gençlik Kampüsü" tasarımı</li>
        </ul>

        <p>Birinci olan "Yeşil Koridor" projesi, şehir merkezinden geçen yeşil bir aks oluşturarak doğa ile kentsel yaşamı birleştiren yenilikçi yaklaşımıyla dikkat çekti.</p>

        <p>Kazanan projeler, şehir planlama sürecinde referans alınacak ve uygulanabilirlik çalışmaları başlatılacak.</p>

        <p>Tüm yarışma projeleri, şehir müzemizde 1 ay boyunca sergilenecek.</p>
      </div>`,
      categorySlug: 'kurumsal-haberler',
      tags: ['kentsel tasarım', 'yarışma', 'mimari', 'şehir planlama']
    },
    {
      title: 'Dijital Dönüşüm Hizmetleri Genişletildi',
      summary: 'Vatandaş hizmetlerinde dijital dönüşüm kapsamında yeni online hizmetler devreye alındı.',
      content: `<div class="news-content">
        <p>Vatandaşlarımızın işlemlerini daha hızlı ve kolay yapabilmesi için dijital hizmet portföyümüz genişletildi.</p>

        <h3>Yeni Online Hizmetler:</h3>
        <ul>
          <li>Online proje başvuru sistemi</li>
          <li>Dijital belge doğrulama</li>
          <li>Sanal randevu sistemi</li>
          <li>Mobil ödeme entegrasyonu</li>
          <li>Canlı destek hattı</li>
        </ul>

        <p>Yeni sistem, 7/24 hizmet verebilme kapasitesine sahip ve kullanıcı dostu arayüzü ile tüm yaş gruplarının kolayca kullanabileceği şekilde tasarlandı.</p>

        <p>Dijital hizmetler, güvenlik sertifikaları ile korunuyor ve kişisel veriler KVKK kapsamında işleniyor.</p>

        <p>Vatandaşlarımız, web sitemiz ve mobil uygulamamız üzerinden bu hizmetlere erişebilirler.</p>
      </div>`,
      categorySlug: 'kurumsal-haberler',
      tags: ['dijital dönüşüm', 'online hizmet', 'teknoloji', 'vatandaş']
    }
  ];

  console.log(`📝 Creating ${newsArticles.length} news articles...`);

  for (let i = 0; i < newsArticles.length; i++) {
    const article = newsArticles[i];
    const slug = generateSlug(article.title);
    
    // Check if article already exists
    const existingNews = await prisma.news.findUnique({
      where: { slug }
    });

    if (existingNews) {
      console.log(`⏭️ News article already exists: ${article.title}`);
      continue;
    }

    // Find category
    const category = createdCategories.find(cat => cat.slug === article.categorySlug);
    if (!category) {
      console.log(`⚠️ Category not found for article: ${article.title}`);
      continue;
    }

    // Create news article
    const readingTime = calculateReadingTime(article.content);
    const publishedAt = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)); // Stagger publication dates

    const news = await prisma.news.create({
      data: {
        title: article.title,
        slug,
        summary: article.summary,
        content: article.content,
        categoryId: category.id,
        authorId: author.id,
        published: true,
        publishedAt,
        readingTime,
        shareCount: Math.floor(Math.random() * 50) + 10,
        downloadCount: Math.floor(Math.random() * 20),
        likeCount: Math.floor(Math.random() * 100) + 20,
        hasQuickAccess: i < 2 // First 2 articles have quick access
      }
    });

    // Add tags
    if (article.tags && article.tags.length > 0) {
      for (const tagName of article.tags) {
        // Create or find tag
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: generateSlug(tagName)
          }
        });

        // Create news-tag relation
        await prisma.newsTag.create({
          data: {
            newsId: news.id,
            tagId: tag.id
          }
        });
      }
    }

    console.log(`✅ Created news article: ${article.title}`);
  }

  console.log('🎉 News seeding completed!');
}
