const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedFooterSections() {
  console.log('🔄 Footer sections yükleniyor...');

  try {
    // Helper to upsert a section by unique key
    async function upsertSection(key, data) {
      const section = await prisma.footerSection.upsert({
        where: { key },
        update: {
          title: data.title ?? undefined,
          type: data.type,
          orientation: data.orientation ?? 'VERTICAL',
          order: data.order,
          isActive: data.isActive ?? true,
          layoutConfig: data.layoutConfig ?? undefined,
        },
        create: {
          key,
          title: data.title ?? undefined,
          type: data.type,
          orientation: data.orientation ?? 'VERTICAL',
          order: data.order,
          isActive: data.isActive ?? true,
          layoutConfig: data.layoutConfig ?? undefined,
        },
      });
      return section;
    }

    // Helper to reset items of a section and insert fresh
    async function resetItems(sectionId, items) {
      await prisma.footerItem.deleteMany({ where: { sectionId } });
      for (const item of items) {
        await prisma.footerItem.create({
          data: {
            sectionId,
            order: item.order,
            type: item.type,
            label: item.label ?? undefined,
            url: item.url ?? undefined,
            target: item.target ?? undefined,
            isExternal: item.isExternal ?? false,
            icon: item.icon ?? undefined,
            imageUrl: item.imageUrl ?? undefined,
            text: item.text ?? undefined,
            metadata: item.metadata ?? undefined,
          },
        });
      }
    }

    // 1) Genel (LINKS - vertical)
    console.log('📑 Genel linkler oluşturuluyor...');
    const s1 = await upsertSection('general_links_1', {
      title: 'Genel',
      type: 'LINKS',
      orientation: 'VERTICAL',
      order: 1,
    });
    await resetItems(s1.id, [
      { order: 1, type: 'LINK', label: 'İhale Yönetimi', url: '/ihale-yonetimi' },
      { order: 2, type: 'LINK', label: 'Kurumsal Kimlik', url: '/kurumsal-kimlik' },
      { order: 3, type: 'LINK', label: 'Yayınlarımız', url: '/yayinlar' },
      { order: 4, type: 'LINK', label: 'Memnuniyet Anketi', url: '/memnuniyet-anketi' },
      { order: 5, type: 'LINK', label: 'Beni Haberdar Et', url: '/beni-haberdar-et' },
    ]);

    // 2) Hizmetler (LINKS - vertical)
    console.log('🔧 Hizmetler linkleri oluşturuluyor...');
    const s2 = await upsertSection('services_links_2', {
      title: 'Hizmetler',
      type: 'LINKS',
      orientation: 'VERTICAL',
      order: 2,
    });
    await resetItems(s2.id, [
      { order: 1, type: 'LINK', label: 'Hafriyat Ücret Tarifeleri', url: '/hafriyat/ucret-tarifeleri' },
      { order: 2, type: 'LINK', label: 'Hafriyat Sahaları', url: '/hafriyat/sahalar' },
      { order: 3, type: 'LINK', label: 'Kredi Hesaplama', url: '/kredi-hesaplama' },
      { order: 4, type: 'LINK', label: 'Dokümanlarımız', url: '/dokumanlar' },
      { order: 5, type: 'LINK', label: 'Video', url: '/video' },
    ]);

    // 3) Orta Görsel (IMAGE)
    console.log('🖼️ Orta görsel oluşturuluyor...');
    const s3 = await upsertSection('center_image', {
      title: null,
      type: 'IMAGE',
      order: 3,
    });
    await resetItems(s3.id, [
      { order: 1, type: 'IMAGE', imageUrl: '/referanslar/buyuksehirlogo_28022021011400.png', url: '/' },
    ]);

    // 4) İletişim (CONTACT) - ikonlu öğeler
    console.log('📞 İletişim bilgileri oluşturuluyor...');
    const s4 = await upsertSection('contact_block', {
      title: 'İletişim',
      type: 'CONTACT',
      order: 4,
    });
    await resetItems(s4.id, [
      { order: 1, type: 'ADDRESS', icon: 'map-pin', text: 'Körfez Mah. Hafız Binbaşı Cad. No:3 İzmit / Kocaeli' },
      { order: 2, type: 'EMAIL', icon: 'mail', label: 'halklailiskiler@kentkonut.com.tr', url: 'mailto:halklailiskiler@kentkonut.com.tr' },
      { order: 3, type: 'PHONE', icon: 'phone', label: '0 262 331 0703', url: 'tel:+902623310703' },
    ]);

    // 5) Düz Metin (TEXT)
    console.log('📝 Alt metin oluşturuluyor...');
    const s5 = await upsertSection('bottom_text', {
      title: null,
      type: 'TEXT',
      order: 5,
    });
    await resetItems(s5.id, [
      { order: 1, type: 'TEXT', text: 'KENT KONUT İNŞAAT SAN. VE TİC. A.Ş. KOCAELİ BÜYÜKŞEHİR BELEDİYESİ İŞTİRAKİDİR' },
    ]);

    // 6) Alt Bağlantılar (LEGAL - horizontal)
    console.log('⚖️ Yasal linkler oluşturuluyor...');
    const s6 = await upsertSection('legal_links', {
      title: null,
      type: 'LEGAL',
      orientation: 'HORIZONTAL',
      order: 6,
    });
    await resetItems(s6.id, [
      { order: 1, type: 'LINK', label: 'Site Kullanımı', url: '/site-kullanimi' },
      { order: 2, type: 'LINK', label: 'KVKK', url: '/kvkk' },
      { order: 3, type: 'LINK', label: 'Web Mail', url: '/web-mail' },
      { order: 4, type: 'LINK', label: 'RSS', url: '/rss' },
      { order: 5, type: 'LINK', label: 'Yazılım K7', url: 'http://www.k7.com.tr', isExternal: true },
    ]);

    console.log('🎉 Footer sections başarıyla yüklendi!');

  } catch (error) {
    console.error('❌ Footer sections yükleme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFooterSections();
