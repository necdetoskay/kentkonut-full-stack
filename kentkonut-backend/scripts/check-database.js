const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('🔍 Veritabanı durumu kontrol ediliyor...\n');
    
    // Kullanıcıları kontrol et
    const users = await prisma.user.findMany();
    console.log('👥 Toplam kullanıcı sayısı:', users.length);
    
    if (users.length > 0) {
      console.log('👤 Mevcut kullanıcılar:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    } else {
      console.log('❌ Hiç kullanıcı bulunamadı!');
      console.log('💡 Seed işlemi yapılması gerekiyor.');
    }
    
    // Banner gruplarını kontrol et
    const bannerGroups = await prisma.bannerGroup.findMany();
    console.log(`\n🏷️ Banner grupları: ${bannerGroups.length}`);
    bannerGroups.forEach(group => {
      console.log(`  - ${group.name} (${group.type}) - Deletable: ${group.deletable}`);
    });
    
    // Medya kategorilerini kontrol et
    const mediaCategories = await prisma.mediaCategory.findMany();
    console.log(`\n📁 Medya kategorileri: ${mediaCategories.length}`);
    mediaCategories.forEach(cat => {
      console.log(`  - ${cat.name} - Built-in: ${cat.isBuiltIn}`);
    });
    
    // Sayfaları kontrol et
    const pages = await prisma.page.findMany({
      include: { contents: true }
    });
    console.log(`\n📄 Sayfalar: ${pages.length}`);
    pages.forEach(page => {
      console.log(`  - ${page.title} (${page.slug}) - ${page.contents.length} içerik`);
    });
    
    console.log('\n✅ Kontrol tamamlandı.');
    
    // Seed gerekli mi?
    if (users.length === 0) {
      console.log('\n🚨 UYARI: Kullanıcı bulunamadı. Seed işlemi yapılmalı!');
      console.log('Çalıştır: npm run prisma:seed');
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
