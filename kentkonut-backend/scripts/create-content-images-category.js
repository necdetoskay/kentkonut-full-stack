const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createContentImagesCategory() {
  try {
    console.log('🗂️ İçerik Resimleri kategorisi oluşturuluyor...');
      // Mevcut kategorileri kontrol et
    const existingCategories = await prisma.mediaCategory.findMany({
      select: { id: true, name: true, isBuiltIn: true, icon: true, order: true }
    });
    
    console.log('📁 Mevcut kategoriler:');
    existingCategories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id}) - Built-in: ${cat.isBuiltIn}`);
    });
    
    // İçerik Resimleri kategorisi var mı kontrol et
    const contentImagesCategory = existingCategories.find(cat => 
      cat.name === 'İçerik Resimleri' || cat.name === 'Content Images'
    );
    
    if (contentImagesCategory) {
      console.log(`✅ İçerik Resimleri kategorisi zaten mevcut (ID: ${contentImagesCategory.id})`);
      return contentImagesCategory;
    }
      // Yeni kategori oluştur
    const newCategory = await prisma.mediaCategory.create({
      data: {
        name: 'İçerik Resimleri',
        icon: '🖼️',
        order: 90, // Sonlarda göster
        isBuiltIn: true, // Sistem kategorisi olarak işaretle
      }
    });
    
    console.log(`✅ İçerik Resimleri kategorisi oluşturuldu (ID: ${newCategory.id})`);
    
    // Güncellenmiş kategori listesini göster
    const updatedCategories = await prisma.mediaCategory.findMany({
      select: { id: true, name: true, isBuiltIn: true, icon: true, order: true }
    });
    
    console.log('\n📁 Güncellenmiş kategori listesi:');
    updatedCategories.forEach(cat => {
      console.log(`  - ${cat.icon} ${cat.name} (ID: ${cat.id}) - Built-in: ${cat.isBuiltIn} - Order: ${cat.order}`);
    });
    
    return newCategory;
    
  } catch (error) {
    console.error('❌ Kategori oluşturma hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script çalıştır
createContentImagesCategory()
  .then(() => {
    console.log('\n🎉 İşlem tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script hatası:', error);
    process.exit(1);
  });
