const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addHafriyatPage() {
  console.log('🏗️ Hafriyat sayfası pages tablosuna ekleniyor...');

  const hafriyatPageData = {
    slug: 'hafriyat',
    title: 'Hafriyat Hizmetleri',
    metaTitle: 'Hafriyat Hizmetleri - Kent Konut',
    metaDescription: 'Kocaeli ili hafriyat sahalarının yönetimi ve rehabilitasyon hizmetleri hakkında güncel bilgiler.',
    isActive: true,
    order: 10,
    publishedAt: new Date(),
    content: `<h2>GÜNCELLENMIS MADEN VE KULLANIMI MAYAN ALANLARIN REHABILITASYONU</h2>

<p>Bu içerik güncellenmistir. Kocaeli ili sınırları içinde yapılan yatırımlarla büyüyen inşaat sektöründe hafriyat atığı, miktarı gün geçtikçe artmaktadır.</p>

<p>Hafriyat sayfasının detaylı içeriği düzenlenmektedir. Bu sayfa ile ilgili güncel bilgiler için lütfen daha sonra tekrar ziyaret ediniz.</p>

<h3>Hizmet Alanlarımız</h3>
<ul>
<li>Hafriyat sahalarının planlanması ve yönetimi</li>
<li>Çevre dostu hafriyat teknikleri</li>
<li>Rehabilitasyon projeleri</li>
<li>Sürdürülebilir kalkınma uygulamaları</li>
</ul>

<h3>İletişim Bilgileri</h3>
<p>Hafriyat hizmetleri hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz.</p>`,
    excerpt: 'Kocaeli ili hafriyat sahalarının yönetimi ve rehabilitasyon hizmetleri.',
    metaKeywords: ['hafriyat', 'rehabilitasyon', 'çevre', 'sürdürülebilirlik', 'Kocaeli'],
    hasQuickAccess: false
  };

  try {
    // Mevcut hafriyat sayfasını kontrol et
    const existingPage = await prisma.page.findUnique({
      where: { slug: 'hafriyat' }
    });

    if (existingPage) {
      // Mevcut sayfayı güncelle
      const updatedPage = await prisma.page.update({
        where: { slug: 'hafriyat' },
        data: hafriyatPageData
      });
      console.log('✅ Mevcut hafriyat sayfası güncellendi:', updatedPage.title);
    } else {
      // Yeni sayfa oluştur
      const newPage = await prisma.page.create({
        data: hafriyatPageData
      });
      console.log('✅ Yeni hafriyat sayfası oluşturuldu:', newPage.title);
    }

    console.log('🎉 Hafriyat sayfası başarıyla eklendi!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addHafriyatPage();