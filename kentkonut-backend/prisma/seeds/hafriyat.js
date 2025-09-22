const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedHafriyat() {
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

  // Bölgeleri oluştur
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
    // Gebze Bölgesi Sahaları
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
      aciklama: 'Gebze Taşçıoğlu mevkiinde bulunan ana hafriyat sahası. Yüksek kapasiteli ve modern ekipmanlarla hizmet vermektedir.',
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
      aciklama: 'Çayırova sınırlarında bulunan orta ölçekli hafriyat sahası. Bölgesel projelere hizmet vermektedir.',
      baslangicTarihi: new Date('2024-03-01'),
      tahminibitisTarihi: new Date('2025-08-15'),
      tamamlananTon: 18000,
      toplamTon: 30000
    },
    // İzmit Bölgesi Sahaları
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
      aciklama: 'İzmit merkez bölgesinde bulunan stratejik konumdaki hafriyat sahası. Şehir merkezine yakınlığı ile avantajlı.',
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
      aciklama: 'Yahyakaptan mevkiinde tamamlanmış hafriyat sahası. Başarıyla sonuçlandırılmış örnek proje.',
      baslangicTarihi: new Date('2023-05-15'),
      tahminibitisTarihi: new Date('2024-11-30'),
      tamamlananTon: 35000,
      toplamTon: 35000
    },
    // Körfez Bölgesi Sahaları
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
      aciklama: 'Taşlıçiftlik mevkiinde bulunan deniz kenarındaki hafriyat sahası. Liman projelerine hizmet vermektedir.',
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
      aciklama: 'Madeni mevkiinde yeni açılan hafriyat sahası. Modern teknoloji ile çevre dostu yaklaşım.',
      baslangicTarihi: new Date('2024-04-05'),
      tahminibitisTarihi: new Date('2026-01-15'),
      tamamlananTon: 9000,
      toplamTon: 30000
    }
  ];

  // Sahaları oluştur
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

  // Hafriyat Belge Kategorileri
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

  console.log('🎉 Hafriyat data seeding completed!');
}

module.exports = { seedHafriyat };
