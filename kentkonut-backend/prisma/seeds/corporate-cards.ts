import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialCorporateCards = [
  {
    title: "BAŞKANIMIZ",
    subtitle: "Doç. Dr. Tahir BÜYÜKAKIN",
    description: "İdare Başkanımız Doç. Dr. Tahir BÜYÜKAKIN'ın kurumsal profili ve mesajları",
    imageUrl: "/media/kurumsal/kartlar/1753701562176_bxxx466huz.jpg",
    backgroundColor: "#f8f9fa",
    textColor: "#2c3e50",
    accentColor: "#3498db",
    displayOrder: 1,
    isActive: true,
    targetUrl: "/kurumsal/baskan",
    openInNewTab: false,
    imagePosition: "center",
    cardSize: "medium",
    borderRadius: "rounded",
    content: {
      type: "executive",
      position: "chairman",
      department: "management",
      bio: "Kentsel dönüşüm ve konut politikaları alanında uzman akademisyen"
    },
    customData: {
      position: "chairman",
      department: "management",
      showBio: true,
      priority: "high"
    }
  },
  {
    title: "GENEL MÜDÜR",
    subtitle: "Erhan COŞAN",
    description: "Genel Müdürümüz Erhan COŞAN'ın kurumsal profili ve yönetim yaklaşımı",
    imageUrl: "/media/kurumsal/kartlar/1753701602359_dzppbgod8o8.jpg",
    backgroundColor: "#f8f9fa",
    textColor: "#2c3e50",
    accentColor: "#27ae60",
    displayOrder: 2,
    isActive: true,
    targetUrl: "/kurumsal/genel-mudur",
    openInNewTab: false,
    imagePosition: "center",
    cardSize: "medium",
    borderRadius: "rounded",
    content: {
      type: "executive",
      position: "general_manager",
      department: "management",
      bio: "Operasyonel mükemmellik ve stratejik yönetim konularında deneyimli"
    },
    customData: {
      position: "general_manager",
      department: "management",
      showBio: true,
      priority: "high"
    }
  },
  {
    title: "BİRİMLERİMİZ",
    subtitle: "MÜDÜRLÜKLER",
    description: "Kurumumuzun organizasyon yapısı ve departmanlarımız hakkında bilgiler",
    imageUrl: "/images/corporate/birimler.jpg",
    backgroundColor: "#f8f9fa",
    textColor: "#2c3e50",
    accentColor: "#8e44ad",
    displayOrder: 3,
    isActive: true,
    targetUrl: "/kurumsal/birimler",
    openInNewTab: false,
    imagePosition: "center",
    cardSize: "medium",
    borderRadius: "rounded",
    content: {
      type: "departments",
      showSubItems: true,
      departmentCount: 12,
      description: "Kurumumuzun tüm birimlerini ve müdürlüklerini keşfedin"
    },
    customData: {
      type: "departments",
      showSubItems: true,
      departmentCount: 12,
      hasOrganizationChart: true
    }
  },
  {
    title: "STRATEJİMİZ",
    subtitle: null,
    description: "Kurumumuzun stratejik hedefleri, vizyonu ve misyonu",
    imageUrl: "/images/corporate/strateji.jpg",
    backgroundColor: "#fff3cd",
    textColor: "#856404",
    accentColor: "#ffc107",
    displayOrder: 4,
    isActive: true,
    targetUrl: "/kurumsal/strateji",
    openInNewTab: false,
    imagePosition: "center",
    cardSize: "medium",
    borderRadius: "rounded",
    content: {
      type: "strategy",
      highlightColor: "#ffc107",
      sections: ["vizyon", "misyon", "değerler", "stratejik_hedefler"],
      description: "2024-2028 Stratejik Planımız ve kurumsal değerlerimiz"
    },
    customData: {
      type: "strategy",
      highlightColor: "#ffc107",
      showTimeline: true,
      strategicPeriod: "2024-2028"
    }
  },
  {
    title: "HEDEFİMİZ",
    subtitle: null,
    description: "Kurumumuzun kısa ve uzun vadeli hedefleri ile başarı göstergeleri",
    imageUrl: "/images/corporate/hedef.jpg",
    backgroundColor: "#d1ecf1",
    textColor: "#0c5460",
    accentColor: "#17a2b8",
    displayOrder: 5,
    isActive: true,
    targetUrl: "/kurumsal/hedef",
    openInNewTab: false,
    imagePosition: "center",
    cardSize: "medium",
    borderRadius: "rounded",
    content: {
      type: "goals",
      showProgress: true,
      progressData: {
        "2024": 75,
        "2025": 45,
        "2026": 20
      },
      description: "Sürdürülebilir kentsel dönüşüm ve kaliteli konut üretimi"
    },
    customData: {
      type: "goals",
      showProgress: true,
      hasMetrics: true,
      trackingEnabled: true
    }
  }
];

