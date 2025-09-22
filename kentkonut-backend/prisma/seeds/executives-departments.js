const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedExecutivesAndDepartments() {
  console.log('👥 Seeding executives and departments...');

  // Yönetim Kadrosu
  const executives = [
    {
      name: 'Dr. Mehmet Özkan',
      title: 'Genel Müdür',
      biography: 'İnşaat mühendisliği alanında 25 yıllık deneyime sahip Dr. Mehmet Özkan, kentsel dönüşüm ve hafriyat yönetimi konularında uzman. İstanbul Teknik Üniversitesi İnşaat Mühendisliği bölümünden mezun, doktora derecesini kentsel planlama alanında almıştır.',
      content: '<p>Dr. Mehmet Özkan, kentsel dönüşüm ve hafriyat yönetimi alanında 25 yıllık deneyime sahip uzman bir mühendistir.</p><p>Eğitim ve kariyer geçmişi:</p><ul><li>İstanbul Teknik Üniversitesi İnşaat Mühendisliği - Lisans</li><li>Kentsel Planlama alanında Doktora</li><li>Çeşitli kamu ve özel sektör projelerinde yöneticilik</li></ul>',
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
      content: '<p>Mimar Ayşe Demir, şehir plancılığı ve mimarlık alanında 20 yıllık deneyime sahip uzman bir mimardır.</p><p>Uzmanlık alanları:</p><ul><li>Kentsel tasarım</li><li>Sürdürülebilir kalkınma projeleri</li><li>Şehir plancılığı</li><li>Mimari proje yönetimi</li></ul>',
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
      content: '<p>İnşaat Mühendisi Hasan Kaya, hafriyat ve altyapı projeleri konusunda 18 yıllık deneyime sahiptir.</p><p>Uzmanlık alanları:</p><ul><li>Büyük ölçekli hafriyat projeleri</li><li>Altyapı planlama</li><li>Teknik proje yönetimi</li><li>İnşaat denetimi</li></ul>',
      imageUrl: '/media/kurumsal/yonetim/hasan-kaya.jpg',
      email: 'hasan.kaya@kentkonut.gov.tr',
      phone: '0262 317 1002',
      order: 3,
      slug: 'hasan-kaya'
    },
    {
      name: 'Çevre Müh. Fatma Yılmaz',
      title: 'Çevre ve Sürdürülebilirlik Müdürü',
      biography: 'Çevre Mühendisi Fatma Yılmaz, çevre koruma ve sürdürülebilir kalkınma alanında 15 yıllık deneyime sahiptir. Boğaziçi Üniversitesi Çevre Mühendisliği bölümü mezunu. Çevre dostu hafriyat teknikleri konusunda araştırmalar yapmaktadır.',
      content: '<p>Çevre Mühendisi Fatma Yılmaz, çevre koruma ve sürdürülebilir kalkınma alanında 15 yıllık deneyime sahiptir.</p><p>Araştırma alanları:</p><ul><li>Çevre dostu hafriyat teknikleri</li><li>Sürdürülebilir kalkınma</li><li>Çevre etki değerlendirmesi</li><li>Yeşil teknolojiler</li></ul>',
      imageUrl: '/media/kurumsal/yonetim/fatma-yilmaz.jpg',
      email: 'fatma.yilmaz@kentkonut.gov.tr',
      phone: '0262 317 1003',
      order: 4,
      slug: 'fatma-yilmaz'
    },
    {
      name: 'Mali Müşavir Ahmet Şen',
      title: 'Mali İşler Müdürü',
      biography: 'Mali Müşavir Ahmet Şen, kamu mali yönetimi alanında 22 yıllık deneyime sahiptir. Marmara Üniversitesi İktisat Fakültesi mezunu. Kamu kaynaklarının etkin kullanımı ve mali denetim konularında uzmanlaşmıştır.',
      content: '<p>Mali Müşavir Ahmet Şen, kamu mali yönetimi alanında 22 yıllık deneyime sahiptir.</p><p>Uzmanlık alanları:</p><ul><li>Kamu kaynaklarının etkin kullanımı</li><li>Mali denetim ve kontrol</li><li>Bütçe planlama</li><li>Mali analiz ve raporlama</li></ul>',
      imageUrl: '/media/kurumsal/yonetim/ahmet-sen.jpg',
      email: 'ahmet.sen@kentkonut.gov.tr',
      phone: '0262 317 1004',
      order: 5,
      slug: 'ahmet-sen'
    }
  ];

  // Yöneticileri oluştur
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

  // Birimler
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
    },
    {
      name: 'Halkla İlişkiler Birimi',
      imageUrl: '/media/kurumsal/birimler/halkla-iliskiler.jpg',
      services: [
        'Vatandaş şikayetleri ve önerileri',
        'Basın ve medya ilişkileri',
        'Kurumsal iletişim',
        'Etkinlik organizasyonu',
        'Bilgi edinme başvuruları'
      ],
      order: 6,
      content: 'Halkla İlişkiler Birimi, vatandaşlarımızla olan iletişimimizi güçlendiren köprü görevini üstlenir. Şeffaf ve hesap verebilir yönetim anlayışıyla hizmet verir.',
      slug: 'halkla-iliskiler-birimi'
    }
  ];

  // Birimleri oluştur
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

  // Personel (Birim Müdürleri ve Şefleri)
  const personnel = [
    {
      name: 'İnş. Müh. Hasan Kaya',
      title: 'Hafriyat Yönetimi Birim Müdürü',
      content: 'Hafriyat yönetimi alanında 18 yıllık deneyime sahip uzman mühendis.',
      phone: '0262 317 2001',
      email: 'hasan.kaya@kentkonut.gov.tr',
      imageUrl: '/media/kurumsal/personel/hasan-kaya.jpg',
      slug: 'hasan-kaya-birim-muduru',
      order: 1,
      type: 'DIRECTOR'
    },
    {
      name: 'Maden Müh. Selim Özdemir',
      title: 'Teknik İşler Birim Müdürü',
      content: 'Maden mühendisliği ve jeoteknik alanında uzman.',
      phone: '0262 317 2002',
      email: 'selim.ozdemir@kentkonut.gov.tr',
      imageUrl: '/media/kurumsal/personel/selim-ozdemir.jpg',
      slug: 'selim-ozdemir-birim-muduru',
      order: 2,
      type: 'DIRECTOR'
    },
    {
      name: 'Çevre Müh. Fatma Yılmaz',
      title: 'Çevre ve Sürdürülebilirlik Birim Müdürü',
      content: 'Çevre koruma ve sürdürülebilir kalkınma uzmanı.',
      phone: '0262 317 2003',
      email: 'fatma.yilmaz@kentkonut.gov.tr',
      imageUrl: '/media/kurumsal/personel/fatma-yilmaz.jpg',
      slug: 'fatma-yilmaz-birim-muduru',
      order: 3,
      type: 'DIRECTOR'
    }
  ];

  // Personeli oluştur
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

  console.log('🎉 Executives and departments seeding completed!');
}

module.exports = { seedExecutivesAndDepartments };
