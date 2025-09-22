// Proje ve diğer gerekli medya kategorilerini oluşturmak için script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initMediaCategories() {
  console.log('Medya kategorileri kontrol ediliyor...');
  
  // Gerekli kategorilerin tanımları
  const requiredCategories = [
    { name: 'İçerik Resimleri', icon: 'FileImage', order: 10, isBuiltIn: true },
    { name: 'Projeler', icon: 'Building2', order: 20, isBuiltIn: true },
    { name: 'Haberler', icon: 'Newspaper', order: 30, isBuiltIn: true },
    { name: 'Bannerlar', icon: 'Images', order: 40, isBuiltIn: true },
  ];

  // Her gerekli kategoriyi kontrol et ve yoksa oluştur
  for (const category of requiredCategories) {
    const existingCategory = await prisma.mediaCategory.findFirst({
      where: { name: category.name }
    });

    if (!existingCategory) {
      console.log(`"${category.name}" kategorisi oluşturuluyor...`);
      await prisma.mediaCategory.create({
        data: category
      });
      console.log(`"${category.name}" kategorisi başarıyla oluşturuldu.`);
    } else {
      console.log(`"${category.name}" kategorisi zaten mevcut, ID: ${existingCategory.id}`);
    }
  }

  console.log('Tüm kategoriler başarıyla kontrol edildi ve oluşturuldu.');
}

// Scripti çalıştır
initMediaCategories()
  .catch(e => {
    console.error('Hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
