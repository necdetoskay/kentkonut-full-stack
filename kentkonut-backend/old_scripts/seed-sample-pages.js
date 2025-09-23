const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSamplePages() {
  try {
    console.log('🌱 Starting sample pages seeding...');

    // Sample pages data
    const samplePages = [
      {
        slug: 'hakkimizda',
        title: 'Hakkımızda',
        content: `
          <h2>Kent Konut Hakkında</h2>
          <p>24 Şubat 2006'da faaliyete geçirilen Kent Konut, Kocaeli Büyükşehir Belediyesi'nin bir iktisadi teşekkülüdür.</p>
          <p>Kocaeli halkına modern ve kaliteli konut sunma misyonuyla kurulan Kent Konut, yıllar içinde güvenilir bir marka haline gelmiştir.</p>
          <h3>Misyonumuz</h3>
          <p>Kocaeli'de yaşayan vatandaşlarımıza uygun fiyatlı, kaliteli ve modern konutlar sunarak şehrimizin gelişimine katkıda bulunmak.</p>
          <h3>Vizyonumuz</h3>
          <p>Türkiye'nin önde gelen belediye iktisadi teşekküllerinden biri olmak ve sürdürülebilir kentsel dönüşümde öncü rol oynamak.</p>
        `,
        excerpt: 'Kent Konut hakkında bilgi edinin. Kocaeli Büyükşehir Belediyesi\'nin Kocaeli halkına modern ve kaliteli konut sunduğu kurum.',
        metaTitle: 'Hakkımızda | Kent Konut',
        metaDescription: 'Kent Konut hakkında bilgi edinin. Kocaeli Büyükşehir Belediyesi\'nin Kocaeli halkına modern ve kaliteli konut sunduğu kurum.',
        metaKeywords: ['kent konut', 'hakkımızda', 'kocaeli', 'belediye', 'konut'],
        isActive: true,
        order: 1,
        hasQuickAccess: false
      },
      {
        slug: 'iletisim',
        title: 'İletişim',
        content: `
          <h2>Bizimle İletişime Geçin</h2>
          <p>Kent Konut ile ilgili tüm sorularınız için bizimle iletişime geçebilirsiniz.</p>
          <h3>Adres</h3>
          <p>Kocaeli Büyükşehir Belediyesi<br>
          Kent Konut İktisadi İşletmesi<br>
          İzmit / Kocaeli</p>
          <h3>Telefon</h3>
          <p>+90 (262) 000 00 00</p>
          <h3>E-posta</h3>
          <p>info@kentkonut.com</p>
          <h3>Çalışma Saatleri</h3>
          <p>Pazartesi - Cuma: 08:30 - 17:30<br>
          Cumartesi - Pazar: Kapalı</p>
        `,
        excerpt: 'Kent Konut ile iletişime geçin. Adres, telefon ve e-posta bilgilerimiz.',
        metaTitle: 'İletişim | Kent Konut',
        metaDescription: 'Kent Konut ile iletişime geçin. Adres, telefon ve e-posta bilgilerimiz.',
        metaKeywords: ['iletişim', 'adres', 'telefon', 'kent konut'],
        isActive: true,
        order: 2,
        hasQuickAccess: true
      },
      {
        slug: 'gizlilik-politikasi',
        title: 'Gizlilik Politikası',
        content: `
          <h2>Gizlilik Politikası</h2>
          <p>Kent Konut olarak kişisel verilerinizin korunması konusunda hassasiyetle hareket etmekteyiz.</p>
          <h3>Toplanan Bilgiler</h3>
          <p>Web sitemizi ziyaret ettiğinizde, hizmetlerimizi kullanırken bazı kişisel bilgilerinizi toplayabiliriz.</p>
          <h3>Bilgilerin Kullanımı</h3>
          <p>Toplanan bilgiler sadece hizmet kalitemizi artırmak ve size daha iyi hizmet sunmak amacıyla kullanılır.</p>
          <h3>Bilgi Güvenliği</h3>
          <p>Kişisel verileriniz güvenli sunucularda saklanır ve yetkisiz erişimlere karşı korunur.</p>
          <h3>İletişim</h3>
          <p>Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz.</p>
        `,
        excerpt: 'Kent Konut gizlilik politikası. Kişisel verilerinizin nasıl korunduğu hakkında bilgi.',
        metaTitle: 'Gizlilik Politikası | Kent Konut',
        metaDescription: 'Kent Konut gizlilik politikası. Kişisel verilerinizin nasıl korunduğu hakkında bilgi.',
        metaKeywords: ['gizlilik', 'politika', 'kişisel veri', 'güvenlik'],
        isActive: true,
        order: 3,
        hasQuickAccess: false
      },
      {
        slug: 'kullanim-kosullari',
        title: 'Kullanım Koşulları',
        content: `
          <h2>Kullanım Koşulları</h2>
          <p>Bu web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.</p>
          <h3>Genel Koşullar</h3>
          <p>Web sitemizde yer alan tüm içerikler Kent Konut'a aittir ve telif hakları ile korunmaktadır.</p>
          <h3>Kullanıcı Sorumlulukları</h3>
          <p>Kullanıcılar web sitesini yasalara uygun şekilde kullanmakla yükümlüdür.</p>
          <h3>Sorumluluk Reddi</h3>
          <p>Web sitesinde yer alan bilgilerin doğruluğu için azami özen gösterilmekle birlikte, değişiklik yapma hakkı saklıdır.</p>
          <h3>Değişiklikler</h3>
          <p>Bu koşullar önceden haber verilmeksizin değiştirilebilir.</p>
        `,
        excerpt: 'Kent Konut web sitesi kullanım koşulları ve kuralları.',
        metaTitle: 'Kullanım Koşulları | Kent Konut',
        metaDescription: 'Kent Konut web sitesi kullanım koşulları ve kuralları.',
        metaKeywords: ['kullanım koşulları', 'şartlar', 'kurallar'],
        isActive: true,
        order: 4,
        hasQuickAccess: false
      },
      {
        slug: 'sss',
        title: 'Sıkça Sorulan Sorular',
        content: `
          <h2>Sıkça Sorulan Sorular</h2>
          <h3>Kent Konut nedir?</h3>
          <p>Kent Konut, Kocaeli Büyükşehir Belediyesi'nin iktisadi teşekkülü olup, vatandaşlara uygun fiyatlı konut sunmaktadır.</p>
          <h3>Nasıl başvuru yapabilirim?</h3>
          <p>Başvurularınızı ofisimize gelerek veya web sitemiz üzerinden yapabilirsiniz.</p>
          <h3>Hangi bölgelerde projeleriniz var?</h3>
          <p>Kocaeli'nin çeşitli ilçelerinde projelerimiz bulunmaktadır. Güncel proje listesi için projeler sayfamızı ziyaret edebilirsiniz.</p>
          <h3>Ödeme seçenekleri nelerdir?</h3>
          <p>Peşin ödeme, taksitli ödeme ve kredi seçenekleri mevcuttur. Detaylı bilgi için ofisimizle iletişime geçebilirsiniz.</p>
          <h3>Satış sonrası hizmetler var mı?</h3>
          <p>Evet, satış sonrası müşteri hizmetlerimiz mevcuttur ve size destek olmaya devam ederiz.</p>
        `,
        excerpt: 'Kent Konut hakkında sıkça sorulan sorular ve cevapları.',
        metaTitle: 'Sıkça Sorulan Sorular | Kent Konut',
        metaDescription: 'Kent Konut hakkında sıkça sorulan sorular ve cevapları.',
        metaKeywords: ['sss', 'sorular', 'cevaplar', 'yardım'],
        isActive: true,
        order: 5,
        hasQuickAccess: true
      }
    ];

    // Create pages
    for (const pageData of samplePages) {
      const existingPage = await prisma.page.findUnique({
        where: { slug: pageData.slug }
      });

      if (!existingPage) {
        const page = await prisma.page.create({
          data: pageData
        });
        console.log(`✅ Created page: ${page.title} (${page.slug})`);
      } else {
        console.log(`⏭️  Page already exists: ${pageData.title} (${pageData.slug})`);
      }
    }

    console.log('🎉 Sample pages seeding completed!');

    // Summary
    const totalPages = await prisma.page.count();
    console.log(`📊 Total pages in database: ${totalPages}`);

  } catch (error) {
    console.error('❌ Error during pages seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSamplePages();
