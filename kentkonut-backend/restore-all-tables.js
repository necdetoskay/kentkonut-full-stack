console.log('🔄 TÜM TABLOLARI DOĞRU SIRADA YÜKLÜYOR...');

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreAllTables() {
  try {
    console.log('📊 Veritabanına bağlanılıyor...');
    
    // Yedekleme dosyasını oku
    const backupPath = path.join(__dirname, 'backups', 'current-data-2025-09-25T05-35-23-529Z', 'current-data-backup-2025-09-25T05-35-23-529Z.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log('🗑️ Tüm tabloları temizliyor...');
    
    // Tüm tabloları temizle
    const allTables = [
      'comment', 'projectTag', 'projectRelation', 'projectGalleryMedia', 'projectGallery',
      'newsTag', 'newsRelation', 'newsGalleryItem', 'newsGallery', 'personnelGallery',
      'quickAccessLink', 'menuPermission', 'menuItem', 'serviceCard', 'corporateContent',
      'highlight', 'banner', 'hafriyatBelge', 'hafriyatSaha', 'hafriyatBolge',
      'project', 'news', 'personnel', 'executive', 'department', 'tag', 'newsCategory',
      'media', 'mediaCategory', 'pageSeoMetrics', 'page', 'pageCategory',
      'session', 'account', 'verificationToken', 'user', 'applicationLog'
    ];
    
    for (const table of allTables) {
      try {
        await prisma[table].deleteMany();
        console.log(`   ✅ ${table} temizlendi`);
      } catch (error) {
        console.log(`   ⚠️ ${table}: ${error.message}`);
      }
    }
    
    console.log('\n📥 Tabloları doğru sırada yüklüyor...');
    
    // 1. User tablosu (ID'ler ile)
    console.log('👤 User tablosu yükleniyor...');
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
        id: 'system-user',
        name: 'System User',
        email: 'system@kentkonut.local',
        password: null,
        role: 'admin',
        emailVerified: null,
        image: null
      }
    ];
    
    await prisma.user.createMany({ data: users });
    console.log(`✅ User: ${users.length} kayıt yüklendi`);
    
    // 2. NewsCategory tablosu (ID'ler ile)
    console.log('📂 NewsCategory tablosu yükleniyor...');
    const newsCategories = [
      { id: 1, name: 'Hafriyat Haberleri', slug: 'hafriyat-haberleri', description: 'Hafriyat ile ilgili haberler', order: 1, active: true },
      { id: 2, name: 'Çevre ve Sürdürülebilirlik', slug: 'cevre-ve-surdurulebilirlik', description: 'Çevre ve sürdürülebilirlik haberleri', order: 2, active: true },
      { id: 3, name: 'Teknik Gelişmeler', slug: 'teknik-gelismeler', description: 'Teknik gelişmeler', order: 3, active: true },
      { id: 4, name: 'Etkinlikler', slug: 'etkinlikler', description: 'Etkinlik haberleri', order: 4, active: true },
      { id: 5, name: 'Basın Açıklamaları', slug: 'basin-aciklamalari', description: 'Basın açıklamaları', order: 5, active: true }
    ];
    
    await prisma.newsCategory.createMany({ data: newsCategories });
    console.log(`✅ NewsCategory: ${newsCategories.length} kayıt yüklendi`);
    
    // 3. MediaCategory tablosu (ID'ler ile)
    console.log('📁 MediaCategory tablosu yükleniyor...');
    const mediaCategories = [
      { id: 1, name: 'Bannerlar', icon: 'Images', order: 0, isBuiltIn: true },
      { id: 2, name: 'Haberler', icon: 'Newspaper', order: 1, isBuiltIn: true },
      { id: 3, name: 'Projeler', icon: 'Building2', order: 2, isBuiltIn: true },
      { id: 4, name: 'Birimler', icon: 'Users', order: 3, isBuiltIn: true },
      { id: 5, name: 'İçerik Resimleri', icon: 'Image', order: 4, isBuiltIn: true },
      { id: 6, name: 'Kurumsal', icon: 'Building', order: 5, isBuiltIn: true }
    ];
    
    await prisma.mediaCategory.createMany({ data: mediaCategories });
    console.log(`✅ MediaCategory: ${mediaCategories.length} kayıt yüklendi`);
    
    // 4. Media tablosu (ID'ler ile)
    console.log('📁 Media tablosu yükleniyor...');
    if (backupData.tables.media && backupData.tables.media.length > 0) {
      await prisma.media.createMany({
        data: backupData.tables.media,
        skipDuplicates: true
      });
      console.log(`✅ Media: ${backupData.tables.media.length} kayıt yüklendi`);
    }
    
    // 5. Diğer temel tablolar
    const basicTables = ['department', 'executive', 'personnel', 'tag', 'page'];
    
    for (const tableName of basicTables) {
      if (backupData.tables[tableName] && backupData.tables[tableName].length > 0) {
        await prisma[tableName].createMany({
          data: backupData.tables[tableName],
          skipDuplicates: true
        });
        console.log(`✅ ${tableName}: ${backupData.tables[tableName].length} kayıt yüklendi`);
      }
    }
    
    // 4. News tablosu
    console.log('📰 News tablosu yükleniyor...');
    if (backupData.tables.news && backupData.tables.news.length > 0) {
      await prisma.news.createMany({
        data: backupData.tables.news,
        skipDuplicates: true
      });
      console.log(`✅ News: ${backupData.tables.news.length} kayıt yüklendi`);
    }
    
    // 5. Project tablosu (mediaId'leri null yaparak)
    console.log('🏢 Project tablosu yükleniyor...');
    if (backupData.tables.project && backupData.tables.project.length > 0) {
      const projectsWithNullMediaId = backupData.tables.project.map(project => ({
        ...project,
        mediaId: null // mediaId'leri null yap
      }));
      
      await prisma.project.createMany({
        data: projectsWithNullMediaId,
        skipDuplicates: true
      });
      console.log(`✅ Project: ${backupData.tables.project.length} kayıt yüklendi`);
    }
    
    // 6. İlişkili tablolar
    const relatedTables = [
      'projectRelation', 'projectGallery', 'projectGalleryMedia', 
      'comment', 'quickAccessLink', 'menuItem', 'highlight', 'banner',
      'hafriyatBolge', 'hafriyatSaha', 'hafriyatBelgeKategori', 'media'
    ];
    
    for (const tableName of relatedTables) {
      if (backupData.tables[tableName] && backupData.tables[tableName].length > 0) {
        try {
          await prisma[tableName].createMany({
            data: backupData.tables[tableName],
            skipDuplicates: true
          });
          console.log(`✅ ${tableName}: ${backupData.tables[tableName].length} kayıt yüklendi`);
        } catch (error) {
          console.log(`⚠️ ${tableName}: ${error.message}`);
        }
      }
    }
    
    // Son durumu kontrol et
    console.log('\n📊 YENİ VERİTABANI DURUMU:');
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const newsCount = await prisma.news.count();
    const commentCount = await prisma.comment.count();
    const quickAccessCount = await prisma.quickAccessLink.count();
    const menuItemCount = await prisma.menuItem.count();
    const projectGalleryCount = await prisma.projectGallery.count();
    const hafriyatBolgeCount = await prisma.hafriyatBolge.count();
    const hafriyatSahaCount = await prisma.hafriyatSaha.count();
    
    console.log(`   👤 Kullanıcı: ${userCount}`);
    console.log(`   🏢 Proje: ${projectCount}`);
    console.log(`   📰 Haber: ${newsCount}`);
    console.log(`   💬 Yorum: ${commentCount}`);
    console.log(`   ⚡ Hızlı Erişim: ${quickAccessCount}`);
    console.log(`   📑 Menü: ${menuItemCount}`);
    console.log(`   🖼️ Proje Galerisi: ${projectGalleryCount}`);
    console.log(`   🏗️ Hafriyat Bölge: ${hafriyatBolgeCount}`);
    console.log(`   ⛏️ Hafriyat Saha: ${hafriyatSahaCount}`);
    
    console.log('\n🎉 TÜM TABLOLAR BAŞARIYLA YÜKLENDİ!');
    
  } catch (error) {
    console.error('❌ Yükleme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAllTables();
