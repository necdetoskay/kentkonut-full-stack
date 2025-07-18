const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function hafriyatVeriEkle() {
  try {
    console.log('🏗️ Hafriyat modülü için temel veriler ekleniyor...');

    // 1. Belge Kategorileri
    const belgeKategorileri = [
      { ad: 'İzin Belgeleri', ikon: 'file-check', sira: 1 },
      { ad: 'Teknik Raporlar', ikon: 'file-text', sira: 2 },
      { ad: 'Mali Belgeler', ikon: 'file-dollar', sira: 3 },
      { ad: 'Çevre Etki Değerlendirmesi', ikon: 'leaf', sira: 4 },
      { ad: 'Güvenlik Belgeleri', ikon: 'shield', sira: 5 }
    ];

    console.log('📄 Belge kategorileri ekleniyor...');
    for (const kategori of belgeKategorileri) {
      await prisma.hafriyatBelgeKategori.upsert({
        where: { ad: kategori.ad },
        update: kategori,
        create: kategori
      });
    }

    // 2. Resim Kategorileri
    const resimKategorileri = [
      { ad: 'Çalışma Öncesi', ikon: 'camera', sira: 1 },
      { ad: 'İnşaat Sırasında', ikon: 'hard-hat', sira: 2 },
      { ad: 'Tamamlanan Çalışmalar', ikon: 'check-circle', sira: 3 },
      { ad: 'Drone Görüntüleri', ikon: 'plane', sira: 4 },
      { ad: 'Makine ve Ekipman', ikon: 'truck', sira: 5 }
    ];

    console.log('🖼️ Resim kategorileri ekleniyor...');
    for (const kategori of resimKategorileri) {
      await prisma.hafriyatResimKategori.upsert({
        where: { ad: kategori.ad },
        update: kategori,
        create: kategori
      });
    }

    // 3. Bölgeler
    const bolgeler = [
      {
        ad: 'Gebze Bölgesi',
        aciklama: 'Gebze ilçesi ve çevresindeki hafriyat sahaları',
        yetkiliKisi: 'Şevki Uzun',
        yetkiliTelefon: '0533 453 8269'
      },
      {
        ad: 'İzmit Bölgesi',
        aciklama: 'İzmit ilçesi ve çevresindeki hafriyat sahaları',
        yetkiliKisi: 'Tahir Aslan',
        yetkiliTelefon: '0545 790 9577'
      },
      {
        ad: 'Körfez Bölgesi',
        aciklama: 'Körfez ilçesi ve çevresindeki hafriyat sahaları',
        yetkiliKisi: 'Serkan Küçük',
        yetkiliTelefon: '0541 223 2479'
      }
    ];

    console.log('🗺️ Bölgeler ekleniyor...');
    const oluşturulanBölgeler = [];
    for (const bolge of bolgeler) {
      const oluşturulanBölge = await prisma.hafriyatBolge.upsert({
        where: { ad: bolge.ad },
        update: bolge,
        create: bolge
      });
      oluşturulanBölgeler.push(oluşturulanBölge);
    }

    // 4. Örnek Sahalar
    const sahalar = [
      {
        ad: 'Körfez Taşocağı',
        konumAdi: 'Körfez İlçesi Tavşanlı Mevkii',
        enlem: 40.7664,
        boylam: 29.7854,
        durum: 'DEVAM_EDIYOR',
        ilerlemeyuzdesi: 90,
        tonBasiUcret: 65.00,
        kdvOrani: 20,
        bolgeId: oluşturulanBölgeler.find(b => b.ad === 'Körfez Bölgesi')?.id
      },
      {
        ad: 'Sepetçiler 3. Etap',
        konumAdi: 'Gebze İlçesi Sepetçiler Mahallesi',
        enlem: 40.7930,
        boylam: 29.4250,
        durum: 'DEVAM_EDIYOR',
        ilerlemeyuzdesi: 95,
        tonBasiUcret: 65.00,
        kdvOrani: 20,
        bolgeId: oluşturulanBölgeler.find(b => b.ad === 'Gebze Bölgesi')?.id
      },
      {
        ad: 'Ketenciler Rehabilite',
        konumAdi: 'İzmit İlçesi Ketenciler Mahallesi',
        enlem: 40.7648,
        boylam: 29.9180,
        durum: 'DEVAM_EDIYOR',
        ilerlemeyuzdesi: 10,
        tonBasiUcret: 65.00,
        kdvOrani: 20,
        bolgeId: oluşturulanBölgeler.find(b => b.ad === 'İzmit Bölgesi')?.id
      },
      {
        ad: 'Balçık Rehabilite',
        konumAdi: 'Gebze İlçesi Balçık Mevkii',
        enlem: 40.8021,
        boylam: 29.4381,
        durum: 'DEVAM_EDIYOR',
        ilerlemeyuzdesi: 87,
        tonBasiUcret: 90.00,
        kdvOrani: 20,
        bolgeId: oluşturulanBölgeler.find(b => b.ad === 'Gebze Bölgesi')?.id
      },
      {
        ad: 'Dilovası Lot Alanı',
        konumAdi: 'Dilovası İlçesi Sanayi Bölgesi',
        enlem: 40.7808,
        boylam: 29.5344,
        durum: 'DEVAM_EDIYOR',
        ilerlemeyuzdesi: 70,
        tonBasiUcret: 90.00,
        kdvOrani: 20,
        bolgeId: oluşturulanBölgeler.find(b => b.ad === 'Gebze Bölgesi')?.id
      },
      {
        ad: 'Maden Taş Ocağı',
        konumAdi: 'Körfez İlçesi Dağyenice Mevkii',
        enlem: 40.7450,
        boylam: 29.8123,
        durum: 'DEVAM_EDIYOR',
        ilerlemeyuzdesi: 50,
        tonBasiUcret: 90.00,
        kdvOrani: 20,
        bolgeId: oluşturulanBölgeler.find(b => b.ad === 'Körfez Bölgesi')?.id
      }
    ];

    console.log('🏗️ Sahalar ekleniyor...');
    for (const saha of sahalar) {
      if (saha.bolgeId) {
        await prisma.hafriyatSaha.upsert({
          where: { 
            ad_bolgeId: {
              ad: saha.ad,
              bolgeId: saha.bolgeId
            }
          },
          update: saha,
          create: saha
        });
      }
    }

    console.log('✅ Hafriyat modülü temel verileri başarıyla eklendi!');
    console.log(`📊 Eklenen veriler:`);
    console.log(`   - ${belgeKategorileri.length} belge kategorisi`);
    console.log(`   - ${resimKategorileri.length} resim kategorisi`);
    console.log(`   - ${bolgeler.length} bölge`);
    console.log(`   - ${sahalar.length} saha`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

hafriyatVeriEkle();