const initialCorporatePage = {
  title: "Kurumsal",
  metaTitle: "Kurumsal - Kent Konut İdaresi",
  metaDescription: "Kent Konut İdaresi kurumsal bilgileri, yönetim kadrosu, organizasyon yapısı ve stratejik hedeflerimiz hakkında detaylı bilgiler.",
  headerImage: "/images/corporate/header.jpg",
  introText: "Kent Konut İdaresi olarak, kentsel dönüşüm ve kaliteli konut üretimi alanında öncü bir kurum olmayı hedefliyoruz.",
  showBreadcrumb: true,
  customCss: null,
  slug: "kurumsal",
  isActive: true
};

export async function seedCorporateCards() {
  console.log('🏢 Kurumsal kartlar seed ediliyor...');

  try {
    // Önce mevcut corporate cards'ları temizle
    await prisma.corporateCard.deleteMany();
    console.log('✅ Mevcut kurumsal kartlar temizlendi');

    // Yeni kartları ekle
    const createdCards = [];
    for (const cardData of initialCorporateCards) {
      const card = await prisma.corporateCard.create({
        data: cardData
      });
      createdCards.push(card);
      console.log(`✅ Kart oluşturuldu: ${card.title}`);
    }

    console.log(`🎉 ${createdCards.length} kurumsal kart başarıyla oluşturuldu`);
    return createdCards;

  } catch (error) {
    console.error('❌ Kurumsal kartlar seed hatası:', error);
    throw error;
  }
}

export async function seedCorporatePage() {
  console.log('📄 Kurumsal sayfa seed ediliyor...');

  try {
    // Önce mevcut corporate page'i kontrol et
    const existingPage = await prisma.corporatePage.findUnique({
      where: { slug: 'kurumsal' }
    });

    let page;
    if (existingPage) {
      // Mevcut sayfayı güncelle
      page = await prisma.corporatePage.update({
        where: { slug: 'kurumsal' },
        data: initialCorporatePage
      });
      console.log('✅ Mevcut kurumsal sayfa güncellendi');
    } else {
      // Yeni sayfa oluştur
      page = await prisma.corporatePage.create({
        data: initialCorporatePage
      });
      console.log('✅ Yeni kurumsal sayfa oluşturuldu');
    }

    return page;

  } catch (error) {
    console.error('❌ Kurumsal sayfa seed hatası:', error);
    throw error;
  }
}

export async function seedCorporateModule() {
  console.log('🌱 Kurumsal modül seed başlıyor...\n');

  try {
    // Corporate page'i seed et
    const page = await seedCorporatePage();
    
    // Corporate cards'ları seed et
    const cards = await seedCorporateCards();

    console.log('\n🎉 Kurumsal modül seed tamamlandı!');
    console.log(`📄 Sayfa: ${page.title}`);
    console.log(`🃏 Kartlar: ${cards.length} adet`);
    
    return { page, cards };

  } catch (error) {
    console.error('❌ Kurumsal modül seed hatası:', error);
    throw error;
  }
}

// Eğer doğrudan çalıştırılırsa
if (require.main === module) {
  seedCorporateModule()
    .then(() => {
      console.log('✅ Seed tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed hatası:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
