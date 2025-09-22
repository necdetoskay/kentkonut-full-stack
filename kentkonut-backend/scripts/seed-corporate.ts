import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🏢 Seeding corporate module data...');
  
  // Seed Executives (Yöneticiler)
  console.log('\n👥 Seeding executives...');
  
  // Önce mevcut executives'ları temizle
  await prisma.executive.deleteMany({});
  
  // Yöneticileri oluştur
  const executives = await prisma.executive.createMany({
    data: [
      {
        name: 'Doç. Dr. Tahir BÜYÜKAKIN',
        title: 'BAŞKANIMIZ',
        position: 'İdare Başkanı',
        biography: `Doç. Dr. Tahir BÜYÜKAKIN, kentsel dönüşüm ve konut politikaları alanında uzman akademisyen olup, uzun yıllardır bu alanda çalışmalar yürütmektedir. 

Şehir planlaması ve kentsel gelişim konularında ulusal ve uluslararası projelerde yer almış, birçok bilimsel makale ve kitap yazmıştır. Kentsel dönüşüm projelerinin sosyal ve ekonomik etkilerini inceleyen araştırmaları ile tanınmaktadır.

Kariyeri boyunca akademik çalışmalarını uygulamaya geçirmeye odaklanmış, özellikle sürdürülebilir kentleşme ve toplumsal katılım konularında öncü projeler gerçekleştirmiştir.`,
        imageUrl: '/uploads/executives/president.jpg',
        email: 'baskan@kentkonut.com.tr',
        phone: '+90 (212) 555-0101',
        type: 'PRESIDENT',
        order: 0,
        isActive: true
      },
      {
        name: 'Erhan COŞAN',
        title: 'GENEL MÜDÜR',
        position: 'Genel Müdür',
        biography: `Erhan COŞAN, 20 yılı aşkın deneyimi ile inşaat ve konut sektöründe uzman bir yöneticidir. Kentsel dönüşüm projelerinin planlanması ve uygulanması konularında derin bilgi ve tecrübeye sahiptir.

Özellikle proje yönetimi, risk analizi ve kalite kontrol süreçlerinde expertise sahibidir. Birçok büyük ölçekli konut projesinin başarıyla tamamlanmasında önemli rol oynamıştır.

Müşteri memnuniyeti odaklı yaklaşımı ve teknik uzmanlığı ile sektörde saygın bir konuma sahiptir. Aynı zamanda sürdürülebilir yapı teknolojileri konusunda da çalışmalar yürütmektedir.`,
        imageUrl: '/uploads/executives/general-manager.jpg',
        email: 'genelmudir@kentkonut.com.tr',
        phone: '+90 (212) 555-0102',
        type: 'GENERAL_MANAGER',
        order: 1,
        isActive: true
      },
      {
        name: 'İng. Mehmet YILMAZ',
        title: 'TEKNİK MÜDÜR',
        position: 'Teknik İşler Müdürü',
        biography: `İnşaat Mühendisi Mehmet YILMAZ, 15 yıllık deneyimi ile kentsel dönüşüm projelerinin teknik altyapısını yönetmektedir. Yapı mühendisliği, zemin etüdleri ve deprem güvenliği konularında uzmanlaşmıştır.

Modern yapı teknolojileri ve akıllı bina sistemleri konusunda sürekli kendini geliştirmekte olan Mehmet YILMAZ, projelerimizde teknik standartların en üst seviyede tutulmasını sağlamaktadır.

Kalite kontrol süreçlerinin etkin bir şekilde işletilmesinde ve teknik ekiplerin koordinasyonunda önemli rol oynamaktadır.`,
        imageUrl: '/uploads/executives/technical-director.jpg',
        email: 'teknik@kentkonut.com.tr',
        phone: '+90 (212) 555-0103',
        type: 'DIRECTOR',
        order: 2,
        isActive: true
      }
    ]
  });
  console.log(`✅ Created ${executives.count} executives`);

  // Seed Departments (Birimler)
  console.log('\n🏢 Seeding departments...');

  // Önce mevcut departments'ları temizle
  await prisma.department.deleteMany({});
  const departments = await prisma.department.createMany({
    data: [
      {
        name: 'Proje Geliştirme Birimi',
        content: 'Kentsel dönüşüm projelerinin planlanması, geliştirilmesi ve hayata geçirilmesi süreçlerini yöneten birimdir.',
        services: [
          'Proje planlama ve tasarım',
          'Fizibilite analizi',
          'Ruhsat işlemleri',
          'İmar planı hazırlama',
          'Teknik şartname oluşturma'
        ],
        order: 0,
        isActive: true
      },
      {
        name: 'İnşaat ve Teknik Birimi',
        content: 'Projelerin inşaat aşamasında teknik denetim, kalite kontrol ve süreç yönetimi faaliyetlerini gerçekleştirir.',
        services: [
          'İnşaat denetimi',
          'Kalite kontrol',
          'Teknik şartname uygulaması',
          'Malzeme kontrolü',
          'İş güvenliği denetimi'
        ],
        order: 1,
        isActive: true
      },
      {
        name: 'Satış ve Pazarlama Birimi',
        content: 'Konut satış süreçleri, müşteri ilişkileri ve pazarlama faaliyetlerini koordine eden birimdir.',
        services: [
          'Konut satış danışmanlığı',
          'Müşteri ilişkileri yönetimi',
          'Pazarlama kampanyaları',
          'Satış ofisi işletmeciliği',
          'Kredi danışmanlığı'        ],
        order: 2,
        isActive: true
      },      {
        name: 'Hukuk ve Mevzuat Birimi',
        content: 'Hukuki süreçler, mevzuat uyumu ve yasal danışmanlık hizmetlerini sağlayan birimdir.',
        services: [
          'Hukuki danışmanlık',
          'Sözleşme hazırlama',
          'Mevzuat takibi',
          'Dava takibi',
          'Tapu işlemleri'
        ],
        order: 3,
        isActive: true
      },      {
        name: 'Mali İşler Birimi',
        content: 'Finansal yönetim, muhasebe işlemleri ve bütçe planlaması faaliyetlerini yürüten birimdir.',
        services: [
          'Muhasebe işlemleri',
          'Bütçe planlama',
          'Finansal raporlama',
          'Ödeme planları',
          'Vergi işlemleri'
        ],
        order: 4,
        isActive: true
      },      {
        name: 'İnsan Kaynakları Birimi',
        content: 'Personel yönetimi, eğitim planlama ve organizasyonel gelişim faaliyetlerini gerçekleştirir.',
        services: [
          'Personel işe alım',
          'Eğitim planlama',
          'Performans değerlendirme',
          'Bordro işlemleri',
          'Çalışan memnuniyeti'
        ],
        order: 5,
        isActive: true
      }
    ]
  });

  console.log(`✅ Created ${departments.count} departments`);

  // Seed Corporate Content (Kurumsal İçerik)
  console.log('\n📄 Seeding corporate content...');

  // Önce mevcut corporate content'ları temizle
  await prisma.corporateContent.deleteMany({});

  const corporateContent = await prisma.corporateContent.createMany({
    data: [
      {
        type: 'VISION',
        title: 'VİZYONUMUZ',
        content: `<div class="corporate-content">
          <p class="lead">Kentsel dönüşüm alanında Türkiye'nin öncü kuruluşu olmak ve sürdürülebilir, yaşanabilir kentler inşa etmek.</p>
          
          <p>Kentsel dönüşüm projelerimizle sadece yapılar değil, yaşam kalitesini dönüştürmeyi hedefliyoruz. Modern teknolojiler ve çevre dostu yaklaşımlarla, geleceğin kentlerini bugünden inşa ediyoruz.</p>
          
          <p>İnovasyonu benimseyen, toplumsal katılımı önemseyen ve sürdürülebilirlik ilkelerini ön planda tutan yaklaşımımızla, Türkiye'nin kentsel dönüşüm alanındaki referans kuruluşu olmayı hedefliyoruz.</p>
        </div>`,
        imageUrl: '/uploads/corporate/vision.jpg',
        icon: 'Eye',
        order: 0,
        isActive: true
      },
      {
        type: 'MISSION',
        title: 'MİSYONUMUZ',
        content: `<div class="corporate-content">
          <p class="lead">Kentsel dönüşüm projelerinde toplumsal fayda, çevresel sürdürülebilirlik ve ekonomik değer yaratmak.</p>
          
          <h3>Temel İlkelerimiz:</h3>
          <ul>
            <li><strong>Kalite:</strong> En yüksek standartlarda proje geliştirme ve uygulama</li>
            <li><strong>Şeffaflık:</strong> Tüm süreçlerde açık ve hesap verebilir yaklaşım</li>
            <li><strong>Sürdürülebilirlik:</strong> Çevre dostu teknolojiler ve uygulamalar</li>
            <li><strong>Toplumsal Katılım:</strong> Paydaşların görüşlerini değerlendirme</li>
            <li><strong>İnovasyon:</strong> Modern teknolojileri projelerimize entegre etme</li>
          </ul>
          
          <p>Bu ilkeler doğrultusunda, kentlerimizin dönüşümüne öncülük ederek toplumsal refahın artırılmasına katkıda bulunuyoruz.</p>
        </div>`,
        imageUrl: '/uploads/corporate/mission.jpg',
        icon: 'Target',
        order: 1,
        isActive: true
      },
      {
        type: 'STRATEGY',
        title: 'STRATEJİMİZ',
        content: `<div class="corporate-content">
          <p class="lead">Kentsel dönüşümde bütüncül yaklaşım ve paydaş odaklı strateji.</p>
          
          <h3>Stratejik Önceliklerimiz:</h3>
          
          <div class="strategy-item">
            <h4>🏗️ Entegre Proje Yönetimi</h4>
            <p>Planlamadan teslime kadar tüm süreçlerin koordineli yönetimi ve kalite kontrolü.</p>
          </div>
          
          <div class="strategy-item">
            <h4>🌱 Sürdürülebilir Gelişim</h4>
            <p>Çevre dostu malzemeler, enerji verimli tasarımlar ve yeşil alan planlaması.</p>
          </div>
          
          <div class="strategy-item">
            <h4>👥 Toplumsal Katılım</h4>
            <p>Proje geliştirme sürecinde tüm paydaşların aktif katılımının sağlanması.</p>
          </div>
          
          <div class="strategy-item">
            <h4>💡 Teknolojik İnovasyon</h4>
            <p>Akıllı bina sistemleri ve dijital çözümlerin projelerimize entegrasyonu.</p>
          </div>
          
          <div class="strategy-item">
            <h4>🤝 Güven ve Şeffaflık</h4>
            <p>Tüm süreçlerde açık iletişim ve hesap verebilir yönetim anlayışı.</p>
          </div>
        </div>`,
        imageUrl: '/uploads/corporate/strategy.jpg',
        icon: 'Map',
        order: 2,
        isActive: true
      },
      {
        type: 'GOALS',
        title: 'HEDEFLERİMİZ',
        content: `<div class="corporate-content">
          <p class="lead">2025-2030 döneminde kentsel dönüşüm alanında öncülük edecek hedefler.</p>
          
          <h3>Kısa Vadeli Hedefler (2025-2026):</h3>
          <ul>
            <li>✅ 5 yeni kentsel dönüşüm projesi başlatmak</li>
            <li>✅ 1,000 konut ünitesini tamamlamak</li>
            <li>✅ Dijital süreç yönetimi sistemini devreye almak</li>
            <li>✅ İSO 14001 Çevre Yönetimi Sertifikası almak</li>
          </ul>
          
          <h3>Orta Vadeli Hedefler (2027-2028):</h3>
          <ul>
            <li>🎯 10 farklı ilde proje portföyü oluşturmak</li>
            <li>🎯 3,000 konut ünitesine ulaşmak</li>
            <li>🎯 Yeşil bina sertifikalı projeler geliştirmek</li>
            <li>🎯 Teknoloji ortaklıkları kurmak</li>
          </ul>
          
          <h3>Uzun Vadeli Hedefler (2029-2030):</h3>
          <ul>
            <li>🚀 Sektörde öncü kuruluş konumunu pekiştirmek</li>
            <li>🚀 5,000+ konut ünitesi tamamlamış olmak</li>
            <li>🚀 Uluslararası projelere katılmak</li>
            <li>🚀 Araştırma ve geliştirme merkezi kurmak</li>
          </ul>
          
          <div class="goals-metrics">
            <h3>Başarı Metrikleri:</h3>
            <p><strong>Müşteri Memnuniyeti:</strong> %95+ hedefi<br>
            <strong>Proje Teslim Süresi:</strong> Zamanında teslim oranı %98+<br>
            <strong>Kalite Standardı:</strong> Sıfır hata toleransı<br>
            <strong>Çevre Etkisi:</strong> Karbon ayak izinde %30 azalma</p>
          </div>
        </div>`,
        imageUrl: '/uploads/corporate/goals.jpg',
        icon: 'Flag',
        order: 3,
        isActive: true
      }
    ]
  });
  console.log(`✅ Created ${corporateContent.count} corporate content items`);

  // Corporate Module Summary
  const totalExecutives = await prisma.executive.count();
  const totalDepartments = await prisma.department.count();
  const totalCorporateContent = await prisma.corporateContent.count();

  console.log('\n🏢 Corporate Module Summary:');
  console.log(`👥 Total executives: ${totalExecutives}`);
  console.log(`🏢 Total departments: ${totalDepartments}`);
  console.log(`📄 Total corporate content: ${totalCorporateContent}`);
  console.log('🎉 Corporate module data seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
