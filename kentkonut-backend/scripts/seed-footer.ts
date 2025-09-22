import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFooter() {
  try {
    console.log('🌱 Footer sections seed başlıyor...');

    // Önce mevcut verileri temizle
    await prisma.footerItem.deleteMany();
    await prisma.footerSection.deleteMany();

    // Sol taraf - İlk sütun menüleri
    const leftColumn1 = await prisma.footerSection.create({
      data: {
        key: 'left-column-1',
        title: null,
        type: 'LINKS',
        orientation: 'VERTICAL',
        order: 1,
        isActive: true,
        items: {
          create: [
            {
              type: 'LINK',
              label: 'İhale Yönetimi',
              url: '/ihale-yonetimi',
              order: 1,
            },
            {
              type: 'LINK',
              label: 'Kurumsal Kimlik',
              url: '/kurumsal-kimlik',
              order: 2,
            },
            {
              type: 'LINK',
              label: 'Yayınlarımız',
              url: '/yayinlarimiz',
              order: 3,
            },
            {
              type: 'LINK',
              label: 'Mevzuiyat Arşivi',
              url: '/mevzuiyat-arsivi',
              order: 4,
            },
            {
              type: 'LINK',
              label: 'Basın Haberler []',
              url: '/basin-haberler',
              order: 5,
            }
          ]
        }
      }
    });

    // Sol taraf - İkinci sütun menüleri
    const leftColumn2 = await prisma.footerSection.create({
      data: {
        key: 'left-column-2',
        title: null,
        type: 'LINKS',
        orientation: 'VERTICAL',
        order: 2,
        isActive: true,
        items: {
          create: [
            {
              type: 'LINK',
              label: 'Hafriyat Ücreti Tarifeleri',
              url: '/hafriyat-ucret-tarifeleri',
              order: 1,
            },
            {
              type: 'LINK',
              label: 'Hafriyat Şikayetleri',
              url: '/hafriyat-sikayetleri',
              order: 2,
            },
            {
              type: 'LINK',
              label: 'Kost Hesaplama',
              url: '/kost-hesaplama',
              order: 3,
            },
            {
              type: 'LINK',
              label: 'Duyurularımız',
              url: '/duyurularimiz',
              order: 4,
            },
            {
              type: 'LINK',
              label: 'Video',
              url: '/video',
              order: 5,
            }
          ]
        }
      }
    });

    // Orta - Logo bölümü
    const logoSection = await prisma.footerSection.create({
      data: {
        key: 'logo-section',
        title: null,
        type: 'IMAGE',
        orientation: 'VERTICAL',
        order: 3,
        isActive: true,
        items: {
          create: [
            {
              type: 'IMAGE',
              label: 'Kocaeli Büyükşehir Belediyesi Logo',
              imageUrl: '/images/logo-footer.png',
              url: '/',
              order: 1,
            },
            {
              type: 'TEXT',
              label: 'Slogan',
              text: 'KENT KONUT İNŞAAT SAN. VE TİC. A.Ş. KOCAELİ BÜYÜKŞEHİR BELEDİYESİ İŞTİRAKIDİR.',
              order: 2,
            }
          ]
        }
      }
    });

    // Sağ taraf - İletişim bilgileri
    const contactSection = await prisma.footerSection.create({
      data: {
        key: 'contact-info',
        title: null,
        type: 'CONTACT',
        orientation: 'VERTICAL',
        order: 4,
        isActive: true,
        items: {
          create: [
            {
              type: 'TEXT',
              label: 'Adres',
              text: 'Körfez Mah. Hafız Birbaşı Cad. No:3 İzmit / Kocaeli',
              icon: 'map-pin',
              order: 1,
            },
            {
              type: 'TEXT',
              label: 'E-posta',
              text: 'halklailiski@kentkonut.com.tr',
              icon: 'mail',
              order: 2,
            },
            {
              type: 'TEXT',
              label: 'Telefon',
              text: '0 262 331 0700',
              icon: 'phone',
              order: 3,
            }
          ]
        }
      }
    });

    // Alt kısım - Site haritası ve diğer linkler
    const bottomSection = await prisma.footerSection.create({
      data: {
        key: 'bottom-links',
        title: null,
        type: 'LINKS',
        orientation: 'HORIZONTAL',
        order: 5,
        isActive: true,
        items: {
          create: [
            {
              type: 'LINK',
              label: 'Site Kullanımı',
              url: '/site-kullanimi',
              order: 1,
            },
            {
              type: 'LINK',
              label: 'KVKK',
              url: '/kvkk',
              order: 2,
            },
            {
              type: 'LINK',
              label: 'Web Mail',
              url: '/webmail',
              target: '_blank',
              isExternal: true,
              order: 3,
            },
            {
              type: 'LINK',
              label: 'RSS',
              url: '/rss',
              order: 4,
            },
            {
              type: 'LINK',
              label: 'Yazılım v.7',
              url: '/yazilim-v7',
              order: 5,
            }
          ]
        }
      }
    });

    console.log('✅ Footer sections başarıyla oluşturuldu');
    console.log(`📊 Sol sütun 1 - 5 item`);
    console.log(`📊 Sol sütun 2 - 5 item`);
    console.log(`📊 Logo bölümü - 2 item`);
    console.log(`📊 İletişim bilgileri - 3 item`);
    console.log(`📊 Alt linkler - 5 item`);

  } catch (error) {
    console.error('❌ Footer seed hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedFooter()
    .then(() => {
      console.log('🎉 Footer seed tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Footer seed başarısız:', error);
      process.exit(1);
    });
}

export { seedFooter };
