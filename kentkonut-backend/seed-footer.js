const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedFooter() {
  console.log('🔄 Footer verileri yükleniyor...');

  try {
    // 1. Site Ayarlarını Oluştur (İletişim ve Sosyal Medya)
    console.log('📧 Site ayarları oluşturuluyor...');
    await prisma.siteSetting.createMany({
      data: [
        { key: 'contact_address', value: 'Körfez Mah. Hafız Binbaşı Cad. No:3 İzmit / Kocaeli' },
        { key: 'contact_phone', value: '0 262 331 0703' },
        { key: 'contact_email', value: 'halklailiskiler@kentkonut.com.tr' },
        { key: 'social_facebook_url', value: 'https://facebook.com/kentkonut' },
        { key: 'social_twitter_url', value: 'https://x.com/kentkonut' },
        { key: 'social_instagram_url', value: 'https://instagram.com/kentkonut' },
        { key: 'social_linkedin_url', value: 'https://linkedin.com/company/kentkonut' },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Site ayarları oluşturuldu');

    // 2. Footer Kolonlarını ve Linklerini Oluştur
    console.log('📑 Footer kolonları oluşturuluyor...');
    const footerData = [
      {
        title: 'Genel',
        order: 1,
        links: [
          { text: 'İhale Yönetimi', url: '/ihale-yonetimi', order: 1 },
          { text: 'Kurumsal Kimlik', url: '/kurumsal-kimlik', order: 2 },
          { text: 'Yayınlarımız', url: '/yayinlar', order: 3 },
          { text: 'Memnuniyet Anketi', url: '/memnuniyet-anketi', order: 4 },
          { text: 'Beni Haberdar Et', url: '/beni-haberdar-et', order: 5 },
        ],
      },
      {
        title: 'Hizmetler',
        order: 2,
        links: [
          { text: 'Hafriyat Ücret Tarifeleri', url: '/hafriyat/ucret-tarifeleri', order: 1 },
          { text: 'Hafriyat Sahaları', url: '/hafriyat/sahalar', order: 2 },
          { text: 'Kredi Hesaplama', url: '/kredi-hesaplama', order: 3 },
          { text: 'Dokümanlarımız', url: '/dokumanlar', order: 4 },
          { text: 'Video', url: '/video', order: 5 },
        ],
      },
      {
        title: 'Alt Bağlantılar',
        order: 3,
        links: [
          { text: 'Site Kullanımı', url: '/site-kullanimi', order: 1 },
          { text: 'KVKK', url: '/kvkk', order: 2 },
          { text: 'Web Mail', url: '/webmail', order: 3 },
          { text: 'RSS', url: '/rss', order: 4 },
          { text: 'Yazılım', url: '/yazilim', order: 5 },
        ],
      },
    ];

    for (const col of footerData) {
      const column = await prisma.footerColumn.upsert({
        where: { title: col.title },
        update: { order: col.order },
        create: { title: col.title, order: col.order },
      });

      for (const link of col.links) {
        // Check if link already exists for this column
        const existingLink = await prisma.footerLink.findFirst({
          where: {
            text: link.text,
            columnId: column.id
          }
        });

        if (existingLink) {
          // Update existing link
          await prisma.footerLink.update({
            where: { id: existingLink.id },
            data: { url: link.url, order: link.order }
          });
        } else {
          // Create new link
          await prisma.footerLink.create({
            data: { ...link, columnId: column.id }
          });
        }
      }
    }
    console.log('✅ Footer kolonları ve linkleri oluşturuldu');

    console.log('🎉 Footer verileri başarıyla yüklendi!');

  } catch (error) {
    console.error('❌ Footer yükleme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFooter();
