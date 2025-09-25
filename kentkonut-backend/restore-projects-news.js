console.log('🔄 Proje ve haber kayıtlarını geri yüklüyor...');

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreProjectsAndNews() {
  try {
    console.log('📊 Veritabanına bağlanılıyor...');
    
    // Yedekleme dosyasını oku
    const backupPath = path.join(__dirname, 'backups', 'current-data-2025-09-25T05-35-23-529Z', 'current-data-backup-2025-09-25T05-35-23-529Z.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log('📥 User tablosunu oluşturuyor...');
    
    // User tablosunu oluştur (ID'ler ile)
    const users = [
      {
        id: 'admin-user-1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: '$2b$10$TRnkvZRAfujdhrnCXAqBjejVW4WzlMKqUZjbokGsgwe3Ifg4QnAO6',
        role: 'ADMIN',
        emailVerified: null,
        image: null
      },
      {
        id: 'system-user-1',
        name: 'System User',
        email: 'system@kentkonut.local',
        password: null,
        role: 'admin',
        emailVerified: null,
        image: null
      }
    ];
    
    // Mevcut user kayıtlarını temizle
    await prisma.user.deleteMany();
    
    // User kayıtlarını oluştur
    await prisma.user.createMany({
      data: users,
      skipDuplicates: true
    });
    
    console.log(`✅ User: ${users.length} kayıt oluşturuldu`);
    
    console.log('📥 NewsCategory tablosunu yüklüyor...');
    
    // NewsCategory kayıtlarını temizle ve yükle
    if (backupData.tables.newsCategory && backupData.tables.newsCategory.length > 0) {
      await prisma.newsCategory.deleteMany();
      await prisma.newsCategory.createMany({
        data: backupData.tables.newsCategory,
        skipDuplicates: true
      });
      console.log(`✅ NewsCategory: ${backupData.tables.newsCategory.length} kayıt yüklendi`);
    }
    
    console.log('📥 News tablosunu yüklüyor...');
    
    // News kayıtlarını temizle
    await prisma.news.deleteMany();
    
    // News kayıtlarını yükle
    if (backupData.tables.news && backupData.tables.news.length > 0) {
      await prisma.news.createMany({
        data: backupData.tables.news,
        skipDuplicates: true
      });
      console.log(`✅ News: ${backupData.tables.news.length} kayıt yüklendi`);
    }
    
    console.log('📥 Project tablosunu yüklüyor...');
    
    // Project kayıtlarını temizle
    await prisma.project.deleteMany();
    
    // Project kayıtlarını yükle
    if (backupData.tables.project && backupData.tables.project.length > 0) {
      await prisma.project.createMany({
        data: backupData.tables.project,
        skipDuplicates: true
      });
      console.log(`✅ Project: ${backupData.tables.project.length} kayıt yüklendi`);
    }
    
    console.log('📥 Project ilişkili tabloları yüklüyor...');
    
    // Project ilişkili tabloları yükle
    const projectRelatedTables = [
      'projectRelation', 'projectGallery', 'projectGalleryMedia', 
      'comment', 'quickAccessLink'
    ];
    
    for (const tableName of projectRelatedTables) {
      if (backupData.tables[tableName] && backupData.tables[tableName].length > 0) {
        try {
          await prisma[tableName].deleteMany();
          await prisma[tableName].createMany({
            data: backupData.tables[tableName],
            skipDuplicates: true
          });
          console.log(`✅ ${tableName}: ${backupData.tables[tableName].length} kayıt yüklendi`);
        } catch (error) {
          console.log(`⚠️ ${tableName}: Yükleme hatası - ${error.message}`);
        }
      }
    }
    
    console.log('📥 Menu tablolarını yüklüyor...');
    
    // Menu tablolarını yükle
    if (backupData.tables.menuItem && backupData.tables.menuItem.length > 0) {
      try {
        await prisma.menuItem.deleteMany();
        await prisma.menuItem.createMany({
          data: backupData.tables.menuItem,
          skipDuplicates: true
        });
        console.log(`✅ menuItem: ${backupData.tables.menuItem.length} kayıt yüklendi`);
      } catch (error) {
        console.log(`⚠️ menuItem: Yükleme hatası - ${error.message}`);
      }
    }
    
    // Son durumu kontrol et
    console.log('\n📊 Yeni veritabanı durumu:');
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const newsCount = await prisma.news.count();
    const commentCount = await prisma.comment.count();
    const quickAccessCount = await prisma.quickAccessLink.count();
    const menuItemCount = await prisma.menuItem.count();
    
    console.log(`   👤 Kullanıcı: ${userCount}`);
    console.log(`   🏢 Proje: ${projectCount}`);
    console.log(`   📰 Haber: ${newsCount}`);
    console.log(`   💬 Yorum: ${commentCount}`);
    console.log(`   ⚡ Hızlı Erişim: ${quickAccessCount}`);
    console.log(`   📑 Menü: ${menuItemCount}`);
    
    console.log('\n🎉 Proje ve haber kayıtları başarıyla geri yüklendi!');
    
  } catch (error) {
    console.error('❌ Geri yükleme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreProjectsAndNews();
